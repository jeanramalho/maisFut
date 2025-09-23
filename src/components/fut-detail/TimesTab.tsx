import React from 'react';
import { UserData } from './types';

interface TimesTabProps {
  teams: Record<string, string[]>;
  members: Record<string, UserData>;
  teamStats: Record<string, { wins: number }>;
  playerStats: Record<string, { goals: number; assists: number }>;
  futStarted: boolean;
  futEnded: boolean;
  onShowTeamDrawModal: () => void;
  onShowTeamSelectModal: () => void;
  onSelectTeam: (teamName: string) => void;
  selectedTeam: string | null;
  onDeleteTeams: () => void;
  onShareTeams: () => void;
  onUpdateTeamWins: (teamName: string, delta: number) => void;
}

export default function TimesTab({
  teams,
  members,
  teamStats,
  playerStats,
  futStarted,
  futEnded,
  onShowTeamDrawModal,
  onShowTeamSelectModal,
  onSelectTeam,
  selectedTeam,
  onDeleteTeams,
  onShareTeams,
  onUpdateTeamWins
}: TimesTabProps) {
  return (
    <div className="space-y-4">
      {Object.keys(teams).length === 0 ? (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <button 
              onClick={onShowTeamDrawModal}
              className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sorteio de Times
            </button>
            <button 
              onClick={onShowTeamSelectModal}
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
              onClick={onDeleteTeams}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Apagar Times
            </button>
            <button 
              onClick={onShareTeams}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Compartilhar Times
            </button>
          </div>
          
          <div className="bg-primary-lighter rounded-lg p-3">
            <h3 className="text-white text-base font-semibold mb-3">TIMES:</h3>
            <div className="space-y-4">
              {Object.entries(teams).map(([teamName, players]) => (
                <div key={teamName} className="space-y-2">
                  <h4 className="text-secondary font-semibold">{teamName}</h4>
                  <div className="space-y-1">
                    {players.map((playerId, index) => {
                      const player = members[playerId];
                      return (
                        <div key={playerId} className="text-white text-sm">
                          {index + 1}- {player?.name || 'VAGA'}
                        </div>
                      );
                    })}
                    {/* Add VAGA if team is not full */}
                    {Array.from({ length: Math.max(0, 5 - players.length) }).map((_, index) => (
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
  );
}