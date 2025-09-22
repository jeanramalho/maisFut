import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue, get } from 'firebase/database';
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
  email: string;
  phone?: string;
  photoURL?: string;
  position?: string;
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
  const [teamCount, setTeamCount] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
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

  const handleReleaseList = () => {
    setListReleased(true);
    setConfirmedMembers([user?.uid || '']); // Admin se confirma automaticamente
    
    // If no specific vagas set, use fut's maxVagas
    if (releasedVagas === 0) {
      setReleasedVagas(fut?.maxVagas || 0);
    }
  };

  const handleConfirmPresence = (isIn: boolean) => {
    if (!user?.uid) return;
    
    if (isIn) {
      if (!confirmedMembers.includes(user.uid)) {
        setConfirmedMembers([...confirmedMembers, user.uid]);
      }
    } else {
      setConfirmedMembers(confirmedMembers.filter(id => id !== user.uid));
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

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      const results = Object.entries(users)
        .filter(([uid, userData]: [string, any]) => 
          userData.name?.toLowerCase().includes(query.toLowerCase()) ||
          userData.email?.toLowerCase().includes(query.toLowerCase()) ||
          userData.phone?.includes(query)
        )
        .map(([uid, userData]) => ({ uid, ...userData }))
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
        
        const existingUser = Object.entries(users).find(([uid, userData]: [string, any]) => 
          userData.email === guestEmail || userData.phone === guestPhone
        );
        
        if (existingUser) {
          const [uid, userData] = existingUser;
          setConfirmedMembers([...confirmedMembers, uid]);
          setMembers(prev => ({
            ...prev,
            [uid]: { ...userData, isGuest: true, guestType: 'cadastrado' }
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
    } catch (error) {
      alert('Erro ao adicionar convidado');
    }
  };

  const handleAddSearchedUser = async (userData: any) => {
    try {
      setConfirmedMembers([...confirmedMembers, userData.uid]);
      setMembers(prev => ({
        ...prev,
        [userData.uid]: { ...userData, isGuest: true, guestType: 'cadastrado' }
      }));
      
      // Reset search
      setSearchQuery('');
      setSearchResults([]);
      setShowGuestTypeModal(false);
      
      alert('Convidado cadastrado adicionado com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar convidado');
    }
  };

  const handleSearchMembers = async (query: string) => {
    if (!query.trim()) {
      setMemberSearchResults([]);
      return;
    }

    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      const results = Object.entries(users)
        .filter(([uid, userData]: [string, any]) => 
          (userData.name?.toLowerCase().includes(query.toLowerCase()) ||
          userData.email?.toLowerCase().includes(query.toLowerCase()) ||
          userData.phone?.includes(query)) &&
          !members[uid] // Not already a member
        )
        .map(([uid, userData]) => ({ uid, ...userData }))
        .slice(0, 10); // Limit to 10 results
      
      setMemberSearchResults(results);
    } catch (error) {
      console.error('Error searching members:', error);
      setMemberSearchResults([]);
    }
  };

  const handleAddMember = async (userData: any) => {
    try {
      // Add to fut members
      const futRef = ref(database, `futs/${id}/members/${userData.uid}`);
      await set(futRef, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        photoURL: userData.photoURL,
        position: userData.position,
        joinedAt: new Date().toISOString()
      });
      
      // Update local state
      setMembers(prev => ({
        ...prev,
        [userData.uid]: userData
      }));
      
      // Reset search
      setMemberSearchQuery('');
      setMemberSearchResults([]);
      setShowAddMemberModal(false);
      
      alert('Membro adicionado com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar membro');
    }
  };

  const handleTeamDraw = () => {
    if (!teamCount || !playersPerTeam) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const shuffledMembers = [...confirmedMembers].sort(() => Math.random() - 0.5);
    const newTeams: Record<string, string[]> = {};
    
    // Initialize teams
    for (let i = 1; i <= teamCount; i++) {
      newTeams[`Time ${i}`] = [];
    }
    
    // Distribute players
    let memberIndex = 0;
    for (let i = 1; i <= teamCount; i++) {
      const teamName = `Time ${i}`;
      for (let j = 0; j < playersPerTeam && memberIndex < shuffledMembers.length; j++) {
        newTeams[teamName].push(shuffledMembers[memberIndex]);
        memberIndex++;
      }
    }
    
    setTeams(newTeams);
    setShowTeamDrawModal(false);
    
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
  };

  const handleTeamSelect = () => {
    if (!teamCount || !playersPerTeam) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const newTeams: Record<string, string[]> = {};
    for (let i = 1; i <= teamCount; i++) {
      newTeams[`Time ${i}`] = [];
    }
    
    setTeams(newTeams);
    setShowTeamSelectModal(false);
    setSelectedTeam(`Time 1`);
  };

  const handleAddPlayerToTeam = (playerId: string, teamName: string) => {
    setTeams(prev => {
      const newTeams = { ...prev };
      
      // Remove player from all teams first
      Object.keys(newTeams).forEach(team => {
        newTeams[team] = newTeams[team].filter(id => id !== playerId);
      });
      
      // Add player to selected team
      newTeams[teamName] = [...newTeams[teamName], playerId];
      
      return newTeams;
    });
  };

  const handleRemovePlayerFromTeam = (playerId: string, teamName: string) => {
    setTeams(prev => ({
      ...prev,
      [teamName]: prev[teamName].filter(id => id !== playerId)
    }));
  };

  const handleSaveTeams = () => {
    // Teams are already saved in state
    alert('Times salvos com sucesso!');
  };

  const handleDeleteTeams = () => {
    setTeams({});
    setTeamStats({});
    setPlayerStats({});
    setSelectedTeam(null);
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
      while (players.length < playersPerTeam) {
        message += `${players.length + 1}- VAGA\n`;
        players.push('VAGA');
      }
      
      message += '\n';
    });
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleUpdateTeamWins = (teamName: string, delta: number) => {
    setTeamStats(prev => ({
      ...prev,
      [teamName]: {
        wins: Math.max(0, (prev[teamName]?.wins || 0) + delta)
      }
    }));
  };

  const handleUpdatePlayerStats = (playerId: string, stat: 'goals' | 'assists', delta: number) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [stat]: Math.max(0, (prev[playerId]?.[stat] || 0) + delta)
      }
    }));
  };

  const handleEndFut = () => {
    setFutEnded(true);
    alert('Fut encerrado! Não é mais possível alterar os dados.');
  };

  const handleStartVoting = () => {
    setVotingOpen(true);
    // Initialize player votes
    const initialVotes: Record<string, number> = {};
    Object.values(teams).flat().forEach(playerId => {
      initialVotes[playerId] = 0;
    });
    setPlayerVotes(initialVotes);
  };

  const handleEndVoting = () => {
    setVotingEnded(true);
    setVotingOpen(false);
    alert('Votação encerrada!');
  };

  const handleVote = (playerId: string, rating: number) => {
    if (!user?.uid || !votingOpen) return;
    
    setUserVotes(prev => ({
      ...prev,
      [user.uid]: {
        ...prev[user.uid],
        [playerId]: rating
      }
    }));
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

  const handleFinalizeFut = () => {
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
                  <span className="text-white drop-shadow-lg shadow-black font-medium">{memberCount}/{fut.maxVagas} jogadores</span>
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
                  <span>{memberCount}/{fut.maxVagas} jogadores</span>
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
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          {memberData?.photoURL ? (
                            <Image
                              src={memberData.photoURL}
                              alt={memberData.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold text-xs">
                                {memberData?.name?.charAt(0).toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                        </div>
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
                  onClick={() => setFutStarted(true)}
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
                      <Image
                        src={memberData.photoURL}
                        alt={memberData.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
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
                          {Array.from({ length: Math.max(0, playersPerTeam - players.length) }).map((_, index) => (
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
                    onClick={handleGenerateRanking}
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
                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                  <span className="text-primary font-semibold text-xs">
                                    {player?.name?.charAt(0).toUpperCase() || 'C'}
                                  </span>
                                </div>
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
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleGenerateRanking('pontuacao')}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            rankingType === 'pontuacao' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Pontuação
                        </button>
                        <button 
                          onClick={() => handleGenerateRanking('artilharia')}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            rankingType === 'artilharia' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Artilharia
                        </button>
                        <button 
                          onClick={() => handleGenerateRanking('assistencias')}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            rankingType === 'assistencias' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Assistências
                        </button>
                        <button 
                          onClick={() => handleGenerateRanking('vitorias')}
                          className={`px-3 py-1 rounded text-xs font-medium ${
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
                                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                    <span className="text-primary font-semibold text-xs">
                                      {item.name?.charAt(0).toUpperCase() || 'C'}
                                    </span>
                                  </div>
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
                    
                    <div className="mt-4 flex justify-center">
                      <button 
                        onClick={() => {/* TODO: Generate image */}}
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
                                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                    <span className="text-primary font-semibold text-xs">
                                      {player?.name?.charAt(0).toUpperCase() || 'C'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-white text-sm font-medium">{player?.name || 'Convidado'}</span>
                                    {isGuest && (
                                      <span className="text-gray-400 text-xs ml-2">(Convidado)</span>
                                    )}
                                  </div>
                                </div>
                                
                                {!futEnded && (
                                  <div className="flex items-center space-x-6">
                                    {/* Goals */}
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-400 text-xs">Gols:</span>
                                      <button 
                                        onClick={() => handleUpdatePlayerStats(playerId, 'goals', -1)}
                                        className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="text-white text-sm min-w-[20px] text-center font-semibold">
                                        {playerStats[playerId]?.goals || 0}
                                      </span>
                                      <button 
                                        onClick={() => handleUpdatePlayerStats(playerId, 'goals', 1)}
                                        className="w-6 h-6 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                    
                                    {/* Assists */}
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-400 text-xs">Assist.:</span>
                                      <button 
                                        onClick={() => handleUpdatePlayerStats(playerId, 'assists', -1)}
                                        className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="text-white text-sm min-w-[20px] text-center font-semibold">
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
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearchUsers(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                      placeholder="Digite nome, email ou telefone"
                    />
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
                  onChange={(e) => setTeamCount(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Jogadores por Time
                </label>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
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
                  onChange={(e) => setTeamCount(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Jogadores por Time
                </label>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
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
                        const canAdd = teams[selectedTeam].length < playersPerTeam;
                        
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
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => {
                    setMemberSearchQuery(e.target.value);
                    handleSearchMembers(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite nome, email ou telefone"
                />
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