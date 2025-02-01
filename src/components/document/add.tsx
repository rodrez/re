"use client"

import { useState } from "react"
import { FileUp, Link2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { db } from "@/lib/db"
import { searchService } from "@/lib/search"
import { invoke } from '@tauri-apps/api/core'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [link, setLink] = useState("")
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

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
      setIsLoading(false)
      return
    }

    try {
      // Extract filename from URL
      const fileName = link.split("/").pop() || "document"

      // Fetch the file content
      const response = await fetch(link)
      if (!response.ok) {
        throw new Error("Failed to fetch file")
      }

      // Get the file data as bytes
      const fileData = new Uint8Array(await response.arrayBuffer())

      // Save file using Tauri command
      const filePath = await invoke<string>("save_file", {
        fileName,
        fileData: Array.from(fileData) // Convert Uint8Array to regular array for serialization
      })

      // Add document to database
      const docId = await db.documents.add({
        title: fileName,
        filePath: filePath,
        type: link.toLowerCase().endsWith(".pdf") ? "pdf" : "text",
        importDate: new Date(),
      })

      // Update search index
      const doc = await db.documents.get(docId)
      if (doc) {
        await searchService.addDocument(doc)
      }

      setLink("")
      onOpenChange(false)
    } catch (err) {
      setError("Failed to import document. Please try again.")
      console.error("Error importing document:", err)
    }

    setIsLoading(false)
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

  const handleFiles = async (files: File[]) => {
    setIsLoading(true)
    setError("")

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".md")) {
          setError("Only PDF and Markdown files are supported")
          continue
        }

        // Read file as array buffer
        const buffer = await file.arrayBuffer()
        const fileData = new Uint8Array(buffer)

        // Save file using Tauri command
        const filePath = await invoke<string>("save_file", {
          fileName: file.name,
          fileData: Array.from(fileData) // Convert Uint8Array to regular array for serialization
        })

        // Add document to database
        const docId = await db.documents.add({
          title: file.name,
          filePath: filePath,
          type: file.type.includes("pdf") ? "pdf" : "text",
          importDate: new Date(),
        })

        // Update search index
        const doc = await db.documents.get(docId)
        if (doc) {
          await searchService.addDocument(doc)
        }
      }

      onOpenChange(false)
    } catch (err) {
      setError("Failed to upload files. Please try again.")
      console.error("Error uploading files:", err)
    }

    setIsLoading(false)
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
                  disabled={isLoading}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>
              <Button type="submit" size="sm" disabled={isLoading}>
                <Link2 className="mr-2 h-4 w-4" />
                {isLoading ? "Adding..." : "Add"}
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
              <input
                type="file"
                id="file-upload"
                className="sr-only"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.md"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className={cn(
                  "grid cursor-pointer place-items-center gap-1 text-center",
                  isLoading && "pointer-events-none opacity-50"
                )}
              >
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isLoading ? "Uploading..." : "Drag and drop files here, or click to select files"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload PDF or Markdown files from your device
                </p>
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

