import ResearchList from "@/components/research/research-list"

const researchItems = [
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

export default function DocumentList() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ResearchList items={researchItems} />
    </main>
  )
}

