import ResearchList from "@/components/research/research-list"
import { useParams } from "react-router"

const linear_algebra = [
  {
    id: "1",
    title: "The Impact of AI on Modern Society",
    author: "Dr. Jane Smith",
    type: "Research Paper",
    year: 2023,
    description:
      "An in-depth analysis of how artificial intelligence is shaping various aspects of contemporary life, including work, education, and social interactions.",
  },
  {
    id: "2",
    title: "Quantum Computing: Principles and Applications",
    author: "Prof. John Doe",
    type: "Book",
    year: 2022,
    description:
      "A comprehensive guide to the fundamentals of quantum computing and its potential applications in cryptography, optimization, and simulation.",
  },
  {
    id: "3",
    title: "Climate Change Mitigation Strategies",
    author: "Dr. Emily Brown",
    type: "Research Report",
    year: 2023,
    description:
      "An examination of various approaches to reducing greenhouse gas emissions and their effectiveness in combating global climate change.",
  },
  {
    id: "4",
    title: "The Evolution of Human Consciousness",
    author: "Dr. Michael Green",
    type: "Book",
    year: 2021,
    description:
      "An exploration of the development of human consciousness from a multidisciplinary perspective, including neuroscience, psychology, and philosophy.",
  },
  {
    id: "5",
    title: "Nanotechnology in Medicine",
    author: "Dr. Sarah Johnson",
    type: "Research Paper",
    year: 2023,
    description:
      "A study of the latest advancements in nanotechnology and their applications in medical diagnosis, drug delivery, and treatment of various diseases.",
  },
  {
    id: "6",
    title: "Sustainable Urban Planning",
    author: "Prof. David Wilson",
    type: "Research Report",
    year: 2022,
    description:
      "An analysis of innovative approaches to urban design and development that prioritize environmental sustainability and quality of life for residents.",
  },
]

const calculus = [
  {
    id: "7",
    title: "The Role of Mathematics in Art",
    author: "Dr. Laura Martinez",
    type: "Research Paper",
    year: 2022,
    description:
      "An exploration of the connections between mathematics and art, including symmetry, fractals, and the golden ratio.",
  },
  {
    id: "8",
    title: "Game Theory and Strategic Decision-Making",
    author: "Prof. Mark Davis",
    type: "Book",
    year: 2021,
    description:
      "A comprehensive overview of game theory and its applications in economics, political science, and evolutionary biology.",
  },
]

const researchItems = [
  {
    title: "Linear Algebra",
    items: linear_algebra,
  },
  {
    title: "Calculus",
    items: calculus,
  },
]

export default function DocumentList() {
  const params = useParams()
  console.log('doc list params', params)

  const items = researchItems.find((item) => item.title === params.category)?.items ?? []
  return (
    <main className="min-h-screen bg-gray-50">
      <ResearchList items={items} />
    </main>
  )
}

