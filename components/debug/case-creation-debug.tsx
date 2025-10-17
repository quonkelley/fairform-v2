'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DebugResult {
  success: boolean;
  requestId?: string;
  error?: string;
  details?: any[];
  timestamp: string;
  requestData: any;
  responseData?: any;
}

export function CaseCreationDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    caseType: 'eviction',
    jurisdiction: 'Marion County',
    title: 'Test Case',
    notes: 'Debug test case'
  });

  const testCaseCreation = async () => {
    setIsLoading(true);
    setResult(null);
    
    const startTime = new Date().toISOString();
    
    try {
      // Get auth token
      const user = await import('firebase/auth').then(auth => auth.getAuth().currentUser);
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      const idToken = await user.getIdToken();
      
      const requestData = {
        ...formData,
        timestamp: startTime
      };
      
      console.log('[CaseCreationDebug] Testing with data:', requestData);
      
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      });
      
      const responseData = await response.json();
      
      const debugResult: DebugResult = {
        success: response.ok,
        requestId: responseData.requestId,
        error: response.ok ? undefined : responseData.message,
        details: responseData.details,
        timestamp: startTime,
        requestData,
        responseData
      };
      
      setResult(debugResult);
      
    } catch (error) {
      const debugResult: DebugResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: startTime,
        requestData: formData
      };
      
      setResult(debugResult);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (result.error?.includes('Validation')) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (!result) return 'default';
    if (result.success) return 'success';
    if (result.error?.includes('Validation')) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Case Creation Debug Tool</CardTitle>
          <CardDescription>
            Test case creation with detailed error reporting and validation feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="caseType">Case Type</Label>
              <Input
                id="caseType"
                value={formData.caseType}
                onChange={(e) => setFormData(prev => ({ ...prev, caseType: e.target.value }))}
                placeholder="eviction, small_claims, etc."
              />
            </div>
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                placeholder="Marion County, Indiana"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Case title"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={testCaseCreation} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Case Creation'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Test Result
                <Badge variant={getStatusColor()}>
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Debug Info'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {result.error}
                </AlertDescription>
              </Alert>
            )}
            
            {result.details && result.details.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Validation Details:</h4>
                <div className="space-y-2">
                  {result.details.map((detail: any, index: number) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="font-medium text-sm">{detail.field}</div>
                      <div className="text-sm text-gray-600">{detail.message}</div>
                      {detail.code && (
                        <Badge variant="outline" className="mt-1">
                          {detail.code}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Request ID:</strong> {result.requestId || 'N/A'}
              </div>
              <div>
                <strong>Timestamp:</strong> {result.timestamp}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Request Data:</h4>
              <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto">
                {JSON.stringify(result.requestData, null, 2)}
              </pre>
            </div>
            
            {result.responseData && (
              <div>
                <h4 className="font-medium mb-2">Response Data:</h4>
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto">
                  {JSON.stringify(result.responseData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
