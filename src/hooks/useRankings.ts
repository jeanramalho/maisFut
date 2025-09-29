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

  // Load available dates with rankings
  const loadAvailableDates = useCallback(async () => {
    if (!futId) return;

    try {
      const rankingsRef = ref(database, `futs/${futId}/rankings`);
      const snapshot = await get(rankingsRef);
      
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
  }, [futId]);

  // Load latest fut ranking (for rodada period)
  const loadLatestRanking = useCallback(async () => {
    if (!futId || availableDates.length === 0) {
      setRankings([]);
      return;
    }

    setLoading(true);
    try {
      const latestDate = availableDates[0];
      const futRankingsRef = ref(database, `futs/${futId}/rankings/${latestDate}`);
      const snapshot = await get(futRankingsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Get the latest fut for this date (highest fut number)
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
      console.error('Error loading latest ranking:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [futId, availableDates, type]);

  // Load annual ranking
  const loadAnnualRanking = useCallback(async () => {
    if (!futId) {
      setRankings([]);
      return;
    }

    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const annualRankingsRef = ref(database, `futs/${futId}/rankings-anual/${currentYear}`);
      const snapshot = await get(annualRankingsRef);
      
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
  }, [futId, type]);

  // Load ranking for specific date
  const loadRankingForDate = useCallback(async (date: string) => {
    if (!futId) {
      setRankings([]);
      return;
    }

    setLoading(true);
    try {
      const futRankingsRef = ref(database, `futs/${futId}/rankings/${date}`);
      const snapshot = await get(futRankingsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Get the latest fut for this date
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
  }, [futId, type]);

  // Load rankings based on current period
  const loadRankings = useCallback(() => {
    if (period === 'anual') {
      loadAnnualRanking();
    } else if (selectedDate) {
      loadRankingForDate(selectedDate);
    } else {
      loadLatestRanking();
    }
  }, [period, selectedDate, loadAnnualRanking, loadRankingForDate, loadLatestRanking]);

  // Load data when component mounts or dependencies change
  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

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
    loadRankings,
  };
}
