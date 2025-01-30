"use client"

import { MessageCircle } from "lucide-react"
import { useState } from "react"

export default function ChatIcon() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        aria-label="Toggle chat"
      >
        <MessageCircle size={24} />
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white shadow-xl rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Chat with Document</h2>
          <div className="h-72 overflow-y-auto mb-2 border rounded p-2">{/* Chat messages will go here */}</div>
          <div className="flex">
            <input type="text" placeholder="Type your message..." className="flex-grow border rounded-l px-2 py-1" />
            <button className="bg-blue-500 text-white px-4 py-1 rounded-r">Send</button>
          </div>
        </div>
      )}
    </>
  )
}

