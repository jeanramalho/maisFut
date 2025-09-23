import React, { useState } from 'react';
import { GeneralRanking } from './GeneralRanking';
import { RoundRanking } from './RoundRanking';
import { FutRanking } from './FutRanking';

interface RankingTabProps {
  futId: string;
  members: Record<string, any>;
  isAdmin: boolean;
}

export const RankingTab: React.FC<RankingTabProps> = ({
  futId,
  members,
  isAdmin
}) => {
  const [activeView, setActiveView] = useState<'geral' | 'rodada' | 'fut'>('geral');
  const [currentRanking, setCurrentRanking] = useState<any[]>([]);

  const handleRankingGenerated = (ranking: any[]) => {
    setCurrentRanking(ranking);
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Apenas administradores podem acessar os rankings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-semibold">Rankings</h3>
      
      {/* View Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveView('geral')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeView === 'geral'
              ? 'bg-secondary text-primary'
              : 'bg-primary-lighter text-white hover:bg-primary'
          }`}
        >
          Ranking Geral
        </button>
        <button
          onClick={() => setActiveView('rodada')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeView === 'rodada'
              ? 'bg-secondary text-primary'
              : 'bg-primary-lighter text-white hover:bg-primary'
          }`}
        >
          Ranking da Rodada
        </button>
        <button
          onClick={() => setActiveView('fut')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeView === 'fut'
              ? 'bg-secondary text-primary'
              : 'bg-primary-lighter text-white hover:bg-primary'
          }`}
        >
          Ranking por Fut
        </button>
      </div>

      {/* Content based on active view */}
      <div className="bg-primary-lighter rounded-lg p-6">
        {activeView === 'geral' && (
          <div>
            <h4 className="text-white font-medium mb-4">Ranking Geral</h4>
            <p className="text-gray-400 text-sm mb-4">
              Soma de todos os gols, assistências e pontos de todos os futs
            </p>
            <GeneralRanking
              futId={futId}
              members={members}
              onRankingGenerated={handleRankingGenerated}
            />
          </div>
        )}

        {activeView === 'rodada' && (
          <div>
            <h4 className="text-white font-medium mb-4">Ranking da Rodada</h4>
            <p className="text-gray-400 text-sm mb-4">
              Ranking do último fut jogado
            </p>
            <RoundRanking
              futId={futId}
              members={members}
              onRankingGenerated={handleRankingGenerated}
            />
          </div>
        )}

        {activeView === 'fut' && (
          <div>
            <h4 className="text-white font-medium mb-4">Ranking por Fut</h4>
            <p className="text-gray-400 text-sm mb-4">
              Selecione um fut específico para ver seu ranking
            </p>
            <FutRanking
              futId={futId}
              members={members}
              onRankingGenerated={handleRankingGenerated}
            />
          </div>
        )}
      </div>

      {/* No data message */}
      {currentRanking.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Nenhum ranking gerado ainda</p>
          <p className="text-gray-500 text-sm">Selecione um tipo de ranking acima para começar</p>
        </div>
      )}
    </div>
  );
};
