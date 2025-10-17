'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface NextStep {
  title: string;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

export interface CelebrationModalProps {
  caseId: string;
  caseTitle: string;
  nextSteps: NextStep[];
  onClose: () => void;
  isOpen?: boolean;
}

export function CelebrationModal({
  caseTitle,
  nextSteps,
  onClose,
  isOpen = true
}: CelebrationModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <DialogTitle className="text-2xl">
              Case Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-base">
              Your case &quot;{caseTitle}&quot; is ready. Here&apos;s what you can do next:
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {nextSteps.map((step, i) => (
            <Button
              key={i}
              variant={step.variant || (i === 0 ? 'default' : 'outline')}
              className="w-full"
              onClick={step.action}
            >
              {step.title}
            </Button>
          ))}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <h4 className="font-medium mb-1">💡 Tip</h4>
          <p className="text-gray-700">
            FairForm will guide you through each step of your legal journey.
            You can always come back and ask questions using the AI Copilot.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            I&apos;ll explore on my own
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
