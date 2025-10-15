import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, FileText } from 'lucide-react';

interface CaseConfirmationCardProps {
  caseType: string;
  details: Record<string, string | undefined>;
  onConfirm?: () => void;  // For future interactive buttons
  onDecline?: () => void;   // For future interactive buttons
}

export function CaseConfirmationCard({
  caseType,
  details,
  // onConfirm and onDecline reserved for future use
}: CaseConfirmationCardProps) {
  // Format case type for display
  const caseTypeDisplay = caseType === 'eviction'
    ? 'Eviction Defense'
    : caseType === 'small_claims'
    ? 'Small Claims'
    : caseType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <Card className="border-primary/50 bg-primary/5 my-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-primary" />
          Ready to Create Your Case
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm space-y-2">
          <p className="font-medium">I&apos;ve gathered the following information:</p>

          <div className="pl-4 space-y-1">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" data-testid="check-icon" />
              <div>
                <span className="font-medium">Case Type:</span>{' '}
                <span>{caseTypeDisplay}</span>
              </div>
            </div>

            {details.location && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" data-testid="check-icon" />
                <div>
                  <span className="font-medium">Location:</span>{' '}
                  <span>{details.location}</span>
                </div>
              </div>
            )}

            {details.noticeType && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" data-testid="check-icon" />
                <div>
                  <span className="font-medium">Notice Type:</span>{' '}
                  <span>{details.noticeType.replace(/-/g, ' ')}</span>
                </div>
              </div>
            )}

            {details.dateReceived && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" data-testid="check-icon" />
                <div>
                  <span className="font-medium">Date Received:</span>{' '}
                  <span>{details.dateReceived}</span>
                </div>
              </div>
            )}

            {/* Render any other details */}
            {Object.entries(details)
              .filter(([key]) => !['location', 'noticeType', 'dateReceived'].includes(key))
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" data-testid="check-icon" />
                  <div>
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>{' '}
                    <span>{value}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="text-sm text-muted-foreground pt-2 border-t">
          <p>
            Would you like me to create your case with this information?
            You can say &quot;Yes, create my case&quot; to proceed, or let me know
            if you&apos;d like to change anything first.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
