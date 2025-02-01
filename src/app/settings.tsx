import { useEffect } from "react"
import { DocumentPathSettings } from "@/components/settings/document-path"
import { useSettings } from "@/lib/settings"

export default function Settings() {
  const { initializeDocumentPath } = useSettings()

  useEffect(() => {
    initializeDocumentPath()
  }, [initializeDocumentPath])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <div className="space-y-6">
        <DocumentPathSettings />
      </div>
    </div>
  )
} 