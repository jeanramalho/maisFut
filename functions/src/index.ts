import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from './email';
import { sendPushNotification } from './notifications';

admin.initializeApp();

// Trigger when a new invitation is created
export const onInvitationCreate = functions.database
  .ref('/invitations/{inviteId}')
  .onCreate(async (snapshot, context) => {
    const invitation = snapshot.val();
    const inviteId = context.params.inviteId;

    try {
      // Get fut details
      const futSnapshot = await admin.database()
        .ref(`/futs/${invitation.futId}`)
        .once('value');
      const fut = futSnapshot.val();

      // Get admin details
      const adminSnapshot = await admin.database()
        .ref(`/users/${fut.adminId}`)
        .once('value');
      const admin_user = adminSnapshot.val();

      // Check if user already exists
      const usersSnapshot = await admin.database()
        .ref('/users')
        .orderByChild('email')
        .equalTo(invitation.to)
        .once('value');

      if (usersSnapshot.exists()) {
        // User exists - send push notification
        const userId = Object.keys(usersSnapshot.val())[0];
        const user = usersSnapshot.val()[userId];
        
        if (user.fcmToken) {
          await sendPushNotification(user.fcmToken, {
            title: 'Convite para Fut!',
            body: `${admin_user.name} te convidou para "${fut.name}"`,
            data: {
              type: 'fut_invitation',
              futId: invitation.futId,
              inviteId: inviteId,
            },
          });
        }
      } else {
        // User doesn't exist - send email invitation
        await sendEmail({
          to: invitation.to,
          subject: `Convite para o Fut: ${fut.name}`,
          html: `
            <h2>Você foi convidado para um Fut!</h2>
            <p><strong>${admin_user.name}</strong> te convidou para participar do fut <strong>"${fut.name}"</strong></p>
            
            ${fut.description ? `<p><em>${fut.description}</em></p>` : ''}
            
            <p><strong>Detalhes:</strong></p>
            <ul>
              <li>Tipo: ${fut.type === 'mensal' ? 'Mensal' : 'Avulso'}</li>
              <li>Máximo de jogadores: ${fut.maxVagas}</li>
              ${fut.location ? `<li>Local: ${fut.location}</li>` : ''}
            </ul>
            
            <p>Para aceitar o convite, baixe o app +Fut e crie sua conta com este email.</p>
            <p><strong>Código do convite:</strong> ${inviteId}</p>
            
            <a href="https://your-app-url.com/signup?invite=${inviteId}" 
               style="background-color: rgb(44,255,5); color: rgb(26,26,26); padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Aceitar Convite
            </a>
          `,
        });
      }

      console.log(`Invitation sent for fut ${invitation.futId} to ${invitation.to}`);
    } catch (error) {
      console.error('Error processing invitation:', error);
    }
  });

// Trigger when an occurrence is closed (partida finalizada)
export const onOccurrenceClose = functions.database
  .ref('/futOccurrences/{futId}/{dateId}/status')
  .onUpdate(async (change, context) => {
    const newStatus = change.after.val();
    const previousStatus = change.before.val();
    
    if (previousStatus !== 'closed' && newStatus === 'closed') {
      const { futId, dateId } = context.params;
      
      try {
        // Get occurrence data
        const occurrenceRef = admin.database().ref(`/futOccurrences/${futId}/${dateId}`);
        const occurrenceSnapshot = await occurrenceRef.once('value');
        const occurrence = occurrenceSnapshot.val();

        // Calculate stats for each player
        const playerStats: Record<string, { goals: number; assists: number }> = {};
        
        if (occurrence.events) {
          occurrence.events.forEach((event: any) => {
            if (!playerStats[event.playerId]) {
              playerStats[event.playerId] = { goals: 0, assists: 0 };
            }
            
            if (event.type === 'goal') {
              playerStats[event.playerId].goals++;
            } else if (event.type === 'assist') {
              playerStats[event.playerId].assists++;
            }
          });
        }

        // Update occurrence stats
        await occurrenceRef.child('stats').set(playerStats);

        // Update global user stats
        const updatePromises = Object.entries(playerStats).map(async ([playerId, stats]) => {
          const userStatsRef = admin.database().ref(`/users/${playerId}/stats`);
          const userStatsSnapshot = await userStatsRef.once('value');
          const currentStats = userStatsSnapshot.val() || { totalGoals: 0, totalAssists: 0, totalGames: 0 };

          await userStatsRef.update({
            totalGoals: (currentStats.totalGoals || 0) + stats.goals,
            totalAssists: (currentStats.totalAssists || 0) + stats.assists,
            totalGames: (currentStats.totalGames || 0) + 1,
          });
        });

        await Promise.all(updatePromises);

        // Enable voting
        await occurrenceRef.child('voting').update({
          enabled: true,
          open: false, // Admin needs to open it manually
        });

        console.log(`Occurrence ${dateId} closed for fut ${futId}, stats updated`);
      } catch (error) {
        console.error('Error processing occurrence close:', error);
      }
    }
  });

// Trigger when voting is closed
export const onVotingClose = functions.database
  .ref('/futOccurrences/{futId}/{dateId}/voting/open')
  .onUpdate(async (change, context) => {
    const isNowClosed = change.before.val() === true && change.after.val() === false;
    
    if (isNowClosed) {
      const { futId, dateId } = context.params;
      
      try {
        const occurrenceRef = admin.database().ref(`/futOccurrences/${futId}/${dateId}`);
        const occurrenceSnapshot = await occurrenceRef.once('value');
        const occurrence = occurrenceSnapshot.val();

        if (!occurrence.voting?.votes) {
          console.log('No votes to process');
          return;
        }

        // Count votes
        const bolaCheiaCounts: Record<string, number> = {};
        const bolaMurchaCounts: Record<string, number> = {};

        Object.values(occurrence.voting.votes).forEach((vote: any) => {
          if (vote.bolaCheia) {
            bolaCheiaCounts[vote.bolaCheia] = (bolaCheiaCounts[vote.bolaCheia] || 0) + 1;
          }
          if (vote.bolaMurcha) {
            bolaMurchaCounts[vote.bolaMurcha] = (bolaMurchaCounts[vote.bolaMurcha] || 0) + 1;
          }
        });

        // Calculate performance scores (goals * 2 + assists)
        const performanceScores: Record<string, number> = {};
        if (occurrence.stats) {
          Object.entries(occurrence.stats).forEach(([playerId, stats]: [string, any]) => {
            performanceScores[playerId] = (stats.goals * 2) + (stats.assists * 1);
          });
        }

        // Determine winners (votes + performance as tiebreaker)
        const getWinner = (counts: Record<string, number>) => {
          const maxVotes = Math.max(...Object.values(counts));
          const winners = Object.entries(counts)
            .filter(([, votes]) => votes === maxVotes)
            .map(([playerId]) => playerId);

          if (winners.length === 1) {
            return winners[0];
          }

          // Tiebreaker: highest performance score
          return winners.reduce((winner, playerId) => {
            const winnerScore = performanceScores[winner] || 0;
            const playerScore = performanceScores[playerId] || 0;
            return playerScore > winnerScore ? playerId : winner;
          });
        };

        const bolaCheia = Object.keys(bolaCheiaCounts).length > 0 ? getWinner(bolaCheiaCounts) : null;
        const bolaMurcha = Object.keys(bolaMurchaCounts).length > 0 ? getWinner(bolaMurchaCounts) : null;

        // Save results
        await occurrenceRef.child('votingResult').set({
          bolaCheia,
          bolaMurcha,
          bolaCheiaCounts,
          bolaMurchaCounts,
          timestamp: admin.database.ServerValue.TIMESTAMP,
        });

        // Update user achievements/rankings if needed
        if (bolaCheia) {
          const userRef = admin.database().ref(`/users/${bolaCheia}/achievements`);
          const achievementsSnapshot = await userRef.once('value');
          const achievements = achievementsSnapshot.val() || {};
          
          await userRef.update({
            bolaCheia: (achievements.bolaCheia || 0) + 1,
          });
        }

        if (bolaMurcha) {
          const userRef = admin.database().ref(`/users/${bolaMurcha}/achievements`);
          const achievementsSnapshot = await userRef.once('value');
          const achievements = achievementsSnapshot.val() || {};
          
          await userRef.update({
            bolaMurcha: (achievements.bolaMurcha || 0) + 1,
          });
        }

        console.log(`Voting results calculated for ${futId}/${dateId}`);
      } catch (error) {
        console.error('Error processing voting close:', error);
      }
    }
  });

// Cron job to create monthly fut occurrences
export const createMonthlyOccurrences = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      const futsSnapshot = await admin.database().ref('/futs').once('value');
      const futs = futsSnapshot.val() || {};

      const today = new Date();
      const promises: Promise<any>[] = [];

      Object.entries(futs).forEach(([futId, fut]: [string, any]) => {
        if (fut.type === 'mensal' && fut.recurrence) {
          let shouldCreateOccurrence = false;
          let occurrenceDate = new Date(today);

          if (fut.recurrence.kind === 'monthly' && today.getDate() === fut.recurrence.day) {
            shouldCreateOccurrence = true;
            occurrenceDate = new Date(today);
          } else if (fut.recurrence.kind === 'weekly' && today.getDay() === fut.recurrence.day) {
            shouldCreateOccurrence = true;
            occurrenceDate = new Date(today);
          }

          if (shouldCreateOccurrence) {
            const dateId = occurrenceDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const occurrenceRef = admin.database().ref(`/futOccurrences/${futId}/${dateId}`);

            promises.push(
              occurrenceRef.set({
                date: dateId,
                futId: futId,
                present: {},
                events: [],
                stats: {},
                voting: {
                  enabled: false,
                  open: false,
                  votes: {},
                },
                status: 'scheduled',
                createdAt: admin.database.ServerValue.TIMESTAMP,
              })
            );
          }
        }
      });

      await Promise.all(promises);
      console.log(`Created ${promises.length} occurrences`);
    } catch (error) {
      console.error('Error creating monthly occurrences:', error);
    }
  });