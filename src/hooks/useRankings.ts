import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { RankingEntry, RankingType, RankingPeriod, FutRanking, AnnualRanking } from '@/hooks/fut-details/types';

interface UseRankingsProps {
  futId: string;
  isAdmin: boolean;
}

export function useRankings({ futId, isAdmin }: UseRankingsProps) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<RankingPeriod>('rodada');
  const [type, setType] = useState<RankingType>('pontuacao');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Real-time listener for available dates
  useEffect(() => {
    if (!futId) return;

    const rankingsRef = ref(database, `futs/${futId}/rankings`);
    const unsubscribe = onValue(rankingsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dates = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          setAvailableDates(dates);
        } else {
          setAvailableDates([]);
        }
      } catch (error) {
        console.error('Error loading available dates:', error);
        setAvailableDates([]);
      }
    });

    return unsubscribe;
  }, [futId]);

  // Real-time listener for latest ranking (rodada period)
  useEffect(() => {
    if (!futId || period !== 'rodada' || selectedDate) return;

    const unsubscribe = onValue(ref(database, `futs/${futId}/rankings`), async (snapshot) => {
      try {
        setLoading(true);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dates = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          
          if (dates.length > 0) {
            const latestDate = dates[0];
            const futRankingsRef = ref(database, `futs/${futId}/rankings/${latestDate}`);
            const futSnapshot = await get(futRankingsRef);
            
            if (futSnapshot.exists()) {
              const futData = futSnapshot.val();
              const futKeys = Object.keys(futData);
              const latestFutKey = futKeys.reduce((latest, key) => {
                const futNumber = parseInt(key.split('-')[1]) || 0;
                const latestNumber = parseInt(latest.split('-')[1]) || 0;
                return futNumber > latestNumber ? key : latest;
              }, futKeys[0]);
              
              const futRanking: FutRanking = futData[latestFutKey];
              const rankingData = futRanking.rankings[type] || [];
              setRankings(rankingData);
            } else {
              setRankings([]);
            }
          } else {
            setRankings([]);
          }
        } else {
          setRankings([]);
        }
      } catch (error) {
        console.error('Error loading latest ranking:', error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [futId, period, type, selectedDate]);

  // Real-time listener for annual ranking
  useEffect(() => {
    if (!futId || period !== 'anual') return;

    const currentYear = new Date().getFullYear();
    const annualRankingsRef = ref(database, `futs/${futId}/rankings-anual/${currentYear}`);
    
    const unsubscribe = onValue(annualRankingsRef, (snapshot) => {
      try {
        setLoading(true);
        if (snapshot.exists()) {
          const annualRanking: AnnualRanking = snapshot.val();
          const rankingData = annualRanking.rankings[type] || [];
          setRankings(rankingData);
        } else {
          setRankings([]);
        }
      } catch (error) {
        console.error('Error loading annual ranking:', error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [futId, period, type]);

  // Real-time listener for specific date ranking
  useEffect(() => {
    if (!futId || !selectedDate || period !== 'rodada') return;

    const futRankingsRef = ref(database, `futs/${futId}/rankings/${selectedDate}`);
    
    const unsubscribe = onValue(futRankingsRef, (snapshot) => {
      try {
        setLoading(true);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const futKeys = Object.keys(data);
          const latestFutKey = futKeys.reduce((latest, key) => {
            const futNumber = parseInt(key.split('-')[1]) || 0;
            const latestNumber = parseInt(latest.split('-')[1]) || 0;
            return futNumber > latestNumber ? key : latest;
          }, futKeys[0]);
          
          const futRanking: FutRanking = data[latestFutKey];
          const rankingData = futRanking.rankings[type] || [];
          setRankings(rankingData);
        } else {
          setRankings([]);
        }
      } catch (error) {
        console.error('Error loading ranking for date:', error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [futId, selectedDate, type, period]);

  // Handle period change
  const handlePeriodChange = useCallback((newPeriod: RankingPeriod) => {
    setPeriod(newPeriod);
    setSelectedDate(null); // Reset selected date when changing period
  }, []);

  // Handle type change
  const handleTypeChange = useCallback((newType: RankingType) => {
    setType(newType);
  }, []);

  // Handle date selection (for admin calendar)
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setPeriod('rodada'); // Switch to rodada when selecting a specific date
  }, []);

  return {
    rankings,
    loading,
    period,
    type,
    availableDates,
    selectedDate,
    handlePeriodChange,
    handleTypeChange,
    handleDateSelect,
  };
}