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

const EXPIRATION_OPTIONS = [
  { label: '1 hour', value: 1, unit: 'hours' },
  { label: '24 hours', value: 1, unit: 'days' },
  { label: '3 days', value: 3, unit: 'days' },
  { label: '7 days', value: 7, unit: 'days' },
  { label: '30 days', value: 30, unit: 'days' },
  { label: 'Unlimited', value: null, unit: null },
];

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
  const [selectedExpiration, setSelectedExpiration] = useState(EXPIRATION_OPTIONS[3]); // Default to 7 days
  const [linkGenerated, setLinkGenerated] = useState<boolean>(false);
  
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
      // Calculate expiration date based on selected option
      let expiresAt = null;
      if (selectedExpiration.value !== null) {
        expiresAt = new Date();
        if (selectedExpiration.unit === 'hours') {
          expiresAt.setHours(expiresAt.getHours() + selectedExpiration.value);
        } else {
          expiresAt.setDate(expiresAt.getDate() + selectedExpiration.value);
        }
      }
      
      // Use the API base URL to ensure we're hitting the correct port
      const response = await fetch(`${apiBaseUrl}/api/file/share/${fileKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShareUrl(data.shareUrl);
        setLinkGenerated(true);
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
  }, [apiBaseUrl, fileKey, selectedExpiration]);

  useEffect(() => {
    if (isOpen && fileKey) {
      // Reset state when modal opens
      setShareUrl(null);
      setLinkGenerated(false);
    }
  }, [isOpen, fileKey]);


  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateLink = () => {
    setShareUrl(null);
    setLinkGenerated(false);
    generateShareLink();
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
        
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="expiration" className="text-sm font-medium">
              Link expiration
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {EXPIRATION_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  variant={selectedExpiration.label === option.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedExpiration(option)}
                  disabled={loading}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            type="button"
            onClick={handleGenerateLink}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Share Link'
            )}
          </Button>
          
          {linkGenerated && (
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  value={shareUrl || ''}
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
          )}
        </div>
        
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>File: {fileName}</p>
          {isPasswordProtected ? (
            <p className="text-yellow-600">⚠️ This file requires a password to download</p>
          ) : (
            <p>✓ This file is accessible without password</p>
          )}
          <p className="mt-1">Link expires in: {selectedExpiration.label}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}