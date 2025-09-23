import React from 'react';
import { Edit, Users, Trash2, AlertTriangle, Shield } from 'lucide-react';

interface SettingsTabProps {
  fut: any;
  isOriginalAdmin: boolean;
  showEditInfoModal: boolean;
  editName: string;
  editDescription: string;
  editTime: string;
  editLocation: string;
  editMaxVagas: string;
  editPlayersPerTeam: string;
  showDeleteDataModal: boolean;
  showDeleteFutModal: boolean;
  deleteConfirmation: string;
  deletePassword: string;
  onShowEditInfoModal: () => void;
  onHideEditInfoModal: () => void;
  onEditNameChange: (name: string) => void;
  onEditDescriptionChange: (description: string) => void;
  onEditTimeChange: (time: string) => void;
  onEditLocationChange: (location: string) => void;
  onEditMaxVagasChange: (maxVagas: string) => void;
  onEditPlayersPerTeamChange: (playersPerTeam: string) => void;
  onSaveInfo: () => void;
  onShowDeleteDataModal: () => void;
  onHideDeleteDataModal: () => void;
  onShowDeleteFutModal: () => void;
  onHideDeleteFutModal: () => void;
  onDeleteConfirmationChange: (confirmation: string) => void;
  onDeletePasswordChange: (password: string) => void;
  onDeleteData: () => void;
  onDeleteFut: () => void;
}

export default function SettingsTab({
  fut,
  isOriginalAdmin,
  showEditInfoModal,
  editName,
  editDescription,
  editTime,
  editLocation,
  editMaxVagas,
  editPlayersPerTeam,
  showDeleteDataModal,
  showDeleteFutModal,
  deleteConfirmation,
  deletePassword,
  onShowEditInfoModal,
  onHideEditInfoModal,
  onEditNameChange,
  onEditDescriptionChange,
  onEditTimeChange,
  onEditLocationChange,
  onEditMaxVagasChange,
  onEditPlayersPerTeamChange,
  onSaveInfo,
  onShowDeleteDataModal,
  onHideDeleteDataModal,
  onShowDeleteFutModal,
  onHideDeleteFutModal,
  onDeleteConfirmationChange,
  onDeletePasswordChange,
  onDeleteData,
  onDeleteFut
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-semibold">Configurações do Fut</h3>
      
      <div className="space-y-4">
        {/* Edit Fut Info */}
        <button 
          onClick={onShowEditInfoModal}
          className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors flex items-center justify-center space-x-2"
        >
          <Edit size={20} />
          <span>Editar Informações do Fut</span>
        </button>
        
        {/* Manage Members */}
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <Users size={20} />
          <span>Gerenciar Membros</span>
        </button>
        
        {/* Delete Data */}
        <button 
          onClick={onShowDeleteDataModal}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Trash2 size={20} />
          <span>Excluir Dados do Fut</span>
        </button>
        
        {/* Delete Fut */}
        <div className="pt-4 border-t border-gray-700">
          <button 
            onClick={onShowDeleteFutModal}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <AlertTriangle size={20} />
            <span>Excluir Fut</span>
          </button>
        </div>
      </div>

      {/* Edit Info Modal */}
      {showEditInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Editar Informações do Fut</h2>
              <button 
                onClick={onHideEditInfoModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Nome do Fut</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite o nome do fut"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => onEditDescriptionChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary h-24 resize-none"
                  placeholder="Digite a descrição do fut"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Horário</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => onEditTimeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white focus:outline-none focus:border-secondary"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Local</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => onEditLocationChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite o local do fut"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Máximo de Vagas</label>
                <input
                  type="number"
                  value={editMaxVagas}
                  onChange={(e) => onEditMaxVagasChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white focus:outline-none focus:border-secondary"
                  placeholder="Digite o máximo de vagas"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Jogadores por Time</label>
                <input
                  type="number"
                  value={editPlayersPerTeam}
                  onChange={(e) => onEditPlayersPerTeamChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white focus:outline-none focus:border-secondary"
                  placeholder="Digite quantos jogadores por time"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onHideEditInfoModal}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onSaveInfo}
                  className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Data Modal */}
      {showDeleteDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Excluir Dados do Fut</h2>
              <button 
                onClick={onHideDeleteDataModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-orange-900 border border-orange-600 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle size={20} className="text-orange-400" />
                  <span className="text-orange-400 font-medium">Atenção!</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Esta ação irá excluir todos os dados do fut (gols, assistências, rankings, etc.) mas manterá o fut e os membros.
                </p>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Digite "CONFIRMAR" para prosseguir:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => onDeleteConfirmationChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite CONFIRMAR"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Digite sua senha:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => onDeletePasswordChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite sua senha"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onHideDeleteDataModal}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onDeleteData}
                  disabled={deleteConfirmation !== 'CONFIRMAR' || !deletePassword}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Excluir Dados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Fut Modal */}
      {showDeleteFutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">Excluir Fut</h2>
              <button 
                onClick={onHideDeleteFutModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-red-900 border border-red-600 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">Perigo!</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Esta ação irá excluir completamente o fut e todos os seus dados. Esta ação não pode ser desfeita.
                </p>
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Digite "EXCLUIR" para prosseguir:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => onDeleteConfirmationChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite EXCLUIR"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Digite sua senha:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => onDeletePasswordChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite sua senha"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onHideDeleteFutModal}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onDeleteFut}
                  disabled={deleteConfirmation !== 'EXCLUIR' || !deletePassword}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Excluir Fut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
