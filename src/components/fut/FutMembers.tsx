import { useState } from 'react';
import Image from 'next/image';
import { Crown, Users, UserPlus } from 'lucide-react';

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

interface FutMembersProps {
  fut: Fut;
  members: Record<string, UserData>;
  isAdmin: boolean;
  isOriginalAdmin: boolean;
  user: any;
}

export function FutMembers({ fut, members, isAdmin, isOriginalAdmin, user }: FutMembersProps) {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [selectedMemberForAdmin, setSelectedMemberForAdmin] = useState<any>(null);

  const memberCount = Object.keys(fut.members || {}).length;
  const availableSlots = fut.maxVagas - memberCount;

  const handleMakeAdmin = (memberId: string) => {
    const member = members[memberId];
    if (member) {
      setSelectedMemberForAdmin({ id: memberId, ...member });
      setShowMakeAdminModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Membros</h3>
        {isAdmin && (
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors flex items-center space-x-2"
          >
            <UserPlus size={16} />
            <span>Adicionar Membro</span>
          </button>
        )}
      </div>

      {/* Member Count */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Users size={20} className="text-gray-400" />
          <span className="text-white">
            {memberCount} de {fut.maxVagas} vagas preenchidas
          </span>
        </div>
        {availableSlots > 0 && (
          <div className="mt-2 text-gray-400 text-sm">
            {availableSlots} vaga{availableSlots > 1 ? 's' : ''} disponível{availableSlots > 1 ? 'is' : ''}
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {Object.entries(members).map(([memberId, memberData]) => {
          const isMemberAdmin = fut.adminId === memberId || fut.admins?.[memberId];
          const isCurrentUser = user?.uid === memberId;
          
          return (
            <div key={memberId} className="bg-primary-lighter rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Member Photo or Initial */}
                {memberData.photoURL ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={memberData.photoURL}
                      alt={memberData.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {memberData.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{memberData.name}</span>
                    {isMemberAdmin && (
                      <Crown 
                        size={16} 
                        className={fut.adminId === memberId ? "text-yellow-400" : "text-green-400"} 
                      />
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">{memberData.email}</div>
                  {memberData.totalGoals !== undefined && memberData.totalAssists !== undefined && (
                    <div className="text-gray-500 text-xs">
                      {memberData.totalGoals} gols • {memberData.totalAssists} assistências
                    </div>
                  )}
                </div>
              </div>
              
              {/* Admin Actions */}
              {isAdmin && !isCurrentUser && (
                <div className="flex space-x-2">
                  {!isMemberAdmin && (
                    <button
                      onClick={() => handleMakeAdmin(memberId)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Tornar Admin
                    </button>
                  )}
                  {isMemberAdmin && fut.adminId !== memberId && (
                    <button
                      onClick={() => handleMakeAdmin(memberId)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Remover Admin
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty Slots */}
      {availableSlots > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Vagas Disponíveis</h4>
          {Array.from({ length: availableSlots }, (_, index) => (
            <div key={index} className="bg-primary-lighter rounded-lg p-4 border-2 border-dashed border-gray-600">
              <div className="text-gray-400 text-center">VAGA</div>
            </div>
          ))}
        </div>
      )}

      {/* Modals would go here - simplified for now */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Adicionar Membro</h3>
              <p className="text-gray-400">Funcionalidade de adicionar membro será implementada aqui.</p>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="mt-4 bg-secondary text-primary px-4 py-2 rounded hover:bg-secondary-darker transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showMakeAdminModal && selectedMemberForAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Tornar Administrador</h3>
              <p className="text-gray-400 mb-4">
                Tem certeza que deseja tornar {selectedMemberForAdmin.name} um administrador?
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMakeAdminModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowMakeAdminModal(false)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
