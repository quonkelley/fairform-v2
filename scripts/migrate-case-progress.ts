#!/usr/bin/env tsx
/**
 * Migration script to calculate and populate currentStep for existing cases
 *
 * This script runs the calculateCaseProgress function on all existing cases
 * to ensure they have the new Epic 6.5 fields (currentStep, totalSteps, etc.)
 *
 * Usage:
 *   tsx scripts/migrate-case-progress.ts
 */

import { getAdminFirestore } from "../lib/firebase-admin";
import { calculateCaseProgress } from "../lib/db/casesRepo";

async function migrateCaseProgress() {
  console.log("🚀 Starting case progress migration...\n");

  try {
    const db = getAdminFirestore();
    const casesSnapshot = await db.collection("cases").get();

    console.log(`📊 Found ${casesSnapshot.size} cases to migrate\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: { caseId: string; error: string }[] = [];

    // Process each case
    for (const doc of casesSnapshot.docs) {
      const caseId = doc.id;
      const caseData = doc.data();

      try {
        console.log(`Processing case ${caseId} (${caseData.caseType})...`);

        // Check if currentStep already exists
        if (typeof caseData.currentStep === "number") {
          console.log(`  ✓ Already has currentStep: ${caseData.currentStep}\n`);
          successCount++;
          continue;
        }

        // Calculate progress (includes currentStep)
        const updatedCase = await calculateCaseProgress(caseId);

        console.log(`  ✓ Updated progress:`);
        console.log(`    - Progress: ${updatedCase.progressPct}%`);
        console.log(`    - Current Step: ${updatedCase.currentStep}`);
        console.log(`    - Total Steps: ${updatedCase.totalSteps}`);
        console.log(`    - Completed: ${updatedCase.completedSteps}\n`);

        successCount++;
      } catch (error) {
        console.error(`  ✗ Error processing case ${caseId}:`, error);
        errorCount++;
        errors.push({
          caseId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📈 Migration Summary");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successCount} cases`);
    console.log(`❌ Errors: ${errorCount} cases`);

    if (errors.length > 0) {
      console.log("\n❌ Errors:");
      errors.forEach(({ caseId, error }) => {
        console.log(`  - Case ${caseId}: ${error}`);
      });
    }

    console.log("\n✨ Migration complete!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateCaseProgress()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
