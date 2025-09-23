import { useState } from 'react';
import { ActiveTab } from './types';

export const useFutState = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('fut');

  // Fut state
  const [listReleased, setListReleased] = useState(false);
  const [releasedVagas, setReleasedVagas] = useState(0);
  const [confirmedMembers, setConfirmedMembers] = useState<string[]>([]);
  const [futStarted, setFutStarted] = useState(false);
  const [teams, setTeams] = useState<Record<string, string[]>>({});
  const [teamStats, setTeamStats] = useState<Record<string, { wins: number }>>({});
  const [playerStats, setPlayerStats] = useState<Record<string, { goals: number; assists: number }>>({});
  const [futEnded, setFutEnded] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingEnded, setVotingEnded] = useState(false);
  const [playerVotes, setPlayerVotes] = useState<any>({});
  const [userVotes, setUserVotes] = useState<any>({});
  const [showRanking, setShowRanking] = useState(false);

  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showGuestTypeModal, setShowGuestTypeModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [showTeamDrawModal, setShowTeamDrawModal] = useState(false);

  // Guest form states
  const [guestType, setGuestType] = useState<'avulso' | 'cadastrado' | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);

  // Team draw states
  const [teamCount, setTeamCount] = useState('');
  const [playersPerTeam, setPlayersPerTeam] = useState('');

  // Edit states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMaxVagas, setEditMaxVagas] = useState('');
  const [editPlayersPerTeam, setEditPlayersPerTeam] = useState('');

  // Member management states
  const [selectedMemberForAdmin, setSelectedMemberForAdmin] = useState<any>(null);

  // Announcement states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  // Settings states
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteFutModal, setShowDeleteFutModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Ranking states
  const [ranking, setRanking] = useState<any>(null);
  const [rankingType, setRankingType] = useState<'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias'>('pontuacao');
  const [rankingView, setRankingView] = useState<'geral' | 'rodada' | 'fut'>('geral');
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Team selection states
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Reset functions
  const resetGuestForm = () => {
    setGuestType(null);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setSearchQuery('');
    setSearchResults([]);
    setShowGuestTypeModal(false);
  };

  const resetSearchForm = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const resetMemberSearchForm = () => {
    setMemberSearchQuery('');
    setMemberSearchResults([]);
  };

  const resetEditInfoForm = () => {
    setEditName('');
    setEditDescription('');
    setEditTime('');
    setEditLocation('');
    setEditMaxVagas('');
    setEditPlayersPerTeam('');
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Fut state
    listReleased,
    setListReleased,
    releasedVagas,
    setReleasedVagas,
    confirmedMembers,
    setConfirmedMembers,
    futStarted,
    setFutStarted,
    teams,
    setTeams,
    teamStats,
    setTeamStats,
    playerStats,
    setPlayerStats,
    futEnded,
    setFutEnded,
    votingOpen,
    setVotingOpen,
    votingEnded,
    setVotingEnded,
    playerVotes,
    setPlayerVotes,
    userVotes,
    setUserVotes,
    showRanking,
    setShowRanking,

    // Modal states
    showImageModal,
    setShowImageModal,
    showGuestModal,
    setShowGuestModal,
    showGuestTypeModal,
    setShowGuestTypeModal,
    showAddMemberModal,
    setShowAddMemberModal,
    showMakeAdminModal,
    setShowMakeAdminModal,
    showTeamDrawModal,
    setShowTeamDrawModal,

    // Guest form states
    guestType,
    setGuestType,
    guestName,
    setGuestName,
    guestEmail,
    setGuestEmail,
    guestPhone,
    setGuestPhone,

    // Search states
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    memberSearchQuery,
    setMemberSearchQuery,
    memberSearchResults,
    setMemberSearchResults,

    // Team draw states
    teamCount,
    setTeamCount,
    playersPerTeam,
    setPlayersPerTeam,

    // Edit states
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editTime,
    setEditTime,
    editLocation,
    setEditLocation,
    editMaxVagas,
    setEditMaxVagas,
    editPlayersPerTeam,
    setEditPlayersPerTeam,

    // Member management states
    selectedMemberForAdmin,
    setSelectedMemberForAdmin,

    // Announcement states
    showAnnouncementModal,
    setShowAnnouncementModal,
    announcementTitle,
    setAnnouncementTitle,
    announcementMessage,
    setAnnouncementMessage,
    editingAnnouncement,
    setEditingAnnouncement,

    // Settings states
    showEditInfoModal,
    setShowEditInfoModal,
    showDeleteDataModal,
    setShowDeleteDataModal,
    showDeleteFutModal,
    setShowDeleteFutModal,
    deleteConfirmation,
    setDeleteConfirmation,
    deletePassword,
    setDeletePassword,

    // Ranking states
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

    // Team selection states
    showTeamSelectModal,
    setShowTeamSelectModal,
    selectedTeam,
    setSelectedTeam,

    // Reset functions
    resetGuestForm,
    resetSearchForm,
    resetMemberSearchForm,
    resetEditInfoForm
  };
};
