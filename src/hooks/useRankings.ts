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
  const [loading, setLoading] = useState(true); // Start with loading true
  const [period, setPeriod] = useState<RankingPeriod>('rodada');
  const [type, setType] = useState<RankingType>('pontuacao');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  console.log(`useRankings initialized with futId: ${futId}, isAdmin: ${isAdmin}, period: ${period}, type: ${type}`);

  // Real-time listener for available dates
  useEffect(() => {
    if (!futId) {
      console.log('No futId provided, skipping available dates listener');
      return;
    }

    console.log(`Setting up available dates listener for futId: ${futId}`);
    const rankingsRef = ref(database, `futs/${futId}/rankings`);
    const unsubscribe = onValue(rankingsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dates = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          setAvailableDates(dates);
          console.log(`Available dates updated: ${dates.join(', ')}`);
        } else {
          setAvailableDates([]);
          console.log('No rankings data found for available dates');
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

    console.log(`Loading latest ranking for futId: ${futId}, period: ${period}, type: ${type}`);

    const unsubscribe = onValue(ref(database, `futs/${futId}/rankings`), async (snapshot) => {
      try {
        setLoading(true);
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('Rankings data found:', data);
          
          // Find the latest fut across all dates
          let latestFutRanking: FutRanking | null = null;
          let latestDate = '';
          let latestFutNumber = 0;
          let latestCreatedAt = 0;
          
          Object.entries(data).forEach(([date, dateRankings]: [string, any]) => {
            console.log(`Processing date: ${date}`);
            Object.entries(dateRankings).forEach(([futKey, futRanking]: [string, any]) => {
              const futNumber = parseInt(futKey.split('-')[1]) || 0;
              const futDate = new Date(date).getTime();
              const latestTime = latestDate ? new Date(latestDate).getTime() : 0;
              const createdAt = futRanking.createdAt || 0;
              
              console.log(`  Processing ${futKey}: futNumber=${futNumber}, futDate=${futDate}, latestTime=${latestTime}, createdAt=${createdAt}`);
              
              // If this fut is newer (later date, same date with higher fut number, or same date/fut with later createdAt)
              // For the first fut, latestTime will be 0, so futDate > 0 will be true
              if (futDate > latestTime || 
                  (futDate === latestTime && futNumber > latestFutNumber) ||
                  (futDate === latestTime && futNumber === latestFutNumber && createdAt > latestCreatedAt)) {
                latestFutRanking = futRanking;
                latestDate = date;
                latestFutNumber = futNumber;
                latestCreatedAt = createdAt;
                console.log(`    -> New latest: ${date}, fut-${futNumber}`);
              }
            });
          });
          
          if (latestFutRanking) {
            const rankingData = latestFutRanking.rankings[type] || [];
            setRankings(rankingData);
            console.log(`Loading latest ranking from ${latestDate}, fut-${latestFutNumber}, type: ${type}, data:`, rankingData);
          } else {
            console.log('No latest fut ranking found');
            setRankings([]);
          }
        } else {
          console.log('No rankings data found');
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