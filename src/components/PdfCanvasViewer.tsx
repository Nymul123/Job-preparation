import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Maximize2
} from 'lucide-react';
import { JobQuestionPost } from '../types';
import { createJobQuestionPdf } from '../utils/pdfGenerator';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfCanvasViewerProps {
  post: JobQuestionPost;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({ post }) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.3);
  const [loading, setLoading] = useState<boolean>(true);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Load the PDF document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    async function loadPdf() {
      try {
        let uint8Data: Uint8Array;

        if (post.pdfDataUrl) {
          // Uploaded PDF file base64 data URL
          const base64Data = post.pdfDataUrl.includes(',') 
            ? post.pdfDataUrl.split(',')[1] 
            : post.pdfDataUrl;
          const binaryStr = atob(base64Data);
          const len = binaryStr.length;
          uint8Data = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            uint8Data[i] = binaryStr.charCodeAt(i);
          }
        } else {
          // Dynamically generated from question data
          const doc = createJobQuestionPdf(post);
          const arrayBuffer = doc.output('arraybuffer');
          uint8Data = new Uint8Array(arrayBuffer);
        }

        const loadingTask = pdfjsLib.getDocument({ 
          data: uint8Data,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
          cMapPacked: true,
        });

        const loadedDoc = await loadingTask.promise;

        if (isCancelled) return;

        setPdfDoc(loadedDoc);
        setNumPages(loadedDoc.numPages || 1);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load PDF in PDF.js:', err);
        if (!isCancelled) {
          setError('Could not decode PDF document pages. Please ensure the file is a valid PDF.');
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [post]);

  // 2. Render the current page on canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCurrent = true;
    setRenderingPage(true);

    async function renderPage() {
      try {
        // Cancel prior running render task if any
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
        }

        const page = await pdfDoc.getPage(currentPage);
        if (!isCurrent || !canvasRef.current) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set dimensions directly without pre-transforming context
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;

        if (isCurrent) {
          setRenderingPage(false);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${currentPage}:`, err);
        }
        if (isCurrent) {
          setRenderingPage(false);
        }
      }
    }

    renderPage();

    return () => {
      isCurrent = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((p) => p + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.6));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.7));
  };

  const handleFitWidth = () => {
    setScale(1.25);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-8 space-y-3 bg-slate-950">
        <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
        <p className="text-sm font-semibold text-white">Loading PDF Document...</p>
        <p className="text-xs text-slate-400">Preparing pages for page-by-page display</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-rose-300 p-8 space-y-3 text-center bg-slate-950">
        <AlertCircle className="w-10 h-10 text-rose-400" />
        <p className="text-sm font-semibold text-white">{error}</p>
        <p className="text-xs text-slate-400 max-w-sm">
          You can use the Download PDF button in the top right to download and view this document directly.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-950">
      
      {/* Page Navigation & Zoom Control Bar - Page by Page Header */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between text-white shrink-0 select-none z-10">
        
        {/* Page By Page Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-200 cursor-pointer"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Dropdown / Indicator */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-slate-400">Page</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-transparent text-white font-bold font-mono focus:outline-none cursor-pointer pr-1"
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  {p}
                </option>
              ))}
            </select>
            <span className="text-slate-400">of {numPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-200 cursor-pointer"
            title="Next Page"
            aria-label="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.7}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors text-slate-300 hover:text-white"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-slate-200 w-11 text-center font-semibold">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 2.6}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors text-slate-300 hover:text-white"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleFitWidth}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors ml-1"
            title="Fit to standard size"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reset Zoom</span>
          </button>
        </div>
      </div>

      {/* Main Single Page Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/95 relative"
      >
        <div className="relative my-auto flex flex-col items-center">
          
          {/* Page Loading Overlay */}
          {renderingPage && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-xl">
              <div className="bg-slate-900/90 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs text-white shadow-lg">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Rendering Page {currentPage}...</span>
              </div>
            </div>
          )}

          {/* PDF Page Canvas Card */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-600/60 p-2 sm:p-3">
            <canvas 
              ref={canvasRef} 
              className="block bg-white shadow-sm mx-auto" 
            />
          </div>

          {/* Quick Page Nav Footer */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Viewing Page {currentPage} of {numPages}</span>
            <span>·</span>
            <span>{post.organization}</span>
          </div>
        </div>
      </div>

      {/* Quick Page Jump Thumbnail strip (if multi-page document) */}
      {numPages > 1 && (
        <div className="h-12 bg-slate-900 border-t border-slate-800 px-4 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>Jump to:</span>
          </span>
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => {
                setCurrentPage(pageNum);
                containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                currentPage === pageNum
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Page {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
