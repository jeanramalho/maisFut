import React, { useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../../lib/firebase';

interface GeneralRankingProps {
  futId: string;
  members: Record<string, any>;
  onRankingGenerated: (ranking: any[]) => void;
}

export const GeneralRanking: React.FC<GeneralRankingProps> = ({
  futId,
  members,
  onRankingGenerated
}) => {
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState<any[]>([]);

  const generateGeneralRanking = async (type: 'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias') => {
    try {
      setLoading(true);
      
      // Load all fut history data
      const historyRef = ref(database, `futs/${futId}/history`);
      const historySnapshot = await get(historyRef);
      const historyData = historySnapshot.val();

      if (!historyData) {
        setRanking([]);
        onRankingGenerated([]);
        return;
      }

      // Aggregate data from all futs
      const aggregatedStats: Record<string, any> = {};

      Object.values(historyData).forEach((futData: any) => {
        if (futData.playerStats) {
          Object.entries(futData.playerStats).forEach(([playerId, stats]: [string, any]) => {
            if (!aggregatedStats[playerId]) {
              aggregatedStats[playerId] = {
                playerId,
                name: stats.name || members[playerId]?.name || 'Jogador',
                goals: 0,
                assists: 0,
                wins: 0,
                score: 0
              };
            }

            aggregatedStats[playerId].goals += stats.goals || 0;
            aggregatedStats[playerId].assists += stats.assists || 0;
            aggregatedStats[playerId].wins += stats.wins || 0;
            aggregatedStats[playerId].score += (stats.goals || 0) * 2 + (stats.assists || 0);
          });
        }
      });

      // Convert to array and sort
      let sortedRanking = Object.values(aggregatedStats);

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
      console.error('Error generating general ranking:', error);
      alert('Erro ao gerar ranking geral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => generateGeneralRanking('pontuacao')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Pontuação Geral'}
        </button>
        <button
          onClick={() => generateGeneralRanking('artilharia')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Artilharia Geral'}
        </button>
        <button
          onClick={() => generateGeneralRanking('assistencias')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Assistências Geral'}
        </button>
        <button
          onClick={() => generateGeneralRanking('vitorias')}
          disabled={loading}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Vitórias Geral'}
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
