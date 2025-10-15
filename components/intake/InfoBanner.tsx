'use client';

import { X, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InfoBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function InfoBanner({ message, onDismiss, className }: InfoBannerProps) {
  return (
    <Card className={`border-blue-200 bg-blue-50 ${className || ''}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm text-blue-900">{message}</p>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-auto p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

