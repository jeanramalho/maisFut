import { useCallback } from 'react';
import { ref, get, set, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Fut, UserData } from './types';

export const useFutHandlers = (
  id: string | string[] | undefined,
  fut: Fut | null,
  user: any,
  members: Record<string, UserData>,
  setMembers: (members: Record<string, UserData> | ((prev: Record<string, UserData>) => Record<string, UserData>)) => void,
  state: any
) => {
  const getRecurrenceText = useCallback(() => {
    if (!fut) return '';
    if (fut.type === 'avulso') return 'Partida única';
    
    if (fut.recurrence) {
      if (fut.recurrence.kind === 'weekly') {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return `Toda ${days[fut.recurrence.day]}`;
      } else {
        return `Todo dia ${fut.recurrence.day} do mês`;
      }
    }
    
    return 'Recorrência não definida';
  }, [fut]);

  const handleReleaseList = useCallback(async () => {
    if (!fut) return;
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        listReleased: true,
        releasedVagas: state.releasedVagas || fut.maxVagas,
        releasedAt: new Date().toISOString()
      });
      
      state.setListReleased(true);
      state.setConfirmedMembers([user?.uid || '']);
      
      if (state.releasedVagas === 0) {
        state.setReleasedVagas(fut?.maxVagas || 0);
      }
      
      alert('Lista liberada! Os jogadores podem confirmar presença.');
    } catch (error) {
      console.error('Error releasing list:', error);
      alert('Erro ao liberar lista');
    }
  }, [id, fut, user?.uid, state]);

  const handleConfirmPresence = useCallback(async (isIn: boolean) => {
    if (!user?.uid) return;
    
    try {
      let newConfirmedMembers = [...state.confirmedMembers];
      
      if (isIn) {
        if (!state.confirmedMembers.includes(user.uid)) {
          newConfirmedMembers = [...state.confirmedMembers, user.uid];
        }
      } else {
        newConfirmedMembers = state.confirmedMembers.filter((id: string) => id !== user.uid);
      }
      
      await set(ref(database, `futs/${id}/confirmedMembers`), newConfirmedMembers);
      state.setConfirmedMembers(newConfirmedMembers);
    } catch (error) {
      console.error('Error confirming presence:', error);
      alert('Erro ao confirmar presença');
    }
  }, [id, user?.uid, state]);

  const handleStartFut = useCallback(async () => {
    if (!fut) return;
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        futStarted: true,
        startedAt: new Date().toISOString()
      });
      
      state.setFutStarted(true);
      alert('Fut iniciado! Agora você pode gerenciar times e dados.');
    } catch (error) {
      console.error('Error starting fut:', error);
      alert('Erro ao iniciar fut');
    }
  }, [id, fut, state]);

  const handleShareList = useCallback(() => {
    if (!fut) return;
    const confirmedNames = state.confirmedMembers.map((memberId: string, index: number) => {
      const member = members[memberId];
      return `${index + 1} - ${member?.name || 'VAGA'}`;
    }).join('\n');

    const message = `Lista de confirmados - ${fut.name} - ${fut.time || '19:00'} - ${getRecurrenceText()} - 23/09/2025\n\n${confirmedNames}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [fut, state.confirmedMembers, members, getRecurrenceText]);

  const handleSearchUsers = useCallback(async () => {
    if (!state.searchQuery.trim()) {
      state.setSearchResults([]);
      return;
    }

    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      const results = Object.entries(users)
        .filter(([uid, userData]: [string, any]) => 
          (userData.email?.toLowerCase() === state.searchQuery.toLowerCase() ||
          userData.phone === state.searchQuery) &&
          !state.confirmedMembers.includes(uid)
        )
        .map(([uid, userData]: [string, any]) => ({ 
          uid, 
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          photoURL: userData.photoURL || '',
          position: userData.position || ''
        }))
        .slice(0, 10);
      
      state.setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      state.setSearchResults([]);
    }
  }, [state]);

  const handleAddGuest = useCallback(async () => {
    if (!state.guestType) return;

    try {
      if (state.guestType === 'avulso') {
        if (!state.guestName.trim()) {
          alert('Por favor, digite o nome do convidado');
          return;
        }
        
        const guestId = `guest_${Date.now()}`;
        state.setConfirmedMembers([...state.confirmedMembers, guestId]);
        
        const guestData = {
          name: state.guestName,
          isGuest: true,
          guestType: 'avulso'
        };
        
        setMembers(prev => ({
          ...prev,
          [guestId]: guestData
        }));
        
        alert('Convidado avulso adicionado com sucesso!');
      } else {
        if (!state.guestEmail.trim() && !state.guestPhone.trim()) {
          alert('Por favor, digite o email ou telefone do convidado');
          return;
        }
        
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        const users = snapshot.val() || {};
        
        const existingUser = Object.entries(users).find(([uid, userData]: [string, any]) => 
          userData.email === state.guestEmail || userData.phone === state.guestPhone
        );
        
        if (existingUser) {
          const [uid, userData] = existingUser;
          const userDataTyped = userData as any;
          state.setConfirmedMembers([...state.confirmedMembers, uid]);
          setMembers(prev => ({
            ...prev,
            [uid]: { 
              name: userDataTyped.name || '',
              email: userDataTyped.email || '',
              phone: userDataTyped.phone || '',
              photoURL: userDataTyped.photoURL || '',
              position: userDataTyped.position || '',
              isGuest: true, 
              guestType: 'cadastrado' 
            }
          }));
          alert('Convidado cadastrado adicionado com sucesso!');
        } else {
          alert('Usuário não encontrado com este email/telefone');
          return;
        }
      }
      
      state.resetGuestForm();
    } catch (error: any) {
      console.error('Error adding guest:', error);
      alert(`Erro ao adicionar convidado: ${error?.message || 'Erro desconhecido'}`);
    }
  }, [state, setMembers]);

  const handleAddSearchedUser = useCallback(async (userData: any) => {
    try {
      if (!userData.uid) {
        throw new Error('UID do usuário não encontrado');
      }
      
      if (!userData.name) {
        throw new Error('Nome do usuário não encontrado');
      }
      
      state.setConfirmedMembers([...state.confirmedMembers, userData.uid]);
      setMembers(prev => ({
        ...prev,
        [userData.uid]: { 
          ...userData, 
          isGuest: true, 
          guestType: 'cadastrado' 
        }
      }));
      
      state.resetSearchForm();
      state.setShowGuestTypeModal(false);
      
      alert('Convidado cadastrado adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding searched user:', error);
      alert(`Erro ao adicionar convidado: ${error?.message || 'Erro desconhecido'}`);
    }
  }, [state, setMembers]);

  const handleSearchMembers = useCallback(async () => {
    if (!state.memberSearchQuery.trim()) {
      state.setMemberSearchResults([]);
      return;
    }

    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      const results = Object.entries(users)
        .filter(([uid, userData]: [string, any]) => 
          (userData.email?.toLowerCase() === state.memberSearchQuery.toLowerCase() ||
          userData.phone === state.memberSearchQuery) &&
          !members[uid]
        )
        .map(([uid, userData]: [string, any]) => ({ 
          uid, 
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          photoURL: userData.photoURL || '',
          position: userData.position || ''
        }))
        .slice(0, 10);
      
      state.setMemberSearchResults(results);
    } catch (error) {
      console.error('Error searching members:', error);
      state.setMemberSearchResults([]);
    }
  }, [state, members]);

  const handleAddMember = useCallback(async (userData: any) => {
    try {
      if (!userData.uid) {
        throw new Error('UID do usuário não encontrado');
      }
      
      if (!userData.name) {
        throw new Error('Nome do usuário não encontrado');
      }
      
      const futRef = ref(database, `futs/${id}/members/${userData.uid}`);
      await set(futRef, {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        photoURL: userData.photoURL || '',
        position: userData.position || '',
        joinedAt: new Date().toISOString()
      });
      
      setMembers(prev => ({
        ...prev,
        [userData.uid]: {
          ...userData,
          isGuest: false
        }
      }));
      
      state.resetMemberSearchForm();
      alert('Membro adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert(`Erro ao adicionar membro: ${error?.message || 'Erro desconhecido'}`);
    }
  }, [id, setMembers, state]);

  const handleTeamDraw = useCallback(async () => {
    const teamCountNum = parseInt(state.teamCount);
    const playersPerTeamNum = parseInt(state.playersPerTeam);
    
    if (!state.teamCount || !state.playersPerTeam || isNaN(teamCountNum) || isNaN(playersPerTeamNum)) {
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

    const shuffledMembers = [...state.confirmedMembers].sort(() => Math.random() - 0.5);
    const newTeams: Record<string, string[]> = {};
    
    for (let i = 1; i <= teamCountNum; i++) {
      newTeams[`Time ${i}`] = [];
    }
    
    let memberIndex = 0;
    for (let i = 1; i <= teamCountNum; i++) {
      const teamName = `Time ${i}`;
      for (let j = 0; j < playersPerTeamNum; j++) {
        if (memberIndex < shuffledMembers.length) {
          newTeams[teamName].push(shuffledMembers[memberIndex]);
          memberIndex++;
        } else {
          newTeams[teamName].push('VAGA');
        }
      }
    }
    
    state.setTeams(newTeams);
    state.setShowTeamDrawModal(false);
    
    try {
      await set(ref(database, `futs/${id}/teams`), newTeams);
    } catch (error) {
      console.error('Error saving teams:', error);
    }
    
    const initialTeamStats: Record<string, { wins: number }> = {};
    const initialPlayerStats: Record<string, { goals: number; assists: number }> = {};
    
    Object.keys(newTeams).forEach(teamName => {
      initialTeamStats[teamName] = { wins: 0 };
    });
    
    Object.values(newTeams).flat().forEach(playerId => {
      initialPlayerStats[playerId] = { goals: 0, assists: 0 };
    });
    
    state.setTeamStats(initialTeamStats);
    state.setPlayerStats(initialPlayerStats);
    
    try {
      await set(ref(database, `futs/${id}/teamStats`), initialTeamStats);
      await set(ref(database, `futs/${id}/playerStats`), initialPlayerStats);
    } catch (error) {
      console.error('Error saving initial stats:', error);
    }
  }, [id, state]);

  const handleSaveInfo = useCallback(async () => {
    if (!fut) return;
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        name: state.editName,
        description: state.editDescription,
        time: state.editTime,
        location: state.editLocation,
        maxVagas: parseInt(state.editMaxVagas) || fut?.maxVagas,
        playersPerTeam: parseInt(state.editPlayersPerTeam) || fut?.playersPerTeam
      });
      
      state.resetEditInfoForm();
      alert('Informações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error saving info:', error);
      alert('Erro ao salvar informações');
    }
  }, [id, fut, state]);

  // Data tab handlers
  const handleAddGoal = useCallback(async (playerId: string) => {
    try {
      const currentStats = state.playerStats[playerId] || { goals: 0, assists: 0 };
      const newStats = { ...currentStats, goals: currentStats.goals + 1 };
      
      state.setPlayerStats(prev => ({ ...prev, [playerId]: newStats }));
      
      await set(ref(database, `futs/${id}/playerStats/${playerId}`), newStats);
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Erro ao adicionar gol');
    }
  }, [id, state]);

  const handleAddAssist = useCallback(async (playerId: string) => {
    try {
      const currentStats = state.playerStats[playerId] || { goals: 0, assists: 0 };
      const newStats = { ...currentStats, assists: currentStats.assists + 1 };
      
      state.setPlayerStats(prev => ({ ...prev, [playerId]: newStats }));
      
      await set(ref(database, `futs/${id}/playerStats/${playerId}`), newStats);
    } catch (error) {
      console.error('Error adding assist:', error);
      alert('Erro ao adicionar assistência');
    }
  }, [id, state]);

  const handleRemoveGoal = useCallback(async (playerId: string) => {
    try {
      const currentStats = state.playerStats[playerId] || { goals: 0, assists: 0 };
      if (currentStats.goals > 0) {
        const newStats = { ...currentStats, goals: currentStats.goals - 1 };
        state.setPlayerStats(prev => ({ ...prev, [playerId]: newStats }));
        await set(ref(database, `futs/${id}/playerStats/${playerId}`), newStats);
      }
    } catch (error) {
      console.error('Error removing goal:', error);
      alert('Erro ao remover gol');
    }
  }, [id, state]);

  const handleRemoveAssist = useCallback(async (playerId: string) => {
    try {
      const currentStats = state.playerStats[playerId] || { goals: 0, assists: 0 };
      if (currentStats.assists > 0) {
        const newStats = { ...currentStats, assists: currentStats.assists - 1 };
        state.setPlayerStats(prev => ({ ...prev, [playerId]: newStats }));
        await set(ref(database, `futs/${id}/playerStats/${playerId}`), newStats);
      }
    } catch (error) {
      console.error('Error removing assist:', error);
      alert('Erro ao remover assistência');
    }
  }, [id, state]);

  const handleVotePlayer = useCallback(async (playerId: string, rating: number) => {
    try {
      const newUserVotes = { ...state.userVotes };
      if (!newUserVotes[user?.uid || '']) {
        newUserVotes[user?.uid || ''] = {};
      }
      newUserVotes[user?.uid || ''][playerId] = rating;
      
      state.setUserVotes(newUserVotes);
      
      await set(ref(database, `futs/${id}/userVotes/${user?.uid}`), newUserVotes[user?.uid || '']);
    } catch (error) {
      console.error('Error voting player:', error);
      alert('Erro ao votar no jogador');
    }
  }, [id, user?.uid, state]);

  const handleOpenVoting = useCallback(async () => {
    try {
      state.setVotingOpen(true);
      await set(ref(database, `futs/${id}/votingOpen`), true);
    } catch (error) {
      console.error('Error opening voting:', error);
      alert('Erro ao abrir votação');
    }
  }, [id, state]);

  const handleCloseVoting = useCallback(async () => {
    try {
      state.setVotingOpen(false);
      await set(ref(database, `futs/${id}/votingOpen`), false);
    } catch (error) {
      console.error('Error closing voting:', error);
      alert('Erro ao fechar votação');
    }
  }, [id, state]);

  const handleEndVoting = useCallback(async () => {
    try {
      state.setVotingEnded(true);
      state.setVotingOpen(false);
      
      // Calculate average votes for each player
      const playerVotes: Record<string, number> = {};
      const allUserVotes = state.userVotes;
      
      Object.values(allUserVotes).forEach(userVote => {
        Object.entries(userVote).forEach(([playerId, rating]) => {
          if (!playerVotes[playerId]) {
            playerVotes[playerId] = 0;
          }
          playerVotes[playerId] += rating;
        });
      });
      
      // Calculate averages
      Object.keys(playerVotes).forEach(playerId => {
        const totalVotes = Object.values(allUserVotes).filter(userVote => userVote[playerId]).length;
        if (totalVotes > 0) {
          playerVotes[playerId] = playerVotes[playerId] / totalVotes;
        }
      });
      
      state.setPlayerVotes(playerVotes);
      
      await set(ref(database, `futs/${id}/votingEnded`), true);
      await set(ref(database, `futs/${id}/playerVotes`), playerVotes);
    } catch (error) {
      console.error('Error ending voting:', error);
      alert('Erro ao finalizar votação');
    }
  }, [id, state]);

  const handleEndFut = useCallback(async () => {
    try {
      state.setFutEnded(true);
      await set(ref(database, `futs/${id}/futEnded`), true);
      alert('Fut finalizado com sucesso!');
    } catch (error) {
      console.error('Error ending fut:', error);
      alert('Erro ao finalizar fut');
    }
  }, [id, state]);

  // Ranking handlers
  const handleGenerateRanking = useCallback(async (type: string) => {
    try {
      state.setLoadingRanking(true);
      
      // This is a simplified version - in a real app you'd implement the full ranking logic
      const ranking = [
        { playerId: 'player1', points: 10, goals: 5, assists: 3, wins: 2 },
        { playerId: 'player2', points: 8, goals: 3, assists: 5, wins: 1 },
        { playerId: 'player3', points: 6, goals: 4, assists: 2, wins: 1 }
      ];
      
      state.setRanking(ranking);
      state.setLoadingRanking(false);
    } catch (error) {
      console.error('Error generating ranking:', error);
      state.setLoadingRanking(false);
      alert('Erro ao gerar ranking');
    }
  }, [state]);

  // Admin management handlers
  const handleMakeAdmin = useCallback(async () => {
    try {
      if (!fut || !state.selectedMemberForAdmin) return;
      
      const updatedAdmins = { ...fut.admins, [state.selectedMemberForAdmin.uid]: true };
      
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, { ...fut, admins: updatedAdmins });
      
      state.setShowMakeAdminModal(false);
      alert(`${state.selectedMemberForAdmin.name} foi promovido a administrador!`);
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Erro ao promover administrador');
    }
  }, [id, fut, state]);

  const handleRemoveAdmin = useCallback(async () => {
    try {
      if (!fut || !state.selectedMemberForAdmin) return;
      
      const updatedAdmins = { ...fut.admins };
      delete updatedAdmins[state.selectedMemberForAdmin.uid];
      
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, { ...fut, admins: updatedAdmins });
      
      state.setShowMakeAdminModal(false);
      alert(`Privilégios de administrador removidos de ${state.selectedMemberForAdmin.name}!`);
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Erro ao remover privilégios de administrador');
    }
  }, [id, fut, state]);

  // Times Tab Functions
  const handleDeleteTeams = useCallback(async () => {
    try {
      await set(ref(database, `futs/${id}/teams`), null);
      await set(ref(database, `futs/${id}/teamStats`), null);
      await set(ref(database, `futs/${id}/playerStats`), null);
      
      state.setTeams({});
      state.setTeamStats({});
      state.setPlayerStats({});
      state.setSelectedTeam(null);
    } catch (error) {
      console.error('Error deleting teams:', error);
      alert('Erro ao deletar times');
    }
  }, [id, state]);

  const handleShareTeams = useCallback(() => {
    if (!fut) return;
    let message = `${fut.name} - ${getRecurrenceText()} às ${fut.time || '19:00'} - 23/09/2025\n\nTIMES:\n\n`;
    
    Object.entries(state.teams).forEach(([teamName, players]: [string, string[]]) => {
      message += `${teamName}\n`;
      players.forEach((playerId, index) => {
        const player = members[playerId];
        message += `${index + 1}- ${player?.name || 'VAGA'}\n`;
      });
      
      // Add VAGA if team is not full
      while (players.length < parseInt(state.playersPerTeam)) {
        message += `${players.length + 1}- VAGA\n`;
        players.push('VAGA');
      }
      
      message += '\n';
    });
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [fut, getRecurrenceText, state.teams, state.playersPerTeam, members]);

  const handleUpdateTeamWins = useCallback(async (teamName: string, delta: number) => {
    const newStats = {
      ...state.teamStats,
      [teamName]: {
        wins: Math.max(0, (state.teamStats[teamName]?.wins || 0) + delta)
      }
    };
    
    state.setTeamStats(newStats);
    
    // Save to Firebase
    try {
      const futRef = ref(database, `futs/${id}/teamStats/${teamName}`);
      await set(futRef, newStats[teamName]);
    } catch (error) {
      console.error('Error saving team stats:', error);
    }
  }, [id, state]);

  const handleUpdatePlayerStats = useCallback(async (playerId: string, stat: 'goals' | 'assists', delta: number) => {
    const newStats = {
      ...state.playerStats,
      [playerId]: {
        ...state.playerStats[playerId],
        [stat]: Math.max(0, (state.playerStats[playerId]?.[stat] || 0) + delta)
      }
    };
    
    state.setPlayerStats(newStats);
    
    // Save to Firebase
    try {
      const futRef = ref(database, `futs/${id}/playerStats/${playerId}`);
      await set(futRef, newStats[playerId]);
    } catch (error) {
      console.error('Error saving player stats:', error);
    }
  }, [id, state]);

  return {
    getRecurrenceText,
    handleReleaseList,
    handleConfirmPresence,
    handleStartFut,
    handleShareList,
    handleSearchUsers,
    handleAddGuest,
    handleAddSearchedUser,
    handleSearchMembers,
    handleAddMember,
    handleTeamDraw,
    handleDeleteTeams,
    handleShareTeams,
    handleUpdateTeamWins,
    handleUpdatePlayerStats,
    handleSaveInfo,
    handleAddGoal,
    handleAddAssist,
    handleRemoveGoal,
    handleRemoveAssist,
    handleVotePlayer,
    handleOpenVoting,
    handleCloseVoting,
    handleEndVoting,
    handleEndFut,
    handleGenerateRanking,
    handleMakeAdmin,
    handleRemoveAdmin,
  };
};
