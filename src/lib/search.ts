import FlexSearch from "flexsearch";
import type { Document, Category } from "@/lib/db";
import { db } from "@/lib/db";

export interface SearchResult {
  type: "document" | "category";
  item: Document | Category;
  score?: number;
}

class SearchService {
  private documentIndex: FlexSearch.Document<Document, true>;
  private categoryIndex: FlexSearch.Document<Category, true>;

  constructor() {
    this.documentIndex = new FlexSearch.Document({
      document: {
        id: "id",
        index: [
          "title",
          "author",
          "summary",
          "type"
        ],
        store: true
      },
      tokenize: "forward",
      context: {
        resolution: 9,
        depth: 2,
        bidirectional: true,
      },
    });

    this.categoryIndex = new FlexSearch.Document({
      document: {
        id: "id",
        index: ["name"],
        store: true
      },
      tokenize: "forward",
    });
  }

  async indexAll() {
    // Clear existing indices
    this.documentIndex.remove("*");
    this.categoryIndex.remove("*");

    // Index all documents
    const documents = await db.documents.toArray();
    documents.forEach(doc => {
      if (doc.id !== undefined) {
        this.documentIndex.add(doc);
      }
    });

    // Index all categories
    const categories = await db.categories.toArray();
    categories.forEach(category => {
      if (category.id !== undefined) {
        this.categoryIndex.add(category);
      }
    });
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!query) return [];

    const [documentResults, categoryResults] = await Promise.all([
      this.documentIndex.searchAsync(query, {
        enrich: true,
        limit: 10,
      }),
      this.categoryIndex.searchAsync(query, {
        enrich: true,
        limit: 5,
      })
    ]);

    const results: SearchResult[] = [];

    // Process document results
    documentResults.forEach(result => {
      result.result.forEach((docResult) => {
        const doc = docResult.doc as Document;
        results.push({
          type: "document",
          item: doc,
          score: result.field ? parseFloat(result.field) : undefined
        });
      });
    });

    // Process category results
    categoryResults.forEach(result => {
      result.result.forEach((catResult) => {
        const category = catResult.doc as Category;
        results.push({
          type: "category",
          item: category,
          score: result.field ? parseFloat(result.field) : undefined
        });
      });
    });

    // Sort by score
    return results.sort((a, b) => ((b.score || 0) - (a.score || 0)));
  }

  // Method to add or update a single document
  async addDocument(document: Document) {
    if (document.id !== undefined) {
      this.documentIndex.add(document);
    }
  }

  // Method to add or update a single category
  async addCategory(category: Category) {
    if (category.id !== undefined) {
      this.categoryIndex.add(category);
    }
  }

  // Method to remove a document
  async removeDocument(id: number) {
    this.documentIndex.remove(id);
  }

  // Method to remove a category
  async removeCategory(id: number) {
    this.categoryIndex.remove(id);
  }
}

// Export a singleton instance
export const searchService = new SearchService(); 