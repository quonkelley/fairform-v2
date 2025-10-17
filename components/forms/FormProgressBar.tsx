'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FormProgressBarProps {
  current: number;
  total: number;
}

export function FormProgressBar({ current, total }: FormProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="form-progress-bar space-y-2">
      {/* Text indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Question {current} of {total}
        </span>
        <span className="text-gray-600 font-medium">
          {percentage}% Complete
        </span>
      </div>

      {/* Visual progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between mt-3">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < current;
          const isCurrent = stepNumber === current;
          
          return (
            <div
              key={stepNumber}
              className="flex items-center"
              style={{ flex: 1 }}
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                  initial={{ scale: 1 }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </motion.div>
              </div>
              
              {/* Connector line */}
              {index < total - 1 && (
                <div className="flex-1 mx-2">
                  <div className="h-0.5 bg-gray-300 relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
