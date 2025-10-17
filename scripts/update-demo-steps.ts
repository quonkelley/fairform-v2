#!/usr/bin/env tsx

/**
 * Update demo case steps with enhanced step information
 * 
 * This script updates the existing DEMO-EVICTION-001 case steps in Firebase
 * to include the enhanced fields (stepType, instructions, estimatedTime, etc.)
 * that are needed for the educational content in the step modal.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { evictionScenario } from '../lib/demo/scenarios/eviction';

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config as needed
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function updateDemoSteps() {
  try {
    console.log('🔄 Updating demo case steps with enhanced information...');
    
    // Get the enhanced step data from the demo scenario
    const enhancedSteps = evictionScenario.steps;
    
    // Update each step in Firebase
    for (const step of enhancedSteps) {
      console.log(`📝 Updating step: ${step.name}`);
      
      // Find the step document in Firebase
      const stepsRef = collection(db, 'caseSteps');
      const q = query(stepsRef, where('caseId', '==', 'DEMO-EVICTION-001'), where('order', '==', step.order));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`⚠️  No step found for order ${step.order}`);
        continue;
      }
      
      // Update the step document
      const stepDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'caseSteps', stepDoc.id), {
        stepType: step.stepType,
        instructions: step.instructions,
        estimatedTime: step.estimatedTime,
        disclaimer: step.disclaimer,
        description: step.description,
      });
      
      console.log(`✅ Updated step: ${step.name} (${step.stepType})`);
    }
    
    console.log('🎉 Successfully updated all demo case steps!');
    console.log('Now the step modal should show enhanced educational content.');
    
  } catch (error) {
    console.error('❌ Error updating demo steps:', error);
    process.exit(1);
  }
}

// Run the update
updateDemoSteps();
