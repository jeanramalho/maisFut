import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Settings, Users, Calendar, MapPin, Crown, X, ChevronLeft, ChevronRight, Copy, Edit, Save } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useFutState } from '@/hooks/fut-details/useFutState';
import { useFutActions } from '@/hooks/fut-details/useFutActions';
import { TabType } from '@/hooks/fut-details/types';
import Tabs from './components/Tabs';

export default function FutDetailPage() {
const router = useRouter();
const { id } = router.query;
  
  // Hook de estado
  const futState = useFutState();
  
  // Hook de ações
  const futActions = useFutActions(futState.fut, futState.isAdmin || false, futState);
  
  // Get user from auth context
  const { user } = useAuth();

  // Loading state
  if (futState.loading) {
return (
<div className="min-h-screen bg-primary flex items-center justify-center">
<div className="text-secondary text-lg">Carregando...</div>
</div>
);
}

  // Fut not found
  if (!futState.fut) {
    return null;
  }

  const memberCount = Object.entries(futState.members || {})
    .filter(([memberId, memberData]) => {
      // Exclude only avulso guests, but include cadastrado guests who became members
      if (memberData.isGuest && memberData.guestType === 'avulso') {
        return false; // Exclude avulso guests
      }
      return true; // Include everyone else (members and cadastrado guests)
    }).length;
  const isAdmin = futState.isAdmin || false;

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
                onClick={() => futState.setActiveTab('configuracoes')}
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
        {futState.fut.photoURL ? (
          <div 
            className="w-full h-64 bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url(${futState.fut.photoURL})` }}
            onClick={() => futState.setShowImageModal(true)}
          >
            {/* Blur overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
            
            {/* Fut Info over blur */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-white text-xl font-bold drop-shadow-lg shadow-black truncate">{futState.fut.name}</h2>
                {isAdmin && (
                  <Crown size={18} className="text-yellow-500 drop-shadow-lg shadow-black flex-shrink-0" />
                )}
              </div>
              
              {futState.fut.description && (
                <p className="text-white mb-3 text-sm drop-shadow-lg shadow-black font-medium line-clamp-2">{futState.fut.description}</p>
              )}

              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-white drop-shadow-lg shadow-black flex-shrink-0" />
                  <span className="text-white drop-shadow-lg shadow-black font-medium truncate">{futActions.getRecurrenceText()}</span>
                </div>
                
                {futState.fut.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} className="text-white drop-shadow-lg shadow-black flex-shrink-0" />
                    <span className="text-white drop-shadow-lg shadow-black font-medium truncate">{futState.fut.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Users size={14} className="text-white drop-shadow-lg shadow-black flex-shrink-0" />
                  <span className="text-white drop-shadow-lg shadow-black font-medium">{memberCount} membros</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-white drop-shadow-lg shadow-black flex-shrink-0" />
                  <span className="text-white drop-shadow-lg shadow-black font-medium">{futState.fut.maxVagas} vagas sugeridas</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-3 flex-wrap gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium drop-shadow-lg shadow-black ${
                  futState.fut.type === 'mensal' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-purple-600 text-white'
                }`}>
                  {futState.fut.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
                </span>
                
                {futState.fut.privacy === 'invite' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-600 text-white drop-shadow-lg shadow-black">
                    Privado
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-primary-lighter flex items-center justify-center px-4">
            <div className="text-center max-w-full">
              <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-3xl">
                  {futState.fut.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h2 className="text-white text-xl font-bold truncate">{futState.fut.name}</h2>
                {isAdmin && (
                  <Crown size={18} className="text-yellow-500 flex-shrink-0" />
                )}
              </div>
              
              {futState.fut.description && (
                <p className="text-gray-400 mb-3 text-sm line-clamp-2">{futState.fut.description}</p>
              )}

              <div className="flex items-center justify-center space-x-2 mt-3 flex-wrap gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  futState.fut.type === 'mensal' 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-purple-900 text-purple-300'
                }`}>
                  {futState.fut.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
                </span>
                
                {futState.fut.privacy === 'invite' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                    Privado
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs 
        activeTab={futState.activeTab} 
        setActiveTab={futState.setActiveTab} 
        isAdmin={isAdmin}
        votingOpen={futState.votingOpen}
        futStarted={futState.futStarted}
        confirmedMembers={futState.confirmedMembers}
        userUid={user?.uid}
        teams={futState.teams}
      />

      {/* Tab Content */}
      <div className="px-6 py-6">
        {/* Fut Tab - Admin */}
        {futState.activeTab === 'fut' && isAdmin && (
          <div className="space-y-4">
            {!futState.futStarted ? (
              <>
                {/* Next Game Section */}
                <div className="bg-primary-lighter rounded-lg p-3">
                  <h3 className="text-white text-base font-semibold mb-3">Próximo Fut - {futActions.getNextFutDate()}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={futState.fut?.maxVagas}
                        value={futState.releasedVagas || ''}
                        onChange={(e) => futState.setReleasedVagas(parseInt(e.target.value) || 0)}
                        className="flex-1 px-2 py-1 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary text-sm"
                        placeholder={`Vagas (padrão: ${futState.fut?.maxVagas || 0})`}
                      />
                      <button 
                        onClick={futActions.handleReleaseList}
                        disabled={futState.listReleased}
                        className="bg-secondary text-primary px-3 py-1 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {futState.listReleased ? 'Liberada' : 'Liberar'}
                      </button>
                    </div>
                    
                    {/* Action buttons for admin */}
                    {futState.listReleased && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => futActions.handleConfirmPresence(true)}
                          className={`flex-1 py-1 rounded text-sm font-medium transition-colors ${
                            futState.confirmedMembers.includes(user?.uid || '') 
                              ? 'bg-green-700 text-white' 
                              : 'bg-green-600 text-black hover:bg-green-700'
                          }`}
                        >
                          To Dentro
                        </button>
                        <button 
                          onClick={() => futActions.handleConfirmPresence(false)}
                          className={`flex-1 py-1 rounded text-sm font-medium transition-colors ${
                            !futState.confirmedMembers.includes(user?.uid || '') 
                              ? 'bg-red-700 text-white' 
                              : 'bg-red-600 text-black hover:bg-red-700'
                          }`}
                        >
                          To Fora
                        </button>
                        <button 
                          onClick={() => futState.setShowGuestModal(true)}
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
                <h3 className="text-white text-base font-semibold mb-3">Fut em Andamento - {futActions.getNextFutDate()}</h3>
                
                <div className="space-y-3">
                  <div className="text-gray-400 text-sm">
                    Vagas: {futState.releasedVagas}
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    Confirmados: {futState.confirmedMembers.length}
                  </div>
                </div>
              </div>
            )}

            {/* Confirmed List Section - Only show after list is released */}
            {futState.listReleased && (
              <div className="bg-primary-lighter rounded-lg p-3">
                <h3 className="text-white text-base font-semibold mb-3">Lista de Confirmados para o Fut - {futActions.getNextFutDate()}</h3>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Confirmados</span>
                    <span>{futState.confirmedMembers.length}/{futState.releasedVagas}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${Math.min((futState.confirmedMembers.length / futState.releasedVagas) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Confirmed Members List */}
                <div className="space-y-2">
                  {futState.confirmedMembers.map((memberId, index) => {
                    const memberData = futState.members[memberId];
                    return (
                      <div key={memberId} className="flex items-center justify-between bg-gray-800 rounded-lg p-2">
                        <div className="flex items-center space-x-2 flex-1">
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
                          <div className="flex flex-col">
                            <span className="text-white font-medium text-sm">{memberData?.name || 'VAGA'}</span>
                            {memberData?.isGuest && (
                              <span className="text-gray-400 text-xs">(Convidado)</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Remove from confirmed button - only for admins */}
                        {isAdmin && (
                          <button
                            onClick={() => futActions.handleRemoveFromConfirmed(memberId)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg text-xs transition-all duration-200 flex items-center space-x-1 shadow-sm hover:shadow-md"
                            title="Remover da lista de confirmados"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <button 
                  onClick={futActions.handleShareList}
                  className="w-full mt-3 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Compartilhar Lista
                </button>
              </div>
            )}

            {/* Start Fut Button */}
            {futState.listReleased && !futState.futStarted && (
              <div className="bg-primary-lighter rounded-lg p-3">
                <button 
                  onClick={futActions.handleStartFut}
                  className="w-full bg-yellow-600 text-white py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Iniciar Fut
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Tab */}
        {futState.activeTab === 'info' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Informações do Fut</h3>
              {isAdmin && (
                <button 
                  onClick={() => {
                    if (futState.isEditingInfo) {
                      // Salvar alterações
                      futActions.handleUpdateFutInfo();
                    } else {
                      // Entrar no modo de edição
                      futState.setEditName(futState.fut?.name || '');
                      futState.setEditDescription(futState.fut?.description || '');
                      futState.setEditTime(futState.fut?.time || '');
                      futState.setEditLocation(futState.fut?.location || '');
                      futState.setEditMaxVagas(futState.fut?.maxVagas?.toString() || '');
                      futState.setEditPlayersPerTeam(futState.fut?.playersPerTeam?.toString() || '');
                      futState.setEditValue(futState.fut?.value || '');
                      futState.setEditPixKey(futState.fut?.pixKey || '');
                      futState.setEditFutType(futState.fut?.futType || 'quadra');
                      futState.setIsEditingInfo(true);
                    }
                  }}
                  className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors flex items-center gap-2"
                >
                  {futState.isEditingInfo ? (
                    <>
                      <Save size={16} />
                      Salvar
                    </>
                  ) : (
                    <>
                      <Edit size={16} />
                      Editar
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Informações Básicas */}
            <div className="bg-primary-lighter rounded-lg p-4">
              <h4 className="text-white text-base font-semibold mb-3 flex items-center">
                <Settings size={18} className="mr-2" />
                Informações Básicas
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Nome:</span>
                  {futState.isEditingInfo ? (
                    <input
                      type="text"
                      value={futState.editName}
                      onChange={(e) => futState.setEditName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                      placeholder="Nome do fut"
                    />
                  ) : (
                    <p className="text-white font-medium">{futState.fut?.name || 'Não definido'}</p>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Tipo:</span>
                  <p className="text-white font-medium">
                    {futState.fut?.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Privacidade:</span>
                  <p className="text-white font-medium">
                    {futState.fut?.privacy === 'invite' ? 'Privado (por convite)' : 'Público'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Tipo de Fut:</span>
                  {futState.isEditingInfo ? (
                    <select
                      value={futState.editFutType}
                      onChange={(e) => futState.setEditFutType(e.target.value as 'quadra' | 'campo')}
                      className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                    >
                      <option value="quadra">Quadra</option>
                      <option value="campo">Campo</option>
                    </select>
                  ) : (
                    <p className="text-white font-medium">
                      {futState.fut?.futType === 'quadra' ? 'Quadra' : 
                       futState.fut?.futType === 'campo' ? 'Campo' : 'Não definido'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-primary-lighter rounded-lg p-4">
              <h4 className="text-white text-base font-semibold mb-3">Descrição</h4>
              {futState.isEditingInfo ? (
                <textarea
                  value={futState.editDescription}
                  onChange={(e) => futState.setEditDescription(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary resize-none"
                  rows={3}
                  placeholder="Descrição do fut"
                />
              ) : (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {futState.fut?.description || 'Nenhuma descrição disponível.'}
                </p>
              )}
            </div>

            {/* Detalhes do Jogo */}
            <div className="bg-primary-lighter rounded-lg p-4">
              <h4 className="text-white text-base font-semibold mb-3 flex items-center">
                <Calendar size={18} className="mr-2" />
                Detalhes do Jogo
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Horário:</span>
                  {futState.isEditingInfo ? (
                    <input
                      type="time"
                      value={futState.editTime}
                      onChange={(e) => futState.setEditTime(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                    />
                  ) : (
                    <p className="text-white font-medium">{futState.fut?.time || 'Não definido'}</p>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Local:</span>
                  {futState.isEditingInfo ? (
                    <input
                      type="text"
                      value={futState.editLocation}
                      onChange={(e) => futState.setEditLocation(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                      placeholder="Local do fut"
                    />
                  ) : (
                    <p className="text-white font-medium">{futState.fut?.location || 'Não definido'}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 text-sm">Jogadores por time:</span>
                    {futState.isEditingInfo ? (
                      <input
                        type="number"
                        value={futState.editPlayersPerTeam}
                        onChange={(e) => futState.setEditPlayersPerTeam(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                        placeholder="Ex: 5"
                        min="1"
                      />
                    ) : (
                      <p className="text-white font-medium">{futState.fut?.playersPerTeam || 'Não definido'}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Máximo de vagas:</span>
                    {futState.isEditingInfo ? (
                      <input
                        type="number"
                        value={futState.editMaxVagas}
                        onChange={(e) => futState.setEditMaxVagas(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                        placeholder="Ex: 20"
                        min="1"
                      />
                    ) : (
                      <p className="text-white font-medium">{futState.fut?.maxVagas || 'Não definido'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-primary-lighter rounded-lg p-4">
              <h4 className="text-white text-base font-semibold mb-3 flex items-center">
                <Crown size={18} className="mr-2" />
                Pagamento
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Valor:</span>
                  {futState.isEditingInfo ? (
                    <input
                      type="text"
                      value={futState.editValue}
                      onChange={(e) => futState.setEditValue(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                      placeholder="Ex: R$ 15,00"
                    />
                  ) : (
                    <p className="text-white font-medium">{futState.fut?.value || 'Não definido'}</p>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Chave PIX:</span>
                  {futState.isEditingInfo ? (
                    <input
                      type="text"
                      value={futState.editPixKey}
                      onChange={(e) => futState.setEditPixKey(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
                      placeholder="Chave PIX para pagamento"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-white font-medium flex-1">{futState.fut?.pixKey || 'Não definido'}</p>
                      {futState.fut?.pixKey && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(futState.fut?.pixKey || '');
                            alert('Chave PIX copiada!');
                          }}
                          className="p-2 bg-secondary text-primary rounded-lg hover:bg-secondary-darker transition-colors"
                          title="Copiar chave PIX"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recorrência */}
            {futState.fut?.type === 'mensal' && (
              <div className="bg-primary-lighter rounded-lg p-4">
                <h4 className="text-white text-base font-semibold mb-3 flex items-center">
                  <Calendar size={18} className="mr-2" />
                  Recorrência
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Frequência:</span>
                    <span className="text-white font-medium">{futActions.getRecurrenceText()}</span>
                  </div>
                  {futState.fut?.recurrence?.day !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dia:</span>
                      <span className="text-white font-medium">
                        {futState.fut.recurrence.kind === 'weekly' 
                          ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][futState.fut.recurrence.day]
                          : `Dia ${futState.fut.recurrence.day} do mês`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="bg-primary-lighter rounded-lg p-4">
              <h4 className="text-white text-base font-semibold mb-3 flex items-center">
                <Users size={18} className="mr-2" />
                Estatísticas
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Membros:</span>
                  <span className="text-white font-medium">{Object.keys(futState.members).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Administradores:</span>
                  <span className="text-white font-medium">
                    {Object.keys(futState.fut?.admins || {}).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Criado em:</span>
                  <span className="text-white font-medium">
                    {futState.fut?.createdAt ? new Date(futState.fut.createdAt).toLocaleDateString('pt-BR') : 'Não disponível'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fut Tab - Player */}
        {futState.activeTab === 'fut' && !isAdmin && (
          <div className="space-y-4">
            {!futState.futStarted ? (
              <>
                {/* Next Game Section */}
                <div className="bg-primary-lighter rounded-lg p-4">
                  <h3 className="text-white text-lg font-semibold mb-3">
                    Próximo Fut - {futActions.getNextFutDate()}
                  </h3>
                  
                  <div className="space-y-4">
                    {!futState.listReleased ? (
                      /* List not released yet */
                      <div className="text-center py-6">
                        <div className="text-gray-400 text-sm mb-2">
                          ⏳ Aguardando liberação da lista
                        </div>
                        <p className="text-gray-500 text-xs">
                          O administrador ainda não liberou a lista do fut
                        </p>
                      </div>
                    ) : (
                      /* List released - show confirmation buttons */
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-gray-300 text-sm mb-4">
                            A lista foi liberada! Confirme sua presença:
                          </p>
                          
                          {/* Check if slots are full */}
                          {futState.confirmedMembers && futState.confirmedMembers.length >= futState.releasedVagas ? (
                            <div className="text-center py-4">
                              <p className="text-red-400 text-sm mb-2">
                                ❌ Não há mais vagas disponíveis
                              </p>
                              <p className="text-gray-500 text-xs">
                                A lista está completa. Os botões aparecerão novamente se alguém desistir.
                              </p>
                            </div>
                          ) : (
                            <div className="flex space-x-3">
                              <button 
                                onClick={() => futActions.handleConfirmPresence(true)}
                                disabled={futState.confirmedMembers.includes(user?.uid || '')}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                                  futState.confirmedMembers.includes(user?.uid || '') 
                                    ? 'bg-green-700 text-white cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                Tô Dentro
                              </button>
                              <button 
                                onClick={() => futActions.handleConfirmPresence(false)}
                                disabled={!futState.confirmedMembers.includes(user?.uid || '')}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                                  !futState.confirmedMembers.includes(user?.uid || '') 
                                    ? 'bg-red-700 text-white cursor-not-allowed' 
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                              >
                                Tô Fora
                              </button>
                            </div>
                          )}
                          
                          {!futState.confirmedMembers.includes(user?.uid || '') && futState.confirmedMembers.length < futState.releasedVagas && (
                            <p className="text-gray-500 text-xs mt-2">
                              Até o próximo fut! 👋
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirmed List Section - Only show after list is released */}
                {futState.listReleased && (
                  <div className="bg-primary-lighter rounded-lg p-4">
                    <h3 className="text-white text-lg font-semibold mb-3">
                      Lista de Confirmados - {futActions.getNextFutDate()} ({futState.confirmedMembers.length}/{futState.releasedVagas})
                    </h3>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Confirmados</span>
                        <span>{futState.confirmedMembers.length}/{futState.releasedVagas}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((futState.confirmedMembers.length / futState.releasedVagas) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Confirmed Members List */}
                    <div className="space-y-2">
                      {futState.confirmedMembers.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">
                          Nenhum jogador confirmado ainda
                        </p>
                      ) : (
                        futState.confirmedMembers.map((memberId: string) => {
                          // Check if it's a guest first, then fallback to members
                          const memberData = futState.guests?.[memberId] || futState.members[memberId];
                          return (
                            <div key={memberId} className="flex items-center space-x-3 p-2 bg-primary rounded-lg">
                              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                {memberData?.photoURL ? (
                                  <Image
                                    src={memberData.photoURL}
                                    alt={memberData.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-primary font-bold text-sm">
                                    {memberData?.name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {memberData?.name || 'Jogador'}
                                </p>
                                {memberData?.isGuest && (
                                  <p className="text-gray-400 text-xs">(Convidado)</p>
                                )}
                              </div>
                              {memberId === user?.uid && (
                                <div className="text-xs text-secondary font-medium">
                                  Você
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Fut started - show read-only info */
              <div className="space-y-4">
                <div className="bg-primary-lighter rounded-lg p-4">
                  <h3 className="text-white text-lg font-semibold mb-3">
                    Fut em Andamento - {futActions.getNextFutDate()}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="text-gray-400 text-sm">
                      Vagas: {futState.releasedVagas}
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      Confirmados: {futState.confirmedMembers.length}
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      Status: {futState.futEnded ? 'Finalizado' : 'Em andamento'}
                    </div>
                  </div>
                </div>

                {/* Confirmed List Section - Show even after fut started */}
                <div className="bg-primary-lighter rounded-lg p-4">
                  <h3 className="text-white text-lg font-semibold mb-3">
                    Lista de Confirmados - {futActions.getNextFutDate()} ({futState.confirmedMembers.length}/{futState.releasedVagas})
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Confirmados</span>
                      <span>{futState.confirmedMembers.length}/{futState.releasedVagas}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((futState.confirmedMembers.length / futState.releasedVagas) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Confirmed Members List */}
                  <div className="space-y-2">
                    {futState.confirmedMembers.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">
                        Nenhum jogador confirmado ainda
                      </p>
                    ) : (
                      futState.confirmedMembers.map((memberId: string) => {
                        // Check if it's a guest first, then fallback to members
                        const memberData = futState.guests?.[memberId] || futState.members[memberId];
                        return (
                          <div key={memberId} className="flex items-center space-x-3 p-2 bg-primary rounded-lg">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                              {memberData?.photoURL ? (
                                <Image
                                  src={memberData.photoURL}
                                  alt={memberData.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-primary font-bold text-sm">
                                  {memberData?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {memberData?.name || 'Jogador'}
                              </p>
                              {memberData?.isGuest && (
                                <p className="text-gray-400 text-xs">(Convidado)</p>
                              )}
                            </div>
                            {memberId === user?.uid && (
                              <div className="text-xs text-secondary font-medium">
                                Você
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voting Tab - Player */}
        {futState.activeTab === 'voting' && !isAdmin && (
          <div className="space-y-4">
            <div className="bg-primary-lighter rounded-lg p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Votação - Avalie os Jogadores</h3>
              
              {futState.votingEnded ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm mb-2">
                    🗳️ Votação encerrada
                  </div>
                  <p className="text-gray-500 text-xs">
                    A votação foi encerrada pelo administrador. Você será redirecionado automaticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.values(futState.teams).flat()
                    .filter(playerId => {
                      if (playerId === 'VAGA') return false;
                      const player = futState.members[playerId];
                      const guest = futState.guests?.[playerId];
                      // Only members, not any type of guest (including cadastrado guests)
                      return !player?.isGuest && !guest?.isGuest;
                    })
                    .map((playerId) => {
                      const player = futState.members[playerId];
                      const currentVote = futState.userVotes[user?.uid || '']?.[playerId] || 0;
                      
                      return (
                        <div key={playerId} className="bg-primary p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
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
                              <div className="min-w-0 flex-1">
                                <span className="text-white text-sm font-medium truncate block">{player?.name || 'VAGA'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-0.5 ml-2 flex-shrink-0">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => futActions.handleVote(playerId, star)}
                                  className={`w-6 h-6 rounded text-sm ${
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
              )}
            </div>
          </div>
        )}

        {/* Times Tab - Player */}
        {futState.activeTab === 'times' && !isAdmin && futState.futStarted && (
          <div className="space-y-4">
            <div className="bg-primary-lighter rounded-lg p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Times do Fut</h3>
              
              {Object.keys(futState.teams).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm mb-2">
                    ⚽ Times ainda não foram escolhidos
                  </div>
                  <p className="text-gray-500 text-xs">
                    O administrador ainda não definiu os times para este fut
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(futState.teams).map(([teamName, players]) => (
                    <div key={teamName} className="bg-primary rounded-lg p-4">
                      <h4 className="text-white text-base font-semibold mb-3 flex items-center">
                        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mr-2">
                          <span className="text-primary font-bold text-xs">
                            {teamName.charAt(teamName.length - 1)}
                          </span>
                        </div>
                        {teamName}
                      </h4>
                      
                      <div className="space-y-2">
                        {(players as string[]).map((playerId: string, index: number) => {
                          const player = futState.members[playerId];
                          const guest = futState.guests?.[playerId];
                          const memberData = guest || player;
                          
                          return (
                            <div key={playerId} className="flex items-center space-x-3 p-2 bg-primary-lighter rounded-lg">
                              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                {memberData?.photoURL ? (
                                  <Image
                                    src={memberData.photoURL}
                                    alt={memberData.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <span className="text-primary font-bold text-xs">
                                    {memberData?.name?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {memberData?.name || 'VAGA'}
                                </p>
                                {memberData?.isGuest && (
                                  <p className="text-gray-400 text-xs">(Convidado)</p>
                                )}
                              </div>
                              {playerId === user?.uid && (
                                <div className="text-xs text-secondary font-medium">
                                  Você
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {futState.activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Membros</h3>
              {isAdmin && (
                <button 
                  onClick={() => futState.setShowAddMemberModal(true)}
                  className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors"
                >
                  Adicionar Membro
                </button>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(futState.members)
                .filter(([memberId, memberData]) => {
                  // Exclude only avulso guests, but include cadastrado guests who became members
                  if (memberData.isGuest && memberData.guestType === 'avulso') {
                    return false; // Exclude avulso guests
                  }
                  return true; // Include everyone else (members and cadastrado guests)
                })
                .sort(([memberIdA, memberDataA], [memberIdB, memberDataB]) => {
                  // Admin criador (adminId) sempre primeiro
                  if (memberIdA === futState.fut?.adminId) return -1;
                  if (memberIdB === futState.fut?.adminId) return 1;
                  
                  // Outros admins em seguida
                  const isAdminA = futState.fut?.admins?.[memberIdA];
                  const isAdminB = futState.fut?.admins?.[memberIdB];
                  
                  if (isAdminA && !isAdminB) return -1;
                  if (!isAdminA && isAdminB) return 1;
                  
                  // Resto por ordem alfabética
                  return memberDataA.name?.localeCompare(memberDataB.name || '') || 0;
                })
                .map(([memberId, memberData]) => (
                  <div
                    key={memberId}
                    className={`bg-primary-lighter rounded-lg p-4 border border-gray-700 ${
                      isAdmin ? 'cursor-pointer hover:bg-primary hover:border-gray-600 transition-colors' : ''
                    }`}
                    onClick={() => {
                      if (isAdmin) {
                        futState.setSelectedMemberForAdmin({ uid: memberId, name: memberData.name });
                        futState.setShowMakeAdminModal(true);
                      }
                    }}
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
                          {memberId === futState.fut?.adminId && (
                            <Crown size={16} className="text-yellow-500" />
                          )}
                          {memberId !== futState.fut?.adminId && futState.fut?.admins?.[memberId] && (
                            <Crown size={16} className="text-green-500" />
                          )}
                        </div>
                        {memberData.position && (
                          <p className="text-gray-400 text-sm">{memberData.position}</p>
                        )}
                      </div>

                      {/* Member actions */}
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              futActions.handleRemoveMember(memberId, memberData.name);
                            }}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Ranking Tab */}
        {futState.activeTab === 'ranking' && isAdmin && (
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Rankings</h3>
            
            {/* View Selector */}
            <div className="flex space-x-2">
              <button
                onClick={() => futState.setRankingView('geral')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  futState.rankingView === 'geral'
                    ? 'bg-secondary text-primary'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Geral
              </button>
              <button
                onClick={() => futState.setRankingView('rodada')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  futState.rankingView === 'rodada'
                    ? 'bg-secondary text-primary'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Rodada
              </button>
              <button
                onClick={() => futState.setRankingView('fut')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  futState.rankingView === 'fut'
                    ? 'bg-secondary text-primary'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Por Fut
              </button>
            </div>

            {/* Ranking Type Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => futActions.handleGenerateRanking('pontuacao')}
                className={`px-3 py-2 rounded text-sm font-medium text-center ${
                  futState.rankingType === 'pontuacao'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Pontuação
              </button>
              <button
                onClick={() => futActions.handleGenerateRanking('artilharia')}
                className={`px-3 py-2 rounded text-sm font-medium text-center ${
                  futState.rankingType === 'artilharia'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Artilharia
              </button>
              <button
                onClick={() => futActions.handleGenerateRanking('assistencias')}
                className={`px-3 py-2 rounded text-sm font-medium text-center ${
                  futState.rankingType === 'assistencias'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Assistências
              </button>
              <button
                onClick={() => futActions.handleGenerateRanking('vitorias')}
                className={`px-3 py-2 rounded text-sm font-medium text-center ${
                  futState.rankingType === 'vitorias'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Vitórias
              </button>
            </div>

            {/* Fut History Selector (only for "Por Fut" view) */}
            {futState.rankingView === 'fut' && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Selecionar Fut:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {futState.futHistory.map((futData) => (
                    <button
                      key={futData.id}
                      onClick={() => {
                        futState.setSelectedDate(futData.id);
                        futActions.handleGenerateRanking(futState.rankingType);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        futState.selectedDate === futData.id
                          ? 'bg-secondary text-primary border-secondary'
                          : 'bg-primary-lighter text-white border-gray-600 hover:bg-primary'
                      }`}
                    >
                      <div className="font-medium">{futData.name || 'Fut'}</div>
                      <div className="text-sm opacity-75">
                        {new Date(futData.date).toLocaleDateString('pt-BR')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ranking Display */}
            {futState.ranking && futState.ranking.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">
                    {futState.rankingView === 'geral' ? 'Ranking Geral' : 
                     futState.rankingView === 'rodada' ? 'Ranking da Rodada' : 
                     'Ranking do Fut'}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={futActions.handleGenerateImage}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Gerar Imagem
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {futState.ranking.slice(0, 10).map((item: any, index: number) => {
                    const position = index + 1;
                    const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';
                    
                    return (
                      <div key={item.playerId} className="bg-primary-lighter rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{medal}</div>
                          <div>
                            <div className="text-white font-medium">{item.name}</div>
                            <div className="text-gray-400 text-sm">#{position}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-lg">
                            {futState.rankingType === 'pontuacao' ? item.score :
                             futState.rankingType === 'artilharia' ? item.goals :
                             futState.rankingType === 'assistencias' ? item.assists :
                             item.wins}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {futState.rankingType === 'pontuacao' ? 'pts' :
                             futState.rankingType === 'artilharia' ? 'gols' :
                             futState.rankingType === 'assistencias' ? 'assist' :
                             'vitórias'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Times Tab */}
        {futState.activeTab === 'times' && isAdmin && futState.futStarted && (
          <div className="space-y-4">
            {Object.keys(futState.teams).length === 0 ? (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => futState.setShowTeamDrawModal(true)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sorteio de Times
                  </button>
                  <button 
                    onClick={() => futState.setShowTeamSelectModal(true)}
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
                    onClick={futActions.handleDeleteTeams}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Apagar Times
                  </button>
                  <button 
                    onClick={futActions.handleShareTeams}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Compartilhar Times
                  </button>
                </div>
                
                <div className="bg-primary-lighter rounded-lg p-3">
                  <h3 className="text-white text-base font-semibold mb-3">TIMES:</h3>
                  <div className="space-y-4">
                    {Object.entries(futState.teams).map(([teamName, players]) => (
                      <div key={teamName} className="space-y-2">
                        <h4 className="text-secondary font-semibold">{teamName}</h4>
                        <div className="space-y-1">
                          {players.map((playerId, index) => {
                            const player = futState.members[playerId];
                            return (
                              <div key={playerId} className="text-white text-sm">
                                {index + 1}- {player?.name || 'VAGA'}
                              </div>
                            );
                          })}
                          {/* Add VAGA if team is not full */}
                          {Array.from({ length: Math.max(0, parseInt(futState.playersPerTeam || futState.fut?.playersPerTeam?.toString() || '5') - players.length) }).map((_, index) => (
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

        {/* Data Tab */}
        {futState.activeTab === 'data' && isAdmin && futState.futStarted && (
          <div className="space-y-4">
            {Object.keys(futState.teams).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Os times ainda não foram escolhidos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!futState.futEnded && (
                  <button 
                    onClick={futActions.handleEndFut}
                    className="w-full bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Encerrar Fut
                  </button>
                )}

                {futState.futEnded && !futState.votingOpen && !futState.votingEnded && (
                  <button 
                    onClick={futActions.handleStartVoting}
                    className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Liberar Votação
                  </button>
                )}

                {futState.votingOpen && (
                  <button 
                    onClick={futActions.handleEndVoting}
                    className="w-full bg-yellow-600 text-white py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                  >
                    Encerrar Votação
                  </button>
                )}

                {futState.votingEnded && !futState.showRanking && (
                  <button 
                    onClick={() => futActions.handleGenerateRanking('pontuacao')}
                    className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Gerar Ranking
                  </button>
                )}

                {futState.showRanking && (
                  <button 
                    onClick={futActions.handleFinalizeFut}
                    className="w-full bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Finalizar Fut
                  </button>
                )}

                {/* Voting Section */}
                {futState.votingOpen && (
                  <div className="bg-primary-lighter rounded-lg p-4">
                    <h3 className="text-white text-lg font-semibold mb-4">Votação - Avalie os Jogadores</h3>
                    <div className="space-y-4">
                      {Object.values(futState.teams).flat()
                        .filter(playerId => {
                          if (playerId === 'VAGA') return false;
                          const player = futState.members[playerId];
                          // Only members, not any type of guest
                          return !player?.isGuest;
                        })
                        .map((playerId) => {
                        const player = futState.members[playerId];
                        const currentVote = futState.userVotes[user?.uid || '']?.[playerId] || 0;
                        
                        return (
                          <div key={playerId} className="bg-primary p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
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
                                <div className="min-w-0 flex-1">
                                  <span className="text-white text-sm font-medium truncate block">{player?.name || 'VAGA'}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-0.5 ml-2 flex-shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => futActions.handleVote(playerId, star)}
                                    className={`w-6 h-6 rounded text-sm ${
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
                {futState.showRanking && futState.ranking && (
                  <div className="bg-primary-lighter rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-semibold">
                        {futState.rankingType === 'pontuacao' ? 'Ranking de Pontuação' :
                         futState.rankingType === 'artilharia' ? 'Ranking de Artilharia' :
                         futState.rankingType === 'assistencias' ? 'Ranking de Assistências' :
                         'Ranking de Vitórias'}
                      </h3>
                      <div className="grid grid-cols-2 gap-1">
                        <button 
                          onClick={() => futActions.handleGenerateRanking('pontuacao')}
                          className={`px-2 py-1.5 rounded text-xs font-medium text-center truncate ${
                            futState.rankingType === 'pontuacao' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Pontuação
                        </button>
                        <button 
                          onClick={() => futActions.handleGenerateRanking('artilharia')}
                          className={`px-2 py-1.5 rounded text-xs font-medium text-center truncate ${
                            futState.rankingType === 'artilharia' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Artilharia
                        </button>
                        <button 
                          onClick={() => futActions.handleGenerateRanking('assistencias')}
                          className={`px-2 py-1.5 rounded text-xs font-medium text-center truncate ${
                            futState.rankingType === 'assistencias' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Assistências
                        </button>
                        <button 
                          onClick={() => futActions.handleGenerateRanking('vitorias')}
                          className={`px-2 py-1.5 rounded text-xs font-medium text-center truncate ${
                            futState.rankingType === 'vitorias' ? 'bg-secondary text-primary' : 'bg-gray-600 text-white'
                          }`}
                        >
                          Vitórias
                        </button>
                      </div>
                    </div>
                    
                    
                    <div className="space-y-3">
                      {futState.ranking.slice(0, 3).map((item: any, index: number) => (
                        <div key={item.playerId || item.teamName} className="bg-primary p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-4xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </div>
                              {futState.rankingType === 'vitorias' ? (
                                <div>
                                  <div className="text-white text-sm font-medium">{item.teamName}</div>
                                  <div className="text-gray-400 text-xs">
                                    {item.wins} vitórias
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {futState.members[item.playerId]?.photoURL ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      <Image
                                        src={futState.members[item.playerId]?.photoURL || ''}
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
                                      {futState.rankingType === 'pontuacao' ? `${item.score} pts` :
                                       futState.rankingType === 'artilharia' ? `${item.goals} gols` :
                                       `${item.assists} assistências`}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="text-secondary font-semibold text-lg">
                                {futState.rankingType === 'pontuacao' ? item.score :
                                 futState.rankingType === 'artilharia' ? item.goals :
                                 futState.rankingType === 'assistencias' ? item.assists :
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
                        onClick={futActions.handleGenerateImage}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Gerar Imagem
                      </button>
                      <button 
                        onClick={() => futState.setShowBolaCardsModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        Gerar Bola Cheia e Bola Murcha
                      </button>
                    </div>
                  </div>
                )}

                
                <div className="space-y-6">
                  {Object.entries(futState.teams).map(([teamName, players], teamIndex) => (
                    <div key={teamName} className="bg-primary-lighter rounded-lg p-4">
                      {/* Team Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
                        <h3 className="text-white font-semibold text-lg">{teamName}</h3>
                        {!futState.futEnded && (
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400 text-sm">Vitórias:</span>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => futActions.handleUpdateTeamWins(teamName, -1)}
                                className="w-7 h-7 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition-colors"
                              >
                                -
                              </button>
                              <span className="text-white font-semibold min-w-[25px] text-center text-lg">
                                {futState.teamStats[teamName]?.wins || 0}
                              </span>
                              <button 
                                onClick={() => futActions.handleUpdateTeamWins(teamName, 1)}
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
                          .filter(playerId => {
                            if (playerId === 'VAGA') return false;
                            const player = futState.members[playerId];
                            // Allow members and registered guests, but not avulso guests
                            return !player?.isGuest || player?.guestType === 'cadastrado';
                          })
                          .map((playerId) => {
                          const player = futState.members[playerId];
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
                                    <span className="text-white text-sm font-medium">{player?.name || 'VAGA'}</span>
                                    {player?.isGuest && (
                                      <span className="text-gray-400 text-xs ml-2">(Convidado)</span>
                                    )}
                                  </div>
                                </div>
                                
                                {!futState.futEnded && (
                                  <div className="space-y-4">
                                    {/* Goals */}
                                    <div className="flex flex-col items-center space-y-2">
                                      <span className="text-gray-400 text-sm font-medium">Gols:</span>
                                      <div className="flex items-center space-x-2">
                                        <button 
                                          onClick={() => futActions.handleUpdatePlayerStats(playerId, 'goals', -1)}
                                          className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                        >
                                          -
                                        </button>
                                        <span className="text-white text-lg min-w-[20px] text-center font-semibold">
                                          {futState.playerStats[playerId]?.goals || 0}
                                        </span>
                                        <button 
                                          onClick={() => futActions.handleUpdatePlayerStats(playerId, 'goals', 1)}
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
                                          onClick={() => futActions.handleUpdatePlayerStats(playerId, 'assists', -1)}
                                          className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                        >
                                          -
                                        </button>
                                        <span className="text-white text-lg min-w-[20px] text-center font-semibold">
                                          {futState.playerStats[playerId]?.assists || 0}
                                        </span>
                                        <button 
                                          onClick={() => futActions.handleUpdatePlayerStats(playerId, 'assists', 1)}
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {futState.activeTab === 'avisos' && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Avisos</h3>
              <button 
                onClick={() => {
                  futState.setEditingAnnouncement(null);
                  futState.setAnnouncementTitle('');
                  futState.setAnnouncementMessage('');
                  futState.setShowAnnouncementModal(true);
                }}
                className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors"
              >
                Novo Aviso
              </button>
            </div>
            
            <div className="space-y-3">
              {futState.announcements.length === 0 ? (
                <div className="bg-primary-lighter rounded-lg p-6 text-center">
                  <p className="text-gray-400">Nenhum aviso ainda.</p>
                </div>
              ) : (
                futState.announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-primary-lighter rounded-lg p-4 cursor-pointer hover:bg-primary-darker transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold text-base">{announcement.title}</h4>
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              futState.setEditingAnnouncement(announcement);
                              futState.setAnnouncementTitle(announcement.title);
                              futState.setAnnouncementMessage(announcement.message);
                              futState.setShowAnnouncementModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              futActions.handleDeleteAnnouncement(announcement.id);
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                    <div 
                      onClick={() => {
                        futState.setSelectedAnnouncement(announcement);
                        futState.setShowAnnouncementViewModal(true);
                      }}
                    >
                      <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                        {announcement.message.length > 150 
                          ? `${announcement.message.substring(0, 150)}...` 
                          : announcement.message
                        }
                      </p>
                      <div className="text-xs text-gray-500">
                        Por {announcement.authorName} • {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {futState.activeTab === 'configuracoes' && isAdmin && (
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Configurações</h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => {
                  futState.setEditName(futState.fut?.name || '');
                  futState.setEditDescription(futState.fut?.description || '');
                  futState.setEditTime(futState.fut?.time || '');
                  futState.setEditLocation(futState.fut?.location || '');
                  futState.setEditMaxVagas(futState.fut?.maxVagas?.toString() || '');
                  futState.setEditPlayersPerTeam(futState.fut?.playersPerTeam?.toString() || '');
                  futState.setShowEditInfoModal(true);
                }}
                className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors"
              >
                Editar Informações do Fut
              </button>
              
              <button 
                onClick={() => futState.setActiveTab('members')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Gerenciar Membros
              </button>
              
              <button 
                onClick={() => futState.setActiveTab('avisos')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Gerenciar Avisos
              </button>
              
              <div className="pt-4 border-t border-gray-700">
                <button 
                  onClick={() => futState.setShowDeleteDataModal(true)}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Excluir Dados do Fut
                </button>
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={() => futState.setShowDeleteFutModal(true)}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Excluir Fut
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {futState.showImageModal && futState.fut.photoURL && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full p-4">
            <div className="relative">
              <img
                src={futState.fut.photoURL}
                alt={futState.fut.name}
                className="w-full rounded-lg"
              />
              <button
                onClick={() => futState.setShowImageModal(false)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Draw Modal */}
      {futState.showTeamDrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Sorteio de Times</h2>
              <button
                onClick={() => futState.setShowTeamDrawModal(false)}
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
                  value={futState.teamCount}
                  onChange={(e) => futState.setTeamCount(e.target.value)}
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
                  value={futState.playersPerTeam}
                  onChange={(e) => futState.setPlayersPerTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Ex: 5"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => futState.setShowTeamDrawModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={futActions.handleTeamDraw}
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
      {futState.showTeamSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Escolher Times</h2>
              <button
                onClick={() => futState.setShowTeamSelectModal(false)}
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
                  value={futState.teamCount}
                  onChange={(e) => futState.setTeamCount(e.target.value)}
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
                  value={futState.playersPerTeam}
                  onChange={(e) => futState.setPlayersPerTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Ex: 5"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => futState.setShowTeamSelectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={futActions.handleTeamSelect}
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
      {futState.selectedTeam && Object.keys(futState.teams).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Selecionar Times</h2>
              <button
                onClick={() => {
                  futState.setSelectedTeam(null);
                  futActions.handleSaveTeams();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Team Filters */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(futState.teams).map(teamName => (
                  <button
                    key={teamName}
                    onClick={() => futState.setSelectedTeam(teamName)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      futState.selectedTeam === teamName
                        ? 'bg-secondary text-primary'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {teamName} ({futState.teams[teamName].length}/{futState.playersPerTeam})
                  </button>
                ))}
              </div>

              {/* Selected Team */}
              {futState.selectedTeam && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">{futState.selectedTeam}</h3>
                  
                  {/* Team Members */}
                  <div className="space-y-2">
                    {futState.teams[futState.selectedTeam].map((playerId, index) => {
                      const player = futState.members[playerId];
                      return (
                        <div key={playerId} className="flex items-center justify-between bg-primary p-2 rounded">
                          <span className="text-white text-sm">
                            {index + 1}- {player?.name || 'Convidado'}
                          </span>
                          <button
                            onClick={() => futActions.handleRemovePlayerFromTeam(playerId, futState.selectedTeam!)}
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
                    {futState.confirmedMembers
                      .filter(playerId => !Object.values(futState.teams).flat().includes(playerId))
                      .map(playerId => {
                        const player = futState.members[playerId];
                        const canAdd = futState.selectedTeam ? futState.teams[futState.selectedTeam].length < parseInt(futState.playersPerTeam || futState.fut?.playersPerTeam?.toString() || '5') : false;
                        
                        return (
                          <div key={playerId} className="flex items-center justify-between bg-primary p-2 rounded">
                            <span className="text-white text-sm">{player?.name || 'VAGA'}</span>
                            {canAdd && (
                              <button
                                onClick={() => futActions.handleAddPlayerToTeam(playerId, futState.selectedTeam!)}
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

            {/* Save Button */}
            <div className="p-4 border-t border-gray-600">
              <button
                onClick={() => {
                  futActions.handleSaveTeams();
                  futState.setSelectedTeam(null);
                }}
                className="w-full px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
              >
                Salvar Times
              </button>
            </div>
</div>
</div>
)}

{/* Guest Modal */}
{futState.showGuestModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-primary-lighter rounded-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h2 className="text-white text-xl font-semibold">Adicionar Convidado</h2>
        <button
          onClick={() => futState.setShowGuestModal(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <button 
            onClick={() => futActions.handleGuestTypeSelect('avulso')}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Convidado Avulso (Apenas Nome)
          </button>
          <button 
            onClick={() => futActions.handleGuestTypeSelect('cadastrado')}
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
{futState.showGuestTypeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-primary-lighter rounded-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h2 className="text-white text-xl font-semibold">
          {futState.guestType === 'avulso' ? 'Convidado Avulso' : 'Convidado Cadastrado'}
        </h2>
        <button
          onClick={() => {
            futState.setShowGuestTypeModal(false);
            futState.setGuestType(null);
            futState.setGuestName('');
            futState.setGuestEmail('');
            futState.setGuestPhone('');
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {futState.guestType === 'avulso' ? (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Nome do Convidado
            </label>
            <input
              type="text"
              value={futState.guestName}
              onChange={(e) => futState.setGuestName(e.target.value)}
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
                  value={futState.searchQuery}
                  onChange={(e) => futState.setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite email ou telefone"
                />
                <button
                  onClick={futActions.handleSearchUsers}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
            
            {/* Search Results */}
            {futState.searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {futState.searchResults.map((user) => (
                  <div key={user.uid} className="flex items-center justify-between bg-primary p-2 rounded">
                    <div>
                      <div className="text-white text-sm font-medium">{user.name}</div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                      {user.phone && (
                        <div className="text-gray-400 text-xs">{user.phone}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (futState.guestType === 'cadastrado') {
                          futActions.handleAddRegisteredGuest(user);
                        } else {
                          futActions.handleAddSearchedUser(user);
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      {futState.guestType === 'cadastrado' ? 'Adicionar como Convidado' : 'Adicionar como Membro'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {futState.searchQuery && futState.searchResults.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-2">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => {
              futState.setShowGuestTypeModal(false);
              futState.setGuestType(null);
              futState.setGuestName('');
              futState.setGuestEmail('');
              futState.setGuestPhone('');
            }}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (futState.guestType === 'avulso') {
                futActions.handleAddGuest();
              } else if (futState.guestType === 'cadastrado') {
                // Para convidados cadastrados, focar no campo de busca
                const searchInput = document.querySelector('input[placeholder="Digite email ou telefone"]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                }
              }
            }}
            className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
          >
            {futState.guestType === 'avulso' ? 'Adicionar' : 'Focar Busca'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Add Member Modal */}
      {futState.showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Adicionar Membro</h2>
              <button
                onClick={() => {
                  futState.setShowAddMemberModal(false);
                  futState.setMemberSearchQuery('');
                  futState.setMemberSearchResults([]);
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
                    value={futState.memberSearchQuery}
                    onChange={(e) => futState.setMemberSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                    placeholder="Digite email ou telefone"
                  />
                  <button
                    onClick={futActions.handleSearchMembers}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Buscar
                  </button>
                </div>
              </div>
              
              {/* Search Results */}
              {futState.memberSearchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {futState.memberSearchResults.map((user, index) => (
                    <div key={user.id || `user-${index}`} className="flex items-center justify-between bg-primary p-2 rounded">
                      <div>
                        <div className="text-white text-sm font-medium">{user.name}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                        {user.phone && (
                          <div className="text-gray-400 text-xs">{user.phone}</div>
                        )}
                      </div>
                      <button
                        onClick={() => futActions.handleAddMember(user)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {futState.memberSearchQuery && futState.memberSearchResults.length === 0 && (
                <div className="text-gray-400 text-sm text-center py-2">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-600 flex space-x-3">
              <button
                onClick={() => {
                  futState.setShowAddMemberModal(false);
                  futState.setMemberSearchQuery('');
                  futState.setMemberSearchResults([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Make Admin Modal */}
      {futState.showMakeAdminModal && futState.selectedMemberForAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">
                {futState.fut?.admins?.[futState.selectedMemberForAdmin.uid] ? 'Gerenciar Administrador' : 'Tornar Administrador'}
              </h2>
              <button
                onClick={() => {
                  futState.setShowMakeAdminModal(false);
                  futState.setSelectedMemberForAdmin(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              {futState.selectedMemberForAdmin.uid === futState.fut?.adminId ? (
                <div>
                  <p className="text-white mb-4">
                    <strong>{futState.selectedMemberForAdmin.name}</strong> é o administrador original deste fut.
                  </p>
                  <p className="text-yellow-400 text-sm mb-4">
                    O administrador original não pode ter seus privilégios removidos.
                  </p>
                </div>
              ) : futState.fut?.admins?.[futState.selectedMemberForAdmin.uid] ? (
                <div>
                  <p className="text-white mb-4">
                    <strong>{futState.selectedMemberForAdmin.name}</strong> é um administrador deste fut.
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Você pode remover os privilégios administrativos deste usuário.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-white mb-4">
                    Tem certeza que deseja tornar <strong>{futState.selectedMemberForAdmin.name}</strong> administrador deste fut?
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    O usuário terá acesso a todas as funcionalidades administrativas.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-600 flex space-x-3">
              <button
                onClick={() => {
                  futState.setShowMakeAdminModal(false);
                  futState.setSelectedMemberForAdmin(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              {futState.selectedMemberForAdmin.uid !== futState.fut?.adminId && (
                <>
                  {futState.fut?.admins?.[futState.selectedMemberForAdmin.uid] ? (
                    <button
                      onClick={futActions.handleRemoveAdmin}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Remover Administrador
                    </button>
                  ) : (
                    <button
                      onClick={futActions.handleMakeAdmin}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                    >
                      Tornar Administrador
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

{/* Bola Cheia e Bola Murcha Modal */}
{futState.showBolaCardsModal && futState.ranking && futState.ranking.length >= 1 && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-primary-lighter rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h2 className="text-white text-xl font-semibold">Bola Cheia e Bola Murcha</h2>
        <button
          onClick={() => futState.setShowBolaCardsModal(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex flex-row gap-4">
          {/* Bola Cheia Card */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 shadow-lg w-1/2">
            {/* Imagem da bola cheia - menor e centralizada */}
            <div className="flex justify-center mb-3">
              <Image
                src="/bola-cheia.png"
                alt="Bola Cheia"
                width={80}
                height={80}
                className="mx-auto"
              />
            </div>
            
            {/* Card com blur para avatar e nome - centralizado */}
            <div className="flex justify-center mb-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-2 py-1.5 flex items-center space-x-2">
                {futState.members[futState.ranking[0].playerId]?.photoURL ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={futState.members[futState.ranking[0].playerId]?.photoURL || ''}
                      alt={futState.ranking[0].name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">
                      {futState.ranking[0].name?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                )}
                <div className="text-white font-medium text-xs truncate max-w-[100px]">{futState.ranking[0].name}</div>
              </div>
            </div>
            
            {/* Pontuação com # */}
            <div className="text-white text-base font-bold text-center">
              #{futState.ranking[0].score}
            </div>
          </div>

          {/* Bola Murcha Card */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 shadow-lg w-1/2">
            {/* Imagem da bola murcha - menor e centralizada */}
            <div className="flex justify-center mb-3">
              <Image
                src="/bola-murcha.png"
                alt="Bola Murcha"
                width={80}
                height={80}
                className="mx-auto"
              />
            </div>
            
            {/* Card com blur para avatar e nome - centralizado */}
            <div className="flex justify-center mb-3">
              {futState.ranking.length > 1 ? (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-2 py-1.5 flex items-center space-x-2">
                  {futState.members[futState.ranking[futState.ranking.length - 1].playerId]?.photoURL ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={futState.members[futState.ranking[futState.ranking.length - 1].playerId]?.photoURL || ''}
                        alt={futState.ranking[futState.ranking.length - 1].name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {futState.ranking[futState.ranking.length - 1].name?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}
                  <div className="text-white font-medium text-xs truncate max-w-[100px]">{futState.ranking[futState.ranking.length - 1].name}</div>
                </div>
              ) : (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-2 py-1.5">
                  <div className="text-white text-xs opacity-60 text-center">
                    Aguardando mais jogadores
                  </div>
                </div>
              )}
            </div>
            
            {/* Pontuação com # */}
            {futState.ranking.length > 1 && (
              <div className="text-white text-base font-bold text-center">
                #{futState.ranking[futState.ranking.length - 1].score}
              </div>
            )}
          </div>
        </div>
        
        {/* Download Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => futActions.handleDownloadBolaCards()}
            className="bg-secondary text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-secondary-darker transition-colors"
          >
            Baixar Imagem
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal de Criar/Editar Aviso */}
{futState.showAnnouncementModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-primary-lighter rounded-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">
          {futState.editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
        </h3>
        <button
          onClick={() => {
            futState.setShowAnnouncementModal(false);
            futState.setEditingAnnouncement(null);
            futState.setAnnouncementTitle('');
            futState.setAnnouncementMessage('');
          }}
          className="text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Título
          </label>
          <input
            type="text"
            value={futState.announcementTitle}
            onChange={(e) => futState.setAnnouncementTitle(e.target.value)}
            className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary"
            placeholder="Digite o título do aviso"
          />
        </div>
        
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Mensagem
          </label>
          <textarea
            value={futState.announcementMessage}
            onChange={(e) => futState.setAnnouncementMessage(e.target.value)}
            className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-secondary resize-none"
            rows={4}
            placeholder="Digite a mensagem do aviso"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => {
              futState.setShowAnnouncementModal(false);
              futState.setEditingAnnouncement(null);
              futState.setAnnouncementTitle('');
              futState.setAnnouncementMessage('');
            }}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={futActions.handleSaveAnnouncement}
            disabled={!futState.announcementTitle.trim() || !futState.announcementMessage.trim()}
            className="flex-1 px-4 py-2 bg-secondary text-primary rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal de Visualizar Aviso */}
{futState.showAnnouncementViewModal && futState.selectedAnnouncement && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-primary-lighter rounded-lg p-6 w-full max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">
          {futState.selectedAnnouncement.title}
        </h3>
        <button
          onClick={() => {
            futState.setShowAnnouncementViewModal(false);
            futState.setSelectedAnnouncement(null);
          }}
          className="text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-primary rounded-lg p-4">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {futState.selectedAnnouncement.message}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Por {futState.selectedAnnouncement.authorName}
          </span>
          <span>
            {new Date(futState.selectedAnnouncement.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                futState.setShowAnnouncementViewModal(false);
                futState.setEditingAnnouncement(futState.selectedAnnouncement);
                futState.setAnnouncementTitle(futState.selectedAnnouncement.title);
                futState.setAnnouncementMessage(futState.selectedAnnouncement.message);
                futState.setShowAnnouncementModal(true);
                futState.setSelectedAnnouncement(null);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => {
                futActions.handleDeleteAnnouncement(futState.selectedAnnouncement.id);
                futState.setShowAnnouncementViewModal(false);
                futState.setSelectedAnnouncement(null);
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}
</div>
);
}