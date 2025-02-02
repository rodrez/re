import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  MessageSquare,
  Brain,
} from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
// Initialize PDF.js worker

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SelectionPosition {
  x: number;
  y: number;
}

interface PDFViewerProps {
  fileData: Uint8Array | null;
  fileName?: string;
  fileType?: 'pdf' | 'text' | 'other';
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
  onExplainWithAI?: (text: string) => void;
  onSendToChat?: (text: string) => void;
}

export function PDFViewer({
  fileData,
  fileName,
  fileType,
  onLoadSuccess,
  onLoadError,
  onExplainWithAI,
  onSendToChat
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<SelectionPosition | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (fileData) {
      // Create a blob URL from the file data
      const blob = new Blob([fileData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Cleanup the URL when component unmounts or fileData changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileData]);

  useEffect(() => {
    if (pdfUrl) {
      pdfjs.getDocument(pdfUrl).promise.then((pdf) => {
        setPdfDocument(pdf);
      }).catch((error) => {
        console.error('Error loading PDF document:', error);
      });
    }
  }, [pdfUrl]);

  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search query is empty, clear results immediately
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    // Set a new timeout for the search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch();
    }, 300);

    // Cleanup on unmount or when searchQuery changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle text selection
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const text = selection.toString().trim();
        setSelectedText(text);

        // Get the selection coordinates
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // If clicked in the bottom half of the selection, send to chat
        const clickY = window.innerHeight - rect.bottom;
        if (clickY < rect.height / 2) {
          onSendToChat?.(text);
          return;
        }

        // Calculate position for the menu
        setSelectionPosition({
          x: rect.left + (rect.width / 2),
          y: rect.top - 10 // Position slightly above the selection
        });

        // Clear any existing timeout
        if (menuTimeoutRef.current) {
          window.clearTimeout(menuTimeoutRef.current);
        }

        // Show menu after delay
        menuTimeoutRef.current = window.setTimeout(() => {
          setShowMenu(true);
        }, 200);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.selection-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      if (menuTimeoutRef.current) {
        window.clearTimeout(menuTimeoutRef.current);
      }
    };
  }, [onSendToChat]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onLoadSuccess?.(numPages);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const handlePrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  };

  const handlePageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(event.target.value);
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const handleDownload = async () => {
    if (!fileData || !fileName) return;

    try {
      const blob = new Blob([fileData], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const customTextRenderer = useCallback(
    ({ str }: { str: string; itemIndex: number }) => {
      if (!searchQuery) return str;

      // For case-insensitive search, work with lowercased copies
      const lowerStr = str.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      let result = '';
      let currentIndex = 0;

      // Loop to find all occurrences of the search query.
      while (true) {
        const foundIndex = lowerStr.indexOf(lowerQuery, currentIndex);

        // No more matches found: append the rest of the string and break.
        if (foundIndex === -1) {
          result += str.substring(currentIndex);
          break;
        }

        // Append the text before the match.
        result += str.substring(currentIndex, foundIndex);

        // Append the matched text wrapped in a <mark> tag.
        result += `<mark class="bg-teal-200 mix-blend-multiply text-teal-800">` +
          str.substring(foundIndex, foundIndex + searchQuery.length) +
          `</mark>`;

        // Update the index to search for the next occurrence.
        currentIndex = foundIndex + searchQuery.length;
      }

      return result;
    },
    [searchQuery]
  );

  const handleSearch = async () => {
    if (!searchQuery.trim() || !pdfDocument) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    try {
      const results: number[] = [];
      const lowerQuery = searchQuery.toLowerCase();

      // Search through all pages
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .toLowerCase();

        if (pageText.includes(lowerQuery)) {
          results.push(i);
        }
      }

      setSearchResults(results);
      if (results.length > 0) {
        setCurrentSearchIndex(0);
        setPageNumber(results[0]);
      } else {
        setCurrentSearchIndex(-1);
      }
    } catch (error) {
      console.error('Error searching PDF:', error);
    }
  };

  const handleNextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    setPageNumber(searchResults[nextIndex]);
  };

  const handlePrevSearchResult = () => {
    if (searchResults.length === 0) return;
    const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    setPageNumber(searchResults[prevIndex]);
  };

  if (!fileData || !pdfUrl || fileType !== 'pdf') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No PDF document loaded</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            value={[scale * 100]}
            min={50}
            max={300}
            step={10}
            className="w-32"
            onValueChange={(value) => setScale(value[0] / 100)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRotate}
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={handlePageChange}
              className="w-16 text-center"
            />
            <span className="text-sm text-muted-foreground">
              / {numPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <Search className="h-4 w-4" />
          </Button>
          {searchResults.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevSearchResult}
                title="Previous result"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentSearchIndex + 1} / {searchResults.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextSearchResult}
                title="Next result"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/10 relative">
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={onLoadError}
            className="max-w-full"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg"
              renderTextLayer={true}
              customTextRenderer={customTextRenderer}
              // canvasBackground='transparent'
              renderAnnotationLayer={true}
            />
          </Document>
        </div>

        {/* Floating Selection Menu */}
        {showMenu && selectionPosition && selectedText && (
          <div
            className="selection-menu fixed z-50 bg-popover shadow-md rounded-md border border-border p-1"
            style={{
              left: `${selectionPosition.x}px`,
              top: `${selectionPosition.y}px`,
              transform: 'translate(-50%, -100%) scale(0)',
              animation: 'scaleIn 150ms ease forwards',
            }}
          >
            <style>
              {`
                @keyframes scaleIn {
                  from { transform: translate(-50%, -100%) scale(0); }
                  to { transform: translate(-50%, -100%) scale(1); }
                }
              `}
            </style>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-sm px-3 py-2 hover:bg-accent"
                onClick={() => {
                  onExplainWithAI?.(selectedText);
                  setShowMenu(false);
                }}
              >
                <Brain className="h-4 w-4" />
                Explain
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-sm px-3 py-2 hover:bg-accent"
                onClick={() => {
                  onSendToChat?.(selectedText);
                  setShowMenu(false);
                }}
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
