import { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { recordEvent } from '@/lib/presence';
import { Target, Users, Clock, X } from 'lucide-react';

interface OccurrenceLiveProps {
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

interface GameEvent {
  type: 'goal' | 'assist';
  playerId: string;
  time: string;
  timestamp: number;
  by: string;
}

interface PlayerStats {
  goals: number;
  assists: number;
}

export default function OccurrenceLive({ futId, dateId, isAdmin, onClose }: OccurrenceLiveProps) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [stats, setStats] = useState<Record<string, PlayerStats>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'scheduled' | 'live' | 'closed'>('scheduled');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen to occurrence data
    const occurrenceRef = ref(database, `futOccurrences/${futId}/${dateId}`);
    const unsubscribe = onValue(occurrenceRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setEvents(data.events || []);
      setStats(data.stats || {});
      setGameStatus(data.status || 'scheduled');

      // Fetch player data for those present
      if (data.present) {
        const playerIds = Object.keys(data.present);
        const playerPromises = playerIds.map(async (playerId) => {
          const playerRef = ref(database, `users/${playerId}`);
          const playerSnapshot = await new Promise((resolve) => {
            onValue(playerRef, resolve, { onlyOnce: true });
          }) as any;
          const playerData = playerSnapshot.val();
          return {
            id: playerId,
            name: playerData?.name || 'Jogador',
            photoURL: playerData?.photoURL,
          };
        });

        const playersData = await Promise.all(playerPromises);
        setPlayers(playersData);
      }
    });

    return unsubscribe;
  }, [futId, dateId]);

  const handleStartGame = async () => {
    if (!isAdmin) return;

    try {
      const occurrenceRef = ref(database, `futOccurrences/${futId}/${dateId}`);
      await update(occurrenceRef, {
        status: 'live',
        startTime: Date.now(),
      });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleEndGame = async () => {
    if (!isAdmin) return;

    try {
      const occurrenceRef = ref(database, `futOccurrences/${futId}/${dateId}`);
      await update(occurrenceRef, {
        status: 'closed',
        endTime: Date.now(),
      });
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  const handleRecordEvent = async (eventType: 'goal' | 'assist') => {
    if (!isAdmin || !selectedPlayer || !user) return;

    setLoading(true);
    try {
      const result = await recordEvent(futId, dateId, selectedPlayer, eventType, user.uid);
      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error recording event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerStats = (playerId: string) => {
    return stats[playerId] || { goals: 0, assists: 0 };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-lighter rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div>
            <h2 className="text-white text-xl font-semibold">Partida ao Vivo</h2>
            <p className="text-gray-400 text-sm">{dateId}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              gameStatus === 'live' 
                ? 'bg-red-600 text-white animate-pulse' 
                : gameStatus === 'closed'
                ? 'bg-gray-600 text-gray-300'
                : 'bg-yellow-600 text-white'
            }`}>
              {gameStatus === 'live' ? 'AO VIVO' : gameStatus === 'closed' ? 'ENCERRADA' : 'AGENDADA'}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Game Controls - Admin only */}
        {isAdmin && (
          <div className="p-4 border-b border-gray-600">
            {gameStatus === 'scheduled' && (
              <button
                onClick={handleStartGame}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Iniciar Partida
              </button>
            )}

            {gameStatus === 'live' && (
              <div className="space-y-3">
                {/* Player Selection */}
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
                >
                  <option value="">Selecionar jogador...</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>

                {/* Event Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRecordEvent('goal')}
                    disabled={!selectedPlayer || loading}
                    className="flex-1 bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Target size={20} />
                    <span>Gol</span>
                  </button>
                  <button
                    onClick={() => handleRecordEvent('assist')}
                    disabled={!selectedPlayer || loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Users size={20} />
                    <span>Assist</span>
                  </button>
                </div>

                <button
                  onClick={handleEndGame}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Encerrar Partida
                </button>
              </div>
            )}
          </div>
        )}

        {/* Players List with Stats */}
        <div className="p-4">
          <h3 className="text-white text-lg font-semibold mb-3 flex items-center space-x-2">
            <Users size={20} />
            <span>Jogadores Presentes ({players.length})</span>
          </h3>

          <div className="space-y-2 mb-6">
            {players.map(player => {
              const playerStats = getPlayerStats(player.id);
              return (
                <div
                  key={player.id}
                  className={`bg-primary rounded-lg p-3 border transition-colors ${
                    selectedPlayer === player.id 
                      ? 'border-secondary' 
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events Feed */}
          <h3 className="text-white text-lg font-semibold mb-3 flex items-center space-x-2">
            <Clock size={20} />
            <span>Eventos da Partida</span>
          </h3>

          <div className="space-y-2">
            {events.length > 0 ? (
              events
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((event, index) => {
                  const player = players.find(p => p.id === event.playerId);
                  return (
                    <div
                      key={index}
                      className="bg-primary rounded-lg p-3 border border-gray-700 flex items-center space-x-3"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        event.type === 'goal' 
                          ? 'bg-secondary' 
                          : 'bg-blue-600'
                      }`}>
                        {event.type === 'goal' ? (
                          <Target size={14} className="text-primary" />
                        ) : (
                          <Users size={14} className="text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {player?.name} - {event.type === 'goal' ? 'Gol' : 'Assistência'}
                        </div>
                        <div className="text-gray-400 text-sm">{event.time}</div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-400">Nenhum evento ainda</div>
                {gameStatus === 'scheduled' && (
                  <div className="text-gray-500 text-sm mt-1">
                    A partida precisa ser iniciada
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}