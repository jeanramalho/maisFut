import React, { useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../../lib/firebase';

interface RoundRankingProps {
  futId: string;
  members: Record<string, any>;
  onRankingGenerated: (ranking: any[]) => void;
}

export const RoundRanking: React.FC<RoundRankingProps> = ({
  futId,
  members,
  onRankingGenerated
}) => {
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState<any[]>([]);

  const generateRoundRanking = async (type: 'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias') => {
    try {
      setLoading(true);
      
      // Get the most recent fut data
      const historyRef = ref(database, `futs/${futId}/history`);
      const historySnapshot = await get(historyRef);
      const historyData = historySnapshot.val();

      if (!historyData) {
        setRanking([]);
        onRankingGenerated([]);
        return;
      }

      // Get the most recent fut (last entry)
      const futEntries = Object.values(historyData);
      const mostRecentFut = futEntries[futEntries.length - 1] as any;

      if (!mostRecentFut || !mostRecentFut.playerStats) {
        setRanking([]);
        onRankingGenerated([]);
        return;
      }

      // Convert player stats to array
      let sortedRanking = Object.entries(mostRecentFut.playerStats).map(([playerId, stats]: [string, any]) => ({
        playerId,
        name: stats.name || members[playerId]?.name || 'Jogador',
        goals: stats.goals || 0,
        assists: stats.assists || 0,
        wins: stats.wins || 0,
        score: (stats.goals || 0) * 2 + (stats.assists || 0)
      }));

      // Sort by selected type
      switch (type) {
        case 'pontuacao':
          sortedRanking = sortedRanking.sort((a, b) => b.score - a.score);
          break;
        case 'artilharia':
          sortedRanking = sortedRanking.sort((a, b) => b.goals - a.goals);
          break;
        case 'assistencias':
          sortedRanking = sortedRanking.sort((a, b) => b.assists - a.assists);
          break;
        case 'vitorias':
          sortedRanking = sortedRanking.sort((a, b) => b.wins - a.wins);
          break;
      }

      setRanking(sortedRanking);
      onRankingGenerated(sortedRanking);
    } catch (error) {
      console.error('Error generating round ranking:', error);
      alert('Erro ao gerar ranking da rodada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => generateRoundRanking('pontuacao')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Pontuação da Rodada'}
        </button>
        <button
          onClick={() => generateRoundRanking('artilharia')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Artilharia da Rodada'}
        </button>
        <button
          onClick={() => generateRoundRanking('assistencias')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Assistências da Rodada'}
        </button>
        <button
          onClick={() => generateRoundRanking('vitorias')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Vitórias da Rodada'}
        </button>
      </div>

      {ranking.length > 0 && (
        <div className="space-y-3">
          {ranking.map((item, index) => {
            const position = index + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '';
            
            return (
              <div key={item.playerId} className="bg-primary-lighter rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{medal}</div>
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-gray-400 text-sm">#{position}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-lg">
                    {item.score} pts
                  </div>
                  <div className="text-gray-400 text-sm">
                    {item.goals}G • {item.assists}A • {item.wins}V
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
