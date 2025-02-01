"use client"

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { FileText, FolderTree, Plus } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"
import { useCallback } from "react"
import type { Document, Category } from "@/lib/db"

interface CommandPaletteProps {
  defaultOpen?: boolean
}

export function CommandPalette({ defaultOpen = false }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const { search, results, isIndexing } = useSearch()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = useCallback((value: string) => {
    search(value)
  }, [search])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search documents and categories..." 
        onValueChange={handleSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {isIndexing && (
          <div className="py-6 text-center text-sm">Initializing search...</div>
        )}
        {results.length > 0 && (
          <>
            <CommandGroup heading="Documents">
              {results
                .filter((result): result is { type: "document"; item: Document } => 
                  result.type === "document"
                )
                .map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.item.id}`}
                    value={`doc-${result.item.id}`}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{result.item.title}</span>
                      {result.item.summary && (
                        <span className="text-sm text-muted-foreground">
                          {result.item.summary.slice(0, 100)}
                          {result.item.summary.length > 100 ? "..." : ""}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="Categories">
              {results
                .filter((result): result is { type: "category"; item: Category } => 
                  result.type === "category"
                )
                .map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.item.id}`}
                    value={`cat-${result.item.id}`}
                  >
                    <FolderTree className="mr-2 h-4 w-4" />
                    <span>{result.item.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
        <CommandGroup heading="Actions">
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Document</span>
          </CommandItem>
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Category</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}