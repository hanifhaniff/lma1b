'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CONTRACT_CODES,
  DOCUMENT_TYPES,
  DISCIPLINES,
  LOCATIONS,
  SUBMISSION_STATUS,
  DOCUMENT_WORKFLOW_STATUS,
  REVISION_REVIEW_CODES,
  DoconDocument,
  DoconDocumentFormData,
  generateDocumentNumber,
} from './types';

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: DoconDocument | null;
  onSuccess: () => void;
}

export function DocumentForm({ open, onOpenChange, document, onSuccess }: DocumentFormProps) {
  const isEdit = !!document;

  const [formData, setFormData] = useState<DoconDocumentFormData>({
    contract_code: '',
    document_type: '',
    discipline: '',
    location: '',
    work_system: '',
    title: '',
    pic: '',
    date_received: new Date().toISOString().split('T')[0],
    transmittal_no: '',
    submission_status: 'Draft',
    document_workflow_status: '',
    revision_review_code: '',
    remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [nextSerial, setNextSerial] = useState<string>('');
  const [previewDocNumber, setPreviewDocNumber] = useState<string>('');
  const [isNewCombination, setIsNewCombination] = useState<boolean>(false);
  const [serialMessage, setSerialMessage] = useState<string>('');

  // Load document data if editing
  useEffect(() => {
    if (document) {
      setFormData({
        contract_code: document.contract_code,
        document_type: document.document_type,
        discipline: document.discipline,
        location: document.location,
        work_system: document.work_system,
        title: document.title,
        pic: document.pic,
        date_received: document.date_received,
        transmittal_no: document.transmittal_no || '',
        submission_status: document.submission_status,
        document_workflow_status: document.document_workflow_status || '',
        revision_review_code: document.revision_review_code || '',
        remarks: document.remarks || '',
        revision_number: document.revision_number,
      });
      setNextSerial(document.serial_number);
    } else {
      // Reset form
      setFormData({
        contract_code: '',
        document_type: '',
        discipline: '',
        location: '',
        work_system: '',
        title: '',
        pic: '',
        date_received: new Date().toISOString().split('T')[0],
        transmittal_no: '',
        submission_status: 'Draft',
        document_workflow_status: '',
        revision_review_code: '',
        remarks: '',
      });
      setNextSerial('');
    }
  }, [document, open]);

  const fetchNextSerial = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        get_next_serial: 'true',
        contract_code: formData.contract_code,
        document_type: formData.document_type,
        discipline: formData.discipline,
        location: formData.location,
        work_system: formData.work_system,
      });

      const response = await fetch(`/api/docon/monitorsd?${params}`);
      if (!response.ok) throw new Error('Failed to fetch next serial');
      
      const data = await response.json();
      setNextSerial(data.serial_number);
      setIsNewCombination(data.is_new_combination || false);
      setSerialMessage(data.message || '');
      
      if (data.is_new_combination) {
        toast.success('New combination detected - starting from beginning');
      }
    } catch (error) {
      console.error('Error fetching next serial:', error);
      toast.error('Failed to get next serial number');
    }
  }, [formData.contract_code, formData.document_type, formData.discipline,
      formData.location, formData.work_system]);

  // Fetch next serial number when key fields change
  useEffect(() => {
    if (!isEdit && formData.contract_code && formData.document_type &&
        formData.discipline && formData.location && formData.work_system) {
      fetchNextSerial();
    }
  }, [formData.contract_code, formData.document_type, formData.discipline,
      formData.location, formData.work_system, isEdit, fetchNextSerial]);

  // Update preview document number
  useEffect(() => {
    if (formData.contract_code && formData.document_type && formData.discipline &&
        formData.location && formData.work_system && nextSerial) {
      const revisionNum = formData.revision_number || '0';
      const preview = generateDocumentNumber({
        contract_code: formData.contract_code,
        document_type: formData.document_type,
        discipline: formData.discipline,
        location: formData.location,
        work_system: formData.work_system,
        serial_number: nextSerial,
        revision_number: revisionNum,
      });
      setPreviewDocNumber(preview);
    } else {
      setPreviewDocNumber('');
    }
  }, [formData, nextSerial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/docon/monitorsd';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload: any = {
        ...formData,
        serial_number: nextSerial,
      };

      if (isEdit && document) {
        payload.id = document.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save document');
      }

      toast.success(`Document ${isEdit ? 'updated' : 'created'} successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast.error(error.message || 'Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof DoconDocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate work system options based on ranges
  const workSystemOptions = Array.from({ length: 99 }, (_, i) => {
    const num = i + 1;
    return { value: num.toString().padStart(2, '0'), label: num.toString().padStart(2, '0') };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Document' : 'Create New Document'}</DialogTitle>
          <DialogDescription>
            Fill in the document information. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Number Preview */}
          {previewDocNumber && (
            <div className={`p-4 rounded-lg border-2 ${isNewCombination ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'}`}>
              <Label className="text-sm font-medium">Document Number Preview</Label>
              <p className="text-2xl font-mono font-bold mt-2 mb-2">{previewDocNumber}</p>
              {serialMessage && (
                <p className={`text-xs mt-2 ${isNewCombination ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
                  ℹ️ {serialMessage}
                </p>
              )}
            </div>
          )}

          {/* Document Numbering Section */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="text-lg font-semibold">Document Numbering</h3>
              <p className="text-sm text-muted-foreground">Define the document identification structure</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_code">Contract Code *</Label>
                <Select 
                  value={formData.contract_code} 
                  onValueChange={(val) => handleChange('contract_code', val)}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_CODES).map(([code, desc]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type *</Label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(val) => handleChange('document_type', val)}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPES).map(([code, { desc }]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline">Discipline *</Label>
                <Select 
                  value={formData.discipline} 
                  onValueChange={(val) => handleChange('discipline', val)}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DISCIPLINES).map(([code, desc]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select 
                  value={formData.location} 
                  onValueChange={(val) => handleChange('location', val)}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATIONS).map(([code, { desc, sta }]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_system">Work System *</Label>
                <Select 
                  value={formData.work_system} 
                  onValueChange={(val) => handleChange('work_system', val)}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select system" />
                  </SelectTrigger>
                  <SelectContent>
                    {workSystemOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision_number">Revision Number *</Label>
                <Input
                  id="revision_number"
                  value={formData.revision_number || '0'}
                  onChange={(e) => handleChange('revision_number', e.target.value)}
                  placeholder="0"
                  className="font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Default: 0 (Rev. 1, 2, A, B, etc.)
                </p>
              </div>

              {nextSerial && (
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label>Serial Number (Auto)</Label>
                  <Input 
                    value={nextSerial} 
                    disabled 
                    className="bg-muted font-mono font-medium" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Document Details Section */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="text-lg font-semibold">Document Details</h3>
              <p className="text-sm text-muted-foreground">Basic information about the document</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter descriptive document title"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pic">PIC (Person In Charge) *</Label>
                <Input
                  id="pic"
                  value={formData.pic}
                  onChange={(e) => handleChange('pic', e.target.value)}
                  placeholder="Enter PIC name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_received">Date Received *</Label>
                <Input
                  id="date_received"
                  type="date"
                  value={formData.date_received}
                  onChange={(e) => handleChange('date_received', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="transmittal_no">Transmittal Number</Label>
                <Input
                  id="transmittal_no"
                  value={formData.transmittal_no}
                  onChange={(e) => handleChange('transmittal_no', e.target.value)}
                  placeholder="Enter transmittal number (optional)"
                />
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="text-lg font-semibold">Status & Review</h3>
              <p className="text-sm text-muted-foreground">Track submission and review status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submission_status">Submission Status</Label>
                <Select 
                  value={formData.submission_status} 
                  onValueChange={(val) => handleChange('submission_status', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBMISSION_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_workflow_status">Doc Status</Label>
                <Select 
                  value={formData.document_workflow_status} 
                  onValueChange={(val) => handleChange('document_workflow_status', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_WORKFLOW_STATUS).map(([code, desc]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex flex-col"  >
                          <span className="font-medium">{code}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision_review_code">Review Code</Label>
                <Select 
                  value={formData.revision_review_code || ''} 
                  onValueChange={(val) => handleChange('revision_review_code', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select review code" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REVISION_REVIEW_CODES).map(([code, desc]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex flex-col">
                          {/* <span className="font-medium">Code {code}</span> */}
                          <span className="text-xs text-foreground">{desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-4">
            <div className="pb-2 border-b">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <p className="text-sm text-muted-foreground">Notes and remarks</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks / Notes</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Enter any additional notes, comments, or special instructions..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Document' : 'Create Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
