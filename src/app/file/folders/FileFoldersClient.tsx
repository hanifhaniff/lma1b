'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Folder, File, ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FolderItem {
  type: 'folder' | 'file';
  name: string;
  prefix?: string;
  file_key?: string;
  password_protected?: boolean;
}

export default function FileFoldersClient() {
  const [items, setItems] = useState<FolderItem[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const getApiBaseUrl = () => window.location.origin;
    setApiBaseUrl(getApiBaseUrl());
  }, []);



  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/file/list?prefix=${encodeURIComponent(currentPrefix)}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      } else {
        console.error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, currentPrefix]);

  useEffect(() => {
    if (apiBaseUrl) {
      fetchItems();
    }
  }, [apiBaseUrl, fetchItems]);

  const handleFolderClick = (prefix: string) => {
    setCurrentPrefix(prefix);
  };

  const handleBackClick = () => {
    const parentPrefix = currentPrefix.split('/').slice(0, -2).join('/') + (currentPrefix.split('/').length > 2 ? '/' : '');
    setCurrentPrefix(parentPrefix);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToMainPage = () => {
    window.location.href = '/file';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">File Explorer</CardTitle>
              <CardDescription>Browse and manage your files and folders</CardDescription>
            </div>
            <Button onClick={navigateToMainPage} variant="outline">
              Switch to Main View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search and Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {currentPrefix && (
                <Button onClick={handleBackClick} variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            {/* Current Path */}
            <div className="text-sm text-gray-600">
              Current Path: {currentPrefix || '/'}
            </div>

            {/* Folder Grid */}
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems
                  .filter(item => item.type === 'folder')
                  .map((folder, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleFolderClick(folder.prefix || '')}
                    >
                      <div className="flex items-center space-x-3">
                        <Folder className="h-8 w-8 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{folder.name}</h3>
                          <p className="text-sm text-gray-500">Folder</p>
                        </div>
                        <Badge variant="secondary">Folder</Badge>
                      </div>
                    </div>
                  ))}

                {filteredItems
                  .filter(item => item.type === 'file')
                  .map((file, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="h-8 w-8 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{file.name}</h3>
                          <p className="text-sm text-gray-500">File</p>
                        </div>
                        <Badge variant="outline">File</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No items match your search.' : 'This folder is empty.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}