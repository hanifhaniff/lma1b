'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Download, File, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadFilePageProps {
  fileKey: string;
  fileName: string;
  requiresPassword: boolean;
  shareId: string;
}

export function DownloadFilePage({
  fileKey,
  fileName,
  requiresPassword,
  shareId
}: DownloadFilePageProps) {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isValidShare, setIsValidShare] = useState<boolean>(true);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  
  // Set the API base URL on the client side
  useEffect(() => {
    const getApiBaseUrl = () => {
      // Always use the same origin for API requests
      return window.location.origin;
    };
    
    setApiBaseUrl(getApiBaseUrl());
  }, []);

  useEffect(() => {
    // The share verification is already done on the server side in the page component
    // We don't need to verify it again here
    // If we're on this page, the share is already valid
  }, []);

  const handleDownload = async () => {
    if (requiresPassword && !password) {
      toast.error('Please enter the password to download this file');
      return;
    }

    setIsDownloading(true);

    try {
      if (requiresPassword) {
        // For password-protected files, verify password first by making a request to the API
        const verifyResponse = await fetch(`${apiBaseUrl}/api/file/download-shared/${shareId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        if (verifyResponse.ok) {
          // Password is correct, redirect to download
          window.location.href = `${apiBaseUrl}/api/file/download-shared/${shareId}?password=${encodeURIComponent(password)}`;
          return;
        } else {
          const errorData = await verifyResponse.json();
          setIsPasswordValid(false);
          if (errorData.setupRequired) {
            toast.error(
              'File sharing is not set up. Please see FILE_SHARING_SETUP.md for instructions on how to set up the file sharing feature.',
              {
                duration: 8000, // Show for longer to give users time to read
                action: {
                  label: 'View Guide',
                  onClick: () => {
                    window.open('/FILE_SHARING_SETUP.md', '_blank');
                  }
                }
              }
            );
          } else {
            toast.error(errorData.error || 'Invalid password. Please try again.');
          }
          return;
        }
      } else {
        // For non-password files, use GET on the shared download endpoint
        window.location.href = `${apiBaseUrl}/api/file/download-shared/${shareId}`;
        return;
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDownload();
    }
  };

  if (!isValidShare) {
    return (
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <CardTitle className="text-xl">Invalid Link</CardTitle>
            <CardDescription className="text-red-500">
              This share link is no longer valid. The file may have been deleted or the link may have expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-4">
      <Card className="w-full shadow-lg rounded-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-blue-50 p-3 rounded-full">
            <File className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Download File</CardTitle>
            <CardDescription className="text-base mt-1">
              Securely download your shared file
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <File className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">Click to download</p>
            </div>
          </div>
          
          {requiresPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isPasswordValid ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Enter Password
                </label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!isPasswordValid) setIsPasswordValid(true); // Reset error when user types
                  }}
                  placeholder="Enter password to access file"
                  className={`pr-10 ${!isPasswordValid ? 'border-red-500 focus:ring-red-500' : ''}`}
                  onKeyPress={handleKeyPress}
                  disabled={isDownloading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isDownloading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!isPasswordValid && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Password is incorrect. Please try again.
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Secure & encrypted download</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full py-6 text-lg" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Download className="mr-2 h-5 w-5 animate-spin" />
                Preparing Download...
              </>
            ) : requiresPassword ? (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Unlock & Download
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Provide a default export to make importing from server components simpler
export default DownloadFilePage;