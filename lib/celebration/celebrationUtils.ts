import confetti from 'canvas-confetti';

/**
 * Trigger confetti animation for case creation celebration
 * Only shows on first case creation to avoid repetitive celebrations
 */
export function celebrateCaseCreation(): void {
  // Main burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  // Follow-up bursts from sides
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, 400);
}

/**
 * Check if this is the user's first case creation
 * @param userId - The user's ID
 * @returns Promise<boolean> - true if this is their first case
 */
export async function isFirstCase(userId: string): Promise<boolean> {
  try {
    // Import Firebase functions dynamically to avoid SSR issues
    const { getFirestoreDb } = await import('../firebase');
    const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
    const db = getFirestoreDb();
    
    const q = query(
      collection(db, 'cases'),
      where('userId', '==', userId),
      where('status', '!=', 'deleted'),
      limit(2)
    );
    
    const userCases = await getDocs(q);

    return userCases.size === 1; // Just created their first case
  } catch (error) {
    console.error('Error checking if first case:', error);
    // Default to false to avoid showing celebration on error
    return false;
  }
}
