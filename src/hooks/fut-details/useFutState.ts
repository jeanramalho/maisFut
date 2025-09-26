import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue, get, set, push, remove } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { Fut, UserData, TabType, RankingType, RankingView } from './types';

export function useFutState() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  // Estados principais
  const [fut, setFut] = useState<Fut | null>(null);
  const [members, setMembers] = useState<Record<string, UserData>>({});
  const [activeTab, setActiveTab] = useState<TabType>('fut');
  const [loading, setLoading] = useState(true);

  // Estados de Modais
  const [showImageModal, setShowImageModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showGuestTypeModal, setShowGuestTypeModal] = useState(false);
  const [showTeamDrawModal, setShowTeamDrawModal] = useState(false);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteFutModal, setShowDeleteFutModal] = useState(false);
  const [showBolaCardsModal, setShowBolaCardsModal] = useState(false);

  // Estados do Fut (Fluxo Principal)
  const [listReleased, setListReleased] = useState(false);
  const [releasedVagas, setReleasedVagas] = useState(0);
  const [confirmedMembers, setConfirmedMembers] = useState<string[]>([]);
  const [futStarted, setFutStarted] = useState(false);
  const [futEnded, setFutEnded] = useState(false);

  // Estados de Convidados
  const [guestType, setGuestType] = useState<'avulso' | 'cadastrado' | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Estados de Busca
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);

  // Estados de Times
  const [teamCount, setTeamCount] = useState('');
  const [playersPerTeam, setPlayersPerTeam] = useState('');
  const [teams, setTeams] = useState<Record<string, string[]>>({});
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<Record<string, { wins: number }>>({});

  // Estados de Estatísticas dos Jogadores
  const [playerStats, setPlayerStats] = useState<Record<string, { goals: number; assists: number }>>({});

  // Estados de Votação
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingEnded, setVotingEnded] = useState(false);
  const [playerVotes, setPlayerVotes] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, number>>>({});

  // Estados de Ranking
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<any>(null);
  const [rankingType, setRankingType] = useState<RankingType>('pontuacao');
  const [rankingView, setRankingView] = useState<RankingView>('geral');
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Estados de Edição de Informações
  const [editDescription, setEditDescription] = useState('');
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMaxVagas, setEditMaxVagas] = useState('');
  const [editPlayersPerTeam, setEditPlayersPerTeam] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editPixKey, setEditPixKey] = useState('');
  const [editFutType, setEditFutType] = useState<'quadra' | 'campo'>('quadra');
  
  // Estado de modo de edição
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Estados de Avisos
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  // Estados de Administração
  const [selectedMemberForAdmin, setSelectedMemberForAdmin] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [futHistory, setFutHistory] = useState<any[]>([]);

  // Verificar se é admin
  const isAdmin = fut?.adminId === user?.uid || fut?.admins?.[user?.uid || ''];

  // Carregar dados do fut
  useEffect(() => {
    if (!id || !user) return;

    const futRef = ref(database, `futs/${id}`);
    const unsubscribe = onValue(futRef, async (snapshot) => {
      try {
        console.log('Firebase listener triggered - updating fut data');
        console.log('Snapshot data:', snapshot.val());
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
      if (futData.rankingType) {
        setRankingType(futData.rankingType);
      }

        // Members will be loaded separately by the members listener

        setLoading(false);
      } catch (error) {
        console.error('Error loading fut:', error);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [id, user, router]);

  // Carregar dados dos membros separadamente
  useEffect(() => {
    if (!id || !user) return;

    const membersRef = ref(database, `futs/${id}/members`);
    const unsubscribeMembers = onValue(membersRef, (snapshot) => {
      try {
        const membersData = snapshot.val() || {};
        console.log('Members listener triggered:', membersData);
        
        // For the members tab, we only want actual members, not guests
        console.log('Setting members from members listener (members only):', membersData);
        setMembers(membersData);
      } catch (error) {
        console.error('Error loading members:', error);
        setMembers({});
      }
    });

    return unsubscribeMembers;
  }, [id, user]);

  // Carregar anúncios
  const loadAnnouncements = async () => {
    if (!fut || !isAdmin) return;

    try {
      const announcementsRef = ref(database, `futs/${fut.id}/announcements`);
      const snapshot = await get(announcementsRef);
      const announcementsData = snapshot.val() || {};
      const announcementsList = Object.entries(announcementsData).map(([id, data]: [string, any]) => ({
        id,
        ...data,
      }));
      setAnnouncements(announcementsList);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  // Carregar histórico do fut
  const loadFutHistory = async () => {
    if (!fut || !isAdmin) return;

    try {
      const historyRef = ref(database, `futs/${fut.id}/history`);
      const snapshot = await get(historyRef);
      const historyData = snapshot.val() || {};
      const historyList = Object.entries(historyData).map(([id, data]: [string, any]) => ({
        id,
        ...data,
      }));
      setFutHistory(historyList);
    } catch (error) {
      console.error('Error loading fut history:', error);
    }
  };

  // Load additional data when fut is loaded
  useEffect(() => {
    if (fut && user) {
      loadAnnouncements();
      loadFutHistory();
    }
  }, [fut, user]);


  return {
    // Estados principais
    fut,
    setFut,
    members,
    setMembers,
    activeTab,
    setActiveTab,
    loading,
    isAdmin,

    // Estados de Modais
    showImageModal,
    setShowImageModal,
    showGuestModal,
    setShowGuestModal,
    showGuestTypeModal,
    setShowGuestTypeModal,
    showTeamDrawModal,
    setShowTeamDrawModal,
    showTeamSelectModal,
    setShowTeamSelectModal,
    showAddMemberModal,
    setShowAddMemberModal,
    showEditInfoModal,
    setShowEditInfoModal,
    showAnnouncementModal,
    setShowAnnouncementModal,
    showMakeAdminModal,
    setShowMakeAdminModal,
    selectedMemberForAdmin,
    setSelectedMemberForAdmin,
    deleteConfirmation,
    setDeleteConfirmation,
    deletePassword,
    setDeletePassword,
    futHistory,
    setFutHistory,
    showDeleteDataModal,
    setShowDeleteDataModal,
    showDeleteFutModal,
    setShowDeleteFutModal,
    showBolaCardsModal,
    setShowBolaCardsModal,

    // Estados do Fut
    listReleased,
    setListReleased,
    releasedVagas,
    setReleasedVagas,
    confirmedMembers,
    setConfirmedMembers,
    futStarted,
    setFutStarted,
    futEnded,
    setFutEnded,

    // Estados de Convidados
    guestType,
    setGuestType,
    guestName,
    setGuestName,
    guestEmail,
    setGuestEmail,
    guestPhone,
    setGuestPhone,

    // Estados de Busca
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    memberSearchQuery,
    setMemberSearchQuery,
    memberSearchResults,
    setMemberSearchResults,

    // Estados de Times
    teamCount,
    setTeamCount,
    playersPerTeam,
    setPlayersPerTeam,
    teams,
    setTeams,
    selectedTeam,
    setSelectedTeam,
    teamStats,
    setTeamStats,

    // Estados de Estatísticas
    playerStats,
    setPlayerStats,

    // Estados de Votação
    votingOpen,
    setVotingOpen,
    votingEnded,
    setVotingEnded,
    playerVotes,
    setPlayerVotes,
    userVotes,
    setUserVotes,

    // Estados de Ranking
    showRanking,
    setShowRanking,
    ranking,
    setRanking,
    rankingType,
    setRankingType,
    rankingView,
    setRankingView,
    selectedDate,
    setSelectedDate,
    loadingRanking,
    setLoadingRanking,

    // Estados de Convidado (modais) - já incluídos acima

    // Estados de Edição
    editDescription,
    setEditDescription,
    editName,
    setEditName,
    editTime,
    setEditTime,
    editLocation,
    setEditLocation,
    editMaxVagas,
    setEditMaxVagas,
    editPlayersPerTeam,
    setEditPlayersPerTeam,
    editValue,
    setEditValue,
    editPixKey,
    setEditPixKey,
    editFutType,
    setEditFutType,
    isEditingInfo,
    setIsEditingInfo,

    // Estados de Avisos
    announcements,
    setAnnouncements,
    announcementTitle,
    setAnnouncementTitle,
    announcementMessage,
    setAnnouncementMessage,
    editingAnnouncement,
    setEditingAnnouncement,

    // Estados de Administração - já incluídos acima

    // Funções
    loadAnnouncements,
    loadFutHistory,
  };
}
