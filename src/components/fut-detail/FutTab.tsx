import React from 'react';
import Image from 'next/image';
import { UserData } from './types';

interface FutTabProps {
  futStarted: boolean;
  listReleased: boolean;
  releasedVagas: number;
  setReleasedVagas: (vagas: number) => void;
  confirmedMembers: string[];
  members: Record<string, UserData>;
  maxVagas: number;
  userId: string;
  onReleaseList: () => void;
  onConfirmPresence: (isIn: boolean) => void;
  onShowGuestModal: () => void;
  onShareList: () => void;
  onStartFut: () => void;
}

export default function FutTab({
  futStarted,
  listReleased,
  releasedVagas,
  setReleasedVagas,
  confirmedMembers,
  members,
  maxVagas,
  userId,
  onReleaseList,
  onConfirmPresence,
  onShowGuestModal,
  onShareList,
  onStartFut
}: FutTabProps) {
  if (futStarted) {
    return (
      <div className="space-y-4">
        <div className="bg-primary-lighter rounded-lg p-3">
          <h3 className="text-white text-base font-semibold mb-3">Fut em Andamento - 23/09/2025</h3>
          
          <div className="space-y-3">
            <div className="text-gray-400 text-sm">
              Vagas: {releasedVagas}
            </div>
            
            <div className="text-gray-400 text-sm">
              Confirmados: {confirmedMembers.length}
            </div>
          </div>
        </div>

        {listReleased && (
          <ConfirmedList 
            confirmedMembers={confirmedMembers}
            members={members}
            releasedVagas={releasedVagas}
            onShareList={onShareList}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Next Game Section */}
      <div className="bg-primary-lighter rounded-lg p-3">
        <h3 className="text-white text-base font-semibold mb-3">Próximo Fut 23/09/2025</h3>
        
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              max={maxVagas}
              value={releasedVagas}
              onChange={(e) => setReleasedVagas(parseInt(e.target.value) || maxVagas)}
              className="flex-1 px-2 py-1 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary text-sm"
              placeholder="Vagas"
            />
            <button 
              onClick={onReleaseList}
              disabled={listReleased}
              className="bg-secondary text-primary px-3 py-1 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {listReleased ? 'Liberada' : 'Liberar'}
            </button>
          </div>
          
          {/* Action buttons for admin */}
          {listReleased && (
            <div className="flex space-x-2">
              <button 
                onClick={() => onConfirmPresence(true)}
                className={`flex-1 py-1 rounded text-sm font-medium transition-colors ${
                  confirmedMembers.includes(userId) 
                    ? 'bg-green-700 text-white' 
                    : 'bg-green-600 text-black hover:bg-green-700'
                }`}
              >
                To Dentro
              </button>
              <button 
                onClick={() => onConfirmPresence(false)}
                className={`flex-1 py-1 rounded text-sm font-medium transition-colors ${
                  !confirmedMembers.includes(userId) 
                    ? 'bg-red-700 text-white' 
                    : 'bg-red-600 text-black hover:bg-red-700'
                }`}
              >
                To Fora
              </button>
              <button 
                onClick={onShowGuestModal}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + Convidado
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmed List Section */}
      {listReleased && (
        <ConfirmedList 
          confirmedMembers={confirmedMembers}
          members={members}
          releasedVagas={releasedVagas}
          onShareList={onShareList}
        />
      )}

      {/* Start Fut Button */}
      {listReleased && !futStarted && (
        <div className="bg-primary-lighter rounded-lg p-3">
          <button 
            onClick={onStartFut}
            className="w-full bg-yellow-600 text-white py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Iniciar Fut
          </button>
        </div>
      )}
    </div>
  );
}

interface ConfirmedListProps {
  confirmedMembers: string[];
  members: Record<string, UserData>;
  releasedVagas: number;
  onShareList: () => void;
}

function ConfirmedList({ confirmedMembers, members, releasedVagas, onShareList }: ConfirmedListProps) {
  return (
    <div className="bg-primary-lighter rounded-lg p-3">
      <h3 className="text-white text-base font-semibold mb-3">Lista de Confirmados para o Fut 23/09/2025</h3>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Confirmados</span>
          <span>{confirmedMembers.length}/{releasedVagas}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-secondary h-2 rounded-full" 
            style={{ width: `${Math.min((confirmedMembers.length / releasedVagas) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Confirmed Members List */}
      <div className="space-y-2">
        {confirmedMembers.map((memberId, index) => {
          const memberData = members[memberId];
          return (
            <div key={memberId} className="flex items-center space-x-2">
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
              <span className="text-white font-medium text-sm">{memberData?.name || 'VAGA'}</span>
            </div>
          );
        })}
      </div>
      
      <button 
        onClick={onShareList}
        className="w-full mt-3 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Compartilhar Lista
      </button>
    </div>
  );
}
