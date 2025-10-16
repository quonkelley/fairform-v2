'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SuggestionChip {
  id: string;
  text: string;
  onClick: () => void;
}

export interface SuggestionChipsProps {
  chips: SuggestionChip[];
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  chips,
  className,
}) => {
  if (chips.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-wrap gap-2 mt-3 px-4',
        className
      )}
    >
      {chips.map((chip) => (
        <motion.button
          key={chip.id}
          variants={chipVariants}
          onClick={chip.onClick}
          className="
            px-4 py-2
            bg-gray-100 hover:bg-gray-200
            text-gray-700 text-sm
            rounded-full
            border border-gray-200
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            cursor-pointer
          "
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {chip.text}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default SuggestionChips;
