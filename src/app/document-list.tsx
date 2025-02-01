import ResearchList from "@/components/research/research-list"
import { useParams } from "react-router"
import { db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"

export default function DocumentList() {
  const { category: categoryName } = useParams()

  // Get documents for the current category
  const documents = useLiveQuery(async () => {
    if (!categoryName) return []

    if (categoryName === 'uncategorized') {
      // For uncategorized, get documents that don't have any category
      const allDocIds = await db.documentCategories.toArray()
      const categorizedDocIds = new Set(allDocIds.map(dc => dc.documentId))

      return await db.documents
        .filter(doc => !categorizedDocIds.has(doc.id!))
        .toArray()
    } else {
      // Get the category
      const category = await db.categories
        .where('name')
        .equals(categoryName)
        .first()

      if (!category) return []

      // Get all document IDs in this category
      const docCategories = await db.documentCategories
        .where('categoryId')
        .equals(category.id!)
        .toArray()

      const docIds = docCategories.map(dc => dc.documentId)

      // Get all documents
      return await db.documents
        .where('id')
        .anyOf(docIds)
        .toArray()
    }
  }, [categoryName]) ?? []

  // Convert documents to ResearchItem format with default values for required fields
  const items = documents.map(doc => ({
    id: doc.id!.toString(),
    title: doc.title,
    author: doc.author ?? "Unknown Author",
    type: doc.type.charAt(0).toUpperCase() + doc.type.slice(1),
    year: doc.importDate ? new Date(doc.importDate).getFullYear() : new Date().getFullYear(),
    description: doc.summary ?? "No description available"
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <ResearchList items={items} />
    </main>
  )
}

