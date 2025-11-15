'use client';

import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  Upload,
  Download,
  File,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Share,
  Folder,
  FolderPlus,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video,
  AudioWaveform,
  Archive,
  X
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Added view mode
  const [searchQuery, setSearchQuery] = useState<string>(''); // Added search functionality

  useEffect(() => {
    const getApiBaseUrl = () => window.location.origin;
    setApiBaseUrl(getApiBaseUrl());
  }, []);

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleFetchItems = useCallback(async (prefix: string) => {
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
  }, [apiBaseUrl]);

  useEffect(() => {
    handleFetchItems(currentPrefix);
  }, [currentPrefix, handleFetchItems]);

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

  // Function to get icon based on file type
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext) {
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
        return <ImageIcon className="h-5 w-5" />;
      }
      if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
        return <Video className="h-5 w-5" />;
      }
      if (['mp3', 'wav', 'flac', 'ogg'].includes(ext)) {
        return <AudioWaveform className="h-5 w-5" />;
      }
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return <Archive className="h-5 w-5" />;
      }
      if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        return <FileText className="h-5 w-5" />;
      }
    }

    return <File className="h-5 w-5" />;
  };

  // Format file size
  const formatFileSize = (size: number) => {
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
              <p className="text-muted-foreground mt-1">
                Upload, store, and organize your files securely
              </p>
            </div>
          </div>

          {/* Upload Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Upload New File</CardTitle>
              <CardDescription>Upload files to your storage space</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        ref={fileInputRef}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                    </div>
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
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          {getFileIcon(selectedFile.name)}
                          <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Size: {formatFileSize(selectedFile.size)}
                      </div>

                      <div className="mt-3 flex items-center space-x-2">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={uploadPassword}
                          onChange={handlePasswordChange}
                          placeholder="Password protection (optional)"
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Files with passwords will require the password for download
                      </p>
                    </div>
                  )}

                  {uploadProgress !== null && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Browser Section */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg">File Browser</CardTitle>
                <CardDescription>
                  Manage your files and folders
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Button onClick={() => setCreateFolderDialogOpen(true)} size="sm">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
                <Button
                  onClick={() => handleFetchItems(currentPrefix)}
                  disabled={isFetching}
                  variant="outline"
                  size="sm"
                >
                  {isFetching ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sync</>
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Breadcrumb */}
              <Breadcrumb className="mb-4">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPrefix(''); }}>
                      Root
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentPrefix.split('/').filter(Boolean).map((part, index) => {
                    const prefix = currentPrefix.split('/').slice(0, index + 1).join('/') + '/';
                    const isLast = index === currentPrefix.split('/').filter(Boolean).length - 1;
                    return (
                      <React.Fragment key={`breadcrumb-${index}-${part}`}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage>{part}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPrefix(prefix); }}>
                              {part}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>

              {/* Files and Folders Display */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No files found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No files match your search' : 'Upload a file or create a folder to get started'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.type === 'folder' ? `folder-${item.prefix}` : `file-${item.file_key}`}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-full ${item.type === 'folder' ? 'bg-blue-100 text-blue-600' : 'bg-muted'} mb-3`}>
                          {item.type === 'folder' ? (
                            <Folder className="h-6 w-6" />
                          ) : (
                            getFileIcon(item.name)
                          )}
                        </div>
                        <h3 className="font-medium truncate w-full mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          {item.type === 'file' && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(item.size || 0)}
                              </span>
                            </>
                          )}
                        </div>

                        {item.type === 'folder' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full"
                            onClick={() => handleFolderClick(item.prefix)}
                          >
                            Open
                          </Button>
                        ) : (
                          <div className="flex gap-1 mt-4 w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(item.file_key, item.name)}
                              className="flex-1"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => prepareShare(item.file_key, item.name, item.password_protected)}
                              className="p-2"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Size</th>
                        <th className="text-left p-3">Modified</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr
                          key={item.type === 'folder' ? `folder-${item.prefix}` : `file-${item.file_key}`}
                          className="border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded ${item.type === 'folder' ? 'bg-blue-100 text-blue-600' : 'bg-muted'}`}>
                                {item.type === 'folder' ? <Folder className="h-4 w-4" /> : getFileIcon(item.name)}
                              </div>
                              <div>
                                <div className="font-medium">
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
                                {item.type === 'folder' && (
                                  <div className="text-xs text-muted-foreground">
                                    {items.filter(i => i.prefix && i.prefix.startsWith(item.prefix)).length} items
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={item.type === 'folder' ? 'secondary' : 'outline'}>
                              {item.type}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {item.type === 'file' ? formatFileSize(item.size || 0) : '-'}
                          </td>
                          <td className="p-3">
                            {item.modified || formatDate(new Date().toISOString())}
                          </td>
                          <td className="p-3 text-right">
                            {item.type === 'file' && (
                              <div className="flex gap-2 justify-end">
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
                            {item.type === 'folder' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFolderClick(item.prefix)}
                              >
                                Open
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
              autoFocus
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