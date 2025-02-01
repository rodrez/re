import { useState, useCallback, useEffect } from "react";
import { searchService, type SearchResult } from "@/lib/search";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);

  // Initialize search index when the hook is first used
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        setIsIndexing(true);
        await searchService.indexAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize search");
      } finally {
        setIsIndexing(false);
      }
    };

    initializeSearch();
  }, []);

  // Use useLiveQuery to automatically update when database changes
  useLiveQuery(async () => {
    try {
      const documents = await db.documents.toArray();
      const categories = await db.categories.toArray();
      
      // Update search index with latest data
      documents.forEach(doc => {
        if (doc.id !== undefined) {
          searchService.addDocument(doc);
        }
      });
      
      categories.forEach(category => {
        if (category.id !== undefined) {
          searchService.addCategory(category);
        }
      });
    } catch (err) {
      console.error("Failed to update search index:", err);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const searchResults = await searchService.search(query);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    search,
    results,
    isSearching,
    isIndexing,
    error,
  };
} 