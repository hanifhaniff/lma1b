'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Search, FileText, Edit, Trash2, Filter, X, List, Grid3x3 } from 'lucide-react';
import { DocumentForm } from './DocumentForm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DoconDocumentWithRelations,
  CONTRACT_CODES,
  DOCUMENT_TYPES,
  DISCIPLINES,
  SUBMISSION_STATUS,
  DOCUMENT_WORKFLOW_STATUS,
} from './types';

export default function DoconMonitorPage() {
  const [documents, setDocuments] = useState<DoconDocumentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DoconDocumentWithRelations | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DoconDocumentWithRelations | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped-type' | 'grouped-discipline'>('list');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    contract_code: '',
    document_type: '',
    discipline: '',
    submission_status: '',
    document_workflow_status: '',
  });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.contract_code) params.append('contract_code', filters.contract_code);
      if (filters.document_type) params.append('document_type', filters.document_type);
      if (filters.discipline) params.append('discipline', filters.discipline);
      if (filters.submission_status) params.append('submission_status', filters.submission_status);
      if (filters.document_workflow_status) params.append('document_workflow_status', filters.document_workflow_status);

      const response = await fetch(`/api/docon/monitorsd?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = () => {
    fetchDocuments();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchDocuments();
  };

  const handleClearFilters = () => {
    setFilters({
      contract_code: '',
      document_type: '',
      discipline: '',
      submission_status: '',
      document_workflow_status: '',
    });
    setSearchTerm('');
    setTimeout(() => fetchDocuments(), 100);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      const response = await fetch('/api/docon/monitorsd', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete document');

      toast.success('Document deleted successfully');
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleEdit = (doc: DoconDocumentWithRelations) => {
    setSelectedDocument(doc);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedDocument(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedDocument(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Draft: 'outline',
      Submitted: 'secondary',
      Received: 'default',
      Distributed: 'default',
      Closed: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getWorkflowBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const colors: Record<string, string> = {
      IFA: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      IFC: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      IFI: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      ABT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || ''}`}>
        {status}
      </span>
    );
  };

  const getReviewBadge = (code: string | null | undefined) => {
    if (!code) return null;
    const colors: Record<string, string> = {
      A: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      B: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      C: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      D: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    const descriptions: Record<string, string> = {
      A: 'Approved',
      B: 'Approved with Comments',
      C: 'Revise & Resubmit',
      D: 'Rejected',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[code] || ''}`}>
        {descriptions[code] || code}
      </span>
    );
  };

  // Group documents by document type
  const groupByDocumentType = () => {
    const grouped: Record<string, DoconDocumentWithRelations[]> = {};
    documents.forEach(doc => {
      if (!grouped[doc.document_type]) {
        grouped[doc.document_type] = [];
      }
      grouped[doc.document_type].push(doc);
    });
    return grouped;
  };

  // Group documents by discipline
  const groupByDiscipline = () => {
    const grouped: Record<string, DoconDocumentWithRelations[]> = {};
    documents.forEach(doc => {
      if (!grouped[doc.discipline]) {
        grouped[doc.discipline] = [];
      }
      grouped[doc.discipline].push(doc);
    });
    return grouped;
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allKeys = viewMode === 'grouped-type' 
      ? Object.keys(groupByDocumentType())
      : Object.keys(groupByDiscipline());
    setExpandedGroups(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Document Control System
              </CardTitle>
              <CardDescription>
                Manage and track all project documents with revision control
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by document number, title, PIC, or transmittal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                onClick={() => setShowFilters(!showFilters)} 
                variant="outline"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              {(Object.values(filters).some(v => v) || searchTerm) && (
                <Button onClick={handleClearFilters} variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View:</span>
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="h-8"
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'grouped-type' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grouped-type')}
                  className="h-8"
                >
                  <Grid3x3 className="h-4 w-4 mr-1" />
                  By Type
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'grouped-discipline' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grouped-discipline')}
                  className="h-8"
                >
                  <Grid3x3 className="h-4 w-4 mr-1" />
                  By Discipline
                </Button>
              </div>
              {viewMode !== 'list' && (
                <div className="flex gap-1 ml-auto">
                  <Button size="sm" variant="outline" onClick={expandAll}>
                    Expand All
                  </Button>
                  <Button size="sm" variant="outline" onClick={collapseAll}>
                    Collapse All
                  </Button>
                </div>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contract Code</label>
                      <Select 
                        value={filters.contract_code} 
                        onValueChange={(val) => handleFilterChange('contract_code', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {Object.keys(CONTRACT_CODES).map((code) => (
                            <SelectItem key={code} value={code}>{code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Type</label>
                      <Select 
                        value={filters.document_type} 
                        onValueChange={(val) => handleFilterChange('document_type', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {Object.keys(DOCUMENT_TYPES).map((code) => (
                            <SelectItem key={code} value={code}>{code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discipline</label>
                      <Select 
                        value={filters.discipline} 
                        onValueChange={(val) => handleFilterChange('discipline', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {Object.keys(DISCIPLINES).map((code) => (
                            <SelectItem key={code} value={code}>{code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Submission Status</label>
                      <Select 
                        value={filters.submission_status} 
                        onValueChange={(val) => handleFilterChange('submission_status', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {SUBMISSION_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Status</label>
                      <Select 
                        value={filters.document_workflow_status} 
                        onValueChange={(val) => handleFilterChange('document_workflow_status', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          {Object.keys(DOCUMENT_WORKFLOW_STATUS).map((code) => (
                            <SelectItem key={code} value={code}>{code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={handleApplyFilters} size="sm">
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Documents Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No documents found</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Document
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>PIC</TableHead>
                      <TableHead>Date Received</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Doc Status</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Revisions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {doc.document_number}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={doc.title}>
                            {doc.title}
                          </div>
                          {doc.transmittal_no && (
                            <div className="text-xs text-muted-foreground">
                              TR: {doc.transmittal_no}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{doc.pic}</TableCell>
                        <TableCell>
                          {new Date(doc.date_received).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.submission_status)}</TableCell>
                        <TableCell>{getWorkflowBadge(doc.document_workflow_status)}</TableCell>
                        <TableCell>{getReviewBadge(doc.revision_review_code)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Rev. {doc.revision_number}</Badge>
                          {doc.revision_count > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({doc.revision_count})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(doc)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDocumentToDelete(doc)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                viewMode === 'grouped-type' ? groupByDocumentType() : groupByDiscipline()
              ).map(([groupKey, groupDocs]) => {
                const isExpanded = expandedGroups.has(groupKey);
                const groupLabel = viewMode === 'grouped-type'
                  ? `${groupKey} - ${DOCUMENT_TYPES[groupKey as keyof typeof DOCUMENT_TYPES]?.desc || groupKey}`
                  : `${groupKey} - ${DISCIPLINES[groupKey as keyof typeof DISCIPLINES] || groupKey}`;
                
                return (
                  <Card key={groupKey}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(groupKey)}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-lg">{groupLabel}</div>
                            <Badge variant="secondary">{groupDocs.length} documents</Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            {isExpanded ? '▼' : '▶'}
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Document Number</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>PIC</TableHead>
                                <TableHead>Date Received</TableHead>
                                <TableHead>Submission</TableHead>
                                <TableHead>Doc Status</TableHead>
                                <TableHead>Review</TableHead>
                                <TableHead>Revisions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {groupDocs.map((doc) => (
                                <TableRow key={doc.id}>
                                  <TableCell className="font-mono text-sm font-medium">
                                    {doc.document_number}
                                  </TableCell>
                                  <TableCell className="max-w-xs">
                                    <div className="truncate" title={doc.title}>
                                      {doc.title}
                                    </div>
                                    {doc.transmittal_no && (
                                      <div className="text-xs text-muted-foreground">
                                        TR: {doc.transmittal_no}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>{doc.pic}</TableCell>
                                  <TableCell>
                                    {new Date(doc.date_received).toLocaleDateString('id-ID')}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(doc.submission_status)}</TableCell>
                                  <TableCell>{getWorkflowBadge(doc.document_workflow_status)}</TableCell>
                                  <TableCell>{getReviewBadge(doc.revision_review_code)}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">Rev. {doc.revision_number}</Badge>
                                    {doc.revision_count > 0 && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({doc.revision_count})
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(doc)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDocumentToDelete(doc)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Summary Stats */}
          {documents.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{documents.length}</div>
                  <p className="text-xs text-muted-foreground">Total Documents</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {documents.filter(d => d.submission_status === 'Submitted').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {documents.filter(d => d.document_workflow_status === 'IFC').length}
                  </div>
                  <p className="text-xs text-muted-foreground">For Construction</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {documents.filter(d => d.submission_status === 'Closed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Closed</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Form Dialog */}
      <DocumentForm
        open={formOpen}
        onOpenChange={handleFormClose}
        document={selectedDocument}
        onSuccess={fetchDocuments}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete document <strong>{documentToDelete?.document_number}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
