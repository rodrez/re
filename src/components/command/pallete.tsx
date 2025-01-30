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
import { Plus, Search, Users, HelpCircle } from "lucide-react"

interface CommandPaletteProps {
  defaultOpen?: boolean
}

export function CommandPalette({ defaultOpen = false }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(defaultOpen)

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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="What do you need?" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Projects">
          <CommandItem>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Projects...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>P
            </kbd>
          </CommandItem>
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Project...</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Teams">
          <CommandItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Search Teams...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">↑</span>P
            </kbd>
          </CommandItem>
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Team...</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Help">
          <CommandItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Search Docs...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">↑</span>D
            </kbd>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}