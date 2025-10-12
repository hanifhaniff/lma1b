'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, Download, File, Trash2, Loader2, Eye, EyeOff, Share } from 'lucide-react';
import ShareModal from './ShareModal';

export default function FilePageClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPassword, setUploadPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState<{[key: string]: string}>({});
  const [showPasswordInput, setShowPasswordInput] = useState<{[key: string]: boolean}>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [uploadDialogType, setUploadDialogType] = useState<'success' | 'error'>('success');
  const [uploadDialogMessage, setUploadDialogMessage] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteFileName, setDeleteFileName] = useState<string>('');
  const [fileToDelete, setFileToDelete] = useState<{fileKey: string, fileName: string} | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [fileToShare, setFileToShare] = useState<{fileKey: string, fileName: string, passwordProtected: boolean} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  
  // Set the API base URL on the client side
  useEffect(() => {
    const getApiBaseUrl = () => {
      // Always use the same origin for API requests
      return window.location.origin;
    };
    
    setApiBaseUrl(getApiBaseUrl());
  }, []);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  // Handle password input change for upload
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadPassword(e.target.value);
  };

  // Toggle password visibility for upload
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Starting upload...');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (uploadPassword) {
      formData.append('password', uploadPassword);
    }

    try {
      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      // Create promise to handle the request
      const requestPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Upload failed due to network error'));
        };
      });

      xhr.open('POST', '/api/file/upload');
      xhr.send(formData);

      // Wait for the upload to complete
      const result = await requestPromise;
      
      // Show success dialog
      setUploadDialogType('success');
      setUploadDialogMessage(`File uploaded successfully: ${(result as any).originalName}`);
      setUploadDialogOpen(true);
      setUploadProgress(100);
      
      // Reset file selection and password
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
      setUploadPassword('');
    } catch (error: any) {
      // Show error dialog
      setUploadDialogType('error');
      setUploadDialogMessage(`Upload failed: ${error.message}`);
      setUploadDialogOpen(true);
    } finally {
      setIsUploading(false);
      // Reset upload progress after a short delay to allow dialog to show
      setTimeout(() => {
        setUploadProgress(null);
      }, 500);
    }
  };

  // Fetch files from database
  const handleFetchFiles = async () => {
    setIsFetchingFiles(true);
    setDownloadStatus('Fetching files...');
    try {
      // Use the API base URL to ensure we're hitting the correct port
      const response = await fetch(`${apiBaseUrl}/api/file/list`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
        setDownloadStatus(`${data.files.length} files found`);
      } else {
        setDownloadStatus('Failed to fetch files');
      }
    } catch (error) {
      setDownloadStatus('Error fetching files');
    } finally {
      setIsFetchingFiles(false);
    }
  };

  // Handle password input for download
  const handleDownloadPasswordChange = (filename: string, e: ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(prev => ({
      ...prev,
      [filename]: e.target.value
    }));
  };

  // Toggle password visibility for download
  const toggleDownloadPasswordVisibility = (filename: string) => {
    setShowPasswordInput(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }));
  };

  // Download a file with password authentication
  const handleDownload = async (fileKey: string, filename: string) => {
    // For files with password protection, check password first
    const fileData = files.find(f => f.file_key === fileKey);
    if (fileData?.password) {
      const enteredPassword = passwordInput[filename] || '';
      if (!enteredPassword) {
        setDownloadStatus('Please enter password to download this file');
        return;
      }

      const response = await fetch(`${apiBaseUrl}/api/file/download/${fileKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: enteredPassword }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownloadStatus(`Downloaded ${filename} successfully`);
        // Clear password input after successful download
        setPasswordInput(prev => {
          const newState = { ...prev };
          delete newState[filename];
          return newState;
        });
      } else {
        // For error responses, we might get JSON or just text
        let errorMessage = 'Incorrect password';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Download failed';
        } catch (e) {
          // If response is not JSON, try to get error text
          try {
            errorMessage = await response.text();
          } catch (textError) {
            // If all fails, use a generic message
            errorMessage = 'Download failed';
          }
        }
        setDownloadStatus(`Download failed: ${errorMessage}`);
      }
    } else {
      const response = await fetch(`${apiBaseUrl}/api/file/download/${fileKey}`, {
        method: 'GET'
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownloadStatus(`Downloaded ${filename} successfully`);
      } else {
        // Handle error response which might be JSON
        let errorMessage = 'Download failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Download failed';
        } catch (e) {
          // If response is not JSON, try to get error text
          try {
            errorMessage = await response.text();
          } catch (textError) {
            // If all fails, use a generic message
            errorMessage = 'Download failed';
          }
        }
        setDownloadStatus(`Download failed: ${errorMessage}`);
      }
    }
  };

  // Prepare for delete confirmation
  const prepareDelete = (fileKey: string, fileName: string) => {
    setDeleteFileName(fileName);
    setFileToDelete({ fileKey, fileName });
    setDeleteDialogOpen(true);
  };

  // Delete a file
  const handleDelete = async () => {
    if (!fileToDelete) return;

    setDeleteDialogOpen(false);

    try {
      const response = await fetch(`${apiBaseUrl}/api/file/delete/${fileToDelete.fileKey}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.file_key !== fileToDelete.fileKey));
        setDownloadStatus(`Deleted ${fileToDelete.fileName} successfully`);
      } else {
        setDownloadStatus(`Delete failed for ${fileToDelete.fileName}`);
      }
    } catch (error) {
      setDownloadStatus(`Delete error: ${error}`);
    }
  };

  // Prepare for share
  const prepareShare = (fileKey: string, fileName: string, hasPassword: boolean) => {
    setFileToShare({ fileKey, fileName, passwordProtected: hasPassword });
    setShareModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">File Management</CardTitle>
          <CardDescription>Upload, store, and Secure File</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8">
            {/* Upload Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Upload File</h2>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>

              {selectedFile && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}

              {/* Password field for upload */}
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Set Password (Optional)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={uploadPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter password to protect this file"
                    disabled={isUploading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <div className="text-sm text-muted-foreground">{uploadStatus}</div>
                </div>
              )}
            </div>

            <Separator />

            {/* Download Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Stored Files</h2>
                <Button 
                  onClick={handleFetchFiles} 
                  disabled={isFetchingFiles}
                  variant="outline"
                  size="sm"
                >
                  {isFetchingFiles ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Files'
                  )}
                </Button>
              </div>

              {downloadStatus && (
                <div className="text-sm py-2 px-3 bg-muted rounded-md">
                  {downloadStatus}
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                {files.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No files found. Upload a file to get started.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">File Name</th>
                        <th className="text-left p-3">Password Protected</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4" />
                              {file.nama_file}
                            </div>
                          </td>
                          <td className="p-3">
                            {file.password ? (
                              <Badge variant="secondary">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              {file.password && (
                                <div className="flex gap-2 mb-2">
                                  <div className="relative flex-1">
                                    <Input
                                      type={showPasswordInput[file.nama_file] ? "text" : "password"}
                                      value={passwordInput[file.nama_file] || ''}
                                      onChange={(e) => handleDownloadPasswordChange(file.nama_file, e)}
                                      placeholder="Enter password"
                                      className="pr-10"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => toggleDownloadPasswordVisibility(file.nama_file)}
                                    >
                                      {showPasswordInput[file.nama_file] ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(file.file_key, file.nama_file)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => prepareShare(file.file_key, file.nama_file, !!file.password)}
                                >
                                  <Share className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => prepareDelete(file.file_key, file.nama_file)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Status Dialog */}
      <AlertDialog 
        open={uploadDialogOpen} 
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            // Reset the dialog message when closing to prevent stale messages
            setUploadDialogMessage('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {uploadDialogType === 'success' ? (
                <span className="text-green-500">✓ Success</span>
              ) : (
                <span className="text-red-500">✗ Error</span>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {uploadDialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setUploadDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-red-500">⚠ Confirm Deletion</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deleteFileName}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        fileKey={fileToShare?.fileKey || ''}
        fileName={fileToShare?.fileName || ''}
        isPasswordProtected={fileToShare?.passwordProtected || false}
      />
    </div>
  );
}