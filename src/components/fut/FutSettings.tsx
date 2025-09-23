import { useState } from 'react';
import { Settings, Users, Trash2, Edit } from 'lucide-react';

interface Fut {
  id: string;
  name: string;
  description?: string;
  type: 'mensal' | 'avulso';
  time?: string;
  location?: string;
  maxVagas: number;
  adminId: string;
  admins?: Record<string, boolean>;
  members: Record<string, boolean>;
  photoURL?: string;
  createdAt: number;
  recurrence?: {
    kind: 'weekly' | 'monthly';
    day: number;
  };
  privacy: 'public' | 'invite';
}

interface UserData {
  name: string;
  email: string;
  photoURL?: string;
  totalGoals?: number;
  totalAssists?: number;
}

interface FutSettingsProps {
  fut: Fut;
  members: Record<string, UserData>;
  isOriginalAdmin: boolean;
  user: any;
}

export function FutSettings({ fut, members, isOriginalAdmin, user }: FutSettingsProps) {
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteFutModal, setShowDeleteFutModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const handleDeleteData = async () => {
    if (deleteConfirmation !== 'CONFIRMAR' || !deletePassword) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    try {
      // Aqui seria implementada a lógica de exclusão dos dados
      console.log('Deleting fut data...');
      alert('Dados do fut excluídos com sucesso!');
      setShowDeleteDataModal(false);
      setDeleteConfirmation('');
      setDeletePassword('');
    } catch (error) {
      console.error('Error deleting fut data:', error);
      alert('Erro ao excluir dados do fut');
    }
  };

  const handleDeleteFut = async () => {
    if (deleteConfirmation !== 'CONFIRMAR' || !deletePassword) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    try {
      // Aqui seria implementada a lógica de exclusão do fut
      console.log('Deleting fut...');
      alert('Fut excluído com sucesso!');
      setShowDeleteFutModal(false);
      setDeleteConfirmation('');
      setDeletePassword('');
    } catch (error) {
      console.error('Error deleting fut:', error);
      alert('Erro ao excluir fut');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-semibold">Configurações</h3>
      
      <div className="space-y-4">
        {/* Edit Fut Info */}
        <div className="bg-primary-lighter rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Edit size={20} className="text-gray-400" />
            <h4 className="text-white font-medium">Editar informações do Fut</h4>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Edite as informações básicas do fut como nome, descrição, horário, local, etc.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
            Editar Informações
          </button>
        </div>

        {/* Manage Members */}
        <div className="bg-primary-lighter rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Users size={20} className="text-gray-400" />
            <h4 className="text-white font-medium">Gerenciar membros</h4>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Adicione, exclua e gerencie os membros do fut. Torne outros membros administradores.
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
            Gerenciar Membros
          </button>
        </div>

        {/* Delete Fut Data */}
        <div className="bg-primary-lighter rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Trash2 size={20} className="text-orange-400" />
            <h4 className="text-white font-medium">Excluir dados do fut</h4>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Remove todos os dados do fut (gols, ranking, histórico) mas mantém o fut ativo.
          </p>
          <button 
            onClick={() => setShowDeleteDataModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
          >
            Excluir Dados
          </button>
        </div>

        {/* Delete Fut */}
        {isOriginalAdmin && (
          <div className="bg-primary-lighter rounded-lg p-4 border border-red-600">
            <div className="flex items-center space-x-3 mb-3">
              <Trash2 size={20} className="text-red-400" />
              <h4 className="text-white font-medium">Excluir Fut</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Remove completamente o fut e todos os seus dados. Esta ação não pode ser desfeita.
            </p>
            <button 
              onClick={() => setShowDeleteFutModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Excluir Fut
            </button>
          </div>
        )}
      </div>

      {/* Delete Data Modal */}
      {showDeleteDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="p-4 space-y-4">
              <h3 className="text-white text-lg font-semibold">Excluir Dados do Fut</h3>
              <p className="text-gray-400">
                Tem certeza que deseja excluir todos os dados do fut? Esta ação não pode ser desfeita.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Digite "CONFIRMAR" para continuar
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                    placeholder="CONFIRMAR"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Senha do administrador
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteDataModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteData}
                  className="flex-1 bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors"
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
            <div className="p-4 space-y-4">
              <h3 className="text-white text-lg font-semibold">Excluir Fut</h3>
              <p className="text-gray-400">
                Tem certeza que deseja excluir completamente o fut? Esta ação não pode ser desfeita.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Digite "CONFIRMAR" para continuar
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                    placeholder="CONFIRMAR"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Senha do administrador
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteFutModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteFut}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
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
