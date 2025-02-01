"use client"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { FileText, FolderTree, Plus, Search } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import { useCallback, useState } from "react"
import { db } from "@/lib/db"
import { CreateCategoryDialog } from "@/components/category-dialog"
import { UploadDialog } from "@/components/document/add"
import { useLiveQuery } from "dexie-react-hooks"
import { useNavigate } from "react-router"

export function CommandBase() {
  const { search, results, isSearching } = useSearch()
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const navigate = useNavigate()

  // Use useLiveQuery to automatically update when database changes
  const categories = useLiveQuery(() => db.categories.toArray()) ?? []
  const documents = useLiveQuery(() => db.documents.toArray()) ?? []

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    search(value)
  }, [search])

  // Filter documents and categories based on search results when there's a search query
  const filteredDocuments = searchQuery
    ? documents.filter(doc =>
      results.some(result =>
        result.type === 'document' && result.item.id === doc.id
      )
    )
    : documents
  console.log("filteredDocuments: ", filteredDocuments)

  const filteredCategories = searchQuery
    ? categories.filter(cat =>
      results.some(result =>
        result.type === 'category' && result.item.id === cat.id
      )
    )
    : categories
  console.log("filteredCats: ", filteredCategories)

  // Function to convert title to URL-friendly slug
  const slugify = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '') // Trim hyphens from start
      .replace(/-+$/, ''); // Trim hyphens from end
  }

  const handleSelect = useCallback(async (value: string) => {
    if (value.startsWith('doc-')) {
      const id = value.replace('doc-', '')
      const docId = parseInt(id)
      // Get the document from database
      const document = await db.documents.get(docId)
      if (!document) return

      // Get the document's category from the join table
      const docCategory = await db.documentCategories
        .where('documentId')
        .equals(docId)
        .first()

      if (docCategory) {
        const category = await db.categories.get(docCategory.categoryId)
        if (category) {
          navigate(`/${category.name}/${slugify(document.title)}`)
        }
      } else {
        // If document has no category, navigate directly to document
        navigate(`/uncategorized/${slugify(document.title)}`)
      }
    } else if (value.startsWith('cat-')) {
      const id = value.replace('cat-', '')
      // Get the category from database
      const category = await db.categories.get(parseInt(id))
      if (category) {
        navigate(`/${category.name}`)
      }
    }
  }, [navigate])

  return (
    <>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search documents and categories..."
          onValueChange={handleSearch}
        />
        <CommandList>
          {isSearching ? (
            <CommandEmpty>Searching...</CommandEmpty>
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {filteredDocuments.length > 0 && (
            <CommandGroup heading="Documents">
              {filteredDocuments.map((result) => (
                <CommandItem
                  key={`${result.id}`}
                  value={`doc-${result.id}`}
                  onSelect={handleSelect}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.summary && (
                      <span className="text-sm text-muted-foreground">
                        {result.summary.slice(0, 100)}
                        {result.summary.length > 100 ? "..." : ""}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {filteredCategories.length > 0 && (
            <CommandGroup heading="Categories">
              {filteredCategories.map((result) => (
                <CommandItem
                  key={`${result.id}`}
                  value={`cat-${result.name}`}
                  onSelect={handleSelect}
                >
                  <FolderTree className="mr-2 h-4 w-4" />
                  <span>{result.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => setOpenUploadDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New Document</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>N
              </kbd>
            </CommandItem>
            <CommandItem onSelect={() => setOpenCategoryDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Category</span>
            </CommandItem>
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Advanced Search</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>F
              </kbd>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <CreateCategoryDialog
        open={openCategoryDialog}
        onOpenChange={setOpenCategoryDialog}
      />
      <UploadDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
      />
    </>
  )
}

