'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Link, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileKey: string;
  fileName: string;
  isPasswordProtected: boolean;
}

export default function ShareModal({
  isOpen,
  onClose,
  fileKey,
  fileName,
  isPasswordProtected,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  
  // Set the API base URL on the client side
  useEffect(() => {
    const getApiBaseUrl = () => {
      // Always use the same origin for API requests
      return window.location.origin;
    };
    
    setApiBaseUrl(getApiBaseUrl());
  }, []);

  const generateShareLink = useCallback(async () => {
    setLoading(true);
    try {
      // Use the API base URL to ensure we're hitting the correct port
      const response = await fetch(`${apiBaseUrl}/api/file/share/${fileKey}`);
      const data = await response.json();
      
      if (response.ok) {
        setShareUrl(data.shareUrl);
      } else {
        if (data.setupRequired) {
          toast.error(
            'File sharing is not set up. Please see FILE_MANAGEMENT_SETUP.md for instructions on how to set up the file management feature.',
            {
              duration: 8000, // Show for longer to give users time to read
              action: {
                label: 'View Guide',
                onClick: () => {
                  window.open('/FILE_MANAGEMENT_SETUP.md', '_blank');
                }
              }
            }
          );
        } else {
          toast.error(data.error || 'Failed to generate share link');
        }
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, fileKey]);

  useEffect(() => {
    if (isOpen && fileKey) {
      generateShareLink();
    }
  }, [isOpen, fileKey, generateShareLink]);

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share this file with others using the link below.
            {isPasswordProtected && ' This file requires a password to download.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              value={shareUrl || 'Generating...'}
              readOnly
              disabled={loading}
              className="h-10"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={copyToClipboard}
            disabled={!shareUrl || loading}
          >
            {copied ? (
              'Copied!'
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Generating share link...</span>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>File: {fileName}</p>
          {isPasswordProtected ? (
            <p className="text-yellow-600">⚠️ This file requires a password to download</p>
          ) : (
            <p>✓ This file is accessible without password</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}