import React from 'react';
import { X, Search } from 'lucide-react';

interface AddMemberModalProps {
  showAddMemberModal: boolean;
  memberSearchQuery: string;
  memberSearchResults: any[];
  onClose: () => void;
  onMemberSearchQueryChange: (query: string) => void;
  onSearchMembers: () => void;
  onAddMember: (userData: any) => void;
}

export default function AddMemberModal({
  showAddMemberModal,
  memberSearchQuery,
  memberSearchResults,
  onClose,
  onMemberSearchQueryChange,
  onSearchMembers,
  onAddMember
}: AddMemberModalProps) {
  if (!showAddMemberModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-lighter rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-white text-xl font-semibold">Adicionar Membro</h2>
          <button 
            onClick={onClose}
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
                onChange={(e) => onMemberSearchQueryChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                placeholder="Digite email ou telefone"
              />
              <button
                onClick={onSearchMembers}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {memberSearchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              <h3 className="text-white text-sm font-medium">Resultados da Busca:</h3>
              {memberSearchResults.map((user) => (
                <div key={user.uid} className="flex items-center justify-between bg-primary p-3 rounded-lg">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{user.name}</div>
                    <div className="text-gray-400 text-xs">{user.email}</div>
                    {user.phone && (
                      <div className="text-gray-400 text-xs">{user.phone}</div>
                    )}
                    {user.position && (
                      <div className="text-gray-400 text-xs">{user.position}</div>
                    )}
                  </div>
                  <button
                    onClick={() => onAddMember(user)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {memberSearchQuery && memberSearchResults.length === 0 && (
            <div className="text-gray-400 text-sm text-center py-4">
              Nenhum usuário encontrado
            </div>
          )}
          
          <div className="bg-blue-900 border border-blue-600 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              Digite o email ou telefone do usuário para encontrá-lo e adicioná-lo ao fut.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
