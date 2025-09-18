import { useState, useEffect } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Award, TrendingUp, TrendingDown, X, Crown } from 'lucide-react';

interface VotingPanelProps {
  futId: string;
  dateId: string;
  isAdmin: boolean;
  onClose: () => void;
}

interface Player {
  id: string;
  name: string;
  photoURL?: string;
}

interface PlayerStats {
  goals: number;
  assists: number;
}

interface VotingData {
  enabled: boolean;
  open: boolean;
  votes: Record<string, { bolaCheia?: string; bolaMurcha?: string }>;
}

interface VotingResult {
  bolaCheia: string;
  bolaMurcha: string;
  bolaCheiaCounts: Record<string, number>;
  bolaMurchaCounts: Record<string, number>;
  timestamp: number;
}

export default function VotingPanel({ futId, dateId, isAdmin, onClose }: VotingPanelProps) {
  const { user } = useAuth();
  const [presentPlayers, setPresentPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Record<string, PlayerStats>>({});
  const [voting, setVoting] = useState<VotingData>({ enabled: false, open: false, votes: {} });
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null);
  const [selectedBolaCheia, setSelectedBolaCheia] = useState<string>('');
  const [selectedBolaMurcha, setSelectedBolaMurcha] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const occurrenceRef = ref(database, `futOccurrences/${futId}/${dateId}`);
    
    const unsubscribe = onValue(occurrenceRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setStats(data.stats || {});
      setVoting(data.voting || { enabled: false, open: false, votes: {} });
      setVotingResult(data.votingResult || null);

      // Check if current user has already voted
      if (user && data.voting?.votes?.[user.uid]) {
        setHasVoted(true);
        setSelectedBolaCheia(data.voting.votes[user.uid].bolaCheia || '');
        setSelectedBolaMurcha(data.voting.votes[user.uid].bolaMurcha || '');
      }

      // Fetch present players data
      if (data.present) {
        const playerIds = Object.keys(data.present);
        const playerPromises = playerIds.map(async (playerId) => {
          const playerRef = ref(database, `users/${playerId}`);
          const playerSnapshot = await get(playerRef);
          const playerData = playerSnapshot.val();
          return {
            id: playerId,
            name: playerData?.name || 'Jogador',
            photoURL: playerData?.photoURL,
          };
        });

        const playersData = await Promise.all(playerPromises);
        setPresentPlayers(playersData);
      }
    });

    return unsubscribe;
  }, [futId, dateId, user]);

  const handleOpenVoting = async () => {
    if (!isAdmin) return;

    try {
      const votingRef = ref(database, `futOccurrences/${futId}/${dateId}/voting`);
      await update(votingRef, { open: true });
    } catch (error) {
      console.error('Error opening voting:', error);
    }
  };

  const handleCloseVoting = async () => {
    if (!isAdmin) return;

    try {
      const votingRef = ref(database, `futOccurrences/${futId}/${dateId}/voting`);
      await update(votingRef, { open: false });
    } catch (error) {
      console.error('Error closing voting:', error);
    }
  };

  const handleSubmitVote = async () => {
    if (!user || !selectedBolaCheia || !selectedBolaMurcha) return;

    setLoading(true);
    try {
      const voteRef = ref(database, `futOccurrences/${futId}/${dateId}/voting/votes/${user.uid}`);
      await update(voteRef, {
        bolaCheia: selectedBolaCheia,
        bolaMurcha: selectedBolaMurcha,
        timestamp: Date.now(),
      });
      setHasVoted(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceScore = (playerId: string) => {
    const playerStats = stats[playerId] || { goals: 0, assists: 0 };
    return playerStats.goals * 2 + playerStats.assists;
  };

  const canVote = voting.open && !hasVoted && user && presentPlayers.some(p => p.id === user.uid);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-lighter rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div>
            <h2 className="text-white text-xl font-semibold">Votação</h2>
            <p className="text-gray-400 text-sm">Bola Cheia & Bola Murcha</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Voting Status */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              voting.open 
                ? 'bg-green-600 text-white' 
                : votingResult
                ? 'bg-gray-600 text-gray-300'
                : 'bg-yellow-600 text-white'
            }`}>
              {voting.open ? 'VOTAÇÃO ABERTA' : votingResult ? 'ENCERRADA' : 'AGUARDANDO'}
            </div>
            
            {isAdmin && !votingResult && (
              <button
                onClick={voting.open ? handleCloseVoting : handleOpenVoting}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  voting.open
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-secondary text-primary hover:bg-secondary-darker'
                }`}
              >
                {voting.open ? 'Encerrar' : 'Abrir Votação'}
              </button>
            )}
          </div>

          {hasVoted && (
            <div className="text-green-400 text-sm">
              ✓ Seu voto foi registrado
            </div>
          )}
        </div>

        {/* Voting Results */}
        {votingResult && (
          <div className="p-4 border-b border-gray-600">
            <h3 className="text-white text-lg font-semibold mb-3 flex items-center space-x-2">
              <Award size={20} />
              <span>Resultados</span>
            </h3>

            <div className="space-y-3">
              {/* Bola Cheia Winner */}
              {votingResult.bolaCheia && (
                <div className="bg-green-900 bg-opacity-50 rounded-lg p-3 border border-green-700">
                  <div className="flex items-center space-x-3">
                    <Crown size={20} className="text-yellow-500" />
                    <div>
                      <div className="text-green-300 font-semibold">Bola Cheia</div>
                      <div className="text-white">
                        {presentPlayers.find(p => p.id === votingResult.bolaCheia)?.name}
                      </div>
                      <div className="text-green-400 text-sm">
                        {votingResult.bolaCheiaCounts[votingResult.bolaCheia]} votos
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bola Murcha Winner */}
              {votingResult.bolaMurcha && (
                <div className="bg-red-900 bg-opacity-50 rounded-lg p-3 border border-red-700">
                  <div className="flex items-center space-x-3">
                    <TrendingDown size={20} className="text-red-400" />
                    <div>
                      <div className="text-red-300 font-semibold">Bola Murcha</div>
                      <div className="text-white">
                        {presentPlayers.find(p => p.id === votingResult.bolaMurcha)?.name}
                      </div>
                      <div className="text-red-400 text-sm">
                        {votingResult.bolaMurchaCounts[votingResult.bolaMurcha]} votos
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voting Interface */}
        {canVote && !votingResult && (
          <div className="p-4 border-b border-gray-600">
            <div className="space-y-4">
              {/* Bola Cheia Selection */}
              <div>
                <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span>Bola Cheia</span>
                </h4>
                <select
                  value={selectedBolaCheia}
                  onChange={(e) => setSelectedBolaCheia(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
                >
                  <option value="">Escolher jogador...</option>
                  {presentPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({getPerformanceScore(player.id)} pts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Bola Murcha Selection */}
              <div>
                <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <TrendingDown size={16} className="text-red-400" />
                  <span>Bola Murcha</span>
                </h4>
                <select
                  value={selectedBolaMurcha}
                  onChange={(e) => setSelectedBolaMurcha(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
                >
                  <option value="">Escolher jogador...</option>
                  {presentPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmitVote}
                disabled={loading || !selectedBolaCheia || !selectedBolaMurcha || selectedBolaCheia === selectedBolaMurcha}
                className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Confirmar Votos'}
              </button>

              {selectedBolaCheia === selectedBolaMurcha && selectedBolaCheia && (
                <p className="text-red-400 text-sm text-center">
                  Não é possível votar no mesmo jogador para ambas as categorias
                </p>
              )}
            </div>
          </div>
        )}

        {/* Players List with Stats */}
        <div className="p-4">
          <h3 className="text-white text-lg font-semibold mb-3">
            Performance dos Jogadores
          </h3>

          <div className="space-y-2">
            {presentPlayers
              .sort((a, b) => getPerformanceScore(b.id) - getPerformanceScore(a.id))
              .map((player, index) => {
                const playerStats = stats[player.id] || { goals: 0, assists: 0 };
                const performanceScore = getPerformanceScore(player.id);
                
                return (
                  <div
                    key={player.id}
                    className="bg-primary rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {index < 3 && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            'bg-orange-600 text-white'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        
                        {player.photoURL ? (
                          <img
                            src={player.photoURL}
                            alt={player.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {player.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-white font-medium">{player.name}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-secondary font-semibold">{playerStats.goals}</div>
                          <div className="text-gray-400">Gols</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-semibold">{playerStats.assists}</div>
                          <div className="text-gray-400">Assists</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{performanceScore}</div>
                          <div className="text-gray-400">Pts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Instructions */}
        {!votingResult && (
          <div className="p-4 border-t border-gray-600 bg-primary-lighter bg-opacity-50">
            <div className="text-gray-400 text-sm space-y-1">
              <p>• Apenas jogadores presentes podem votar</p>
              <p>• Um voto para Bola Cheia e um para Bola Murcha</p>
              <p>• Pontuação: Gol = 2pts, Assistência = 1pt</p>
              <p>• Em caso de empate, vence quem tem maior pontuação</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}