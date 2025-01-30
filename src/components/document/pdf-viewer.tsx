import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Loader2
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useCallback } from 'react'
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Set up the worker
// pdfjs.GlobalWorkerOptions.workerSrc = ""
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Highlgiht search
function highlightPattern(text: string, pattern: string) {
  if (!pattern) return text;
  return text.replace(pattern, (value) => `<span class="bg-teal-400/40 text-black font-semibold rounded p-0.5">${value}</span>`);
}

const PDFViewer = ({ file }: { file: File }) => {
  // State for PDF handling
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();
  const [searchText, setSearchText] = useState('');

  function onChange(event) {
    setSearchText(event.target.value);
  }

  // TODO: Remove this when file saving is implemented
  const [testFile, setTestFile] = useState<File | null>(null);

  // Handle successful PDF load
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    toast({
      title: "PDF loaded successfully",
      description: `Total pages: ${numPages}`,
    });
  };

  // Handle PDF load error
  const onDocumentLoadError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Error loading PDF",
      description: "Please check if the file is a valid PDF document.",
    });
    console.error('Error loading PDF:', error);
  };

  // Handle page navigation
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= (numPages ?? 1)) {
      setCurrentPage(pageNum);
    }
  };

  // Handle zoom changes
  const handleZoom = (newZoom: number[]) => {
    setZoomLevel(newZoom[0]);
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const LoadingMessage = () => (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm text-gray-500">Loading PDF...</p>
    </div>
  );

  const textRenderer = useCallback(
    (textItem) => highlightPattern(textItem.str, searchText),
    [searchText]
  )

  return (
    <Card className="w-full mx-auto bg-white shadow-lg h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min={1}
              max={numPages ?? 1}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-16 text-center"
            />
            <span className="text-sm text-gray-500">
              of {numPages || '-'}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= (numPages ?? 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div>
        <label htmlFor="search">Search:</label>
        <input type="search" id="search" value={searchText} onChange={onChange} />
      </div>
        {/* Remove this when file saving is implemented */}
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setTestFile(e.target.files[0])}
        />
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom([Math.max(25, zoomLevel - 25)])}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Slider
              value={[zoomLevel]}
              onValueChange={handleZoom}
              min={25}
              max={200}
              step={25}
              className="w-32"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom([Math.min(200, zoomLevel + 25)])}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!file}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <ScrollArea className='h-[80vh]'>
        <CardContent className="p-8 pt-32 flex items-center justify-center bg-gray-50">
          <div
            className="bg-white shadow-md"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <Document
              file={file ?? testFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<LoadingMessage />}
            >
              <Page
                pageNumber={currentPage}
                scale={zoomLevel / 100}
                rotate={rotation}
                loading={<LoadingMessage />}
                renderTextLayer={true}   // Keep true to allow selection.
                customTextRenderer={textRenderer}
              />
            </Document>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default PDFViewer;
