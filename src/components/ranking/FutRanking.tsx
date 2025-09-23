import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../../lib/firebase';

interface FutRankingProps {
  futId: string;
  members: Record<string, any>;
  onRankingGenerated: (ranking: any[]) => void;
}

export const FutRanking: React.FC<FutRankingProps> = ({
  futId,
  members,
  onRankingGenerated
}) => {
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState<any[]>([]);
  const [futHistory, setFutHistory] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedFut, setSelectedFut] = useState<any>(null);

  useEffect(() => {
    loadFutHistory();
  }, [futId]);

  const loadFutHistory = async () => {
    try {
      const historyRef = ref(database, `futs/${futId}/history`);
      const historySnapshot = await get(historyRef);
      const historyData = historySnapshot.val();

      if (historyData) {
        const historyArray = Object.entries(historyData).map(([key, value]: [string, any]) => ({
          id: key,
          date: value.date || key,
          ...value
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setFutHistory(historyArray);
      }
    } catch (error) {
      console.error('Error loading fut history:', error);
    }
  };

  const generateFutRanking = async (type: 'pontuacao' | 'artilharia' | 'assistencias' | 'vitorias', futData: any) => {
    try {
      setLoading(true);
      
      if (!futData || !futData.playerStats) {
        setRanking([]);
        onRankingGenerated([]);
        return;
      }

      // Convert player stats to array
      let sortedRanking = Object.entries(futData.playerStats).map(([playerId, stats]: [string, any]) => ({
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
      console.error('Error generating fut ranking:', error);
      alert('Erro ao gerar ranking do fut');
    } finally {
      setLoading(false);
    }
  };

  const handleFutSelect = (futData: any) => {
    setSelectedFut(futData);
    setRanking([]);
    onRankingGenerated([]);
  };

  return (
    <div className="space-y-4">
      {/* Fut Selection */}
      <div>
        <h4 className="text-white font-medium mb-3">Selecionar Fut:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {futHistory.map((fut) => (
            <button
              key={fut.id}
              onClick={() => handleFutSelect(fut)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedFut?.id === fut.id
                  ? 'bg-secondary text-primary'
                  : 'bg-primary-lighter text-white hover:bg-primary'
              }`}
            >
              <div className="font-medium">{fut.date}</div>
              <div className="text-sm opacity-75">
                {fut.playerStats ? Object.keys(fut.playerStats).length : 0} jogadores
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ranking Buttons */}
      {selectedFut && (
        <div>
          <h4 className="text-white font-medium mb-3">Ranking do Fut:</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => generateFutRanking('pontuacao', selectedFut)}
              disabled={loading}
              className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Pontuação'}
            </button>
            <button
              onClick={() => generateFutRanking('artilharia', selectedFut)}
              disabled={loading}
              className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Artilharia'}
            </button>
            <button
              onClick={() => generateFutRanking('assistencias', selectedFut)}
              disabled={loading}
              className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Assistências'}
            </button>
            <button
              onClick={() => generateFutRanking('vitorias', selectedFut)}
              disabled={loading}
              className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Vitórias'}
            </button>
          </div>
        </div>
      )}

      {/* Ranking Display */}
      {ranking.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Resultado:</h4>
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
