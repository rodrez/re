import { useEffect, useRef, useCallback, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import { type PDFDocumentProxy } from 'pdfjs-dist';
import { ScrollArea } from "@/components/ui/scroll-area";


pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileData: Uint8Array | null;
  fileName?: string;
  fileType?: 'pdf' | 'text' | 'other';
}

const PDFViewer = ({ fileData, fileName, fileType }: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [textContent, setTextContent] = useState<string>('');

  // Load PDF document
  useEffect(() => {
    if (!fileData) return;

    const loadPDF = async () => {
      setIsLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument({ data: fileData });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        await renderPage(pdf, 1, scale); // Wait for the initial render to complete
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [fileData]);

  // Render PDF page
  const renderPage = useCallback(async (pdf: PDFDocumentProxy, pageNumber: number, scale: number) => {
    if (!canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Get text content for search
      const textContent = await page.getTextContent();
      setTextContent(textContent.items.map((item: any) => item.str).join(' '));

    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, []);

  // Navigation functions
  const goToPage = useCallback((pageNumber: number) => {
    if (!pdfDoc) return;

    const targetPage = Math.max(1, Math.min(pageNumber, pdfDoc.numPages));
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      renderPage(pdfDoc, targetPage, scale);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  const handleZoom = (delta: number) => {
    if (!pdfDoc) return;

    const newScale = Math.max(0.25, Math.min(5.0, scale + delta));
    setScale(newScale);
    renderPage(pdfDoc, currentPage, newScale);
  };

  const handleDownload = useCallback(() => {
    if (!fileData || !fileName) return;
    const blob = new Blob([fileData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fileData, fileName]);

  const handleSearch = useCallback(() => {
    if (!searchText || !textContent) return;

    const searchRegex = new RegExp(searchText, 'gi');
    const matches = textContent.match(searchRegex);

    if (matches) {
      // Highlight matches in canvas (you could implement this)
      console.log(`Found ${matches.length} matches`);
    }
  }, [searchText, textContent]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowLeft' || (e.key === 'p' && e.ctrlKey)) {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === 'ArrowRight' || (e.key === 'n' && e.ctrlKey)) {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === '+' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleZoom(0.25);
      } else if (e.key === '-' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleZoom(-0.25);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, scale]);

  return (
    <Card className="w-full h-full bg-white shadow-lg overflow-hidden flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={!pdfDoc || currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min={1}
              max={pdfDoc?.numPages || 1}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm text-gray-500">
              of {pdfDoc?.numPages || '-'}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={!pdfDoc || currentPage >= (pdfDoc?.numPages || 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-40"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(-0.25)}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500 w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(0.25)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <ScrollArea className="flex-1">
        <div className="flex justify-center p-4 min-h-full bg-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <span className="text-gray-500">Loading PDF...</span>
            </div>
          ) : fileData ? (
            <canvas
              ref={canvasRef}
              className="shadow-lg bg-white"
            />
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">No document loaded</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PDFViewer;
