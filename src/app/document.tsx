import { useState, useEffect } from "react"
import ChatDialog from "@/components/document/chat"
import { Button } from "@/components/ui/button"
import { Expand, Trash2, FolderEdit } from "lucide-react"
import PDFViewer from "@/components/document/pdf-viewer"
import { useParams, useNavigate } from "react-router"
import { db } from "@/lib/db"
import { searchService } from "@/lib/search"
import { readFile } from '@tauri-apps/plugin-fs'
import { invoke } from '@tauri-apps/api/core'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLiveQuery } from "dexie-react-hooks"
import { toast } from "@/hooks/use-toast"

export default function ResearchAssistant() {
  const [isDocumentPopped, setIsDocumentPopped] = useState(false)
  const [isChatPopped, setIsChatPopped] = useState(false)
  const [fileData, setFileData] = useState<Uint8Array | null>(null)
  const [currentDoc, setCurrentDoc] = useState<{ id: number; title: string; type: 'pdf' | 'text' | 'other' } | null>(null)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const navigate = useNavigate()

  const { category: categoryName, document: documentSlug } = useParams()

  // Get all categories for the select dropdown
  const categories = useLiveQuery(() => db.categories.toArray()) ?? []

  useEffect(() => {
    const loadDocument = async () => {
      if (!documentSlug || !categoryName) return

      // Convert slug back to a searchable title format
      const searchTitle = documentSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // First find the category
      const category = await db.categories
        .where('name')
        .equals(categoryName)
        .first()

      if (!category) return

      // Find the document by title
      const doc = await db.documents
        .where('title')
        .equalsIgnoreCase(searchTitle)
        .first()

      if (!doc) return

      setCurrentDoc({ id: doc.id!, title: doc.title, type: doc.type })

      // Verify the document belongs to this category
      const docCategory = await db.documentCategories
        .where('documentId')
        .equals(doc.id!)
        .and(item => item.categoryId === category.id)
        .first()

      // Only load the document if it belongs to the category
      // or if we're in the uncategorized section and the document has no category
      if ((categoryName === 'uncategorized' && !docCategory) || docCategory) {
        try {
          console.log('Original document filePath from database:', doc.filePath);
          let filePath = '';
          if (doc.filePath.startsWith('/')) {
            console.log('Using absolute file path from database:', doc.filePath);
            filePath = doc.filePath;
          } else {
            const fileName = doc.filePath.split('/').pop() || doc.filePath; // Get just the filename
            console.log('Extracted file name for file loading:', fileName);
            filePath = await invoke<string>('get_file_path', { fileName });
            console.log('File path returned by Tauri:', filePath);
          }

          // Read the file using Tauri's filesystem API
          const fileContent = await readFile(filePath);
          setFileData(fileContent);
        } catch (error) {
          console.error('Error loading document:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load the document. Please try again.",
          });
        }
      }
    }

    loadDocument()
  }, [categoryName, documentSlug])

  const handleDeleteDocument = async () => {
    if (!currentDoc) return

    try {
      // Delete document from database
      await db.documents.delete(currentDoc.id)
      // Remove from search index
      await searchService.removeDocument(currentDoc.id)
      // Delete document category associations
      await db.documentCategories
        .where('documentId')
        .equals(currentDoc.id)
        .delete()

      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      })

      // Navigate back to the category page
      navigate(`/${categoryName}`)
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the document. Please try again.",
      })
    }
  }

  const handleCategoryChange = async (newCategoryId: string) => {
    if (!currentDoc) return

    try {
      // Delete existing category associations
      await db.documentCategories
        .where('documentId')
        .equals(currentDoc.id)
        .delete()

      // Add new category association if not uncategorized
      if (newCategoryId !== 'uncategorized') {
        await db.documentCategories.add({
          documentId: currentDoc.id,
          categoryId: parseInt(newCategoryId)
        })
      }

      // Get the new category name for navigation
      const newCategory = newCategoryId === 'uncategorized'
        ? { name: 'uncategorized' }
        : await db.categories.get(parseInt(newCategoryId))

      if (newCategory) {
        // Navigate to the new category
        navigate(`/${newCategory.name}/${documentSlug}`)
      }

      toast({
        title: "Category updated",
        description: "The document category has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the document category. Please try again.",
      })
    } finally {
      setIsCategoryDialogOpen(false)
    }
  }

  const popOutDocument = () => {
    setIsDocumentPopped(true)
  }


  return (
    <div className="flex h-full bg-gray-100">
      {!isDocumentPopped && (
        <div className="flex-1 p-4 relative w-6/12">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FolderEdit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Category</DialogTitle>
                  <DialogDescription>
                    Select a new category for this document
                  </DialogDescription>
                </DialogHeader>
                <Select onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      category.name !== 'uncategorized' && (
                        <SelectItem key={category.id} value={category.id!.toString()}>
                          {category.name}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleDeleteDocument}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={popOutDocument} variant="ghost" size="sm">
              <Expand />
            </Button>
          </div>
          <PDFViewer fileData={fileData} fileName={currentDoc?.title} fileType={currentDoc?.type} />
        </div>
      )}
      {!isChatPopped && (
        <div className="w-1/3 p-4 border-l border-gray-200 relative">
          <Button className="absolute top-4 right-4 z-10" onClick={popOutDocument} variant="ghost" size="sm">
            <Expand />
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
            <PDFViewer fileData={fileData} fileName={currentDoc?.title} fileType={currentDoc?.type} />
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


