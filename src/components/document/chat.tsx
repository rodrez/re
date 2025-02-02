import { useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { useAIModel } from "@/lib/contexts/ai-model-context"

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatDialogProps {
  initialMessage?: string;
}

const ChatDialog = forwardRef<{ sendMessage: (text: string) => void }, ChatDialogProps>(
  ({ initialMessage }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      { role: "assistant", content: "Hello! How can I assist you with your research today?" },
    ])
    const [input, setInput] = useState(initialMessage || "")
    const [isLoading, setIsLoading] = useState(false)
    const { selectedModel } = useAIModel()

    useEffect(() => {
      if (initialMessage) {
        setInput(initialMessage)
      }
    }, [initialMessage])

    const streamOllama = async (model: string, messages: Message[]) => {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to connect to Ollama')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let assistantMessage = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Each chunk is a JSON object with a message field
        const text = new TextDecoder().decode(value)
        const lines = text.split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.message?.content) {
              assistantMessage += json.message.content
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: assistantMessage }
              ])
            }
          } catch (e) {
            console.error('Error parsing JSON:', e)
          }
        }
      }
    }

    const sendMessage = async (text: string = input) => {
      if (!text.trim() || isLoading) return

      try {
        setIsLoading(true)
        const newMessages = [...messages, { role: "user" as const, content: text }]
        setMessages(newMessages)
        setInput("")

        if (selectedModel.provider === "openai") {
          const stream = await streamText({
            model: openai(selectedModel.id),
            messages: newMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          }) as unknown as AsyncIterable<string>

          let assistantMessage = ""
          for await (const chunk of stream) {
            assistantMessage += chunk
            setMessages([
              ...newMessages,
              { role: "assistant" as const, content: assistantMessage }
            ])
          }
        } else if (selectedModel.provider === "ollama") {
          await streamOllama(selectedModel.id, newMessages)
        }
      } catch (error) {
        console.error('Error in chat:', error)
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "I apologize, but I encountered an error. Please try again." }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    useImperativeHandle(ref, () => ({
      sendMessage
    }))

    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="shrink-0 p-4 border-b">
          <h2 className="text-lg font-semibold">AI Research Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Using {selectedModel.name} ({selectedModel.provider})
          </p>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] inline-block p-3 rounded-lg ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

ChatDialog.displayName = "ChatDialog"

export default ChatDialog

