import { ref, runTransaction } from 'firebase/database';
import { database } from './firebase';

/**
 * Confirma presença usando transação para evitar overbooking
 * Esta é uma funcionalidade crítica que precisa ser thread-safe
 */
export async function confirmPresence(
  futId: string,
  dateId: string,
  userId: string,
  maxVagas: number
): Promise<{ success: boolean; message: string }> {
  const occurrenceRef = ref(database, `futOccurrences/${futId}/${dateId}`);

  try {
    const result = await runTransaction(occurrenceRef, (currentData) => {
      if (!currentData) {
        // Primeira confirmação - criar estrutura
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

      // Verifica se usuário já confirmou
      if (currentData.present && currentData.present[userId]) {
        // Abort transaction - usuário já confirmou
        return;
      }

      // Conta vagas ocupadas
      const vagasOcupadas = currentData.present ? Object.keys(currentData.present).length : 0;

      // Verifica se ainda há vagas
      if (vagasOcupadas >= maxVagas) {
        // Abort transaction - sem vagas
        return;
      }

      // Adiciona usuário à lista de presentes
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
      if (!finalData || !finalData.present || !finalData.present[userId]) {
        return { success: false, message: 'Sem vagas disponíveis' };
      }
      return { success: true, message: 'Presença confirmada!' };
    } else {
      return { success: false, message: 'Erro ao confirmar presença' };
    }
  } catch (error) {
    console.error('Error confirming presence:', error);
    return { success: false, message: 'Erro interno' };
  }
}

/**
 * Remove confirmação de presença
 */
export async function removePresence(
  futId: string,
  dateId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const occurrenceRef = ref(database, `futOccurrences/${futId}/${dateId}`);

  try {
    const result = await runTransaction(occurrenceRef, (currentData) => {
      if (!currentData || !currentData.present || !currentData.present[userId]) {
        // Usuário não estava presente
        return;
      }

      // Remove usuário da lista
      const newPresent = { ...currentData.present };
      delete newPresent[userId];

      return {
        ...currentData,
        present: newPresent,
        vagasOcupadas: Math.max(0, Object.keys(newPresent).length),
      };
    });

    if (result.committed) {
      return { success: true, message: 'Presença removida' };
    } else {
      return { success: false, message: 'Erro ao remover presença' };
    }
  } catch (error) {
    console.error('Error removing presence:', error);
    return { success: false, message: 'Erro interno' };
  }
}

/**
 * Registra gol ou assistência durante a partida
 */
export async function recordEvent(
  futId: string,
  dateId: string,
  playerId: string,
  eventType: 'goal' | 'assist',
  adminId: string
): Promise<{ success: boolean; message: string }> {
  const occurrenceRef = ref(database, `futOccurrences/${futId}/${dateId}`);

  try {
    const result = await runTransaction(occurrenceRef, (currentData) => {
      if (!currentData) {
        return;
      }

      const newEvent = {
        type: eventType,
        playerId: playerId,
        time: new Date().toTimeString().slice(0, 5), // HH:MM format
        timestamp: Date.now(),
        by: adminId,
      };

      const events = currentData.events || [];
      const stats = currentData.stats || {};

      // Atualiza stats do jogador
      if (!stats[playerId]) {
        stats[playerId] = { goals: 0, assists: 0 };
      }

      if (eventType === 'goal') {
        stats[playerId].goals++;
      } else if (eventType === 'assist') {
        stats[playerId].assists++;
      }

      return {
        ...currentData,
        events: [...events, newEvent],
        stats: stats,
      };
    });

    if (result.committed) {
      return { success: true, message: `${eventType === 'goal' ? 'Gol' : 'Assistência'} registrado!` };
    } else {
      return { success: false, message: 'Erro ao registrar evento' };
    }
  } catch (error) {
    console.error('Error recording event:', error);
    return { success: false, message: 'Erro interno' };
  }
}