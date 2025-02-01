"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/lib/db"

export function CreateCategoryDialog({open, onOpenChange  }: {open: boolean, onOpenChange: (open: boolean) => void}) {

  const [categoryName, setCategoryName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function createCategory(categoryName: string) {
    const category = await db.categories.add({ name: categoryName});
    console.log('Category created with ID:', category);
    return {
      success: true,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await createCategory(categoryName)

    setIsLoading(false)

    if (result.success) {
      setCategoryName("")
      onOpenChange(false)
    } else {
      alert("Failed to create category. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

