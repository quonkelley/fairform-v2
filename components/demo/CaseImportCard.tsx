"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useCaseImport } from '@/lib/hooks/useCaseImport';
import { resetDemoStorage, demoCasesRepo, demoStepsRepo } from '@/lib/demo/demoRepos';
import { useRouter } from 'next/navigation';

interface CaseImportCardProps {
  userId: string;
  onImportSuccess?: (caseId: string) => void;
}

export function CaseImportCard({ userId, onImportSuccess }: CaseImportCardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    caseNumber: '',
    caseType: 'eviction',
    jurisdiction: 'Marion County',
    title: '',
    notes: '',
  });

  const {
    state,
    handleFileSelect,
    handleReplaceConfirm,
    handleReplaceCancel,
    reset,
  } = useCaseImport({ userId, onImportSuccess });

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle manual entry submission
  const handleManualSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualFormData.caseNumber.trim()) {
      return;
    }

    try {
      // Reset demo storage first
      resetDemoStorage();

      // Create the case
      const newCase = await demoCasesRepo.createCase({
        userId,
        caseType: manualFormData.caseType,
        jurisdiction: manualFormData.jurisdiction,
        title: manualFormData.title || `Manual Case - ${manualFormData.caseNumber}`,
        notes: manualFormData.notes || 'Case created via manual entry',
      });

      // Create steps
      const steps = [
        {
          caseId: newCase.id,
          name: 'Review Notice',
          order: 1,
          dueDate: new Date(),
        },
        {
          caseId: newCase.id,
          name: 'File Answer',
          order: 2,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        },
        {
          caseId: newCase.id,
          name: 'Prepare for Hearing',
          order: 3,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
        {
          caseId: newCase.id,
          name: 'Attend Court Hearing',
          order: 4,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
      ];

      for (const stepData of steps) {
        await demoStepsRepo.createStep(stepData);
      }
      
      console.info('case-import:success', { 
        source: 'manual-entry',
        caseId: manualFormData.caseNumber,
        timestamp: Date.now()
      });

      // Navigate to dashboard
      router.push('/dashboard');
      onImportSuccess?.(manualFormData.caseNumber);

    } catch (err) {
      console.error('Manual entry error:', err);
    }
  }, [manualFormData, userId, router, onImportSuccess]);

  // Reset to idle state
  const handleReset = useCallback(() => {
    reset();
    setShowManualEntry(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [reset]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Case Import
        </CardTitle>
        <CardDescription>
          Upload an eviction notice or manually enter case details to create a new case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        {state.status === 'idle' && (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload eviction notice file"
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upload Eviction Notice</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your eviction notice file here, or click to browse
            </p>
            <Button variant="outline" type="button">
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
              aria-label="Select eviction notice file"
            />
          </div>
        )}

        {/* Processing State */}
        {state.status === 'processing' && (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Processing Notice</h3>
            <p className="text-muted-foreground">
              Scanning and parsing your eviction notice...
            </p>
            <Progress value={state.progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{state.progress}% complete</p>
          </div>
        )}

        {/* Success State */}
        {state.status === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h3 className="text-lg font-semibold text-green-700">Import Successful!</h3>
            <p className="text-muted-foreground">
              Your case has been created and you&apos;ll be redirected to the dashboard shortly.
            </p>
          </div>
        )}

        {/* Error State */}
        {state.status === 'error' && state.error && (
          <Alert variant="destructive" title="Import Failed">
            <strong>Import Failed:</strong> {state.error}
          </Alert>
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Manual Case Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caseNumber">Case Number *</Label>
                <Input
                  id="caseNumber"
                  value={manualFormData.caseNumber}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, caseNumber: e.target.value }))}
                  placeholder="49K01-2510-EV-001234"
                  required
                />
              </div>
              <div>
                <Label htmlFor="caseType">Case Type</Label>
                <Input
                  id="caseType"
                  value={manualFormData.caseType}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, caseType: e.target.value }))}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  value={manualFormData.jurisdiction}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={manualFormData.title}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Optional case title"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={manualFormData.notes}
                onChange={(e) => setManualFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional case notes..."
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                Create Case
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowManualEntry(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Action Buttons */}
        {state.status === 'idle' && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowManualEntry(true)}
            >
              Manual Entry Instead
            </Button>
          </div>
        )}

        {(state.status === 'error' || state.status === 'success') && (
          <div className="flex justify-center gap-2">
            <Button onClick={handleReset}>
              {state.status === 'error' ? 'Try Again' : 'Import Another'}
            </Button>
            {state.status === 'error' && (
              <Button variant="outline" onClick={() => setShowManualEntry(true)}>
                Manual Entry
              </Button>
            )}
          </div>
        )}

        {/* Replace Confirmation Dialog */}
        <Dialog open={state.showReplaceConfirmation} onOpenChange={handleReplaceCancel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Replace Existing Case?
              </DialogTitle>
              <DialogDescription>
                You already have an imported case in this session. Importing a new case will replace the existing one. 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleReplaceCancel}>
                Cancel
              </Button>
              <Button onClick={handleReplaceConfirm}>
                Replace Case
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
