import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string;
  caption: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  caption,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
        {/* Controls */}
        <div className="w-full flex items-center justify-between text-white pb-3 border-b border-slate-800">
          <p className="text-xs sm:text-sm font-medium text-slate-300 truncate pr-4">
            {caption || 'Question Paper Diagram'}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale(1)}
              className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-white"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg ml-2"
              aria-label="Close image lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 w-full overflow-auto flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={caption || 'Question diagram preview'}
            referrerPolicy="no-referrer"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};
