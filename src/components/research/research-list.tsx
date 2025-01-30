import type { FC } from "react"
import ResearchCard from "./research-card"

interface ResearchItem {
  id: string
  title: string
  author: string
  type: string
  year: number
  description: string
}

interface ResearchListProps {
  items: ResearchItem[]
}

const ResearchList: FC<ResearchListProps> = ({ items }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Research Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <ResearchCard key={item.id} {...item}  />
        ))}
      </div>
    </div>
  )
}

export default ResearchList

