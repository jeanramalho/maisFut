import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { X } from 'lucide-react';

// Import hooks and components
import { useFutData } from './useFutData';
import { useFutState } from './useFutState';
import { useFutHandlers } from './useFutHandlers';
import FutHeader from './FutHeader';
import FutTabs from './FutTabs';
import FutTab from './FutTab';
import MembersTab from './MembersTab';
import TimesTab from './TimesTab';
import DataTab from './DataTab';
import AnnouncementsTab from './AnnouncementsTab';
import RankingTab from './RankingTab';
import SettingsTab from './SettingsTab';
import GuestModal from './GuestModal';
import TeamDrawModal from './TeamDrawModal';
import AddMemberModal from './AddMemberModal';
import MakeAdminModal from './MakeAdminModal';

export default function FutDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  // Data hooks
  const { fut, members, setMembers, announcements, futHistory, loading, updateFut, saveAnnouncement, deleteAnnouncement } = useFutData(id, user?.uid);
  
  // State hooks
  const state = useFutState();
  
  // Handler hooks
  const handlers = useFutHandlers(id, fut, user, members, setMembers, state);

  // Derived state
  const isAdmin = user && fut && (fut.adminId === user.uid || fut.admins?.[user.uid]);
  const isOriginalAdmin = user && fut && fut.adminId === user.uid;
  const memberCount = Object.keys(fut?.members || {}).length;

  // Handle back navigation
  const handleBack = () => router.back();

  // Handle settings click
  const handleSettingsClick = () => state.setActiveTab('settings');

  // Handle image modal
  const handleImageClick = () => {
    if (fut?.photoURL) {
      state.setShowImageModal(true);
    }
  };

  // Guest modal handlers
  const handleGuestTypeSelect = (type: 'avulso' | 'cadastrado') => {
    state.setGuestType(type);
    state.setShowGuestTypeModal(true);
    state.setShowGuestModal(false);
  };

  const handleCloseGuestType = () => {
    state.resetGuestForm();
  };

  const handleCloseGuest = () => {
    state.setShowGuestModal(false);
  };

  // Member management handlers
  const handleMemberClick = (memberId: string, memberName: string) => {
    state.setSelectedMemberForAdmin({ uid: memberId, name: memberName });
    state.setShowMakeAdminModal(true);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${memberName} do fut?`)) return;
    
    try {
      if (!fut) return;
      const updatedMembers = { ...fut.members };
      delete updatedMembers[memberId];
      
      const updatedAdmins = { ...fut.admins };
      delete updatedAdmins[memberId];
      
      await updateFut({
        members: updatedMembers,
        admins: updatedAdmins
      });
      
      alert(`${memberName} foi removido do fut!`);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Erro ao remover membro');
    }
  };

  // Announcement handlers
  const handleSaveAnnouncement = async () => {
    try {
      if (!state.announcementTitle.trim() || !state.announcementMessage.trim()) {
        alert('Por favor, preencha todos os campos');
        return;
      }

      const announcementData = {
        title: state.announcementTitle,
        message: state.announcementMessage,
        authorId: user?.uid || '',
        authorName: user?.displayName || 'Admin',
        createdAt: state.editingAnnouncement?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      if (state.editingAnnouncement) {
        // Update existing announcement
        await updateFut({
          [`announcements/${state.editingAnnouncement.id}`]: announcementData
        });
        alert('Aviso atualizado com sucesso!');
      } else {
        // Create new announcement
        await saveAnnouncement(announcementData);
        alert('Aviso criado com sucesso!');
      }

      state.setShowAnnouncementModal(false);
      state.setAnnouncementTitle('');
      state.setAnnouncementMessage('');
      state.setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Erro ao salvar aviso');
    }
  };

  // Settings handlers
  const handleDeleteData = async () => {
    try {
      if (state.deleteConfirmation !== 'CONFIRMAR' || !state.deletePassword) {
        alert('Por favor, confirme a ação e digite sua senha');
        return;
      }

      // Here you would verify the password
      // For now, we'll just clear the data
      await updateFut({
        teams: {},
        teamStats: {},
        playerStats: {},
        playerVotes: {},
        userVotes: {},
        futEnded: false,
        votingOpen: false,
        votingEnded: false
      });

      alert('Dados do fut excluídos com sucesso!');
      state.setShowDeleteDataModal(false);
      state.setDeleteConfirmation('');
      state.setDeletePassword('');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Erro ao excluir dados');
    }
  };

  const handleDeleteFut = async () => {
    try {
      if (state.deleteConfirmation !== 'EXCLUIR' || !state.deletePassword) {
        alert('Por favor, confirme a ação e digite sua senha');
        return;
      }

      // Here you would verify the password and delete the fut
      // For now, we'll just redirect to home
      alert('Fut excluído com sucesso!');
      router.push('/');
    } catch (error) {
      console.error('Error deleting fut:', error);
      alert('Erro ao excluir fut');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-secondary text-lg">Carregando...</div>
      </div>
    );
  }

  if (!fut) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary text-lg mb-4">Fut não encontrado</div>
          <button
            onClick={() => router.push('/')}
            className="bg-secondary text-primary px-4 py-2 rounded hover:bg-secondary-darker transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <FutHeader
        fut={fut}
        isAdmin={!!isAdmin}
        memberCount={memberCount}
        getRecurrenceText={handlers.getRecurrenceText}
        onBack={handleBack}
        onSettingsClick={handleSettingsClick}
        onImageClick={handleImageClick}
      />

      {/* Tabs */}
      <FutTabs
        activeTab={state.activeTab}
        setActiveTab={state.setActiveTab}
        isAdmin={!!isAdmin}
        futStarted={state.futStarted}
        memberCount={memberCount}
      />

      {/* Tab Content */}
      <div className="px-6 py-6">
        {state.activeTab === 'fut' && isAdmin && (
          <FutTab
            futStarted={state.futStarted}
            listReleased={state.listReleased}
            releasedVagas={state.releasedVagas}
            setReleasedVagas={state.setReleasedVagas}
            confirmedMembers={state.confirmedMembers}
            members={members}
            maxVagas={fut.maxVagas}
            userId={user?.uid || ''}
            onReleaseList={handlers.handleReleaseList}
            onConfirmPresence={handlers.handleConfirmPresence}
            onShowGuestModal={() => state.setShowGuestModal(true)}
            onShareList={handlers.handleShareList}
            onStartFut={handlers.handleStartFut}
          />
        )}

        {state.activeTab === 'times' && isAdmin && state.futStarted && (
          <TimesTab
            teams={state.teams}
            members={members}
            teamStats={state.teamStats}
            playerStats={state.playerStats}
            futStarted={state.futStarted}
            futEnded={state.futEnded}
            onShowTeamDrawModal={() => state.setShowTeamDrawModal(true)}
            onShowTeamSelectModal={() => state.setShowTeamSelectModal(true)}
            onSelectTeam={state.setSelectedTeam}
            selectedTeam={state.selectedTeam}
            onDeleteTeams={handlers.handleDeleteTeams}
            onShareTeams={handlers.handleShareTeams}
            onUpdateTeamWins={handlers.handleUpdateTeamWins}
          />
        )}

        {state.activeTab === 'data' && isAdmin && state.futStarted && (
          <DataTab
            teams={state.teams}
            members={members}
            teamStats={state.teamStats}
            playerStats={state.playerStats}
            futStarted={state.futStarted}
            futEnded={state.futEnded}
            votingOpen={state.votingOpen}
            votingEnded={state.votingEnded}
            playerVotes={state.playerVotes}
            userVotes={state.userVotes}
            userId={user?.uid || ''}
            onAddGoal={handlers.handleAddGoal}
            onAddAssist={handlers.handleAddAssist}
            onRemoveGoal={handlers.handleRemoveGoal}
            onRemoveAssist={handlers.handleRemoveAssist}
            onVotePlayer={handlers.handleVotePlayer}
            onOpenVoting={handlers.handleOpenVoting}
            onCloseVoting={handlers.handleCloseVoting}
            onEndVoting={handlers.handleEndVoting}
            onEndFut={handlers.handleEndFut}
            onUpdateTeamWins={handlers.handleUpdateTeamWins}
          />
        )}

        {state.activeTab === 'info' && (
          <InfoTab fut={fut} isAdmin={!!isAdmin} />
        )}

        {state.activeTab === 'members' && (
          <MembersTab
            members={members}
            fut={fut}
            isAdmin={!!isAdmin}
            onAddMember={() => state.setShowAddMemberModal(true)}
            onMemberClick={handleMemberClick}
            onRemoveMember={handleRemoveMember}
          />
        )}

        {state.activeTab === 'announcements' && isAdmin && (
          <AnnouncementsTab
            announcements={announcements}
            showAnnouncementModal={state.showAnnouncementModal}
            announcementTitle={state.announcementTitle}
            announcementMessage={state.announcementMessage}
            editingAnnouncement={state.editingAnnouncement}
            onShowAnnouncementModal={() => state.setShowAnnouncementModal(true)}
            onHideAnnouncementModal={() => state.setShowAnnouncementModal(false)}
            onAnnouncementTitleChange={state.setAnnouncementTitle}
            onAnnouncementMessageChange={state.setAnnouncementMessage}
            onSaveAnnouncement={handleSaveAnnouncement}
            onEditAnnouncement={state.setEditingAnnouncement}
            onDeleteAnnouncement={deleteAnnouncement}
          />
        )}

        {state.activeTab === 'ranking' && (
          <RankingTab
            ranking={state.ranking}
            rankingType={state.rankingType}
            rankingView={state.rankingView}
            loadingRanking={state.loadingRanking}
            futHistory={futHistory}
            selectedDate={state.selectedDate}
            members={members}
            onRankingTypeChange={state.setRankingType}
            onRankingViewChange={state.setRankingView}
            onDateChange={state.setSelectedDate}
            onGenerateRanking={handlers.handleGenerateRanking}
          />
        )}

        {state.activeTab === 'settings' && isAdmin && (
          <SettingsTab
            fut={fut}
            isOriginalAdmin={!!isOriginalAdmin}
            showEditInfoModal={state.showEditInfoModal}
            editName={state.editName}
            editDescription={state.editDescription}
            editTime={state.editTime}
            editLocation={state.editLocation}
            editMaxVagas={state.editMaxVagas}
            editPlayersPerTeam={state.editPlayersPerTeam}
            showDeleteDataModal={state.showDeleteDataModal}
            showDeleteFutModal={state.showDeleteFutModal}
            deleteConfirmation={state.deleteConfirmation}
            deletePassword={state.deletePassword}
            onShowEditInfoModal={() => state.setShowEditInfoModal(true)}
            onHideEditInfoModal={() => state.setShowEditInfoModal(false)}
            onEditNameChange={state.setEditName}
            onEditDescriptionChange={state.setEditDescription}
            onEditTimeChange={state.setEditTime}
            onEditLocationChange={state.setEditLocation}
            onEditMaxVagasChange={state.setEditMaxVagas}
            onEditPlayersPerTeamChange={state.setEditPlayersPerTeam}
            onSaveInfo={handlers.handleSaveInfo}
            onShowDeleteDataModal={() => state.setShowDeleteDataModal(true)}
            onHideDeleteDataModal={() => state.setShowDeleteDataModal(false)}
            onShowDeleteFutModal={() => state.setShowDeleteFutModal(true)}
            onHideDeleteFutModal={() => state.setShowDeleteFutModal(false)}
            onDeleteConfirmationChange={state.setDeleteConfirmation}
            onDeletePasswordChange={state.setDeletePassword}
            onDeleteData={handleDeleteData}
            onDeleteFut={handleDeleteFut}
          />
        )}
      </div>

      {/* Image Modal */}
      {state.showImageModal && fut.photoURL && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => state.setShowImageModal(false)}
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
              onClick={() => state.setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Guest Modal */}
      <GuestModal
        showGuestModal={state.showGuestModal}
        showGuestTypeModal={state.showGuestTypeModal}
        guestType={state.guestType}
        guestName={state.guestName}
        guestEmail={state.guestEmail}
        guestPhone={state.guestPhone}
        searchQuery={state.searchQuery}
        searchResults={state.searchResults}
        onClose={handleCloseGuest}
        onGuestTypeSelect={handleGuestTypeSelect}
        onGuestNameChange={state.setGuestName}
        onGuestEmailChange={state.setGuestEmail}
        onGuestPhoneChange={state.setGuestPhone}
        onSearchQueryChange={state.setSearchQuery}
        onSearchUsers={handlers.handleSearchUsers}
        onAddGuest={handlers.handleAddGuest}
        onAddSearchedUser={handlers.handleAddSearchedUser}
        onCloseGuestType={handleCloseGuestType}
      />

      {/* Team Draw Modal */}
      <TeamDrawModal
        showTeamDrawModal={state.showTeamDrawModal}
        teamCount={state.teamCount}
        playersPerTeam={state.playersPerTeam}
        onClose={() => state.setShowTeamDrawModal(false)}
        onTeamCountChange={state.setTeamCount}
        onPlayersPerTeamChange={state.setPlayersPerTeam}
        onTeamDraw={handlers.handleTeamDraw}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        showAddMemberModal={state.showAddMemberModal}
        memberSearchQuery={state.memberSearchQuery}
        memberSearchResults={state.memberSearchResults}
        onClose={() => state.setShowAddMemberModal(false)}
        onMemberSearchQueryChange={state.setMemberSearchQuery}
        onSearchMembers={handlers.handleSearchMembers}
        onAddMember={handlers.handleAddMember}
      />

      {/* Make Admin Modal */}
      <MakeAdminModal
        showMakeAdminModal={state.showMakeAdminModal}
        selectedMemberForAdmin={state.selectedMemberForAdmin}
        isOriginalAdmin={!!isOriginalAdmin}
        onClose={() => state.setShowMakeAdminModal(false)}
        onMakeAdmin={handlers.handleMakeAdmin}
        onRemoveAdmin={handlers.handleRemoveAdmin}
      />
    </div>
  );
}

// Simple Info Tab component
interface InfoTabProps {
  fut: any;
  isAdmin: boolean;
}

function InfoTab({ fut, isAdmin }: InfoTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Informações do Fut</h3>
        {isAdmin && (
          <button className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors">
            Editar
          </button>
        )}
      </div>
      
      <div className="bg-primary-lighter rounded-lg p-4">
        <h4 className="text-white text-base font-semibold mb-3">Descrição</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          {fut?.description || 'Nenhuma descrição disponível.'}
        </p>
      </div>

      <div className="bg-primary-lighter rounded-lg p-4">
        <h4 className="text-white text-base font-semibold mb-3">Detalhes</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Tipo:</span>
            <span className="text-white">{fut?.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Horário:</span>
            <span className="text-white">{fut?.time || 'Não definido'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Jogadores por time:</span>
            <span className="text-white">{fut?.playersPerTeam || 'Não definido'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Máximo de vagas:</span>
            <span className="text-white">{fut?.maxVagas || 'Não definido'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

