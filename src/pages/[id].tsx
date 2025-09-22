import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue, get, set } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ArrowLeft, Settings, Users, Calendar, MapPin, Crown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Fut {
  id: string;
  name: string;
  photoURL?: string;
  adminId: string;
  type: 'mensal' | 'avulso';
  recurrence?: {
    kind: 'weekly' | 'monthly';
    day: number;
  };
  maxVagas: number;
  privacy: 'public' | 'invite';
  members: Record<string, boolean>;
  location?: string;
  description?: string;
  time?: string;
  createdAt: number;
}

interface UserData {
  name: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  position?: string;
  isGuest?: boolean;
  guestType?: string;
}

export default function FutDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [fut, setFut] = useState<Fut | null>(null);
  const [members, setMembers] = useState<Record<string, UserData>>({});
  const [activeTab, setActiveTab] = useState<'fut' | 'members' | 'occurrences' | 'settings' | 'times' | 'data' | 'ranking'>('fut');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [listReleased, setListReleased] = useState(false);
  const [releasedVagas, setReleasedVagas] = useState(fut?.maxVagas || 0);
  const [confirmedMembers, setConfirmedMembers] = useState<string[]>([]);
  const [futStarted, setFutStarted] = useState(false);
  const [showGuestTypeModal, setShowGuestTypeModal] = useState(false);
  const [guestType, setGuestType] = useState<'avulso' | 'cadastrado' | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showTeamDrawModal, setShowTeamDrawModal] = useState(false);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [teamCount, setTeamCount] = useState('');
  const [playersPerTeam, setPlayersPerTeam] = useState('');
  const [teams, setTeams] = useState<Record<string, string[]>>({});
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [futEnded, setFutEnded] = useState(false);
  const [teamStats, setTeamStats] = useState<Record<string, { wins: number }>>({});
  const [playerStats, setPlayerStats] = useState<Record<string, { goals: number; assists: number }>>({});
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingEnded, setVotingEnded] = useState(false);
  const [playerVotes, setPlayerVotes] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, number>>>({});
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<any>(null);
  const [rankingType, setRankingType] = useState<'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias'>('pontuacao');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const futRef = ref(database, `futs/${id}`);
    const unsubscribe = onValue(futRef, async (snapshot) => {
      const futData = snapshot.val();
      
      if (!futData) {
        router.push('/');
        return;
      }

      // Check if user has access to this fut
      if (!futData.members?.[user.uid] && futData.adminId !== user.uid) {
        router.push('/');
        return;
      }

      setFut({ id: id as string, ...futData });

      // Load fut state
      if (futData.listReleased !== undefined) {
        setListReleased(futData.listReleased);
      }
      if (futData.releasedVagas !== undefined) {
        setReleasedVagas(futData.releasedVagas);
      }
      if (futData.confirmedMembers) {
        setConfirmedMembers(futData.confirmedMembers);
      }
      if (futData.futStarted !== undefined) {
        setFutStarted(futData.futStarted);
      }
      if (futData.teams) {
        setTeams(futData.teams);
      }
      if (futData.teamStats) {
        setTeamStats(futData.teamStats);
      }
      if (futData.playerStats) {
        setPlayerStats(futData.playerStats);
      }
      if (futData.futEnded !== undefined) {
        setFutEnded(futData.futEnded);
      }
      if (futData.votingOpen !== undefined) {
        setVotingOpen(futData.votingOpen);
      }
      if (futData.votingEnded !== undefined) {
        setVotingEnded(futData.votingEnded);
      }
      if (futData.playerVotes) {
        setPlayerVotes(futData.playerVotes);
      }
      if (futData.userVotes) {
        setUserVotes(futData.userVotes);
      }
      if (futData.showRanking !== undefined) {
        setShowRanking(futData.showRanking);
      }
      if (futData.ranking) {
        setRanking(futData.ranking);
      }

      // Fetch member data
      if (futData.members) {
        const memberIds = Object.keys(futData.members);
        const memberPromises = memberIds.map(async (memberId) => {
          const memberRef = ref(database, `users/${memberId}`);
          const memberSnapshot = await get(memberRef);
          return { id: memberId, data: memberSnapshot.val() };
        });

        const memberResults = await Promise.all(memberPromises);
        const membersData: Record<string, UserData> = {};
        
        memberResults.forEach(({ id, data }) => {
          if (data) {
            membersData[id] = data;
          }
        });

        setMembers(membersData);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-secondary text-lg">Carregando...</div>
      </div>
    );
  }

  if (!fut) {
    return null;
  }

  const isAdmin = user?.uid === fut.adminId;
  const memberCount = Object.keys(fut.members || {}).length;

  const getRecurrenceText = () => {
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
  };

  const handleReleaseList = async () => {
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        listReleased: true,
        releasedVagas: releasedVagas || fut.maxVagas,
        releasedAt: new Date().toISOString()
      });
      
      setListReleased(true);
      setConfirmedMembers([user?.uid || '']); // Admin se confirma automaticamente
      
      // If no specific vagas set, use fut's maxVagas
      if (releasedVagas === 0) {
        setReleasedVagas(fut?.maxVagas || 0);
      }
      
      alert('Lista liberada! Os jogadores podem confirmar presença.');
    } catch (error) {
      console.error('Error releasing list:', error);
      alert('Erro ao liberar lista');
    }
  };

  const handleConfirmPresence = async (isIn: boolean) => {
    if (!user?.uid) return;
    
    try {
      const futRef = ref(database, `futs/${id}`);
      const snapshot = await get(futRef);
      const futData = snapshot.val();
      
      let newConfirmedMembers = [...confirmedMembers];
      
      if (isIn) {
        if (!confirmedMembers.includes(user.uid)) {
          newConfirmedMembers = [...confirmedMembers, user.uid];
        }
      } else {
        newConfirmedMembers = confirmedMembers.filter(id => id !== user.uid);
      }
      
      // Update Firebase
      await set(ref(database, `futs/${id}/confirmedMembers`), newConfirmedMembers);
      
      // Update local state
      setConfirmedMembers(newConfirmedMembers);
    } catch (error) {
      console.error('Error confirming presence:', error);
      alert('Erro ao confirmar presença');
    }
  };

  const handleStartFut = async () => {
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        futStarted: true,
        startedAt: new Date().toISOString()
      });
      
      setFutStarted(true);
      alert('Fut iniciado! Agora você pode gerenciar times e dados.');
    } catch (error) {
      console.error('Error starting fut:', error);
      alert('Erro ao iniciar fut');
    }
  };

  const handleShareList = () => {
    const confirmedNames = confirmedMembers.map((memberId, index) => {
      const member = members[memberId];
      return `${index + 1} - ${member?.name || 'Convidado'}`;
    }).join('\n');

    const message = `Lista de confirmados - ${fut.name} - ${fut.time || '19:00'} - ${getRecurrenceText()} - 23/09/2025\n\n${confirmedNames}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGuestTypeSelect = (type: 'avulso' | 'cadastrado') => {
    setGuestType(type);
    setShowGuestTypeModal(true);
    setShowGuestModal(false);
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      const results = Object.entries(users)
        .filter(([uid, userData]: [string, any]) => 
          (userData.email?.toLowerCase() === searchQuery.toLowerCase() ||
          userData.phone === searchQuery) &&
          !confirmedMembers.includes(uid) // Not already confirmed
        )
        .map(([uid, userData]: [string, any]) => ({ 
          uid, 
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          photoURL: userData.photoURL || '',
          position: userData.position || ''
        }))
        .slice(0, 10); // Limit to 10 results
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  const handleAddGuest = async () => {
    if (!guestType) return;

    try {
      console.log('Adding guest:', { guestType, guestName, guestEmail, guestPhone });
      
      if (guestType === 'avulso') {
        if (!guestName.trim()) {
          alert('Por favor, digite o nome do convidado');
          return;
        }
        
        // Add guest to confirmed list
        const guestId = `guest_${Date.now()}`;
        setConfirmedMembers([...confirmedMembers, guestId]);
        
        // Store guest data in members object
        const guestData = {
          name: guestName,
          isGuest: true,
          guestType: 'avulso'
        };
        
        setMembers(prev => ({
          ...prev,
          [guestId]: guestData
        }));
        
        alert('Convidado avulso adicionado com sucesso!');
      } else {
        if (!guestEmail.trim() && !guestPhone.trim()) {
          alert('Por favor, digite o email ou telefone do convidado');
          return;
        }
        
        // Search for existing user
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        const users = snapshot.val() || {};
        
        console.log('Searching for user with email/phone:', { guestEmail, guestPhone });
        console.log('All users:', users);
        
        const existingUser = Object.entries(users).find(([uid, userData]: [string, any]) => 
          userData.email === guestEmail || userData.phone === guestPhone
        );
        
        if (existingUser) {
          const [uid, userData] = existingUser;
          const userDataTyped = userData as any;
          console.log('Found existing user:', { uid, userData: userDataTyped });
          setConfirmedMembers([...confirmedMembers, uid]);
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
      
      // Reset form
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setGuestType(null);
      setShowGuestTypeModal(false);
    } catch (error: any) {
      console.error('Error adding guest:', error);
      alert(`Erro ao adicionar convidado: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleAddSearchedUser = async (userData: any) => {
    try {
      console.log('Adding searched user as guest:', userData);
      
      // Validate userData
      if (!userData.uid) {
        throw new Error('UID do usuário não encontrado');
      }
      
      if (!userData.name) {
        throw new Error('Nome do usuário não encontrado');
      }
      
      setConfirmedMembers([...confirmedMembers, userData.uid]);
      setMembers(prev => ({
        ...prev,
        [userData.uid]: { 
          ...userData, 
          isGuest: true, 
          guestType: 'cadastrado' 
        }
      }));
      
      // Reset search
      setSearchQuery('');
      setSearchResults([]);
      setShowGuestTypeModal(false);
      
      alert('Convidado cadastrado adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding searched user:', error);
      alert(`Erro ao adicionar convidado: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleSearchMembers = async () => {
    if (!memberSearchQuery.trim()) {
      setMemberSearchResults([]);
      return;
    }

    try {
      console.log('Searching for members with query:', memberSearchQuery);
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      console.log('All users:', users);
      console.log('Current members:', members);
      
      const results = Object.entries(users)
        .filter(([uid, userData]: [string, any]) => 
          (userData.email?.toLowerCase() === memberSearchQuery.toLowerCase() ||
          userData.phone === memberSearchQuery) &&
          !members[uid] // Not already a member
        )
        .map(([uid, userData]: [string, any]) => ({ 
          uid, 
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          photoURL: userData.photoURL || '',
          position: userData.position || ''
        }))
        .slice(0, 10); // Limit to 10 results
      
      console.log('Search results:', results);
      setMemberSearchResults(results);
    } catch (error) {
      console.error('Error searching members:', error);
      setMemberSearchResults([]);
    }
  };

  const handleAddMember = async (userData: any) => {
    try {
      console.log('Adding member:', userData);
      console.log('Fut ID:', id);
      
      // Validate userData
      if (!userData.uid) {
        throw new Error('UID do usuário não encontrado');
      }
      
      if (!userData.name) {
        throw new Error('Nome do usuário não encontrado');
      }
      
      // Add to fut members
      const futRef = ref(database, `futs/${id}/members/${userData.uid}`);
      await set(futRef, {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        photoURL: userData.photoURL || '',
        position: userData.position || '',
        joinedAt: new Date().toISOString()
      });
      
      // Update local state
      setMembers(prev => ({
        ...prev,
        [userData.uid]: {
          ...userData,
          isGuest: false
        }
      }));
      
      // Reset search
      setMemberSearchQuery('');
      setMemberSearchResults([]);
      setShowAddMemberModal(false);
      
      alert('Membro adicionado com sucesso!');
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert(`Erro ao adicionar membro: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleTeamDraw = async () => {
    const teamCountNum = parseInt(teamCount);
    const playersPerTeamNum = parseInt(playersPerTeam);
    
    if (!teamCount || !playersPerTeam || isNaN(teamCountNum) || isNaN(playersPerTeamNum)) {
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

    const shuffledMembers = [...confirmedMembers].sort(() => Math.random() - 0.5);
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
    
    setTeams(newTeams);
    setShowTeamDrawModal(false);
    
    // Save teams to Firebase
    try {
      await set(ref(database, `futs/${id}/teams`), newTeams);
    } catch (error) {
      console.error('Error saving teams:', error);
    }
    
    // Initialize stats
    const initialTeamStats: Record<string, { wins: number }> = {};
    const initialPlayerStats: Record<string, { goals: number; assists: number }> = {};
    
    Object.keys(newTeams).forEach(teamName => {
      initialTeamStats[teamName] = { wins: 0 };
    });
    
    Object.values(newTeams).flat().forEach(playerId => {
      initialPlayerStats[playerId] = { goals: 0, assists: 0 };
    });
    
    setTeamStats(initialTeamStats);
    setPlayerStats(initialPlayerStats);
    
    // Save initial stats to Firebase
    try {
      await set(ref(database, `futs/${id}/teamStats`), initialTeamStats);
      await set(ref(database, `futs/${id}/playerStats`), initialPlayerStats);
    } catch (error) {
      console.error('Error saving initial stats:', error);
    }
  };

  const handleTeamSelect = async () => {
    const teamCountNum = parseInt(teamCount);
    const playersPerTeamNum = parseInt(playersPerTeam);
    
    if (!teamCount || !playersPerTeam || isNaN(teamCountNum) || isNaN(playersPerTeamNum)) {
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
    
    setTeams(newTeams);
    setShowTeamSelectModal(false);
    setSelectedTeam(`Time 1`);
    
    // Save teams to Firebase
    try {
      await set(ref(database, `futs/${id}/teams`), newTeams);
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  };

  const handleAddPlayerToTeam = async (playerId: string, teamName: string) => {
    setTeams(prev => {
      const newTeams = { ...prev };
      
      // Remove player from all teams first
      Object.keys(newTeams).forEach(team => {
        newTeams[team] = newTeams[team].filter(id => id !== playerId);
      });
      
      // Add player to selected team
      newTeams[teamName] = [...newTeams[teamName], playerId];
      
      // Save to Firebase
      try {
        set(ref(database, `futs/${id}/teams`), newTeams);
      } catch (error) {
        console.error('Error saving teams:', error);
      }
      
      return newTeams;
    });
  };

  const handleRemovePlayerFromTeam = async (playerId: string, teamName: string) => {
    setTeams(prev => {
      const newTeams = {
        ...prev,
        [teamName]: prev[teamName].filter(id => id !== playerId)
      };
      
      // Save to Firebase
      try {
        set(ref(database, `futs/${id}/teams`), newTeams);
      } catch (error) {
        console.error('Error saving teams:', error);
      }
      
      return newTeams;
    });
  };

  const handleSaveTeams = async () => {
    try {
      await set(ref(database, `futs/${id}/teams`), teams);
      alert('Times salvos com sucesso!');
    } catch (error) {
      console.error('Error saving teams:', error);
      alert('Erro ao salvar times');
    }
  };

  const handleDeleteTeams = async () => {
    try {
      await set(ref(database, `futs/${id}/teams`), null);
      await set(ref(database, `futs/${id}/teamStats`), null);
      await set(ref(database, `futs/${id}/playerStats`), null);
      
      setTeams({});
      setTeamStats({});
      setPlayerStats({});
      setSelectedTeam(null);
    } catch (error) {
      console.error('Error deleting teams:', error);
      alert('Erro ao deletar times');
    }
  };

  const handleShareTeams = () => {
    let message = `${fut.name} - ${getRecurrenceText()} às ${fut.time || '19:00'} - 23/09/2025\n\nTIMES:\n\n`;
    
    Object.entries(teams).forEach(([teamName, players]) => {
      message += `${teamName}\n`;
      players.forEach((playerId, index) => {
        const player = members[playerId];
        message += `${index + 1}- ${player?.name || 'Convidado'}\n`;
      });
      
      // Add VAGA if team is not full
      while (players.length < parseInt(playersPerTeam)) {
        message += `${players.length + 1}- VAGA\n`;
        players.push('VAGA');
      }
      
      message += '\n';
    });
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleUpdateTeamWins = async (teamName: string, delta: number) => {
    const newStats = {
      ...teamStats,
      [teamName]: {
        wins: Math.max(0, (teamStats[teamName]?.wins || 0) + delta)
      }
    };
    
    setTeamStats(newStats);
    
    // Save to Firebase
    try {
      const futRef = ref(database, `futs/${id}/teamStats/${teamName}`);
      await set(futRef, newStats[teamName]);
    } catch (error) {
      console.error('Error saving team stats:', error);
    }
  };

  const handleUpdatePlayerStats = async (playerId: string, stat: 'goals' | 'assists', delta: number) => {
    const newStats = {
      ...playerStats,
      [playerId]: {
        ...playerStats[playerId],
        [stat]: Math.max(0, (playerStats[playerId]?.[stat] || 0) + delta)
      }
    };
    
    setPlayerStats(newStats);
    
    // Save to Firebase
    try {
      const futRef = ref(database, `futs/${id}/playerStats/${playerId}`);
      await set(futRef, newStats[playerId]);
      
      // Update user's total stats
      const userRef = ref(database, `users/${playerId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      if (userData) {
        const currentTotal = userData.totalGoals || 0;
        const currentAssists = userData.totalAssists || 0;
        
        const newTotalGoals = stat === 'goals' ? currentTotal + delta : currentTotal;
        const newTotalAssists = stat === 'assists' ? currentAssists + delta : currentAssists;
        
        await set(ref(database, `users/${playerId}/totalGoals`), Math.max(0, newTotalGoals));
        await set(ref(database, `users/${playerId}/totalAssists`), Math.max(0, newTotalAssists));
      }
    } catch (error) {
      console.error('Error saving player stats:', error);
    }
  };

  const handleEndFut = async () => {
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        futEnded: true,
        endedAt: new Date().toISOString()
      });
      
      setFutEnded(true);
      alert('Fut encerrado! Não é mais possível alterar os dados.');
    } catch (error) {
      console.error('Error ending fut:', error);
      alert('Erro ao encerrar fut');
    }
  };

  const handleStartVoting = async () => {
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        votingOpen: true,
        votingStartedAt: new Date().toISOString()
      });
      
      setVotingOpen(true);
      // Initialize player votes
      const initialVotes: Record<string, number> = {};
      Object.values(teams).flat().forEach(playerId => {
        initialVotes[playerId] = 0;
      });
      setPlayerVotes(initialVotes);
    } catch (error) {
      console.error('Error starting voting:', error);
      alert('Erro ao iniciar votação');
    }
  };

  const handleEndVoting = async () => {
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        votingEnded: true,
        votingOpen: false,
        votingEndedAt: new Date().toISOString()
      });
      
      setVotingEnded(true);
      setVotingOpen(false);
      alert('Votação encerrada!');
    } catch (error) {
      console.error('Error ending voting:', error);
      alert('Erro ao encerrar votação');
    }
  };

  const handleVote = async (playerId: string, rating: number) => {
    if (!user?.uid || !votingOpen) return;
    
    const newVotes = {
      ...userVotes,
      [user.uid]: {
        ...userVotes[user.uid],
        [playerId]: rating
      }
    };
    
    setUserVotes(newVotes);
    
    // Save to Firebase
    try {
      const futRef = ref(database, `futs/${id}/votes/${user.uid}`);
      await set(futRef, newVotes[user.uid]);
    } catch (error) {
      console.error('Error saving vote:', error);
    }
  };

  const handleGenerateRanking = (type: 'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias' = 'pontuacao') => {
    setRankingType(type);
    
    if (type === 'vitorias') {
      // Team wins ranking
      const teamWins = Object.entries(teamStats)
        .map(([teamName, stats]) => ({
          teamName,
          wins: stats.wins || 0
        }))
        .sort((a, b) => b.wins - a.wins);
      
      setRanking(teamWins);
    } else {
      // Calculate average votes for each player (only for members, not guests)
      const playerAverages: Record<string, number> = {};
      
      Object.entries(playerStats).forEach(([playerId, stats]) => {
        // Only calculate for members, not guests
        if (members[playerId]?.isGuest) return;
        
        const votes = Object.values(userVotes).map(userVote => userVote[playerId]).filter(vote => vote);
        playerAverages[playerId] = votes.length > 0 ? votes.reduce((sum, vote) => sum + vote, 0) / votes.length : 0;
      });

      let sortedPlayers: any[] = [];

      if (type === 'pontuacao') {
        // Calculate scores (stars * 20 + goals * 10 + assists * 5)
        const playerScores: Record<string, number> = {};
        Object.entries(playerStats).forEach(([playerId, stats]) => {
          // Only calculate for members, not guests
          if (members[playerId]?.isGuest) return;
          
          const stars = playerAverages[playerId] || 0;
          const goals = stats.goals || 0;
          const assists = stats.assists || 0;
          playerScores[playerId] = (stars * 20) + (goals * 10) + (assists * 5);
        });

        // Sort players by score (only members)
        sortedPlayers = Object.entries(playerScores)
          .map(([playerId, score]) => ({
            playerId,
            score,
            stars: playerAverages[playerId] || 0,
            goals: playerStats[playerId]?.goals || 0,
            assists: playerStats[playerId]?.assists || 0,
            name: members[playerId]?.name || 'Convidado'
          }))
          .sort((a, b) => b.score - a.score);
      } else if (type === 'artilharia') {
        // Goals ranking
        sortedPlayers = Object.entries(playerStats)
          .filter(([playerId]) => !members[playerId]?.isGuest)
          .map(([playerId, stats]) => ({
            playerId,
            goals: stats.goals || 0,
            assists: playerStats[playerId]?.assists || 0,
            stars: playerAverages[playerId] || 0,
            name: members[playerId]?.name || 'Convidado'
          }))
          .sort((a, b) => b.goals - a.goals);
      } else if (type === 'assistencias') {
        // Assists ranking
        sortedPlayers = Object.entries(playerStats)
          .filter(([playerId]) => !members[playerId]?.isGuest)
          .map(([playerId, stats]) => ({
            playerId,
            goals: stats.goals || 0,
            assists: playerStats[playerId]?.assists || 0,
            stars: playerAverages[playerId] || 0,
            name: members[playerId]?.name || 'Convidado'
          }))
          .sort((a, b) => b.assists - a.assists);
      }

      setRanking(sortedPlayers);
    }
    
    setShowRanking(true);
  };

  const handleDownloadRanking = () => {
    if (!ranking || ranking.length === 0) return;
    
    const rankingTitle = rankingType === 'pontuacao' ? 'Ranking de Pontuação' :
                        rankingType === 'artilharia' ? 'Ranking de Artilharia' :
                        rankingType === 'assistencias' ? 'Ranking de Assistências' :
                        'Ranking de Vitórias';
    
    let content = `${fut.name} - ${rankingTitle}\n\n`;
    
    ranking.slice(0, 10).forEach((item: any, index: number) => {
      const position = index + 1;
      const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';
      
      if (rankingType === 'vitorias') {
        content += `${position}${medal} ${item.teamName} - ${item.wins} vitórias\n`;
      } else {
        const value = rankingType === 'pontuacao' ? item.score :
                     rankingType === 'artilharia' ? item.goals :
                     item.assists;
        const unit = rankingType === 'pontuacao' ? 'pts' :
                    rankingType === 'artilharia' ? 'gols' :
                    'assistências';
        content += `${position}${medal} ${item.name} - ${value} ${unit}\n`;
      }
    });
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fut.name}_${rankingTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateImage = async () => {
    if (!ranking || ranking.length === 0) return;
    
    const rankingTitle = rankingType === 'pontuacao' ? 'Ranking de Pontuação' :
                        rankingType === 'artilharia' ? 'Ranking de Artilharia' :
                        rankingType === 'assistencias' ? 'Ranking de Assistências' :
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
    ctx.fillText(fut.name, canvas.width / 2, 40);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillText(rankingTitle, canvas.width / 2, 70);
    
    // Date
    ctx.font = '14px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(new Date().toLocaleDateString('pt-BR'), canvas.width / 2, 95);
    
    // Rankings
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    
    ranking.slice(0, 5).forEach((item: any, index: number) => {
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
      if (rankingType !== 'vitorias') {
        const player = members[item.playerId];
        if (player?.photoURL) {
          // Draw photo circle
          ctx.fillStyle = '#444444';
          ctx.beginPath();
          ctx.arc(140, y - 10, 20, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw photo border
          ctx.strokeStyle = '#666666';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Load and draw the actual image
          try {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(140, y - 10, 20, 0, 2 * Math.PI);
              ctx.clip();
              ctx.drawImage(img, 120, y - 30, 40, 40);
              ctx.restore();
            };
            img.src = player.photoURL;
          } catch (error) {
            // Fallback to initial if image fails to load
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(140, y - 10, 20, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            const initial = ((rankingType as any) === 'vitorias' ? (item as any).teamName : (item as any).name)?.charAt(0).toUpperCase() || '?';
            ctx.fillText(initial, 140, y - 5);
          }
        } else {
          // Draw initial circle
          ctx.fillStyle = '#00ff00';
          ctx.beginPath();
          ctx.arc(140, y - 10, 20, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw initial
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          const initial = ((rankingType as any) === 'vitorias' ? (item as any).teamName : (item as any).name)?.charAt(0).toUpperCase() || '?';
          ctx.fillText(initial, 140, y - 5);
        }
      }
      
      // Name
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      const name = rankingType === 'vitorias' ? item.teamName : item.name;
      ctx.fillText(name, 180, y);
      
      // Value
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'right';
      if (rankingType === 'vitorias') {
        ctx.fillText(`${item.wins} vitórias`, canvas.width - 40, y);
      } else {
        const value = rankingType === 'pontuacao' ? item.score :
                     rankingType === 'artilharia' ? item.goals :
                     item.assists;
        const unit = rankingType === 'pontuacao' ? 'pts' :
                    rankingType === 'artilharia' ? 'gols' :
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
        link.download = `${fut.name}_${rankingTitle.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  const handleFinalizeFut = async () => {
    try {
      const futRef = ref(database, `futs/${id}`);
      await set(futRef, {
        ...fut,
        futStarted: false,
        listReleased: false,
        teams: {},
        teamStats: {},
        playerStats: {},
        futEnded: false,
        votingOpen: false,
        votingEnded: false,
        playerVotes: {},
        userVotes: {},
        showRanking: false,
        ranking: null,
        confirmedMembers: [],
        releasedVagas: fut?.maxVagas || 0,
        finalizedAt: new Date().toISOString()
      });
      
      // Reset everything for next fut
      setFutStarted(false);
      setListReleased(false);
      setTeams({});
      setTeamStats({});
      setPlayerStats({});
      setFutEnded(false);
      setVotingOpen(false);
      setVotingEnded(false);
      setPlayerVotes({});
      setUserVotes({});
      setShowRanking(false);
      setRanking(null);
      setConfirmedMembers([]);
      setReleasedVagas(fut?.maxVagas || 0);
      
      alert('Fut finalizado! Pronto para o próximo.');
    } catch (error) {
      console.error('Error finalizing fut:', error);
      alert('Erro ao finalizar fut');
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header with back button */}
      <div className="bg-primary-lighter border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white text-xl font-semibold">Detalhes do Fut</h1>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className="ml-auto text-gray-400 hover:text-secondary transition-colors"
              >
                <Settings size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fut Image Section */}
      <div className="relative">
        {fut.photoURL ? (
          <div 
            className="w-full h-64 bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url(${fut.photoURL})` }}
            onClick={() => setShowImageModal(true)}
          >
            {/* Blur overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
            
            {/* Fut Info over blur */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-white text-2xl font-bold drop-shadow-lg shadow-black">{fut.name}</h2>
                {isAdmin && (
                  <Crown size={20} className="text-yellow-500 drop-shadow-lg shadow-black" />
                )}
              </div>
              
              {fut.description && (
                <p className="text-white mb-2 text-sm drop-shadow-lg shadow-black font-medium">{fut.description}</p>
              )}

              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-white drop-shadow-lg shadow-black" />
                  <span className="text-white drop-shadow-lg shadow-black font-medium">{getRecurrenceText()}</span>
                </div>
                
                {fut.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-white drop-shadow-lg shadow-black" />
                    <span className="text-white drop-shadow-lg shadow-black font-medium">{fut.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-white drop-shadow-lg shadow-black" />
                  <span className="text-white drop-shadow-lg shadow-black font-medium">{memberCount} membros</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-white drop-shadow-lg shadow-black" />
                  <span className="text-white drop-shadow-lg shadow-black font-medium">{fut.maxVagas} vagas sugeridas</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium drop-shadow-lg shadow-black ${
                  fut.type === 'mensal' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-purple-600 text-white'
                }`}>
                  {fut.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
                </span>
                
                {fut.privacy === 'invite' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-600 text-white drop-shadow-lg shadow-black">
                    Privado
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-primary-lighter flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-4xl">
                  {fut.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-white text-2xl font-bold">{fut.name}</h2>
                {isAdmin && (
                  <Crown size={20} className="text-yellow-500" />
                )}
              </div>
              
              {fut.description && (
                <p className="text-gray-400 mb-2">{fut.description}</p>
              )}

              <div className="space-y-1 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{getRecurrenceText()}</span>
                </div>
                
                {fut.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{fut.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>{memberCount} membros</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{fut.maxVagas} vagas sugeridas</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  fut.type === 'mensal' 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-purple-900 text-purple-300'
                }`}>
                  {fut.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
                </span>
                
                {fut.privacy === 'invite' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                    Privado
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-primary-lighter border-b border-gray-700">
        <div className="px-6">
          <div className="flex items-center">
            {/* Left Arrow - Fixed */}
            <button
              onClick={() => {
                const tabs = isAdmin ? ['fut', 'times', 'data', 'members', 'ranking', 'settings'] : ['members'];
                const currentIndex = tabs.indexOf(activeTab);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                setActiveTab(tabs[prevIndex] as any);
              }}
              className="text-gray-400 hover:text-white transition-colors p-2 mr-2 flex-shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Tabs Container - Scrollable */}
            <div className="flex space-x-1 overflow-x-auto flex-1 min-w-0">
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('fut')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === 'fut'
                      ? 'bg-primary text-secondary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Fut
                </button>
              )}
              {isAdmin && futStarted && (
                <>
                  <button
                    onClick={() => setActiveTab('times')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                      activeTab === 'times'
                        ? 'bg-primary text-secondary'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Times
                  </button>
                  <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                      activeTab === 'data'
                        ? 'bg-primary text-secondary'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Dados
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'bg-primary text-secondary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Membros ({memberCount})
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('ranking')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === 'ranking'
                      ? 'bg-primary text-secondary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Ranking
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-primary text-secondary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Configurações
                </button>
              )}
            </div>
            
            {/* Right Arrow - Fixed */}
            <button
              onClick={() => {
                const tabs = isAdmin ? ['fut', 'times', 'data', 'members', 'ranking', 'settings'] : ['members'];
                const currentIndex = tabs.indexOf(activeTab);
                const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                setActiveTab(tabs[nextIndex] as any);
              }}
              className="text-gray-400 hover:text-white transition-colors p-2 ml-2 flex-shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'fut' && isAdmin && (
          <div className="space-y-4">
            {!futStarted ? (
              <>
                {/* Next Game Section */}
                <div className="bg-primary-lighter rounded-lg p-3">
                  <h3 className="text-white text-base font-semibold mb-3">Próximo Fut 23/09/2025</h3>
                  
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={fut.maxVagas}
                        value={releasedVagas}
                        onChange={(e) => setReleasedVagas(parseInt(e.target.value) || fut.maxVagas)}
                        className="flex-1 px-2 py-1 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary text-sm"
                        placeholder="Vagas"
                      />
                      <button 
                        onClick={handleReleaseList}
                        disabled={listReleased}
                        className="bg-secondary text-primary px-3 py-1 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {listReleased ? 'Liberada' : 'Liberar'}
                      </button>
                    </div>
                    
                    {/* Action buttons for admin */}
                    {listReleased && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleConfirmPresence(true)}
                          className={`flex-1 py-1 rounded text-sm font-medium transition-colors ${
                            confirmedMembers.includes(user?.uid || '') 
                              ? 'bg-green-700 text-white' 
                              : 'bg-green-600 text-black hover:bg-green-700'
                          }`}
                        >
                          To Dentro
                        </button>
                        <button 
                          onClick={() => handleConfirmPresence(false)}
                          className={`flex-1 py-1 rounded text-sm font-medium transition-colors ${
                            !confirmedMembers.includes(user?.uid || '') 
                              ? 'bg-red-700 text-white' 
                              : 'bg-red-600 text-black hover:bg-red-700'
                          }`}
                        >
                          To Fora
                        </button>
                        <button 
                          onClick={() => setShowGuestModal(true)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          + Convidado
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Read-only view after fut started */
              <div className="bg-primary-lighter rounded-lg p-3">
                <h3 className="text-white text-base font-semibold mb-3">Fut em Andamento - 23/09/2025</h3>
                
                <div className="space-y-3">
                  <div className="text-gray-400 text-sm">
                    Vagas: {releasedVagas}
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    Confirmados: {confirmedMembers.length}
                  </div>
                </div>
              </div>
            )}

            {/* Confirmed List Section - Only show after list is released */}
            {listReleased && (
              <div className="bg-primary-lighter rounded-lg p-3">
                <h3 className="text-white text-base font-semibold mb-3">Lista de Confirmados para o Fut 23/09/2025</h3>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Confirmados</span>
                    <span>{confirmedMembers.length}/{releasedVagas}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${Math.min((confirmedMembers.length / releasedVagas) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Confirmed Members List */}
                <div className="space-y-2">
                  {confirmedMembers.map((memberId, index) => {
                    const memberData = members[memberId];
                    return (
                      <div key={memberId} className="flex items-center space-x-2">
                        <span className="text-secondary font-bold text-sm w-6">{index + 1} -</span>
                                {memberData?.photoURL ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                      src={memberData.photoURL}
                                      alt={memberData.name}
                                      width={32}
                                      height={32}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary font-semibold text-xs">
                                      {memberData?.name?.charAt(0).toUpperCase() || 'C'}
                                    </span>
                                  </div>
                                )}
                        <span className="text-white font-medium text-sm">{memberData?.name || 'Convidado'}</span>
                      </div>
                    );
                  })}
                </div>
                
                <button 
                  onClick={handleShareList}
                  className="w-full mt-3 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Compartilhar Lista
                </button>
              </div>
            )}

            {/* Start Fut Button */}
            {listReleased && !futStarted && (
              <div className="bg-primary-lighter rounded-lg p-3">
                <button 
                  onClick={handleStartFut}
                  className="w-full bg-yellow-600 text-white py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Iniciar Fut
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Membros</h3>
              {isAdmin && (
                <button 
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors"
                >
                  Adicionar Membro
                </button>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(members)
                .filter(([memberId, memberData]) => !memberData.isGuest) // Exclude guests
                .map(([memberId, memberData]) => (
                        <div
                          key={memberId}
                          className="bg-primary-lighter rounded-lg p-4 border border-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            {memberData.photoURL ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={memberData.photoURL}
                                  alt={memberData.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-semibold text-sm">
                                  {memberData.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">{memberData.name}</h4>
                        {memberId === fut.adminId && (
                          <Crown size={16} className="text-yellow-500" />
                        )}
                      </div>
                      {memberData.position && (
                        <p className="text-gray-400 text-sm">{memberData.position}</p>
                      )}
                    </div>

                    {/* Member stats would go here */}
                    <div className="text-right text-sm">
                      <div className="text-secondary font-semibold">0</div>
                      <div className="text-gray-400">Gols</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'occurrences' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Partidas</h3>
              {isAdmin && (
                <button className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors">
                  Nova Partida
                </button>
              )}
            </div>

            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Nenhuma partida ainda</div>
              <div className="text-gray-500 text-sm">
                As partidas aparecerão aqui quando forem criadas
              </div>
            </div>
          </div>
        )}

        {activeTab === 'times' && isAdmin && futStarted && (
          <div className="space-y-4">
            {Object.keys(teams).length === 0 ? (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowTeamDrawModal(true)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sorteio de Times
                  </button>
                  <button 
                    onClick={() => setShowTeamSelectModal(true)}
                    className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Escolher Times
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button 
                    onClick={handleDeleteTeams}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Apagar Times
                  </button>
                  <button 
                    onClick={handleShareTeams}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Compartilhar Times
                  </button>
                </div>
                
                <div className="bg-primary-lighter rounded-lg p-3">
                  <h3 className="text-white text-base font-semibold mb-3">TIMES:</h3>
                  <div className="space-y-4">
                    {Object.entries(teams).map(([teamName, players]) => (
                      <div key={teamName} className="space-y-2">
                        <h4 className="text-secondary font-semibold">{teamName}</h4>
                        <div className="space-y-1">
                          {players.map((playerId, index) => {
                            const player = members[playerId];
                            return (
                              <div key={playerId} className="text-white text-sm">
                                {index + 1}- {player?.name || 'Convidado'}
                              </div>
                            );
                          })}
                          {/* Add VAGA if team is not full */}
                          {Array.from({ length: Math.max(0, parseInt(playersPerTeam) - players.length) }).map((_, index) => (
                            <div key={`vaga-${index}`} className="text-gray-400 text-sm">
                              {players.length + index + 1}- VAGA
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && isAdmin && futStarted && (
          <div className="space-y-4">
            {Object.keys(teams).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Os times ainda não foram escolhidos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!futEnded && (
                  <button 
                    onClick={handleEndFut}
                    className="w-full bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Encerrar Fut
                  </button>
                )}

                {futEnded && !votingOpen && !votingEnded && (
                  <button 
                    onClick={handleStartVoting}
                    className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Liberar Votação
                  </button>
                )}

                {votingOpen && (
                  <button 
                    onClick={handleEndVoting}
                    className="w-full bg-yellow-600 text-white py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                  >
                    Encerrar Votação
                  </button>
                )}

                {votingEnded && !showRanking && (
                  <button 
                    onClick={() => handleGenerateRanking('pontuacao')}
                    className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Gerar Ranking
                  </button>
                )}

                {showRanking && (
                  <button 
                    onClick={handleFinalizeFut}
                    className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Finalizar Fut
                  </button>
                )}

                {/* Voting Section */}
                {votingOpen && (
                  <div className="bg-primary-lighter rounded-lg p-4">
                    <h3 className="text-white text-lg font-semibold mb-4">Votação - Avalie os Jogadores</h3>
                    <div className="space-y-4">
                      {Object.values(teams).flat()
                        .filter(playerId => !members[playerId]?.isGuest) // Only members, not guests
                        .map((playerId) => {
                        const player = members[playerId];
                        const currentVote = userVotes[user?.uid || '']?.[playerId] || 0;
                        
                        return (
                          <div key={playerId} className="bg-primary p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {player?.photoURL ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  <Image
                                    src={player.photoURL}
                                    alt={player.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary font-semibold text-xs">
                                    {player?.name?.charAt(0).toUpperCase() || 'C'}
                                  </span>
                                </div>
                              )}
                                <span className="text-white text-sm font-medium">{player?.name || 'Convidado'}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleVote(playerId, star)}
                                    className={`w-8 h-8 rounded text-lg ${
                                      star <= currentVote
                                        ? 'text-yellow-400'
                                        : 'text-gray-400 hover:text-yellow-300'
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ranking Section */}
                {showRanking && ranking && (
                  <div className="bg-primary-lighter rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-semibold">
                        {rankingType === 'pontuacao' ? 'Ranking de Pontuação' :
                         rankingType === 'artilharia' ? 'Ranking de Artilharia' :
                         rankingType === 'assistencias' ? 'Ranking de Assistências' :
                         'Ranking de Vitórias'}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleGenerateRanking('pontuacao')}
                          className={`px-3 py-2 rounded text-sm font-medium ${
                            rankingType === 'pontuacao' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Pontuação
                        </button>
                        <button 
                          onClick={() => handleGenerateRanking('artilharia')}
                          className={`px-3 py-2 rounded text-sm font-medium ${
                            rankingType === 'artilharia' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Artilharia
                        </button>
                        <button 
                          onClick={() => handleGenerateRanking('assistencias')}
                          className={`px-3 py-2 rounded text-sm font-medium ${
                            rankingType === 'assistencias' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Assistências
                        </button>
                        <button 
                          onClick={() => handleGenerateRanking('vitorias')}
                          className={`px-3 py-2 rounded text-sm font-medium ${
                            rankingType === 'vitorias' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Vitórias
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {ranking.slice(0, 3).map((item: any, index: number) => (
                        <div key={item.playerId || item.teamName} className="bg-primary p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-4xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </div>
                              {rankingType === 'vitorias' ? (
                                <div>
                                  <div className="text-white text-sm font-medium">{item.teamName}</div>
                                  <div className="text-gray-400 text-xs">
                                    {item.wins} vitórias
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {members[item.playerId]?.photoURL ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      <Image
                                        src={members[item.playerId]?.photoURL || ''}
                                        alt={item.name}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-primary font-semibold text-xs">
                                        {item.name?.charAt(0).toUpperCase() || 'C'}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-white text-sm font-medium">{item.name}</div>
                                    <div className="text-gray-400 text-xs">
                                      {rankingType === 'pontuacao' ? `${item.score} pts` :
                                       rankingType === 'artilharia' ? `${item.goals} gols` :
                                       `${item.assists} assistências`}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-secondary font-semibold text-lg">
                                {rankingType === 'pontuacao' ? item.score :
                                 rankingType === 'artilharia' ? item.goals :
                                 rankingType === 'assistencias' ? item.assists :
                                 item.wins}
                              </div>
                              <div className="text-gray-400 text-xs">
                                #{index + 1}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-center space-x-3">
                      <button 
                        onClick={() => handleDownloadRanking()}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Baixar TXT
                      </button>
                      <button 
                        onClick={() => handleGenerateImage()}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Gerar Imagem
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {Object.entries(teams).map(([teamName, players], teamIndex) => (
                    <div key={teamName} className="bg-primary-lighter rounded-lg p-4">
                      {/* Team Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
                        <h3 className="text-white font-semibold text-lg">{teamName}</h3>
                        {!futEnded && (
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400 text-sm">Vitórias:</span>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleUpdateTeamWins(teamName, -1)}
                                className="w-7 h-7 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition-colors"
                              >
                                -
                              </button>
                              <span className="text-white font-semibold min-w-[25px] text-center text-lg">
                                {teamStats[teamName]?.wins || 0}
                              </span>
                              <button 
                                onClick={() => handleUpdateTeamWins(teamName, 1)}
                                className="w-7 h-7 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Players Section */}
                      <div className="space-y-3">
                        <h4 className="text-gray-300 text-sm font-medium uppercase tracking-wide">Jogadores</h4>
                        <div className="space-y-2">
                        {players
                          .filter(playerId => !members[playerId]?.isGuest || members[playerId]?.guestType === 'cadastrado') // Only members and registered guests
                          .map((playerId) => {
                          const player = members[playerId];
                          const isGuest = player?.isGuest;
                          
                          return (
                            <div key={playerId} className="bg-primary p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {player?.photoURL ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      <Image
                                        src={player.photoURL}
                                        alt={player.name}
                                        width={32}
                                        height={32}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-primary font-semibold text-xs">
                                        {player?.name?.charAt(0).toUpperCase() || 'C'}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-white text-sm font-medium">{player?.name || 'Convidado'}</span>
                                    {isGuest && (
                                      <span className="text-gray-400 text-xs ml-2">(Convidado)</span>
                                    )}
                                  </div>
                                </div>
                                
                                {!futEnded && (
                                  <div className="space-y-4">
                                    {/* Goals */}
                                    <div className="flex flex-col items-center space-y-2">
                                      <span className="text-gray-400 text-sm font-medium">Gols:</span>
                                      <div className="flex items-center space-x-2">
                                        <button 
                                          onClick={() => handleUpdatePlayerStats(playerId, 'goals', -1)}
                                          className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                        >
                                          -
                                        </button>
                                        <span className="text-white text-lg min-w-[20px] text-center font-semibold">
                                          {playerStats[playerId]?.goals || 0}
                                        </span>
                                        <button 
                                          onClick={() => handleUpdatePlayerStats(playerId, 'goals', 1)}
                                          className="w-6 h-6 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Assists */}
                                    <div className="flex flex-col items-center space-y-2">
                                      <span className="text-gray-400 text-sm font-medium">Assistências:</span>
                                      <div className="flex items-center space-x-2">
                                        <button 
                                          onClick={() => handleUpdatePlayerStats(playerId, 'assists', -1)}
                                          className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                        >
                                          -
                                        </button>
                                        <span className="text-white text-lg min-w-[20px] text-center font-semibold">
                                          {playerStats[playerId]?.assists || 0}
                                        </span>
                                        <button 
                                          onClick={() => handleUpdatePlayerStats(playerId, 'assists', 1)}
                                          className="w-6 h-6 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                      
                      {/* Team Separator */}
                      {teamIndex < Object.keys(teams).length - 1 && (
                        <div className="mt-6 pt-4 border-t border-gray-600"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ranking' && isAdmin && (
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Rankings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-lighter rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Artilharia Geral</h4>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Em desenvolvimento...</div>
                </div>
              </div>
              
              <div className="bg-primary-lighter rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Assistências Gerais</h4>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Em desenvolvimento...</div>
                </div>
              </div>
              
              <div className="bg-primary-lighter rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Ranking por Dia</h4>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Em desenvolvimento...</div>
                </div>
              </div>
              
              <div className="bg-primary-lighter rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Ranking Geral</h4>
                <div className="space-y-2">
                  <div className="text-gray-400 text-sm">Em desenvolvimento...</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Configurações</h3>
            
            <div className="space-y-4">
              <button className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors">
                Editar Informações do Fut
              </button>
              
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Gerenciar Membros
              </button>
              
              <button className="w-full bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                Configurar Notificações
              </button>
              
              <div className="pt-4 border-t border-gray-700">
                <button className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                  Excluir Fut
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && fut.photoURL && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <Image
              src={fut.photoURL}
              alt={fut.name}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Guest Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Adicionar Convidado</h2>
              <button
                onClick={() => setShowGuestModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <button 
                  onClick={() => handleGuestTypeSelect('avulso')}
                  className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Convidado Avulso (Apenas Nome)
                </button>
                <button 
                  onClick={() => handleGuestTypeSelect('cadastrado')}
                  className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Convidado Cadastrado (Email/Telefone)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Type Modal */}
      {showGuestTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">
                {guestType === 'avulso' ? 'Convidado Avulso' : 'Convidado Cadastrado'}
              </h2>
              <button
                onClick={() => {
                  setShowGuestTypeModal(false);
                  setGuestType(null);
                  setGuestName('');
                  setGuestEmail('');
                  setGuestPhone('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {guestType === 'avulso' ? (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Nome do Convidado
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                    placeholder="Digite o nome do convidado"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Buscar Usuário
                    </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                                placeholder="Digite email ou telefone"
                              />
                              <button
                                onClick={handleSearchUsers}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                Buscar
                              </button>
                            </div>
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {searchResults.map((user) => (
                        <div key={user.uid} className="flex items-center justify-between bg-primary p-2 rounded">
                          <div>
                            <div className="text-white text-sm font-medium">{user.name}</div>
                            <div className="text-gray-400 text-xs">{user.email}</div>
                            {user.phone && (
                              <div className="text-gray-400 text-xs">{user.phone}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddSearchedUser(user)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                          >
                            Adicionar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchQuery && searchResults.length === 0 && (
                    <div className="text-gray-400 text-sm text-center py-2">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowGuestTypeModal(false);
                    setGuestType(null);
                    setGuestName('');
                    setGuestEmail('');
                    setGuestPhone('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddGuest}
                  className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Draw Modal */}
      {showTeamDrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Sorteio de Times</h2>
              <button
                onClick={() => setShowTeamDrawModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Quantidade de Times
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={teamCount}
                  onChange={(e) => setTeamCount(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Ex: 2"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Jogadores por Time
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Ex: 5"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTeamDrawModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTeamDraw}
                  className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
                >
                  Gerar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Select Modal */}
      {showTeamSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Escolher Times</h2>
              <button
                onClick={() => setShowTeamSelectModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Quantidade de Times
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={teamCount}
                  onChange={(e) => setTeamCount(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Ex: 2"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Jogadores por Time
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Ex: 5"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTeamSelectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTeamSelect}
                  className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
                >
                  Escolher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Selection Interface */}
      {selectedTeam && Object.keys(teams).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Selecionar Times</h2>
              <button
                onClick={() => {
                  setSelectedTeam(null);
                  handleSaveTeams();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Team Filters */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(teams).map(teamName => (
                  <button
                    key={teamName}
                    onClick={() => setSelectedTeam(teamName)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedTeam === teamName
                        ? 'bg-secondary text-primary'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {teamName} ({teams[teamName].length}/{playersPerTeam})
                  </button>
                ))}
              </div>

              {/* Selected Team */}
              {selectedTeam && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">{selectedTeam}</h3>
                  
                  {/* Team Members */}
                  <div className="space-y-2">
                    {teams[selectedTeam].map((playerId, index) => {
                      const player = members[playerId];
                      return (
                        <div key={playerId} className="flex items-center justify-between bg-primary p-2 rounded">
                          <span className="text-white text-sm">
                            {index + 1}- {player?.name || 'Convidado'}
                          </span>
                          <button
                            onClick={() => handleRemovePlayerFromTeam(playerId, selectedTeam)}
                            className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                          >
                            -
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Available Players */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Jogadores Disponíveis</h4>
                    {confirmedMembers
                      .filter(playerId => !Object.values(teams).flat().includes(playerId))
                      .map(playerId => {
                        const player = members[playerId];
                        const canAdd = teams[selectedTeam].length < parseInt(playersPerTeam);
                        
                        return (
                          <div key={playerId} className="flex items-center justify-between bg-primary p-2 rounded">
                            <span className="text-white text-sm">{player?.name || 'Convidado'}</span>
                            {canAdd && (
                              <button
                                onClick={() => handleAddPlayerToTeam(playerId, selectedTeam)}
                                className="w-6 h-6 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors"
                              >
                                +
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Adicionar Membro</h2>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setMemberSearchQuery('');
                  setMemberSearchResults([]);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Buscar Usuário
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                    placeholder="Digite email ou telefone"
                  />
                  <button
                    onClick={handleSearchMembers}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Buscar
                  </button>
                </div>
              </div>
              
              {/* Search Results */}
              {memberSearchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {memberSearchResults.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between bg-primary p-2 rounded">
                      <div>
                        <div className="text-white text-sm font-medium">{user.name}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                        {user.phone && (
                          <div className="text-gray-400 text-xs">{user.phone}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddMember(user)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {memberSearchQuery && memberSearchResults.length === 0 && (
                <div className="text-gray-400 text-sm text-center py-2">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}