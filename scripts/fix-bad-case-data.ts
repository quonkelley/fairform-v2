/**
 * Script to fix or delete cases with bad translation data
 * Run with: npx tsx scripts/fix-bad-case-data.ts
 */

import { getAdminFirestore } from '../lib/firebase-admin';

async function fixBadCaseData() {
  const db = getAdminFirestore();
  const casesRef = db.collection('cases');

  // Find cases with the bad translation text
  const badTextPattern = 'The translation of';

  console.log('Searching for cases with bad translation data...');

  const casesSnapshot = await casesRef
    .where('userId', '==', 'demo-user-1')
    .get();

  const badCases: Array<{id: string; title?: string; jurisdiction: string}> = [];

  casesSnapshot.forEach((doc) => {
    const data = doc.data();
    const title = data.title || '';
    const jurisdiction = data.jurisdiction || '';

    // Check if title or jurisdiction contains the bad translation text
    if (title.includes(badTextPattern) || jurisdiction.includes(badTextPattern)) {
      badCases.push({
        id: doc.id,
        title: data.title,
        jurisdiction: data.jurisdiction,
      });
    }
  });

  if (badCases.length === 0) {
    console.log('✅ No cases found with bad translation data!');
    return;
  }

  console.log(`\nFound ${badCases.length} case(s) with bad data:`);
  badCases.forEach((c, i) => {
    console.log(`\n${i + 1}. Case ID: ${c.id}`);
    console.log(`   Title: ${c.title || '(no title)'}`);
    console.log(`   Jurisdiction: ${c.jurisdiction}`);
  });

  console.log('\n🗑️  Deleting bad cases...');

  for (const badCase of badCases) {
    await casesRef.doc(badCase.id).delete();
    console.log(`   ✓ Deleted case ${badCase.id}`);
  }

  console.log(`\n✅ Successfully deleted ${badCases.length} case(s)`);
  console.log('You can now create a new case without the translation issue.');
}

// Run the script
fixBadCaseData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
