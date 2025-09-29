import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface RankingCalendarProps {
  availableDates: string[]; // Array of dates with rankings in YYYY-MM-DD format
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export default function RankingCalendar({ availableDates, onDateSelect, onClose }: RankingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const hasRanking = (date: Date) => {
    const dateStr = formatDate(date);
    return availableDates.includes(dateStr);
  };

  const handleDateClick = (date: Date) => {
    if (hasRanking(date)) {
      onDateSelect(formatDate(date));
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-lighter rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-secondary" />
            <h3 className="text-white text-lg font-semibold">Calendário de Rankings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h4 className="text-white text-lg font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-gray-400 text-xs font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-8"></div>;
            }

            const hasRankingData = hasRanking(day);
            const isToday = formatDate(day) === formatDate(new Date());

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={!hasRankingData}
                className={`h-8 rounded text-sm transition-colors ${
                  hasRankingData
                    ? 'bg-secondary text-primary font-bold hover:bg-secondary/80'
                    : isToday
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <div className="text-gray-400 text-sm">
            Datas em <span className="text-secondary font-bold">negrito</span> possuem rankings
          </div>
        </div>
      </div>
    </div>
  );
}
