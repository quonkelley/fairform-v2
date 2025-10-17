'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuggestionChip {
  id: string;
  text: string;
  value: string;
  icon?: LucideIcon;
  primary?: boolean;
}

export interface SuggestionChipsProps {
  chips: SuggestionChip[];
  onSelect: (value: string) => void;
  maxVisible?: number;
  className?: string;
}

const chipVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  chips,
  onSelect,
  maxVisible = 5,
  className,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  if (chips.length === 0) return null;

  const visibleChips = showMore ? chips : chips.slice(0, maxVisible);
  const hasMore = chips.length > maxVisible && !showMore;

  const handleSelect = (chip: SuggestionChip) => {
    setSelected(chip.value);
    onSelect(chip.value);

    // Chip will fade out via AnimatePresence
    setTimeout(() => setSelected(null), 500);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('mt-3 px-4', className)}
    >
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        role="group"
        aria-label="Quick action suggestions"
        style={{
          // Fade edges to indicate scrollability
          maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selected === chip.value;

            return (
              <motion.button
                key={chip.id}
                variants={chipVariants}
                initial="hidden"
                animate={isSelected ? 'exit' : 'visible'}
                exit="exit"
                onClick={() => handleSelect(chip)}
                disabled={isSelected}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full',
                  'whitespace-nowrap snap-start flex-shrink-0',
                  'transition-colors duration-200',
                  'border',
                  // Minimum touch target size for accessibility
                  'min-h-[44px]',
                  chip.primary
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label={`Select ${chip.text}`}
                whileHover={!isSelected ? { scale: 1.02 } : {}}
                whileTap={!isSelected ? { scale: 0.98 } : {}}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                <span className="text-sm font-medium">{chip.text}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {hasMore && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowMore(true)}
            className={cn(
              'flex items-center gap-1 px-4 py-2 rounded-full',
              'whitespace-nowrap snap-start flex-shrink-0',
              'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors',
              'min-h-[44px]',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            aria-label="Show more suggestions"
          >
            <span className="text-sm font-medium">More</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default SuggestionChips;
