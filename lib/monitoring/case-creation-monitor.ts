/**
 * Case Creation Monitoring Utilities
 * 
 * This module provides monitoring and alerting capabilities for case creation failures
 * to help identify and resolve issues quickly in production.
 */

export interface CaseCreationMetrics {
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

export interface CaseCreationEvent {
  type: 'success' | 'failure' | 'validation_error' | 'auth_error' | 'server_error';
  timestamp: string;
  requestId: string;
  userId: string;
  error?: string;
  validationDetails?: any[];
  responseTime?: number;
  userAgent?: string;
  ipAddress?: string;
}

class CaseCreationMonitor {
  private events: CaseCreationEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events

  /**
   * Log a case creation event
   */
  logEvent(event: Omit<CaseCreationEvent, 'timestamp'>) {
    const fullEvent: CaseCreationEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[CaseCreationMonitor]', fullEvent);
    }

    // In production, you might want to send this to an external monitoring service
    // like DataDog, New Relic, or Sentry
    this.sendToMonitoringService(fullEvent);
  }

  /**
   * Get current metrics
   */
  getMetrics(): CaseCreationMetrics {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(
      event => new Date(event.timestamp) > last24Hours
    );

    const totalAttempts = recentEvents.length;
    const successfulCreations = recentEvents.filter(e => e.type === 'success').length;
    const failedCreations = recentEvents.filter(e => e.type === 'failure').length;
    const validationErrors = recentEvents.filter(e => e.type === 'validation_error').length;
    const authErrors = recentEvents.filter(e => e.type === 'auth_error').length;
    const serverErrors = recentEvents.filter(e => e.type === 'server_error').length;

    const responseTimes = recentEvents
      .filter(e => e.responseTime)
      .map(e => e.responseTime!);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const lastFailure = recentEvents
      .filter(e => e.type !== 'success')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return {
      totalAttempts,
      successfulCreations,
      failedCreations,
      validationErrors,
      authErrors,
      serverErrors,
      averageResponseTime,
      lastFailure: lastFailure ? {
        timestamp: lastFailure.timestamp,
        error: lastFailure.error || 'Unknown error',
        requestId: lastFailure.requestId,
        userId: lastFailure.userId,
      } : undefined,
    };
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(limit: number = 50): CaseCreationEvent[] {
    return this.events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Check if there are any critical issues that need attention
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check failure rate
    const failureRate = metrics.totalAttempts > 0 
      ? (metrics.failedCreations / metrics.totalAttempts) * 100 
      : 0;

    if (failureRate > 50) {
      issues.push(`High failure rate: ${failureRate.toFixed(1)}%`);
      recommendations.push('Investigate recent case creation failures immediately');
    } else if (failureRate > 20) {
      issues.push(`Elevated failure rate: ${failureRate.toFixed(1)}%`);
      recommendations.push('Monitor case creation closely and investigate failures');
    }

    // Check validation errors
    if (metrics.validationErrors > 10) {
      issues.push(`High validation error count: ${metrics.validationErrors}`);
      recommendations.push('Review form validation and user guidance');
    }

    // Check server errors
    if (metrics.serverErrors > 5) {
      issues.push(`Server error count: ${metrics.serverErrors}`);
      recommendations.push('Check server logs and database connectivity');
    }

    // Check response time
    if (metrics.averageResponseTime > 5000) {
      issues.push(`Slow response time: ${metrics.averageResponseTime.toFixed(0)}ms`);
      recommendations.push('Optimize case creation performance');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = failureRate > 50 ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }

  /**
   * Send event to external monitoring service
   * In production, this would integrate with your monitoring stack
   */
  private sendToMonitoringService(event: CaseCreationEvent) {
    // Example integration with external monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to your monitoring service here
      // Example: Sentry, DataDog, New Relic, etc.
      
      // For now, just log to console
      console.log('[CaseCreationMonitor] Production event:', event);
    }
  }
}

// Export singleton instance
export const caseCreationMonitor = new CaseCreationMonitor();

/**
 * Helper function to log case creation success
 */
export function logCaseCreationSuccess(
  requestId: string,
  userId: string,
  responseTime: number,
  userAgent?: string,
  ipAddress?: string
) {
  caseCreationMonitor.logEvent({
    type: 'success',
    requestId,
    userId,
    responseTime,
    userAgent,
    ipAddress,
  });
}

/**
 * Helper function to log case creation failure
 */
export function logCaseCreationFailure(
  requestId: string,
  userId: string,
  error: string,
  responseTime?: number,
  userAgent?: string,
  ipAddress?: string
) {
  caseCreationMonitor.logEvent({
    type: 'failure',
    requestId,
    userId,
    error,
    responseTime,
    userAgent,
    ipAddress,
  });
}

/**
 * Helper function to log validation errors
 */
export function logValidationError(
  requestId: string,
  userId: string,
  error: string,
  validationDetails: any[],
  userAgent?: string,
  ipAddress?: string
) {
  caseCreationMonitor.logEvent({
    type: 'validation_error',
    requestId,
    userId,
    error,
    validationDetails,
    userAgent,
    ipAddress,
  });
}

/**
 * Helper function to log authentication errors
 */
export function logAuthError(
  requestId: string,
  userId: string,
  error: string,
  userAgent?: string,
  ipAddress?: string
) {
  caseCreationMonitor.logEvent({
    type: 'auth_error',
    requestId,
    userId,
    error,
    userAgent,
    ipAddress,
  });
}

/**
 * Helper function to log server errors
 */
export function logServerError(
  requestId: string,
  userId: string,
  error: string,
  responseTime?: number,
  userAgent?: string,
  ipAddress?: string
) {
  caseCreationMonitor.logEvent({
    type: 'server_error',
    requestId,
    userId,
    error,
    responseTime,
    userAgent,
    ipAddress,
  });
}
