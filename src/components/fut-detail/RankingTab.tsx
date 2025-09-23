import React from 'react';
import Image from 'next/image';
import { Calendar, Trophy, Target, Users, Award } from 'lucide-react';
import { UserData, RankingType, RankingView } from './types';

interface RankingTabProps {
  ranking: any;
  rankingType: RankingType;
  rankingView: RankingView;
  loadingRanking: boolean;
  futHistory: any[];
  selectedDate: string;
  members: Record<string, UserData>;
  onRankingTypeChange: (type: RankingType) => void;
  onRankingViewChange: (view: RankingView) => void;
  onDateChange: (date: string) => void;
  onGenerateRanking: (type: RankingType) => void;
}

export default function RankingTab({
  ranking,
  rankingType,
  rankingView,
  loadingRanking,
  futHistory,
  selectedDate,
  members,
  onRankingTypeChange,
  onRankingViewChange,
  onDateChange,
  onGenerateRanking
}: RankingTabProps) {
  const rankingTypes = [
    { id: 'pontuacao' as RankingType, label: 'Pontuação', icon: Trophy },
    { id: 'artilharia' as RankingType, label: 'Artilharia', icon: Target },
    { id: 'assistencias' as RankingType, label: 'Assistências', icon: Users },
    { id: 'vitorias' as RankingType, label: 'Vitórias', icon: Award }
  ];

  const rankingViews = [
    { id: 'geral' as RankingView, label: 'Geral' },
    { id: 'rodada' as RankingView, label: 'Rodada' },
    { id: 'fut' as RankingView, label: 'Por Fut' }
  ];

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}º`;
    }
  };

  const getRankingValue = (item: any, type: RankingType) => {
    switch (type) {
      case 'pontuacao':
        return item.points || 0;
      case 'artilharia':
        return item.goals || 0;
      case 'assistencias':
        return item.assists || 0;
      case 'vitorias':
        return item.wins || 0;
      default:
        return 0;
    }
  };

  const getRankingLabel = (type: RankingType) => {
    switch (type) {
      case 'pontuacao':
        return 'Pontos';
      case 'artilharia':
        return 'Gols';
      case 'assistencias':
        return 'Assistências';
      case 'vitorias':
        return 'Vitórias';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Ranking Controls */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-4">Rankings</h3>
        
        {/* Ranking View Selection */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">Tipo de Ranking:</label>
          <div className="flex space-x-2 overflow-x-auto">
            {rankingViews.map((view) => (
              <button
                key={view.id}
                onClick={() => onRankingViewChange(view.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  rankingView === view.id
                    ? 'bg-secondary text-primary'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ranking Type Selection */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">Categoria:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {rankingTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => onRankingTypeChange(type.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center space-y-1 ${
                    rankingType === type.id
                      ? 'bg-secondary text-primary'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent size={20} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Selection for Fut Ranking */}
        {rankingView === 'fut' && (
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-2">Selecionar Data:</label>
            <div className="flex space-x-2">
              <select
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-primary border border-gray-600 rounded text-white focus:outline-none focus:border-secondary"
              >
                <option value="">Selecione uma data</option>
                {futHistory.map((fut) => (
                  <option key={fut.id} value={fut.date}>
                    {new Date(fut.date).toLocaleDateString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={() => onGenerateRanking(rankingType)}
          disabled={loadingRanking || (rankingView === 'fut' && !selectedDate)}
          className="w-full bg-secondary text-primary py-2 rounded-lg font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingRanking ? 'Gerando...' : 'Gerar Ranking'}
        </button>
      </div>

      {/* Ranking Display */}
      {ranking && ranking.length > 0 && (
        <div className="bg-primary-lighter rounded-lg p-4">
          <h4 className="text-white text-lg font-semibold mb-4">
            Ranking {rankingTypes.find(t => t.id === rankingType)?.label} - {rankingViews.find(v => v.id === rankingView)?.label}
          </h4>
          
          <div className="space-y-3">
            {ranking.map((item: any, index: number) => {
              const memberData = members[item.playerId];
              const value = getRankingValue(item, rankingType);
              
              return (
                <div key={item.playerId || index} className="bg-primary p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-secondary font-bold text-lg w-8">
                        {getRankingIcon(index + 1)}
                      </div>
                      
                      {memberData?.photoURL ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={memberData.photoURL}
                            alt={memberData.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold">
                            {memberData?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}

                      <div>
                        <h5 className="text-white font-medium">{memberData?.name || 'Jogador'}</h5>
                        {memberData?.position && (
                          <p className="text-gray-400 text-sm">{memberData.position}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-secondary font-bold text-xl">{value}</div>
                      <div className="text-gray-400 text-sm">{getRankingLabel(rankingType)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {ranking && ranking.length === 0 && (
        <div className="bg-primary-lighter rounded-lg p-6 text-center">
          <Trophy size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Nenhum dado encontrado</p>
          <p className="text-gray-500 text-sm">Gere o ranking para ver os resultados</p>
        </div>
      )}

      {/* No Ranking Generated */}
      {!ranking && (
        <div className="bg-primary-lighter rounded-lg p-6 text-center">
          <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Ranking não gerado</p>
          <p className="text-gray-500 text-sm">Clique em "Gerar Ranking" para ver os resultados</p>
        </div>
      )}
    </div>
  );
}
