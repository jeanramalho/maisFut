import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { ref, get, set, push, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Fut, RankingType } from './types';

export function useFutActions(
  fut: Fut | null,
  isAdmin: boolean,
  futState: any
) {
  const router = useRouter();
  const { user } = useAuth();

  // Função para obter texto de recorrência
  const getRecurrenceText = useCallback(() => {
    if (!fut) return '';
    if (fut.type === 'avulso') return 'Partida única';
    if (fut.recurrence) {
      if (fut.recurrence.kind === 'weekly') {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return `Toda ${days[fut.recurrence.day]}`;
      }
      return `Todo dia ${fut.recurrence.day} do mês`;
    }
    return 'Recorrência não definida';
  }, [fut]);

  // Função para liberar lista
  const handleReleaseList = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        listReleased: true,
        releasedVagas: futState.releasedVagas || fut.maxVagas,
      });
      futState.setListReleased(true);
    } catch (error) {
      console.error('Error releasing list:', error);
      alert('Erro ao liberar lista');
    }
  }, [fut, isAdmin, futState]);

  // Função para confirmar presença
  const handleConfirmPresence = useCallback(async (isIn: boolean) => {
    if (!fut || !user) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      const currentConfirmed = futState.confirmedMembers || [];
      
      let newConfirmed;
      if (isIn) {
        // Verificar se o usuário já está na lista antes de adicionar
        if (currentConfirmed.includes(user.uid)) {
          // Usuário já está na lista, não fazer nada
          return;
        }
        newConfirmed = [...currentConfirmed, user.uid];
      } else {
        newConfirmed = currentConfirmed.filter((id: string) => id !== user.uid);
      }

      await update(futRef, {
        confirmedMembers: newConfirmed,
      });
      futState.setConfirmedMembers(newConfirmed);
    } catch (error) {
      console.error('Error confirming presence:', error);
      alert('Erro ao confirmar presença');
    }
  }, [fut, user, futState]);

  // Função para iniciar fut
  const handleStartFut = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        futStarted: true,
        startedAt: new Date().toISOString(),
      });
      futState.setFutStarted(true);
    } catch (error) {
      console.error('Error starting fut:', error);
      alert('Erro ao iniciar fut');
    }
  }, [fut, isAdmin, futState]);


  // Função para buscar membros
  const handleSearchMembers = useCallback(async () => {
    if (!futState.memberSearchQuery.trim()) {
      futState.setMemberSearchResults([]);
      return;
    }

    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const usersData = snapshot.val() || {};
      
      const results = Object.entries(usersData)
        .filter(([userId, userData]: [string, any]) => {
          const name = userData?.name?.toLowerCase() || '';
          const email = userData?.email?.toLowerCase() || '';
          const query = futState.memberSearchQuery.toLowerCase();
          return (name.includes(query) || email.includes(query)) && userId !== user?.uid;
        })
        .map(([userId, userData]) => ({
          id: userId,
          ...(userData as any),
        }));

      futState.setMemberSearchResults(results);
    } catch (error) {
      console.error('Error searching members:', error);
      futState.setMemberSearchResults([]);
    }
  }, [futState, user]);



  // Função para encerrar fut
  const handleEndFut = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        futEnded: true,
        endedAt: new Date().toISOString(),
      });
      futState.setFutEnded(true);
    } catch (error) {
      console.error('Error ending fut:', error);
      alert('Erro ao encerrar fut');
    }
  }, [fut, isAdmin, futState]);

  // Função para iniciar votação
  const handleStartVoting = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        votingOpen: true,
        votingStartedAt: new Date().toISOString(),
      });
      futState.setVotingOpen(true);
    } catch (error) {
      console.error('Error starting voting:', error);
      alert('Erro ao iniciar votação');
    }
  }, [fut, isAdmin, futState]);

  // Função para encerrar votação
  const handleEndVoting = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        votingOpen: false,
        votingEnded: true,
        votingEndedAt: new Date().toISOString(),
      });
      futState.setVotingOpen(false);
      futState.setVotingEnded(true);
    } catch (error) {
      console.error('Error ending voting:', error);
      alert('Erro ao encerrar votação');
    }
  }, [fut, isAdmin, futState]);

  // Função para votar
  const handleVote = useCallback(async (playerId: string, rating: number) => {
    if (!fut || !user) return;

    try {
      const voteRef = ref(database, `futs/${fut.id}/userVotes/${user.uid}/${playerId}`);
      await set(voteRef, rating);

      // Update local state
      futState.setUserVotes((prev: any) => ({
        ...prev,
        [user.uid]: {
          ...prev[user.uid],
          [playerId]: rating,
        },
      }));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Erro ao votar');
    }
  }, [fut, user, futState]);

  // Função para gerar ranking
  const handleGenerateRanking = useCallback(async (type: RankingType = 'pontuacao') => {
    if (!fut || !isAdmin) return;

    try {
      futState.setRankingType(type);
      futState.setLoadingRanking(true);
      
      if (type === 'vitorias') {
        // Team wins ranking
        const teamWins = Object.entries(futState.teamStats)
          .map(([teamName, stats]: [string, any]) => ({
            teamName,
            wins: stats.wins,
          }))
          .sort((a, b) => b.wins - a.wins);
        
        futState.setRanking(teamWins);
      } else {
        // Calculate average votes for each player (only for members, not guests)
        const playerAverages: Record<string, number> = {};
        
        Object.entries(futState.userVotes).forEach(([userId, votes]: [string, any]) => {
          Object.entries(votes).forEach(([playerId, rating]: [string, any]) => {
            if (!playerAverages[playerId]) {
              playerAverages[playerId] = 0;
            }
            playerAverages[playerId] += rating;
          });
        });

        const playerCounts: Record<string, number> = {};
        Object.values(futState.userVotes).forEach((votes: any) => {
          Object.keys(votes).forEach(playerId => {
            playerCounts[playerId] = (playerCounts[playerId] || 0) + 1;
          });
        });

        const sortedPlayers = Object.entries(playerAverages)
          .filter(([playerId]) => !futState.members[playerId]?.isGuest && futState.members[playerId] && playerId !== 'VAGA')
          .map(([playerId, totalVotes]) => {
            const count = playerCounts[playerId] || 1;
            const average = totalVotes / count;
            const player = futState.members[playerId];
            const stats = futState.playerStats[playerId] || { goals: 0, assists: 0 };
            
            let score = 0;
            if (type === 'pontuacao') {
              // Cada estrela vale 20 pontos, gols valem 10 pontos, assistências valem 5 pontos
              score = average * 20 + stats.goals * 10 + stats.assists * 5;
            } else if (type === 'artilharia') {
              score = stats.goals;
            } else if (type === 'assistencias') {
              score = stats.assists;
            }
            
            return {
              playerId,
              name: player?.name || 'Jogador',
              score,
              goals: stats.goals,
              assists: stats.assists,
            };
          })
          .sort((a, b) => b.score - a.score);
        
        futState.setRanking(sortedPlayers);
      }
      futState.setShowRanking(true);
      futState.setLoadingRanking(false);
    } catch (error) {
      console.error('Error generating ranking:', error);
      alert('Erro ao gerar ranking');
      futState.setLoadingRanking(false);
    }
  }, [fut, isAdmin, futState]);

  // Função para finalizar fut
  const handleFinalizeFut = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        finalized: true,
        finalizedAt: new Date().toISOString(),
        futStarted: false,
        futEnded: false,
        votingOpen: false,
        votingEnded: false,
        listReleased: false,
        confirmedMembers: [],
        teams: null,
        teamStats: null,
        playerStats: null,
        playerVotes: null,
        userVotes: null,
        ranking: null,
        showRanking: false,
      });

      // Save to history
      const historyRef = ref(database, `futs/${fut.id}/history`);
      const historyEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        teams: futState.teams,
        teamStats: futState.teamStats,
        playerStats: futState.playerStats,
        ranking: futState.ranking,
        finalizedAt: new Date().toISOString(),
      };
      await push(historyRef, historyEntry);

      // Reset all states
      futState.setFutStarted(false);
      futState.setFutEnded(false);
      futState.setVotingOpen(false);
      futState.setVotingEnded(false);
      futState.setListReleased(false);
      futState.setConfirmedMembers([]);
      futState.setTeams({});
      futState.setTeamStats({});
      futState.setPlayerStats({});
      futState.setPlayerVotes({});
      futState.setUserVotes({});
      futState.setShowRanking(false);
      futState.setRanking(null);
      futState.setSelectedTeam(null);
      
      // Voltar para a aba fut
      futState.setActiveTab('fut');

      alert('Fut finalizado com sucesso!');
    } catch (error) {
      console.error('Error finalizing fut:', error);
      alert('Erro ao finalizar fut');
    }
  }, [fut, isAdmin, futState]);

  // Função para deletar fut
  const handleDeleteFut = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await remove(futRef);
      
      router.push('/');
    } catch (error) {
      console.error('Error deleting fut:', error);
      alert('Erro ao deletar fut');
    }
  }, [fut, isAdmin, router]);

  // Função para deletar dados do fut
  const handleDeleteData = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        teams: null,
        teamStats: null,
        playerStats: null,
        playerVotes: null,
        userVotes: null,
        futStarted: false,
        futEnded: false,
        votingOpen: false,
        votingEnded: false,
        listReleased: false,
        confirmedMembers: [],
      });

      futState.setTeams({});
      futState.setTeamStats({});
      futState.setPlayerStats({});
      futState.setPlayerVotes({});
      futState.setUserVotes({});
      futState.setFutStarted(false);
      futState.setFutEnded(false);
      futState.setVotingOpen(false);
      futState.setVotingEnded(false);
      futState.setListReleased(false);
      futState.setConfirmedMembers([]);
      futState.setShowRanking(false);
      futState.setRanking(null);
      
      alert('Dados do fut excluídos com sucesso!');
    } catch (error) {
      console.error('Error deleting fut data:', error);
      alert('Erro ao excluir dados do fut');
    }
  }, [fut, isAdmin, futState]);

  // Função para deletar times
  const handleDeleteTeams = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await update(futRef, {
        teams: null,
      });

      futState.setTeams({});
      alert('Times excluídos com sucesso!');
    } catch (error) {
      console.error('Error deleting teams:', error);
      alert('Erro ao excluir times');
    }
  }, [fut, isAdmin, futState]);


  // Função para atualizar vitórias do time
  const handleUpdateTeamWins = useCallback(async (teamName: string, change: number) => {
    if (!fut || !isAdmin) return;

    try {
      const currentWins = futState.teamStats[teamName]?.wins || 0;
      const newWins = Math.max(0, currentWins + change);
      
      const futRef = ref(database, `futs/${fut.id}/teamStats/${teamName}`);
      await set(futRef, { wins: newWins });

      futState.setTeamStats((prev: any) => ({
        ...prev,
        [teamName]: { wins: newWins }
      }));
    } catch (error) {
      console.error('Error updating team wins:', error);
      alert('Erro ao atualizar vitórias do time');
    }
  }, [fut, isAdmin, futState]);

  // Função para atualizar estatísticas do jogador
  const handleUpdatePlayerStats = useCallback(async (playerId: string, stat: 'goals' | 'assists', change: number) => {
    if (!fut || !isAdmin) return;

    try {
      const currentStats = futState.playerStats[playerId] || { goals: 0, assists: 0 };
      const newValue = Math.max(0, currentStats[stat] + change);
      
      const futRef = ref(database, `futs/${fut.id}/playerStats/${playerId}`);
      await set(futRef, {
        ...currentStats,
        [stat]: newValue
      });

      futState.setPlayerStats((prev: any) => ({
        ...prev,
        [playerId]: {
          ...currentStats,
          [stat]: newValue
        }
      }));

      // Update user's total stats
      const userRef = ref(database, `users/${playerId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      if (userData) {
        const currentTotal = userData.totalGoals || 0;
        const currentAssists = userData.totalAssists || 0;
        
        const newTotalGoals = stat === 'goals' ? currentTotal + change : currentTotal;
        const newTotalAssists = stat === 'assists' ? currentAssists + change : currentAssists;
        
        await set(ref(database, `users/${playerId}/totalGoals`), Math.max(0, newTotalGoals));
        await set(ref(database, `users/${playerId}/totalAssists`), Math.max(0, newTotalAssists));
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
      alert('Erro ao atualizar estatísticas do jogador');
    }
  }, [fut, isAdmin, futState]);



  // Função para deletar anúncio
  const handleDeleteAnnouncement = useCallback(async (announcementId: string) => {
    if (!fut || !isAdmin) return;

    try {
      const announcementRef = ref(database, `futs/${fut.id}/announcements/${announcementId}`);
      await remove(announcementRef);

      futState.setAnnouncements((prev: any) => 
        prev.filter((announcement: any) => announcement.id !== announcementId)
      );
      
      alert('Aviso excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Erro ao excluir aviso');
    }
  }, [fut, isAdmin, futState]);

  // Função para remover membro
  const handleRemoveMember = useCallback(async (memberId: string, memberName: string) => {
    if (!fut || !isAdmin) return;

    if (!confirm(`Tem certeza que deseja remover ${memberName} do fut?`)) {
      return;
    }

    try {
      const futRef = ref(database, `futs/${fut.id}/members/${memberId}`);
      await remove(futRef);

      futState.setMembers((prev: any) => {
        const newMembers = { ...prev };
        delete newMembers[memberId];
        return newMembers;
      });

      // Remove from confirmed members if present
      futState.setConfirmedMembers((prev: any) => 
        prev.filter((id: any) => id !== memberId)
      );

      alert('Membro removido com sucesso!');
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Erro ao remover membro');
    }
  }, [fut, isAdmin, futState]);

  // Função para compartilhar lista de confirmados
  const handleShareList = useCallback(() => {
    const confirmedNames = futState.confirmedMembers.map((memberId: string, index: number) => {
      const member = futState.members[memberId];
      return `${index + 1} - ${member?.name || 'VAGA'}`;
    }).join('\n');

    const message = `Lista de confirmados - ${fut?.name} - ${fut?.time || '19:00'} - ${getRecurrenceText()} - 23/09/2025\n\n${confirmedNames}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [fut, futState.confirmedMembers, futState.members]);

  // Função para compartilhar times
  const handleShareTeams = useCallback(() => {
    let message = `${fut?.name} - ${getRecurrenceText()} às ${fut?.time || '19:00'} - 23/09/2025\n\nTIMES:\n\n`;
    
    Object.entries(futState.teams).forEach(([teamName, players]) => {
      message += `${teamName}\n`;
      (players as string[]).forEach((playerId: string, index: number) => {
        const player = futState.members[playerId];
        message += `${index + 1}- ${player?.name || 'VAGA'}\n`;
      });
      
      // Add VAGA if team is not full
      while ((players as string[]).length < parseInt(futState.playersPerTeam)) {
        message += `${(players as string[]).length + 1}- VAGA\n`;
        (players as string[]).push('VAGA');
      }
      
      message += '\n';
    });
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [fut, futState.teams, futState.members, futState.playersPerTeam]);

  // Função para sortear times
  const handleTeamDraw = useCallback(async () => {
    const teamCountNum = parseInt(futState.teamCount);
    const playersPerTeamNum = parseInt(futState.playersPerTeam);
    
    if (!futState.teamCount || !futState.playersPerTeam || isNaN(teamCountNum) || isNaN(playersPerTeamNum)) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    if (teamCountNum < 2) {
      alert('Deve ter pelo menos 2 times');
      return;
    }
    
    if (playersPerTeamNum < 1) {
      alert('Deve ter pelo menos 1 jogador por time');
      return;
    }

    const shuffledMembers = [...futState.confirmedMembers].sort(() => Math.random() - 0.5);
    const newTeams: Record<string, string[]> = {};
    
    // Initialize teams
    for (let i = 1; i <= teamCountNum; i++) {
      newTeams[`Time ${i}`] = [];
    }
    
    // Distribute players
    let memberIndex = 0;
    for (let i = 1; i <= teamCountNum; i++) {
      const teamName = `Time ${i}`;
      for (let j = 0; j < playersPerTeamNum; j++) {
        if (memberIndex < shuffledMembers.length) {
          newTeams[teamName].push(shuffledMembers[memberIndex]);
          memberIndex++;
        } else {
          // Add VAGA if no more players
          newTeams[teamName].push('VAGA');
        }
      }
    }

    try {
      const futRef = ref(database, `futs/${fut?.id}/teams`);
      await set(futRef, newTeams);
      
      futState.setTeams(newTeams);
      futState.setShowTeamDrawModal(false);
      
      // Initialize stats
      const initialTeamStats: Record<string, { wins: number }> = {};
      const initialPlayerStats: Record<string, { goals: number; assists: number }> = {};
      
      Object.keys(newTeams).forEach(teamName => {
        initialTeamStats[teamName] = { wins: 0 };
      });
      
      Object.values(newTeams).flat().forEach(playerId => {
        initialPlayerStats[playerId] = { goals: 0, assists: 0 };
      });
      
      futState.setTeamStats(initialTeamStats);
      futState.setPlayerStats(initialPlayerStats);
      
      // Save initial stats to Firebase
      try {
        await set(ref(database, `futs/${fut?.id}/teamStats`), initialTeamStats);
        await set(ref(database, `futs/${fut?.id}/playerStats`), initialPlayerStats);
      } catch (error) {
        console.error('Error saving initial stats:', error);
      }
      
      alert('Times sorteados com sucesso!');
    } catch (error) {
      console.error('Error drawing teams:', error);
      alert('Erro ao sortear times');
    }
  }, [fut, futState]);

  // Função para escolher times
  const handleTeamSelect = useCallback(async () => {
    const teamCountNum = parseInt(futState.teamCount);
    const playersPerTeamNum = parseInt(futState.playersPerTeam);
    
    if (!futState.teamCount || !futState.playersPerTeam || isNaN(teamCountNum) || isNaN(playersPerTeamNum)) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    if (teamCountNum < 2) {
      alert('Deve ter pelo menos 2 times');
      return;
    }
    
    if (playersPerTeamNum < 1) {
      alert('Deve ter pelo menos 1 jogador por time');
      return;
    }

    const newTeams: Record<string, string[]> = {};
    for (let i = 1; i <= teamCountNum; i++) {
      newTeams[`Time ${i}`] = [];
    }
    
    futState.setTeams(newTeams);
    futState.setShowTeamSelectModal(false);
    futState.setSelectedTeam('Time 1');
    
    // Save teams to Firebase
    try {
      await set(ref(database, `futs/${fut?.id}/teams`), newTeams);
    } catch (error) {
      console.error('Error saving teams:', error);
    }
    
    // Initialize team stats
    const initialTeamStats: Record<string, { wins: number }> = {};
    Object.keys(newTeams).forEach(teamName => {
      initialTeamStats[teamName] = { wins: 0 };
    });
    
    futState.setTeamStats(initialTeamStats);
    
    // Save initial team stats to Firebase
    try {
      await set(ref(database, `futs/${fut?.id}/teamStats`), initialTeamStats);
    } catch (error) {
      console.error('Error saving initial team stats:', error);
    }
    
    alert('Times criados! Agora você pode escolher os jogadores para cada time.');
  }, [fut, futState]);

  // Função para adicionar jogador ao time
  const handleAddPlayerToTeam = useCallback(async (playerId: string, teamName: string) => {
    if (!fut || !isAdmin) return;

    futState.setTeams((prev: any) => {
      const newTeams = { ...prev };
      
      // Remove player from all teams first
      Object.keys(newTeams).forEach(team => {
        newTeams[team] = newTeams[team].filter((id: any) => id !== playerId);
      });
      
      // Add player to selected team
      newTeams[teamName] = [...newTeams[teamName], playerId];
      
      // Ensure all teams exist even if empty (to prevent Firebase from removing them)
      Object.keys(newTeams).forEach(team => {
        if (!newTeams[team]) {
          newTeams[team] = [];
        }
      });
      
      // Save to Firebase
      try {
        set(ref(database, `futs/${fut.id}/teams`), newTeams);
      } catch (error) {
        console.error('Error saving teams:', error);
      }
      
      return newTeams;
    });
  }, [fut, isAdmin, futState]);

  // Função para remover jogador do time
  const handleRemovePlayerFromTeam = useCallback(async (playerId: string, teamName: string) => {
    if (!fut || !isAdmin) return;

    futState.setTeams((prev: any) => {
      const newTeams = {
        ...prev,
        [teamName]: prev[teamName].filter((id: any) => id !== playerId)
      };
      
      // Ensure all teams exist even if empty (to prevent Firebase from removing them)
      Object.keys(newTeams).forEach(team => {
        if (!newTeams[team]) {
          newTeams[team] = [];
        }
      });
      
      // Save to Firebase
      try {
        set(ref(database, `futs/${fut.id}/teams`), newTeams);
      } catch (error) {
        console.error('Error saving teams:', error);
      }
      
      return newTeams;
    });
  }, [fut, isAdmin, futState]);

  // Função para salvar times
  const handleSaveTeams = useCallback(async () => {
    if (!fut || !isAdmin) return;

    try {
      await set(ref(database, `futs/${fut.id}/teams`), futState.teams);
      alert('Times salvos com sucesso!');
    } catch (error) {
      console.error('Error saving teams:', error);
      alert('Erro ao salvar times');
    }
  }, [fut, isAdmin, futState]);

  // Função para selecionar tipo de convidado
  const handleGuestTypeSelect = useCallback((type: 'avulso' | 'cadastrado') => {
    futState.setGuestType(type);
    futState.setShowGuestTypeModal(true);
    futState.setShowGuestModal(false);
  }, [futState]);

  // Função para adicionar convidado avulso (exatamente como no backup)
  const handleAddGuest = useCallback(async () => {
    if (!fut || !isAdmin || futState.guestType !== 'avulso') return;

    try {
      if (!futState.guestName.trim()) {
        alert('Por favor, digite o nome do convidado');
        return;
      }
      
      // Add guest to confirmed list
      const guestId = `guest_${Date.now()}`;
      const guestData = {
        name: futState.guestName,
        isGuest: true,
        guestType: 'avulso'
      };
      
      // Save to Firebase first
      await set(ref(database, `futs/${fut.id}/members/${guestId}`), guestData);
      
      const newConfirmedMembers = [...futState.confirmedMembers, guestId];
      await set(ref(database, `futs/${fut.id}/confirmedMembers`), newConfirmedMembers);
      
      // Update state after Firebase save
      const newMembers = {
        ...futState.members,
        [guestId]: guestData
      };
      
      // Store guest data in members object
      futState.setMembers(newMembers);
      
      // Add to confirmed members
      futState.setConfirmedMembers(newConfirmedMembers);
      
      alert('Convidado avulso adicionado com sucesso!');
      
      // Reset form (exatamente como no backup)
      futState.setGuestName('');
      futState.setGuestType(null);
      futState.setShowGuestTypeModal(false);
    } catch (error: any) {
      console.error('Error adding guest:', error);
      alert(`Erro ao adicionar convidado: ${error?.message || 'Erro desconhecido'}`);
    }
  }, [fut, isAdmin, futState]);

  // Função para adicionar usuário pesquisado como membro permanente
  const handleAddSearchedUser = useCallback(async (userData: any) => {
    if (!fut || !isAdmin) return;

    try {
      console.log('Adding searched user as member:', userData);
      
      // Validate userData
      if (!userData.uid) {
        throw new Error('UID do usuário não encontrado');
      }
      
      if (!userData.name) {
        throw new Error('Nome do usuário não encontrado');
      }

      // Verificar se já é membro
      if (futState.members[userData.uid]) {
        alert('Este usuário já é membro do fut');
        return;
      }
      
      // Update state first
      const newConfirmedMembers = [...futState.confirmedMembers, userData.uid];
      const newMembers = {
        ...futState.members,
        [userData.uid]: { 
          ...userData, 
          isGuest: false, 
          guestType: null 
        }
      };
      
      // Add to confirmed members
      futState.setConfirmedMembers(newConfirmedMembers);
      
      // Store user data in members object (as regular member, not guest)
      futState.setMembers(newMembers);
      
      // Save to Firebase
      await set(ref(database, `futs/${fut.id}/members/${userData.uid}`), {
        ...userData, 
        isGuest: false, 
        guestType: null 
      });
      await set(ref(database, `futs/${fut.id}/confirmedMembers`), newConfirmedMembers);
      
      // Reset search
      futState.setSearchQuery('');
      futState.setSearchResults([]);
      futState.setShowGuestTypeModal(false);
      
      alert('Usuário adicionado como membro do fut!');
    } catch (error: any) {
      console.error('Error adding searched user:', error);
      alert(`Erro ao adicionar usuário: ${error?.message || 'Erro desconhecido'}`);
    }
  }, [fut, isAdmin, futState]);

  // Função para adicionar convidado cadastrado (apenas para o fut daquele dia)
  const handleAddRegisteredGuest = useCallback(async (userData: any) => {
    if (!fut || !isAdmin) return;

    try {
      console.log('Adding registered guest for this fut only:', userData);
      
      // Validate userData
      if (!userData.uid) {
        throw new Error('UID do usuário não encontrado');
      }
      
      if (!userData.name) {
        throw new Error('Nome do usuário não encontrado');
      }

      // Verificar se já está na lista de confirmados
      if (futState.confirmedMembers.includes(userData.uid)) {
        alert('Este usuário já está na lista de confirmados');
        return;
      }
      
      // Add to confirmed members for this fut only
      const newConfirmedMembers = [...futState.confirmedMembers, userData.uid];
      
      // Store user data in members object as guest (only for this fut)
      const newMembers = {
        ...futState.members,
        [userData.uid]: { 
          ...userData, 
          isGuest: true, 
          guestType: 'cadastrado' 
        }
      };
      
      // Update state
      futState.setConfirmedMembers(newConfirmedMembers);
      futState.setMembers(newMembers);
      
      // Save to Firebase (only for this fut, not as permanent member)
      // Save guest in a separate section, not as a member
      await set(ref(database, `futs/${fut.id}/guests/${userData.uid}`), {
        ...userData, 
        isGuest: true, 
        guestType: 'cadastrado' 
      });
      await set(ref(database, `futs/${fut.id}/confirmedMembers`), newConfirmedMembers);
      
      // Reset search
      futState.setSearchQuery('');
      futState.setSearchResults([]);
      futState.setShowGuestTypeModal(false);
      
      alert('Convidado cadastrado adicionado com sucesso! Ele participará apenas deste fut.');
    } catch (error: any) {
      console.error('Error adding registered guest:', error);
      alert(`Erro ao adicionar convidado: ${error?.message || 'Erro desconhecido'}`);
    }
  }, [fut, isAdmin, futState]);

  // Função para pesquisar usuários
  const handleSearchUsers = useCallback(async () => {
    if (!futState.searchQuery.trim()) {
      futState.setSearchResults([]);
      return;
    }

    try {
      console.log('Searching for users with query:', futState.searchQuery);
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      console.log('All users:', users);
      console.log('Current members:', futState.members);
      
      const results = Object.entries(users)
        .filter(([uid, userData]: [string, any]) => {
          const isInSearch = userData.email?.toLowerCase().includes(futState.searchQuery.toLowerCase()) ||
                            userData.phone?.includes(futState.searchQuery) ||
                            userData.name?.toLowerCase().includes(futState.searchQuery.toLowerCase());
          
          const memberData = futState.members[uid];
          const isNotMember = !memberData || memberData.isGuest; // Allow if not a member or if it's a guest
          
          return isInSearch && isNotMember;
        })
        .map(([uid, userData]: [string, any]) => ({ 
          uid, 
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          photoURL: userData.photoURL || '',
          position: userData.position || ''
        }))
        .slice(0, 10);
      
      console.log('Search results:', results);
      futState.setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      futState.setSearchResults([]);
    }
  }, [futState]);

  // Função para baixar imagem dos cards de bola cheia e bola murcha
  const handleDownloadBolaCards = useCallback(async () => {
    if (!futState.ranking || futState.ranking.length === 0) return;
    
    const bolaCheia = futState.ranking[0];
    const bolaMurcha = futState.ranking.length > 1 ? futState.ranking[futState.ranking.length - 1] : null;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size (mobile-first: 400x300, desktop: 600x300)
    const isMobile = window.innerWidth < 768;
    canvas.width = isMobile ? 400 : 600;
    canvas.height = isMobile ? 300 : 300;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load images
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };
    
    try {
      const bolaCheiaImg = await loadImage('/bola-cheia.png');
      const bolaMurchaImg = await loadImage('/bola-murcha.png');
      
      if (isMobile) {
        // Mobile layout: horizontal cards lado a lado
        const cardWidth = (canvas.width - 60) / 2;
        const cardHeight = canvas.height - 40;
        
        // Bola Cheia Card
        const bolaCheiaGradient = ctx.createLinearGradient(20, 20, 20, 20 + cardHeight);
        bolaCheiaGradient.addColorStop(0, '#16a34a');
        bolaCheiaGradient.addColorStop(1, '#15803d');
        ctx.fillStyle = bolaCheiaGradient;
        ctx.fillRect(20, 20, cardWidth, cardHeight);
        
        // Bola Cheia image - menor e centralizada
        ctx.drawImage(bolaCheiaImg, 20 + cardWidth / 2 - 40, 30, 80, 80);
        
        // Card com blur para avatar e nome - centralizado
        const blurCardX = 20 + cardWidth / 2 - 50;
        const blurCardY = 120;
        
        // Fundo do card blur
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(blurCardX, blurCardY, 100, 25);
        
        // Player avatar
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(blurCardX + 15, blurCardY + 12, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Player initial
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((bolaCheia.name?.charAt(0) || 'C').toUpperCase(), blurCardX + 15, blurCardY + 16);
        
        // Player name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(bolaCheia.name || 'Jogador', blurCardX + 30, blurCardY + 16);
        
        // Player score com #
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`#${bolaCheia.score}`, 20 + cardWidth / 2, blurCardY + 50);
        
        // Bola Murcha Card
        const bolaMurchaGradient = ctx.createLinearGradient(20 + cardWidth + 20, 20, 20 + cardWidth + 20, 20 + cardHeight);
        bolaMurchaGradient.addColorStop(0, '#dc2626');
        bolaMurchaGradient.addColorStop(1, '#b91c1c');
        ctx.fillStyle = bolaMurchaGradient;
        ctx.fillRect(20 + cardWidth + 20, 20, cardWidth, cardHeight);
        
        // Bola Murcha image - menor e centralizada
        ctx.drawImage(bolaMurchaImg, 20 + cardWidth + 20 + cardWidth / 2 - 40, 30, 80, 80);
        
        if (bolaMurcha) {
          // Card com blur para avatar e nome - centralizado
          const blurCardX2 = 20 + cardWidth + 20 + cardWidth / 2 - 50;
          const blurCardY2 = 120;
          
          // Fundo do card blur
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(blurCardX2, blurCardY2, 100, 25);
          
          // Player avatar
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(blurCardX2 + 15, blurCardY2 + 12, 8, 0, 2 * Math.PI);
          ctx.fill();
          
          // Player initial
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText((bolaMurcha.name?.charAt(0) || 'C').toUpperCase(), blurCardX2 + 15, blurCardY2 + 16);
          
          // Player name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(bolaMurcha.name || 'Jogador', blurCardX2 + 30, blurCardY2 + 16);
          
          // Player score com #
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`#${bolaMurcha.score}`, 20 + cardWidth + 20 + cardWidth / 2, blurCardY2 + 50);
        } else {
          // No second player message
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(20 + cardWidth + 20 + cardWidth / 2 - 50, 120, 100, 25);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Aguardando mais jogadores', 20 + cardWidth + 20 + cardWidth / 2, 135);
        }
        
      } else {
        // Desktop layout: horizontal cards lado a lado
        const cardWidth = (canvas.width - 60) / 2;
        const cardHeight = canvas.height - 40;
        
        // Bola Cheia Card
        const bolaCheiaGradient = ctx.createLinearGradient(20, 20, 20, 20 + cardHeight);
        bolaCheiaGradient.addColorStop(0, '#16a34a');
        bolaCheiaGradient.addColorStop(1, '#15803d');
        ctx.fillStyle = bolaCheiaGradient;
        ctx.fillRect(20, 20, cardWidth, cardHeight);
        
        // Bola Cheia image - menor e centralizada
        ctx.drawImage(bolaCheiaImg, 20 + cardWidth / 2 - 40, 40, 80, 80);
        
        // Card com blur para avatar e nome - centralizado
        const blurCardX = 20 + cardWidth / 2 - 50;
        const blurCardY = 130;
        
        // Fundo do card blur
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(blurCardX, blurCardY, 100, 25);
        
        // Player avatar
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(blurCardX + 15, blurCardY + 12, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Player initial
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((bolaCheia.name?.charAt(0) || 'C').toUpperCase(), blurCardX + 15, blurCardY + 16);
        
        // Player name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(bolaCheia.name || 'Jogador', blurCardX + 30, blurCardY + 16);
        
        // Player score com #
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`#${bolaCheia.score}`, 20 + cardWidth / 2, blurCardY + 50);
        
        // Bola Murcha Card
        const bolaMurchaGradient = ctx.createLinearGradient(20 + cardWidth + 20, 20, 20 + cardWidth + 20, 20 + cardHeight);
        bolaMurchaGradient.addColorStop(0, '#dc2626');
        bolaMurchaGradient.addColorStop(1, '#b91c1c');
        ctx.fillStyle = bolaMurchaGradient;
        ctx.fillRect(20 + cardWidth + 20, 20, cardWidth, cardHeight);
        
        // Bola Murcha image - menor e centralizada
        ctx.drawImage(bolaMurchaImg, 20 + cardWidth + 20 + cardWidth / 2 - 40, 40, 80, 80);
        
        if (bolaMurcha) {
          // Card com blur para avatar e nome - centralizado
          const blurCardX2 = 20 + cardWidth + 20 + cardWidth / 2 - 50;
          const blurCardY2 = 130;
          
          // Fundo do card blur
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(blurCardX2, blurCardY2, 100, 25);
          
          // Player avatar
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(blurCardX2 + 15, blurCardY2 + 12, 8, 0, 2 * Math.PI);
          ctx.fill();
          
          // Player initial
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText((bolaMurcha.name?.charAt(0) || 'C').toUpperCase(), blurCardX2 + 15, blurCardY2 + 16);
          
          // Player name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(bolaMurcha.name || 'Jogador', blurCardX2 + 30, blurCardY2 + 16);
          
          // Player score com #
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`#${bolaMurcha.score}`, 20 + cardWidth + 20 + cardWidth / 2, blurCardY2 + 50);
        } else {
          // No second player message
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(20 + cardWidth + 20 + cardWidth / 2 - 50, 130, 100, 25);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Aguardando mais jogadores', 20 + cardWidth + 20 + cardWidth / 2, 145);
        }
      }
      
      // Footer
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Gerado pelo +Fut', canvas.width / 2, canvas.height - 10);
      
      // Download image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fut?.name || 'Fut'}_Bola_Cheia_Murcha.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Erro ao carregar imagens para download');
    }
  }, [futState.ranking, fut]);

  // Função para gerar imagem do ranking (exatamente como no backup)
  const handleGenerateImage = useCallback(async () => {
    if (!futState.ranking || futState.ranking.length === 0) return;
    
    const rankingTitle = futState.rankingType === 'pontuacao' ? 'Ranking de Pontuação' :
                        futState.rankingType === 'artilharia' ? 'Ranking de Artilharia' :
                        futState.rankingType === 'assistencias' ? 'Ranking de Assistências' :
                        'Ranking de Vitórias';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header background
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, 120);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(fut?.name || 'Fut', canvas.width / 2, 40);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillText(rankingTitle, canvas.width / 2, 70);
    
    // Date
    ctx.font = '14px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(new Date().toLocaleDateString('pt-BR'), canvas.width / 2, 95);
    
    // Rankings
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    
    futState.ranking.slice(0, 5).forEach((item: any, index: number) => {
      const y = 160 + (index * 80);
      const position = index + 1;
      const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';
      
      // Background for each ranking item
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(20, y - 30, canvas.width - 40, 60);
      
      // Border
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, y - 30, canvas.width - 40, 60);
      
      // Position and medal
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`${position}`, 40, y);
      
      // Medal
      if (medal) {
        ctx.font = '32px Arial';
        ctx.fillText(medal, 80, y);
      }
      
      // Player photo or initial
      if (futState.rankingType !== 'vitorias') {
        const player = futState.members[item.playerId];
        if (player?.photoURL) {
          // Draw photo circle
          ctx.fillStyle = '#444444';
          ctx.beginPath();
          ctx.arc(140, y - 10, 20, 0, 2 * Math.PI);
          ctx.fill();
          
          // Load and draw image
          const img = new Image();
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(140, y - 10, 20, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, 120, y - 30, 40, 40);
            ctx.restore();
          };
          img.src = player.photoURL;
        } else {
          // Draw initial circle
          ctx.fillStyle = '#666666';
          ctx.beginPath();
          ctx.arc(140, y - 10, 20, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw initial
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText((player?.name?.charAt(0) || 'C').toUpperCase(), 140, y - 5);
          ctx.textAlign = 'left';
        }
        
        // Player name
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText(item.name || 'Jogador', 180, y);
      } else {
        // Team name for victories ranking
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText(item.teamName || 'Time', 180, y);
      }
      
      // Value
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'right';
      if (futState.rankingType === 'vitorias') {
        ctx.fillText(`${item.wins} vitórias`, canvas.width - 40, y);
      } else {
        const value = futState.rankingType === 'pontuacao' ? item.score :
                     futState.rankingType === 'artilharia' ? item.goals :
                     item.assists;
        const unit = futState.rankingType === 'pontuacao' ? 'pts' :
                    futState.rankingType === 'artilharia' ? 'gols' :
                    'assistências';
        ctx.fillText(`${value} ${unit}`, canvas.width - 40, y);
      }
      ctx.textAlign = 'left';
    });
    
    // Footer
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Gerado pelo +Fut', canvas.width / 2, canvas.height - 20);
    
    // Download image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fut?.name || 'Fut'}_${rankingTitle.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }, [fut, futState]);

  // Função para remover membro da lista de confirmados (não remove da lista de membros)
  const handleRemoveFromConfirmed = useCallback(async (memberId: string) => {
    if (!fut || !isAdmin) return;

    // Get member name for confirmation
    const memberData = futState.members[memberId];
    const memberName = memberData?.name || 'este membro';

    // Confirm removal
    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${memberName} da lista de confirmados?\n\nIsso gerará uma vaga no fut.`
    );

    if (!confirmed) return;

    try {
      // Remove from confirmed members
      const newConfirmedMembers = futState.confirmedMembers.filter((id: string) => id !== memberId);
      
      // Update local state first
      futState.setConfirmedMembers(newConfirmedMembers);
      
      // Save to Firebase
      await set(ref(database, `futs/${fut.id}/confirmedMembers`), newConfirmedMembers);
      
      alert(`${memberName} foi removido da lista de confirmados!`);
    } catch (error) {
      console.error('Error removing from confirmed:', error);
      alert('Erro ao remover da lista de confirmados');
    }
  }, [fut, isAdmin, futState]);

  // Função para tornar membro admin
  const handleMakeAdmin = useCallback(async () => {
    if (!futState.selectedMemberForAdmin || !fut) return;
    
    try {
      const futRef = ref(database, `futs/${fut.id}`);
      const updatedAdmins = {
        ...fut.admins,
        [futState.selectedMemberForAdmin.uid]: true
      };
      
      await set(futRef, {
        ...fut,
        admins: updatedAdmins
      });
      
      futState.setFut((prev: any) => prev ? { ...prev, admins: updatedAdmins } : null);
      futState.setShowMakeAdminModal(false);
      futState.setSelectedMemberForAdmin(null);
      alert(`${futState.selectedMemberForAdmin.name} agora é administrador!`);
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Erro ao tornar administrador');
    }
  }, [fut, futState]);

  // Função para remover privilégios de admin
  const handleRemoveAdmin = useCallback(async () => {
    if (!futState.selectedMemberForAdmin || !fut) return;
    
    // Check if trying to remove original admin
    if (futState.selectedMemberForAdmin.uid === fut.adminId) {
      alert('Não é possível remover os privilégios do administrador original!');
      futState.setShowMakeAdminModal(false);
      futState.setSelectedMemberForAdmin(null);
      return;
    }
    
    try {
      const futRef = ref(database, `futs/${fut.id}`);
      const updatedAdmins = { ...fut.admins };
      delete updatedAdmins[futState.selectedMemberForAdmin.uid];
      
      await set(futRef, {
        ...fut,
        admins: updatedAdmins
      });
      
      futState.setFut((prev: any) => prev ? { ...prev, admins: updatedAdmins } : null);
      futState.setShowMakeAdminModal(false);
      futState.setSelectedMemberForAdmin(null);
      alert(`${futState.selectedMemberForAdmin.name} não é mais administrador!`);
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Erro ao remover administrador');
    }
  }, [fut, futState]);

  // Função para adicionar membro
  const handleAddMember = useCallback(async (userToAdd: any) => {
    if (!fut || !isAdmin) return;

    try {
      // Add to members
      const newMembers = {
        ...futState.members,
        [userToAdd.uid]: {
          name: userToAdd.name,
          email: userToAdd.email,
          phone: userToAdd.phone,
          photoURL: userToAdd.photoURL,
          position: userToAdd.position,
          isGuest: false,
          guestType: null
        }
      };

      // Update Firebase
      await set(ref(database, `futs/${fut.id}/members`), newMembers);
      
      // Update local state
      futState.setMembers(newMembers);
      
      // Close modal and reset search
      futState.setShowAddMemberModal(false);
      futState.setMemberSearchQuery('');
      futState.setMemberSearchResults([]);
      
      alert(`${userToAdd.name} foi adicionado como membro do fut!`);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Erro ao adicionar membro');
    }
  }, [fut, isAdmin, futState]);

  return {
    getRecurrenceText,
    handleReleaseList,
    handleConfirmPresence,
    handleStartFut,
    handleShareList,
    handleGuestTypeSelect,
    handleSearchUsers,
    handleAddGuest,
    handleAddSearchedUser,
    handleAddRegisteredGuest,
    handleSearchMembers,
    handleEndFut,
    handleStartVoting,
    handleEndVoting,
    handleVote,
    handleGenerateRanking,
    handleFinalizeFut,
    handleDeleteFut,
    handleDeleteData,
    handleDeleteTeams,
    handleShareTeams,
    handleUpdateTeamWins,
    handleUpdatePlayerStats,
    handleGenerateImage,
    handleDownloadBolaCards,
    handleDeleteAnnouncement,
    handleRemoveMember,
    handleTeamDraw,
    handleTeamSelect,
    handleAddPlayerToTeam,
    handleRemovePlayerFromTeam,
    handleSaveTeams,
    handleRemoveFromConfirmed,

    // Funções de gerenciamento de membros e admins
    handleMakeAdmin,
    handleRemoveAdmin,
    handleAddMember,
  };
}