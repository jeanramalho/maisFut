import React from 'react';
import { X } from 'lucide-react';

interface TeamDrawModalProps {
  showTeamDrawModal: boolean;
  teamCount: string;
  playersPerTeam: string;
  onClose: () => void;
  onTeamCountChange: (count: string) => void;
  onPlayersPerTeamChange: (players: string) => void;
  onTeamDraw: () => void;
}

export default function TeamDrawModal({
  showTeamDrawModal,
  teamCount,
  playersPerTeam,
  onClose,
  onTeamCountChange,
  onPlayersPerTeamChange,
  onTeamDraw
}: TeamDrawModalProps) {
  if (!showTeamDrawModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-lighter rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-white text-xl font-semibold">Sortear Times</h2>
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
              Número de Times
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={teamCount}
              onChange={(e) => onTeamCountChange(e.target.value)}
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
              max="20"
              value={playersPerTeam}
              onChange={(e) => onPlayersPerTeamChange(e.target.value)}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
              placeholder="Ex: 5"
            />
          </div>
          
          <div className="bg-blue-900 border border-blue-600 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              Os times serão sorteados aleatoriamente entre os jogadores confirmados. 
              Vagas vazias serão preenchidas automaticamente.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onTeamDraw}
              className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
            >
              Sortear Times
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
