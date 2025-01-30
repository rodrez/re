"use client"

import { useState } from "react"
import { FileUp, Link2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [link, setLink] = useState("")
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const isValidUrl = (url: string) => {
      try {
        new URL(url)
        return url.toLowerCase().endsWith(".pdf") || url.toLowerCase().endsWith(".md")
      } catch {
        return false
      }
    }

    if (!isValidUrl(link)) {
      setError("Please enter a valid PDF or Markdown file URL")
      return
    }

    // Handle link submission
    console.log("Link submitted:", link)
    setLink("")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    // Handle file upload
    console.log("Files to upload:", files)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Content</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="link" className="text-sm font-medium">
              External Link
            </Label>
            <form onSubmit={handleLinkSubmit} className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="link"
                  placeholder="Paste your PDF or Markdown link here"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className={cn(error && "border-red-500")}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>
              <Button type="submit" size="sm">
                <Link2 className="mr-2 h-4 w-4" />
                Add
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">Add links to PDF or Markdown files</p>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">File Upload</Label>
            <div
              className={cn(
                "relative grid gap-1 rounded-lg border-2 border-dashed p-6 transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input type="file" id="file-upload" className="sr-only" multiple onChange={handleFileSelect} />
              <label htmlFor="file-upload" className="grid cursor-pointer place-items-center gap-1 text-center">
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drag and drop files here, or click to select files</p>
                <p className="text-xs text-muted-foreground">
                  Upload documents, images, or other files from your device
                </p>
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

