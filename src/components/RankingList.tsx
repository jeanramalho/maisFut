import React from 'react';
import { RankingEntry, RankingType } from '@/hooks/fut-details/types';

interface RankingListProps {
  rankings: RankingEntry[];
  type: RankingType;
  loading?: boolean;
}

export default function RankingList({ rankings, type, loading = false }: RankingListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-primary-lighter rounded-lg p-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-600 rounded mb-1"></div>
                  <div className="w-8 h-3 bg-gray-600 rounded"></div>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-primary-lighter rounded-lg p-6 text-center">
        <div className="text-gray-400 text-lg mb-2">📊</div>
        <div className="text-gray-400">Nenhum ranking disponível</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rankings.slice(0, 10).map((item, index) => {
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
                {type === 'pontuacao' ? item.score :
                 type === 'artilharia' ? item.goals :
                 type === 'assistencias' ? item.assists :
                 item.wins || 0}
              </div>
              <div className="text-gray-400 text-sm">
                {type === 'pontuacao' ? 'pts' :
                 type === 'artilharia' ? 'gols' :
                 type === 'assistencias' ? 'assist' :
                 'vitórias'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
