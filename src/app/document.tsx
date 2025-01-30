import { useState } from "react"
import DocumentViewer from "@/components/document/viewer"
import ChatDialog from "@/components/document/chat"
import { Button } from "@/components/ui/button"
import { Expand } from "lucide-react"

export default function ResearchAssistant() {
  const [isDocumentPopped, setIsDocumentPopped] = useState(false)
  const [isChatPopped, setIsChatPopped] = useState(false)

  const popOutDocument = () => {
    setIsDocumentPopped(true)
  }

  const popOutChat = () => {
    setIsChatPopped(true)
  }

  return (
    <div className="flex h-full bg-gray-100">
      {!isDocumentPopped && (
        <div className="flex-1 p-4 relative">
          <Button className="absolute top-4 right-4 z-10" onClick={popOutDocument} variant="ghost" size="sm">
            <Expand/>
          </Button>
          <DocumentViewer />
        </div>
      )}
      {!isChatPopped && (
        <div className="w-1/3 p-4 border-l border-gray-200 relative">
          <Button className="absolute top-4 right-4 z-10" onClick={popOutDocument} variant="ghost" size="sm">
            <Expand/>
          </Button>
          <ChatDialog />
        </div>
      )}
      {isDocumentPopped && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 p-4 relative">
            <Button
              className="absolute top-2 right-2 z-10"
              onClick={() => setIsDocumentPopped(false)}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
            <DocumentViewer />
          </div>
        </div>
      )}
      {isChatPopped && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-1/3 p-4 relative">
            <Button
              className="absolute top-2 right-2 z-10"
              onClick={() => setIsChatPopped(false)}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
            <ChatDialog />
          </div>
        </div>
      )}
    </div>
  )
}


