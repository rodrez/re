import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocumentViewer() {
  const [activeTab, setActiveTab] = useState("pdf")

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <TabsList>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="pdf" className="flex-grow p-4 overflow-auto">
          <div className="bg-gray-200 h-full rounded flex items-center justify-center text-gray-500">
            PDF Viewer Placeholder
          </div>
        </TabsContent>
        <TabsContent value="markdown" className="flex-grow p-4 overflow-auto">
          <div className="prose max-w-none">
            <h1>Sample Markdown Content</h1>
            <p>This is a placeholder for Markdown content.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

