/**
 * Script para testar concorrência na confirmação de presença
 * Execute: node test-concurrency.js
 * 
 * Este script simula múltiplos usuários tentando confirmar presença
 * simultaneamente para verificar se a transação está funcionando
 * corretamente e evitando overbooking.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to provide your service account key)
// const serviceAccount = require('./path-to-your-service-account-key.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://your-project-id-default-rtdb.firebaseio.com/'
// });

const db = admin.database();

async function simulatePresenceConfirmation(futId, dateId, userId, maxVagas) {
  const occurrenceRef = db.ref(`futOccurrences/${futId}/${dateId}`);
  
  try {
    const result = await occurrenceRef.transaction((currentData) => {
      if (!currentData) {
        // First confirmation
        return {
          date: dateId,
          futId: futId,
          present: { [userId]: true },
          events: [],
          stats: {},
          voting: { enabled: false, open: false, votes: {} },
          status: 'scheduled',
          createdAt: Date.now(),
          vagasOcupadas: 1,
        };
      }

      // Check if user already confirmed
      if (currentData.present && currentData.present[userId]) {
        console.log(`❌ User ${userId} already confirmed`);
        return; // Abort transaction
      }

      // Count occupied slots
      const vagasOcupadas = currentData.present ? Object.keys(currentData.present).length : 0;

      // Check if there are available slots
      if (vagasOcupadas >= maxVagas) {
        console.log(`❌ No slots available for user ${userId} (${vagasOcupadas}/${maxVagas})`);
        return; // Abort transaction
      }

      // Add user to present list
      console.log(`✅ Adding user ${userId} to presence list (${vagasOcupadas + 1}/${maxVagas})`);
      return {
        ...currentData,
        present: {
          ...currentData.present,
          [userId]: true,
        },
        vagasOcupadas: vagasOcupadas + 1,
      };
    });

    if (result.committed) {
      const finalData = result.snapshot.val();
      if (finalData && finalData.present && finalData.present[userId]) {
        console.log(`🎉 User ${userId} successfully confirmed presence`);
        return { success: true };
      } else {
        console.log(`❌ User ${userId} failed to confirm (no slots)`);
        return { success: false, reason: 'no_slots' };
      }
    } else {
      console.log(`❌ Transaction failed for user ${userId}`);
      return { success: false, reason: 'transaction_failed' };
    }
  } catch (error) {
    console.error(`❌ Error for user ${userId}:`, error.message);
    return { success: false, reason: 'error', error: error.message };
  }
}

async function runConcurrencyTest() {
  console.log('🧪 Starting concurrency test for presence confirmation...\n');
  
  const futId = 'test-fut-' + Date.now();
  const dateId = '2024-03-15';
  const maxVagas = 5; // Small number to force conflicts
  const numUsers = 10; // More users than slots
  
  console.log(`Testing with ${numUsers} users trying to confirm presence`);
  console.log(`Max slots available: ${maxVagas}\n`);

  // Create promises for simultaneous confirmations
  const promises = [];
  for (let i = 1; i <= numUsers; i++) {
    const userId = `user-${i}`;
    promises.push(simulatePresenceConfirmation(futId, dateId, userId, maxVagas));
  }

  // Execute all confirmations simultaneously
  const results = await Promise.all(promises);

  // Analyze results
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n📊 Test Results:');
  console.log(`✅ Successful confirmations: ${successful}`);
  console.log(`❌ Failed confirmations: ${failed}`);
  console.log(`🎯 Expected successful: ${maxVagas}`);
  
  if (successful === maxVagas && failed === (numUsers - maxVagas)) {
    console.log('🎉 CONCURRENCY TEST PASSED! Transaction is working correctly.');
  } else {
    console.log('❌ CONCURRENCY TEST FAILED! There might be a race condition.');
  }

  // Verify final state
  try {
    const finalSnapshot = await db.ref(`futOccurrences/${futId}/${dateId}`).once('value');
    const finalData = finalSnapshot.val();
    
    if (finalData && finalData.present) {
      const finalCount = Object.keys(finalData.present).length;
      console.log(`📋 Final confirmed users in database: ${finalCount}`);
      console.log(`👥 Users: ${Object.keys(finalData.present).join(', ')}`);
      
      if (finalCount === Math.min(maxVagas, successful)) {
        console.log('✅ Database state is consistent!');
      } else {
        console.log('❌ Database state is inconsistent!');
      }
    }

    // Cleanup test data
    await db.ref(`futOccurrences/${futId}`).remove();
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('Error verifying final state:', error);
  }
}

// Uncomment to run the test
// runConcurrencyTest().catch(console.error);

console.log(`
⚠️  SETUP REQUIRED:
1. Install firebase-admin: npm install firebase-admin
2. Download your service account key from Firebase Console
3. Uncomment and update the initialization code above
4. Uncomment the last line to run the test
5. Run: node test-concurrency.js

This test verifies that the transaction-based presence confirmation
prevents overbooking even under high concurrency.
`);

module.exports = {
  simulatePresenceConfirmation,
  runConcurrencyTest
};