import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Copy, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragDropImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageFileSelect: (file: File) => void;
  currentImageUrl?: string;
  onRemoveImage: () => void;
  isUploading?: boolean;
  uploadProgress?: number | null;
  uploadStatus?: string | null;
}

export function DragDropImageUpload({
  onImageUpload,
  onImageFileSelect,
  currentImageUrl,
  onRemoveImage,
  isUploading = false,
  uploadProgress,
  uploadStatus
}: DragDropImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Handle file selection from file input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Handle file processing
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setPasteStatus('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setPasteStatus('File size exceeds 5MB limit');
      return;
    }

    // Clear any previous status
    setPasteStatus(null);
    
    // Call the parent's file selection handler
    onImageFileSelect(file);
  }, [onImageFileSelect]);

  // Handle paste event
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.items.length > 0) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    }
  }, [handleFile]);

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // Handle base64 image from drag-and-drop URL
  const handleBase64FromUrl = (url: string) => {
    // This would be used if someone drags an image URL
    onImageUpload(url);
  };

  return (
    <div className="space-y-4">
      {/* Current image display */}
      {currentImageUrl && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img 
              src={currentImageUrl} 
              alt="Current laptop" 
              className="h-20 w-20 object-cover rounded border"
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Current image</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemoveImage}
                className="w-fit"
              >
                <X className="h-4 w-4 mr-1" />
                Remove Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drag and drop zone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px bg-gray-300 w-12"></div>
            <div className="flex items-center gap-1">
              <Copy className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">or paste</span>
            </div>
            <div className="h-px bg-gray-300 w-12"></div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">Press Ctrl+V (Cmd+V on Mac) to paste an image</p>
        </div>
      </div>

      {/* Upload status and progress */}
      {uploadProgress !== null && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {(uploadStatus || pasteStatus) && (
        <div className={`text-sm ${
          uploadStatus?.includes('failed') || uploadStatus?.includes('Please') || 
          pasteStatus?.includes('failed') || pasteStatus?.includes('Please') 
            ? 'text-red-600' 
            : 'text-green-600'
        }`}>
          {uploadStatus || pasteStatus}
        </div>
      )}
    </div>
  );
}