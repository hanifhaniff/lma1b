'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Link as LinkIcon, Loader2, Copy, Check } from 'lucide-react';

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
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareToDelete, setShareToDelete] = useState<SharedLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
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
    loadSharedLinks();
  }, []);

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

  const handleCopyClick = async (shareId: string) => {
    try {
      await navigator.clipboard.writeText(shareId);
      setCopiedId(shareId);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy share ID:', err);
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
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LinkIcon className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-2xl">Manage Shared Links</CardTitle>
            </div>
            <Button variant="outline" onClick={loadSharedLinks}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading shared links...</span>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {sharedLinks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No shared links found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Share ID</TableHead>
                      <TableHead>Full URL</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Expires At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sharedLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.file_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{link.id.substring(0, 8)}...</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyClick(link.id)}
                              className="h-8 w-8 p-0"
                              aria-label={`Copy share ID ${link.id}`}
                            >
                              {copiedId === link.id ? (
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
                              className="text-blue-500 hover:underline font-mono text-xs truncate max-w-[150px] md:max-w-[200px]"
                              title={getFullUrl(link.id)}
                            >
                              {getFullUrl(link.id)}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyClick(getFullUrl(link.id))}
                              className="h-8 w-8 p-0"
                              aria-label={`Copy full URL`}
                            >
                              {copiedId === getFullUrl(link.id) ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(link.created_at)}</TableCell>
                        <TableCell>
                          {link.expires_at ? formatDate(link.expires_at) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isExpired(link.expires_at) ? 'destructive' : 'default'}>
                            {isExpired(link.expires_at) ? 'Expired' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(link)}
                            disabled={deletingId === link.id}
                          >
                            {deletingId === link.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
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