import React from 'react';
import { X } from 'lucide-react';

interface GuestModalProps {
  showGuestModal: boolean;
  showGuestTypeModal: boolean;
  guestType: 'avulso' | 'cadastrado' | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  searchQuery: string;
  searchResults: any[];
  onClose: () => void;
  onGuestTypeSelect: (type: 'avulso' | 'cadastrado') => void;
  onGuestNameChange: (name: string) => void;
  onGuestEmailChange: (email: string) => void;
  onGuestPhoneChange: (phone: string) => void;
  onSearchQueryChange: (query: string) => void;
  onSearchUsers: () => void;
  onAddGuest: () => void;
  onAddSearchedUser: (user: any) => void;
  onCloseGuestType: () => void;
}

export default function GuestModal({
  showGuestModal,
  showGuestTypeModal,
  guestType,
  guestName,
  guestEmail,
  guestPhone,
  searchQuery,
  searchResults,
  onClose,
  onGuestTypeSelect,
  onGuestNameChange,
  onGuestEmailChange,
  onGuestPhoneChange,
  onSearchQueryChange,
  onSearchUsers,
  onAddGuest,
  onAddSearchedUser,
  onCloseGuestType
}: GuestModalProps) {
  if (showGuestTypeModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-primary-lighter rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <h2 className="text-white text-xl font-semibold">
              {guestType === 'avulso' ? 'Convidado Avulso' : 'Convidado Cadastrado'}
            </h2>
            <button onClick={onCloseGuestType} className="text-gray-400 hover:text-white transition-colors">
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
                  onChange={(e) => onGuestNameChange(e.target.value)}
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
                      onChange={(e) => onSearchQueryChange(e.target.value)}
                      className="flex-1 px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                      placeholder="Digite email ou telefone"
                    />
                    <button
                      onClick={onSearchUsers}
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
                          onClick={() => onAddSearchedUser(user)}
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
                onClick={onCloseGuestType}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onAddGuest}
                className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showGuestModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-primary-lighter rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <h2 className="text-white text-xl font-semibold">Adicionar Convidado</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <button 
                onClick={() => onGuestTypeSelect('avulso')}
                className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Convidado Avulso (Apenas Nome)
              </button>
              <button 
                onClick={() => onGuestTypeSelect('cadastrado')}
                className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Convidado Cadastrado (Email/Telefone)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
