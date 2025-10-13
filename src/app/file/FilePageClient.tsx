'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, Download, File, Trash2, Loader2, Eye, EyeOff, Share, Folder, ArrowLeft, FolderPlus } from 'lucide-react';
import ShareModal from './ShareModal';

export default function FilePageClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPassword, setUploadPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState<{[key: string]: string}>({});
  const [showPasswordInput, setShowPasswordInput] = useState<{[key: string]: boolean}>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [uploadDialogType, setUploadDialogType] = useState<'success' | 'error'>('success');
  const [uploadDialogMessage, setUploadDialogMessage] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [itemToDelete, setItemToDelete] = useState<{fileKey: string, fileName: string} | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [fileToShare, setFileToShare] = useState<{fileKey: string, fileName: string, passwordProtected: boolean} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  useEffect(() => {
    const getApiBaseUrl = () => window.location.origin;
    setApiBaseUrl(getApiBaseUrl());
  }, []);

  useEffect(() => {
    handleFetchItems(currentPrefix);
  }, [currentPrefix, apiBaseUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
    formData.append('prefix', currentPrefix);

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      const requestPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', '/api/file/upload');
      xhr.send(formData);

      const result = await requestPromise;
      
      setUploadDialogType('success');
      setUploadDialogMessage(`File uploaded successfully: ${(result as any).originalName}`);
      setUploadDialogOpen(true);
      setUploadProgress(100);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
      setUploadPassword('');
      handleFetchItems(currentPrefix);
    } catch (error: any) {
      setUploadDialogType('error');
      setUploadDialogMessage(`Upload failed: ${error.message}`);
      setUploadDialogOpen(true);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 500);
    }
  };

  const handleFetchItems = async (prefix: string) => {
    if (!apiBaseUrl) return;
    setIsFetching(true);
    setStatusMessage('Fetching items...');
    try {
      const response = await fetch(`${apiBaseUrl}/api/file/list?prefix=${encodeURIComponent(prefix)}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
        setStatusMessage(`${data.items.length} items found`);
      } else {
        setStatusMessage('Failed to fetch items');
      }
    } catch (error) {
      setStatusMessage('Error fetching items');
    } finally {
      setIsFetching(false);
    }
  };

  const handleFolderClick = (prefix: string) => {
    setCurrentPrefix(prefix);
  };

  const handleBackClick = () => {
    const parentPrefix = currentPrefix.split('/').slice(0, -2).join('/') + (currentPrefix.split('/').length > 2 ? '/' : '');
    setCurrentPrefix(parentPrefix);
  };

  const handleDownload = async (fileKey: string, filename: string) => {
    const response = await fetch(`${apiBaseUrl}/api/file/download/${fileKey}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatusMessage(`Downloaded ${filename} successfully`);
    } else {
      let errorMessage = 'Download failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || 'Download failed';
      } catch (e) {
        try {
          errorMessage = await response.text();
        } catch (textError) {
          errorMessage = 'Download failed';
        }
      }
      setStatusMessage(`Download failed: ${errorMessage}`);
    }
  };

  const prepareDelete = (fileKey: string, fileName: string) => {
    setDeleteItemName(fileName);
    setItemToDelete({ fileKey, fileName });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleteDialogOpen(false);
    try {
      const response = await fetch(`${apiBaseUrl}/api/file/delete/${itemToDelete.fileKey}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        handleFetchItems(currentPrefix);
        setStatusMessage(`Deleted ${itemToDelete.fileName} successfully`);
      } else {
        setStatusMessage(`Delete failed for ${itemToDelete.fileName}`);
      }
    } catch (error) {
      setStatusMessage(`Delete error: ${error}`);
    }
  };

  const prepareShare = (fileKey: string, fileName: string, passwordProtected: boolean = false) => {
    setFileToShare({ fileKey, fileName, passwordProtected });
    setShareModalOpen(true);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/file/folder/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderName: newFolderName, prefix: currentPrefix }),
      });

      if (response.ok) {
        setNewFolderName('');
        setCreateFolderDialogOpen(false);
        handleFetchItems(currentPrefix);
        setStatusMessage(`Folder '${newFolderName}' created successfully`);
      } else {
        const data = await response.json();
        setStatusMessage(`Failed to create folder: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage('Error creating folder');
    }
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
                <div className="mt-2 space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={uploadPassword}
                      onChange={handlePasswordChange}
                      placeholder="Password (optional)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave password empty if you don't want to protect this file
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* File List Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Stored Files</h2>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.href = '/file/folders'} variant="outline" size="sm">
                    <Folder className="mr-2 h-4 w-4" />
                    Folder View
                  </Button>
                  <Button onClick={() => setCreateFolderDialogOpen(true)} variant="outline" size="sm">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create Folder
                  </Button>
                  <Button
                    onClick={() => handleFetchItems(currentPrefix)}
                    disabled={isFetching}
                    variant="outline"
                    size="sm"
                  >
                    {isFetching ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Refreshing...</>
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
              </div>

              {currentPrefix && (
                <Button onClick={handleBackClick} variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {item.type === 'folder' ? <Folder className="h-4 w-4" /> : <File className="h-4 w-4" />}
                            <a 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (item.type === 'folder') handleFolderClick(item.prefix);
                              }}
                              className={item.type === 'folder' ? 'cursor-pointer hover:underline' : ''}
                            >
                              {item.name}
                            </a>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={item.type === 'folder' ? 'secondary' : 'outline'}>
                            {item.type}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {item.type === 'file' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(item.file_key, item.name)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => prepareShare(item.file_key, item.name, item.password_protected)}
                              >
                                <Share className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => prepareDelete(item.file_key, item.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Folder Dialog */}
      <AlertDialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for the new folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCreateFolderDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateFolder}>Create</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Other Dialogs */}
      <AlertDialog 
        open={uploadDialogOpen} 
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-red-500">⚠ Confirm Deletion</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deleteItemName}</strong>"? This action cannot be undone.
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