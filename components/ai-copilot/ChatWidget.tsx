'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  className?: string;
}

// Animation variants for the widget
const widgetVariants = {
  closed: {
    scale: 1,
    rotate: 0
  },
  open: {
    scale: 1.1,
    rotate: 15
  }
};

// Animation variants for the unread badge
const badgeVariants = {
  hidden: {
    scale: 0,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1
  }
};

// Animation variants for the connection status indicator
const statusVariants = {
  connected: {
    scale: [1, 1.2, 1],
    opacity: 1
  },
  connecting: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.7, 1]
  },
  disconnected: {
    scale: 1,
    opacity: 0.6
  }
};

// Get connection status color
const getStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected': return 'bg-green-500';
    case 'connecting': return 'bg-yellow-500';
    case 'disconnected': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

// Get connection status tooltip text
const getStatusTooltip = (status: ConnectionStatus): string => {
  switch (status) {
    case 'connected': return 'AI Copilot is ready';
    case 'connecting': return 'Connecting to AI Copilot...';
    case 'disconnected': return 'AI Copilot is unavailable';
    default: return 'Unknown status';
  }
};

export function ChatWidget({
  isOpen,
  onToggle,
  unreadCount,
  connectionStatus,
  className = ''
}: ChatWidgetProps) {
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  // Generate ARIA label based on state
  const getAriaLabel = (): string => {
    const baseLabel = 'Open AI Copilot chat';
    const unreadText = unreadCount > 0 ? `${unreadCount} unread messages` : 'No unread messages';
    const statusText = getStatusTooltip(connectionStatus);
    return `${baseLabel}. ${unreadText}. ${statusText}`;
  };

  // Format unread count for display
  const formatUnreadCount = (count: number): string => {
    return count > 99 ? '99+' : count.toString();
  };

  return (
    <motion.div
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14
        md:w-16 md:h-16
        lg:bottom-8 lg:right-8
        ${className}
      `.trim()}
      variants={widgetVariants}
      animate={isOpen ? "open" : "closed"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      {/* Main widget button */}
      <button
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label={getAriaLabel()}
        aria-expanded={isOpen}
        className="
          w-full h-full
          bg-blue-600 hover:bg-blue-700
          rounded-full shadow-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors duration-200
          flex items-center justify-center
          relative
        "
      >
        {/* Chat icon */}
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
        
        {/* Unread count badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="
                absolute -top-1 -right-1
                w-5 h-5 md:w-6 md:h-6
                bg-red-500 text-white
                text-xs md:text-sm font-semibold
                rounded-full
                flex items-center justify-center
                border-2 border-white
                shadow-sm
              "
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25
              }}
            >
              {formatUnreadCount(unreadCount)}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Connection status indicator */}
        <motion.div
          className="
            absolute bottom-0 right-0
            w-3 h-3 md:w-4 md:h-4
            rounded-full border-2 border-white
            shadow-sm
          "
          variants={statusVariants}
          animate={connectionStatus}
          transition={{
            duration: 0.3,
            repeat: connectionStatus === 'connecting' ? Infinity : 0,
            repeatType: 'reverse'
          }}
        >
          <div 
            className={`
              w-full h-full rounded-full
              ${getStatusColor(connectionStatus)}
            `}
            title={getStatusTooltip(connectionStatus)}
          />
        </motion.div>
      </button>
    </motion.div>
  );
}

export default ChatWidget;
