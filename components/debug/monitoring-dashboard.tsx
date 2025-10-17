'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CaseCreationMetrics {
  totalAttempts: number;
  successfulCreations: number;
  failedCreations: number;
  validationErrors: number;
  authErrors: number;
  serverErrors: number;
  averageResponseTime: number;
  lastFailure?: {
    timestamp: string;
    error: string;
    requestId: string;
    userId: string;
  };
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<CaseCreationMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would call an API endpoint
      // that returns the monitoring data
      const response = await fetch('/api/debug/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data.metrics);
      setHealthStatus(data.healthStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (!healthStatus) return null;
    switch (healthStatus.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (!healthStatus) return 'default';
    switch (healthStatus.status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading metrics...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load metrics: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics || !healthStatus) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No metrics data available
        </AlertDescription>
      </Alert>
    );
  }

  const successRate = metrics.totalAttempts > 0 
    ? ((metrics.successfulCreations / metrics.totalAttempts) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                System Health
                <Badge variant={getStatusColor()}>
                  {healthStatus.status.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time monitoring of case creation system
              </CardDescription>
            </div>
            <Button onClick={fetchMetrics} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthStatus.issues.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-sm">Issues Detected:</h4>
              {healthStatus.issues.map((issue, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{issue}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
          
          {healthStatus.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {healthStatus.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.successfulCreations} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Creations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedCreations}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.validationErrors} validation errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatResponseTime(metrics.averageResponseTime)}</div>
            <p className="text-xs text-muted-foreground">Per request</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Error Breakdown</CardTitle>
          <CardDescription>Types of errors encountered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.validationErrors}</div>
              <div className="text-sm text-muted-foreground">Validation Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.authErrors}</div>
              <div className="text-sm text-muted-foreground">Auth Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.serverErrors}</div>
              <div className="text-sm text-muted-foreground">Server Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {metrics.failedCreations - metrics.validationErrors - metrics.authErrors - metrics.serverErrors}
              </div>
              <div className="text-sm text-muted-foreground">Other Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Failure */}
      {metrics.lastFailure && (
        <Card>
          <CardHeader>
            <CardTitle>Last Failure</CardTitle>
            <CardDescription>Most recent case creation failure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Time:</strong> {formatTimestamp(metrics.lastFailure.timestamp)}
              </div>
              <div>
                <strong>Error:</strong> {metrics.lastFailure.error}
              </div>
              <div>
                <strong>Request ID:</strong> <code className="text-xs">{metrics.lastFailure.requestId}</code>
              </div>
              <div>
                <strong>User ID:</strong> <code className="text-xs">{metrics.lastFailure.userId}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
