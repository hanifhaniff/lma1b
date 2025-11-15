'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Trash2, Link as LinkIcon, Loader2, Copy, Check, Search, RefreshCw, Clock, Calendar, ExternalLink, File, AlertCircle } from 'lucide-react';

interface SharedLink {
  id: string;
  file_key: string;
  created_at: string;
  expires_at: string | null;
  file_name: string;
}

// Server actions will be implemented in a separate file
const fetchSharedLinks = async (): Promise<SharedLink[]> => {
  const response = await fetch('/api/link/list');
  if (!response.ok) {
    throw new Error('Failed to fetch shared links');
  }
  const data = await response.json();
  return data.sharedLinks;
};

const deleteSharedLink = async (shareId: string): Promise<boolean> => {
  const response = await fetch(`/api/link/delete/${shareId}`, {
    method: 'DELETE',
  });
  return response.ok;
};

export default function LinkManagementPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareToDelete, setShareToDelete] = useState<SharedLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadSharedLinks = async () => {
    try {
      setLoading(true);
      const links = await fetchSharedLinks();
      setSharedLinks(links);
    } catch (error) {
      console.error('Error fetching shared links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadSharedLinks();
    }
  }, [isLoaded, isSignedIn]);

  // Filter links based on search query
  const filteredLinks = sharedLinks.filter(link =>
    link.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check authentication status
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the link management system.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the link management system.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!shareToDelete) return;

    setDeleteDialogOpen(false);
    setDeletingId(shareToDelete.id);

    try {
      const success = await deleteSharedLink(shareToDelete.id);
      if (success) {
        setSharedLinks(prev => prev.filter(link => link.id !== shareToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting shared link:', error);
    } finally {
      setDeletingId(null);
      setShareToDelete(null);
    }
  };

  const handleDeleteClick = (link: SharedLink) => {
    setShareToDelete(link);
    setDeleteDialogOpen(true);
  };

  const handleCopyClick = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFullUrl = (shareId: string) => {
    // Get the current origin (protocol + hostname + port) or use a default
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/share/${shareId}`;
    }
    // Fallback for server-side rendering
    return `https://yourdomain.com/share/${shareId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Link Management</h1>
              <p className="text-muted-foreground">
                Manage your shared links and access permissions
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Links</p>
                    <p className="text-2xl font-bold mt-1">{sharedLinks.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <LinkIcon className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Links</p>
                    <p className="text-2xl font-bold mt-1">
                      {sharedLinks.filter(link => !isExpired(link.expires_at)).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expired Links</p>
                    <p className="text-2xl font-bold mt-1">
                      {sharedLinks.filter(link => isExpired(link.expires_at)).length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-blue-500" />
                Shared Links
                <Badge variant="secondary" className="ml-2">{sharedLinks.length}</Badge>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by file name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={loadSharedLinks}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-3">Loading shared links...</span>
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="text-center py-12">
                  <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No shared links found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No links match your search' : 'Create a shared link to get started'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Share ID</TableHead>
                        <TableHead>Full URL</TableHead>
                        <TableHead className="text-center">Created</TableHead>
                        <TableHead className="text-center">Expires</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLinks.map((link) => (
                        <TableRow key={link.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-blue-500" />
                              {link.file_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                {link.id.substring(0, 8)}...
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyClick(link.id, `id-${link.id}`)}
                                className="h-8 w-8 p-0"
                                aria-label={`Copy share ID ${link.id}`}
                              >
                                {copiedId === `id-${link.id}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <a
                                href={getFullUrl(link.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline font-mono text-xs truncate max-w-[150px] md:max-w-[200px] flex items-center gap-1"
                                title={getFullUrl(link.id)}
                              >
                                {getFullUrl(link.id)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyClick(getFullUrl(link.id), `url-${link.id}`)}
                                className="h-8 w-8 p-0"
                                aria-label={`Copy full URL`}
                              >
                                {copiedId === `url-${link.id}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(link.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {link.expires_at ? (
                              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDate(link.expires_at)}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Never
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={isExpired(link.expires_at) ? 'destructive' : 'default'}
                              className={isExpired(link.expires_at) ? 'bg-red-500/20 text-red-700 dark:text-red-300' : 'bg-green-500/20 text-green-700 dark:text-green-300'}
                            >
                              {isExpired(link.expires_at) ? 'Expired' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyClick(getFullUrl(link.id), `url-${link.id}`)}
                                className="h-8 w-8 p-0"
                                aria-label={`Copy link`}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(getFullUrl(link.id), '_blank')}
                                className="h-8 w-8 p-0"
                                aria-label={`Open link`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(link)}
                                disabled={deletingId === link.id}
                                className="h-8 w-8 p-0"
                              >
                                {deletingId === link.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the share link for{' '}
              <strong>"{shareToDelete?.file_name}"</strong>? This action cannot be undone.
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
    </div>
  );
}