import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/lib/settings"
import { FolderOpen } from "lucide-react"

export function DocumentPathSettings() {
  const { documentPath, selectDocumentPath } = useSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Storage Location</CardTitle>
        <CardDescription>
          Choose where your documents will be stored on your computer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">Current Location:</p>
            <p className="text-sm text-muted-foreground truncate">
              {documentPath || "Default system location"}
            </p>
          </div>
          <Button onClick={selectDocumentPath} variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            Change Location
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 