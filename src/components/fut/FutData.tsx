import { useState } from 'react';
import { Plus, Target, Users, Trophy } from 'lucide-react';

interface Fut {
  id: string;
  name: string;
  maxVagas: number;
  members: Record<string, boolean>;
}

interface UserData {
  name: string;
  email: string;
  photoURL?: string;
  totalGoals?: number;
  totalAssists?: number;
}

interface FutDataProps {
  fut: Fut;
  members: Record<string, UserData>;
  isAdmin: boolean;
}

export function FutData({ fut, members, isAdmin }: FutDataProps) {
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddAssistModal, setShowAddAssistModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [playerStats, setPlayerStats] = useState<Record<string, { goals: number; assists: number }>>({});

  const availableMembers = Object.entries(members).map(([id, data]) => ({ id, ...data }));

  const addGoal = (playerId: string) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        goals: (prev[playerId]?.goals || 0) + 1,
        assists: prev[playerId]?.assists || 0
      }
    }));
    setShowAddGoalModal(false);
  };

  const addAssist = (playerId: string) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        goals: prev[playerId]?.goals || 0,
        assists: (prev[playerId]?.assists || 0) + 1
      }
    }));
    setShowAddAssistModal(false);
  };

  const getTotalGoals = () => {
    return Object.values(playerStats).reduce((total, stats) => total + (stats.goals || 0), 0);
  };

  const getTotalAssists = () => {
    return Object.values(playerStats).reduce((total, stats) => total + (stats.assists || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Dados do Jogo</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Adicionar Gol</span>
          </button>
          <button
            onClick={() => setShowAddAssistModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Adicionar Assistência</span>
          </button>
        </div>
      </div>

      {/* Game Summary */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Resumo do Jogo</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-green-400 text-2xl font-bold">{getTotalGoals()}</div>
            <div className="text-gray-400 text-sm">Total de Gols</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-2xl font-bold">{getTotalAssists()}</div>
            <div className="text-gray-400 text-sm">Total de Assistências</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-2xl font-bold">{availableMembers.length}</div>
            <div className="text-gray-400 text-sm">Jogadores Ativos</div>
          </div>
        </div>
      </div>

      {/* Player Statistics */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Estatísticas dos Jogadores</h4>
        
        <div className="space-y-3">
          {availableMembers.map(player => {
            const stats = playerStats[player.id] || { goals: 0, assists: 0 };
            
            return (
              <div key={player.id} className="flex items-center justify-between bg-gray-700 rounded p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {player.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{player.name}</div>
                    <div className="text-gray-400 text-sm">{player.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Target size={16} className="text-green-400" />
                    <span className="text-green-400 font-bold">{stats.goals}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={16} className="text-blue-400" />
                    <span className="text-blue-400 font-bold">{stats.assists}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Destaques</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Scorer */}
          <div className="bg-gray-700 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-white font-medium">Artilheiro</span>
            </div>
            {(() => {
              const topScorer = availableMembers.reduce((top, player) => {
                const playerGoals = playerStats[player.id]?.goals || 0;
                const topGoals = playerStats[top.id]?.goals || 0;
                return playerGoals > topGoals ? player : top;
              }, availableMembers[0]);
              
              const topGoals = playerStats[topScorer?.id]?.goals || 0;
              
              return (
                <div className="text-gray-300 text-sm">
                  {topScorer ? `${topScorer.name} - ${topGoals} gols` : 'Nenhum gol ainda'}
                </div>
              );
            })()}
          </div>
          
          {/* Top Assister */}
          <div className="bg-gray-700 rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Users size={16} className="text-blue-400" />
              <span className="text-white font-medium">Mais Assistências</span>
            </div>
            {(() => {
              const topAssister = availableMembers.reduce((top, player) => {
                const playerAssists = playerStats[player.id]?.assists || 0;
                const topAssists = playerStats[top.id]?.assists || 0;
                return playerAssists > topAssists ? player : top;
              }, availableMembers[0]);
              
              const topAssists = playerStats[topAssister?.id]?.assists || 0;
              
              return (
                <div className="text-gray-300 text-sm">
                  {topAssister ? `${topAssister.name} - ${topAssists} assistências` : 'Nenhuma assistência ainda'}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="p-4 space-y-4">
              <h3 className="text-white text-lg font-semibold">Adicionar Gol</h3>
              
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">Jogador</label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                >
                  <option value="">Selecione um jogador</option>
                  {availableMembers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => selectedPlayer && addGoal(selectedPlayer)}
                  disabled={!selectedPlayer}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar Gol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Assist Modal */}
      {showAddAssistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="p-4 space-y-4">
              <h3 className="text-white text-lg font-semibold">Adicionar Assistência</h3>
              
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium">Jogador</label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                >
                  <option value="">Selecione um jogador</option>
                  {availableMembers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddAssistModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => selectedPlayer && addAssist(selectedPlayer)}
                  disabled={!selectedPlayer}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar Assistência
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
