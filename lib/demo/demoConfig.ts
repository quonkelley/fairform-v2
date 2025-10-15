/**
 * Demo Configuration
 * 
 * LOCKED FOR PUBLIC DEMO - DO NOT CHANGE without careful consideration
 * 
 * This file contains configuration for demo mode behavior including:
 * - Current scenario selection
 * - Timing constants for animations and delays
 * - Demo user information
 * 
 * Note: No feature flags - this is single-mode demo code.
 * All features (PDF, OCR simulation, reminders) are always enabled
 * with their appropriate implementations.
 */

import { currentScenario } from './scenarios';

/**
 * Demo mode configuration
 */
export const demoConfig = {
  /**
   * Demo user information
   */
  user: {
    id: 'demo-user',
    name: 'Alex Rodriguez',
    email: 'demo@fairform.app',
    displayName: 'Alex Rodriguez (Demo)',
  },

  /**
   * Current scenario metadata
   */
  scenario: {
    id: currentScenario.case.id,
    type: currentScenario.case.caseType,
    name: currentScenario.case.title || 'Demo Case',
  },

  /**
   * Timing constants for animations and simulated delays (milliseconds)
   * 
   * These ensure smooth UX while maintaining realistic behavior
   */
  timing: {
    /**
     * Simulated OCR processing time for document scanning
     * Shows loading indicator to user
     */
    scanDelay: 1500,

    /**
     * AI Copilot typing indicator delay
     * Makes conversation feel natural
     */
    aiResponseDelay: 800,

    /**
     * PDF generation processing indicator
     * Simulates PDF library processing time
     */
    pdfGenerationDelay: 1200,

    /**
     * Case creation animation duration
     * Shows success state before redirect
     */
    caseCreationDelay: 1000,

    /**
     * Reminder creation feedback duration
     * Toast notification display time
     */
    reminderCreatedDelay: 500,

    /**
     * Step completion animation duration
     * Confetti and progress update
     */
    stepCompletionDelay: 800,

    /**
     * Default loading state minimum duration
     * Prevents flickering for fast operations
     */
    minLoadingDuration: 300,

    /**
     * Typing indicator per character delay
     * For realistic typing animation
     */
    typingSpeed: 50,
  },

  /**
   * Demo behavior flags
   * 
   * These control demo-specific behaviors vs production behaviors
   */
  behavior: {
    /**
     * Show demo banner/watermark
     */
    showDemoBanner: true,

    /**
     * Allow data persistence in localStorage
     * Set to false for pure session-based demo
     */
    persistInLocalStorage: true,

    /**
     * Automatically populate form fields with demo data
     */
    autofillForms: true,

    /**
     * Skip actual email/SMS sending
     * Show UI feedback only
     */
    simulateNotifications: true,

    /**
     * Use simulated PDF generation
     * Falls back to HTML preview
     */
    simulatePDF: true,

    /**
     * Auto-advance through certain flows
     * For guided demo presentations
     */
    autoAdvance: false,

    /**
     * Reset to initial state after session timeout
     */
    autoResetOnTimeout: true,
    sessionTimeoutMinutes: 30,
  },

  /**
   * Analytics configuration for demo mode
   */
  analytics: {
    /**
     * Track demo interactions
     */
    enabled: true,

    /**
     * Tag all events as demo events
     */
    demoTag: 'demo-mode',

    /**
     * Events to track in demo mode
     */
    trackedEvents: [
      'demo_started',
      'copilot_message_sent',
      'case_created',
      'step_completed',
      'form_filled',
      'pdf_downloaded',
      'reminder_created',
    ],
  },

  /**
   * UI customization for demo mode
   */
  ui: {
    /**
     * Show "Demo Mode" badge in nav
     */
    showDemoBadge: true,

    /**
     * Demo mode theme color
     */
    themeColor: '#10b981', // green-500

    /**
     * Toast notification duration (ms)
     */
    toastDuration: 3000,

    /**
     * Show helpful hints during demo
     */
    showHints: true,

    /**
     * Enable confetti animations for achievements
     */
    enableConfetti: true,
  },

  /**
   * Demo script support
   * 
   * Supports the 15-minute demo script
   */
  script: {
    /**
     * Predefined conversation flows
     */
    conversations: {
      eviction: [
        'I received a 30-day eviction notice',
        'I live in Indianapolis, Indiana',
        'Yes, I want help with this',
      ],
      smallClaims: [
        'My landlord won\'t return my security deposit',
        'I\'m in Marion County',
        'The amount is $2,500',
      ],
    },

    /**
     * Key demo waypoints for presentations
     */
    waypoints: [
      {
        id: 'chat-to-case',
        label: 'Chat → Case Creation',
        description: 'User shares details, AI creates case',
        duration: '2 min',
      },
      {
        id: 'auto-plan',
        label: 'Auto-Plan Generation',
        description: 'Deadlines and steps generated',
        duration: '2 min',
      },
      {
        id: 'remind-me',
        label: 'Set Reminder',
        description: 'User sets reminder for deadline',
        duration: '1 min',
      },
      {
        id: 'fill-form',
        label: 'Smart Form Filler',
        description: 'AI helps fill appearance form',
        duration: '5 min',
      },
      {
        id: 'hearing-prep',
        label: 'Hearing Day Mode',
        description: 'Day-of checklist and tips',
        duration: '3 min',
      },
    ],

    /**
     * Demo reset triggers
     */
    resetTriggers: {
      onPageReload: false,
      onLogout: true,
      onTimeout: true,
    },
  },
} as const;

/**
 * Check if we're in demo mode
 * 
 * Demo mode is active when:
 * - NEXT_PUBLIC_DEMO_MODE=true, OR
 * - User is logged in as demo user, OR
 * - Using demo routes
 */
export function isDemoMode(): boolean {
  // Check environment variable
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true;
  }

  // Check for demo user (client-side only)
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('demo_user_id');
    return userId === demoConfig.user.id;
  }

  return false;
}

/**
 * Get demo delay for a specific operation
 */
export function getDemoDelay(operation: keyof typeof demoConfig.timing): number {
  return demoConfig.timing[operation];
}

/**
 * Check if a specific demo behavior is enabled
 */
export function isDemoBehaviorEnabled(
  behavior: keyof typeof demoConfig.behavior
): boolean {
  return demoConfig.behavior[behavior];
}

/**
 * Get demo user information
 */
export function getDemoUser() {
  return demoConfig.user;
}

/**
 * Type exports for external use
 */
export type DemoConfig = typeof demoConfig;
export type DemoOperation = keyof typeof demoConfig.timing;
export type DemoBehavior = keyof typeof demoConfig.behavior;

