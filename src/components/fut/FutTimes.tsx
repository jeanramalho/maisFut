import { useState } from 'react';
import { Users, Shuffle, Settings } from 'lucide-react';

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

interface FutTimesProps {
  fut: Fut;
  members: Record<string, UserData>;
  isAdmin: boolean;
}

export function FutTimes({ fut, members, isAdmin }: FutTimesProps) {
  const [teams, setTeams] = useState<Record<string, string[]>>({
    team1: [],
    team2: []
  });
  const [showManualFormation, setShowManualFormation] = useState(false);

  const memberCount = Object.keys(fut.members || {}).length;
  const availableMembers = Object.entries(members).map(([id, data]) => ({ id, ...data }));

  const generateRandomTeams = () => {
    const shuffled = [...availableMembers].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    
    setTeams({
      team1: shuffled.slice(0, half).map(m => m.id),
      team2: shuffled.slice(half).map(m => m.id)
    });
  };

  const movePlayer = (playerId: string, fromTeam: string, toTeam: string) => {
    setTeams(prev => ({
      ...prev,
      [fromTeam]: prev[fromTeam].filter(id => id !== playerId),
      [toTeam]: [...prev[toTeam], playerId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Formação dos Times</h3>
        <div className="flex space-x-2">
          <button
            onClick={generateRandomTeams}
            className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors flex items-center space-x-2"
          >
            <Shuffle size={16} />
            <span>Sortear Times</span>
          </button>
          <button
            onClick={() => setShowManualFormation(!showManualFormation)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Formação Manual</span>
          </button>
        </div>
      </div>

      {/* Teams Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 */}
        <div className="bg-primary-lighter rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Time 1 ({teams.team1.length} jogadores)</span>
          </h4>
          
          <div className="space-y-2">
            {teams.team1.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-4">
                Nenhum jogador no time
              </div>
            ) : (
              teams.team1.map(playerId => {
                const player = members[playerId];
                if (!player) return null;
                
                return (
                  <div key={playerId} className="flex items-center justify-between bg-gray-700 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {player.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-white text-sm">{player.name}</span>
                    </div>
                    <button
                      onClick={() => movePlayer(playerId, 'team1', 'team2')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="bg-primary-lighter rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Time 2 ({teams.team2.length} jogadores)</span>
          </h4>
          
          <div className="space-y-2">
            {teams.team2.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-4">
                Nenhum jogador no time
              </div>
            ) : (
              teams.team2.map(playerId => {
                const player = members[playerId];
                if (!player) return null;
                
                return (
                  <div key={playerId} className="flex items-center justify-between bg-gray-700 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {player.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-white text-sm">{player.name}</span>
                    </div>
                    <button
                      onClick={() => movePlayer(playerId, 'team2', 'team1')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ←
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Available Players */}
      {showManualFormation && (
        <div className="bg-primary-lighter rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4">Jogadores Disponíveis</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableMembers.map(player => {
              const isInTeam = teams.team1.includes(player.id) || teams.team2.includes(player.id);
              
              return (
                <div
                  key={player.id}
                  className={`p-2 rounded border-2 border-dashed transition-colors ${
                    isInTeam 
                      ? 'border-gray-600 bg-gray-800 opacity-50' 
                      : 'border-gray-500 bg-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="text-white text-sm text-center">{player.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Stats */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Estatísticas dos Times</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-blue-400 text-2xl font-bold">0</div>
            <div className="text-gray-400 text-sm">Time 1 - Gols</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 text-2xl font-bold">0</div>
            <div className="text-gray-400 text-sm">Time 2 - Gols</div>
          </div>
        </div>
      </div>
    </div>
  );
}
