import React from 'react';
import Image from 'next/image';
import { Crown } from 'lucide-react';
import { UserData, Fut } from './types';

interface MembersTabProps {
  members: Record<string, UserData>;
  fut: Fut;
  isAdmin: boolean;
  onAddMember: () => void;
  onMemberClick: (memberId: string, memberName: string) => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
}

export default function MembersTab({
  members,
  fut,
  isAdmin,
  onAddMember,
  onMemberClick,
  onRemoveMember
}: MembersTabProps) {
  const memberCount = Object.keys(members).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Membros</h3>
        {isAdmin && (
          <button 
            onClick={onAddMember}
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
              className={`bg-primary-lighter rounded-lg p-4 border border-gray-700 ${
                isAdmin ? 'cursor-pointer hover:bg-primary hover:border-gray-600 transition-colors' : ''
              }`}
              onClick={() => {
                if (isAdmin) {
                  onMemberClick(memberId, memberData.name);
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
                    {memberId === fut.adminId && (
                      <Crown size={16} className="text-yellow-500" />
                    )}
                    {memberId !== fut.adminId && fut.admins?.[memberId] && (
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
                        onRemoveMember(memberId, memberData.name);
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
  );
}
