import React from 'react';
import Image from 'next/image';
import { UserData } from './types';

interface DataTabProps {
  teams: Record<string, string[]>;
  members: Record<string, UserData>;
  teamStats: Record<string, { wins: number }>;
  playerStats: Record<string, { goals: number; assists: number }>;
  futStarted: boolean;
  futEnded: boolean;
  votingOpen: boolean;
  votingEnded: boolean;
  playerVotes: Record<string, number>;
  userVotes: Record<string, Record<string, number>>;
  userId: string;
  onAddGoal: (playerId: string) => void;
  onAddAssist: (playerId: string) => void;
  onRemoveGoal: (playerId: string) => void;
  onRemoveAssist: (playerId: string) => void;
  onVotePlayer: (playerId: string, rating: number) => void;
  onOpenVoting: () => void;
  onCloseVoting: () => void;
  onEndVoting: () => void;
  onEndFut: () => void;
  onUpdateTeamWins: (teamName: string, delta: number) => void;
}

export default function DataTab({
  teams,
  members,
  teamStats,
  playerStats,
  futStarted,
  futEnded,
  votingOpen,
  votingEnded,
  playerVotes,
  userVotes,
  userId,
  onAddGoal,
  onAddAssist,
  onRemoveGoal,
  onRemoveAssist,
  onVotePlayer,
  onOpenVoting,
  onCloseVoting,
  onEndVoting,
  onEndFut,
  onUpdateTeamWins
}: DataTabProps) {
  return (
    <div className="space-y-4">
      {Object.keys(teams).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Os times ainda não foram escolhidos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {!futEnded && (
            <button 
              onClick={onEndFut}
              className="w-full bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Encerrar Fut
            </button>
          )}

          {futEnded && !votingOpen && !votingEnded && (
            <button 
              onClick={onOpenVoting}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Liberar Votação
            </button>
          )}

          {votingOpen && (
            <button 
              onClick={onEndVoting}
              className="w-full bg-yellow-600 text-white py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              Encerrar Votação
            </button>
          )}

          {/* Voting Section */}
          {votingOpen && (
            <div className="bg-primary-lighter rounded-lg p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Votação - Avalie os Jogadores</h3>
              <div className="space-y-4">
                {Object.values(teams).flat()
                  .filter(playerId => playerId !== 'VAGA' && !members[playerId]?.isGuest) // Only members, not guests or VAGA
                  .map((playerId) => {
                  const player = members[playerId];
                  const currentVote = userVotes[userId]?.[playerId] || 0;
                  
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
                              onClick={() => onVotePlayer(playerId, star)}
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
          
          <div className="space-y-6">
            {Object.entries(teams).map(([teamName, players], teamIndex) => (
              <div key={teamName} className="bg-primary-lighter rounded-lg p-4">
                {/* Team Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
                  <h3 className="text-white font-semibold text-lg">{teamName}</h3>
                  {!futEnded && (
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm">Vitórias:</span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onUpdateTeamWins(teamName, -1)}
                          className="w-7 h-7 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-white font-semibold min-w-[25px] text-center text-lg">
                          {teamStats[teamName]?.wins || 0}
                        </span>
                        <button 
                          onClick={() => onUpdateTeamWins(teamName, 1)}
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
                    .filter(playerId => playerId !== 'VAGA' && !members[playerId]?.isGuest) // Only members, not guests or VAGA
                    .map((playerId) => {
                    const player = members[playerId];
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
                              {isGuest && (
                                <span className="text-gray-400 text-xs ml-2">(VAGA)</span>
                              )}
                            </div>
                          </div>
                          
                          {!futEnded && (
                            <div className="space-y-4">
                              {/* Goals */}
                              <div className="flex flex-col items-center space-y-2">
                                <span className="text-gray-400 text-sm font-medium">Gols:</span>
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => onRemoveGoal(playerId)}
                                    className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="text-white text-lg min-w-[20px] text-center font-semibold">
                                    {playerStats[playerId]?.goals || 0}
                                  </span>
                                  <button 
                                    onClick={() => onAddGoal(playerId)}
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
                                    onClick={() => onRemoveAssist(playerId)}
                                    className="w-6 h-6 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="text-white text-lg min-w-[20px] text-center font-semibold">
                                    {playerStats[playerId]?.assists || 0}
                                  </span>
                                  <button 
                                    onClick={() => onAddAssist(playerId)}
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
                
                {/* Team Separator */}
                {teamIndex < Object.keys(teams).length - 1 && (
                  <div className="mt-6 pt-4 border-t border-gray-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}