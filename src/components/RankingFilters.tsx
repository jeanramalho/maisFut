import React from 'react';
import { RankingPeriod, RankingType } from '@/hooks/fut-details/types';

interface RankingFiltersProps {
  period: RankingPeriod;
  type: RankingType;
  onPeriodChange: (period: RankingPeriod) => void;
  onTypeChange: (type: RankingType) => void;
  isAdmin?: boolean;
}

export default function RankingFilters({
  period,
  type,
  onPeriodChange,
  onTypeChange,
  isAdmin = false
}: RankingFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Period Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => onPeriodChange('rodada')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === 'rodada'
              ? 'bg-secondary text-primary'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Rodada
        </button>
        <button
          onClick={() => onPeriodChange('anual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === 'anual'
              ? 'bg-secondary text-primary'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Anual
        </button>
      </div>

      {/* Type Filters */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onTypeChange('pontuacao')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            type === 'pontuacao'
              ? 'bg-secondary text-primary'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Pontuação
        </button>
        <button
          onClick={() => onTypeChange('artilharia')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            type === 'artilharia'
              ? 'bg-secondary text-primary'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Artilharia
        </button>
        <button
          onClick={() => onTypeChange('assistencias')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            type === 'assistencias'
              ? 'bg-secondary text-primary'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Assistências
        </button>
      </div>
    </div>
  );
}
