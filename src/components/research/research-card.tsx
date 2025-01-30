import type { FC } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CardProps {
  title: string
  author: string
  type: string
  year: number
  description: string
}

const ResearchCard: FC<CardProps> = ({ title, author, type, year, description }) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="secondary">{type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{author}</p>
        <p className="text-sm text-muted-foreground mb-4">{year}</p>
        <p className="text-sm">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto">{/* You can add additional actions here if needed */}</CardFooter>
    </Card>
  )
}

export default ResearchCard

