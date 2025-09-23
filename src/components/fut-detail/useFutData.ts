import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, get, set, push, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Fut, UserData, Announcement } from './types';

export const useFutData = (id: string | string[] | undefined, userId: string | undefined) => {
  const [fut, setFut] = useState<Fut | null>(null);
  const [members, setMembers] = useState<Record<string, UserData>>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [futHistory, setFutHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load fut data
  useEffect(() => {
    if (!id || !userId || initialized) {
      if (!userId) setLoading(false);
      return;
    }

    console.log('Loading fut data for:', id);

    const futRef = ref(database, `futs/${id}`);
    const unsubscribe = onValue(futRef, async (snapshot) => {
      try {
        const futData = snapshot.val();
        
        if (!futData) {
          setLoading(false);
          return;
        }

        // Check if user has access to this fut
        if (!futData.members?.[userId] && futData.adminId !== userId) {
          setLoading(false);
          return;
        }

        setFut({ id: id as string, ...futData });

        // Load member data
        if (futData.members) {
          const memberIds = Object.keys(futData.members);
          const memberPromises = memberIds.map(async (memberId) => {
            const memberRef = ref(database, `users/${memberId}`);
            const memberSnapshot = await get(memberRef);
            return { id: memberId, data: memberSnapshot.val() };
          });

          const memberResults = await Promise.all(memberPromises);
          const membersData: Record<string, UserData> = {};
          
          memberResults.forEach(({ id, data }) => {
            if (data) {
              membersData[id] = data;
            }
          });

          setMembers(membersData);
        }

        // Load announcements
        const announcementsRef = ref(database, `futs/${id}/announcements`);
        const announcementsSnapshot = await get(announcementsRef);
        if (announcementsSnapshot.exists()) {
          const announcementsData = announcementsSnapshot.val();
          const announcementsList = Object.entries(announcementsData).map(([key, value]: [string, any]) => ({
            id: key,
            ...value
          }));
          setAnnouncements(announcementsList.sort((a, b) => b.createdAt - a.createdAt));
        }

        // Load fut history
        const historyRef = ref(database, `futs/${id}/history`);
        const historySnapshot = await get(historyRef);
        if (historySnapshot.exists()) {
          const historyData = historySnapshot.val();
          const historyList = Object.entries(historyData).map(([key, value]: [string, any]) => ({
            id: key,
            ...value
          }));
          setFutHistory(historyList.sort((a, b) => b.date - a.date));
        }

        setInitialized(true);
        setLoading(false);
        console.log('Fut data loaded successfully');

      } catch (error) {
        console.error('Error loading fut data:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, userId, initialized]);

  // Update fut function
  const updateFut = useCallback(async (updates: Partial<Fut>) => {
    if (!fut) return;
    
    try {
      const futRef = ref(database, `futs/${fut.id}`);
      await set(futRef, { ...fut, ...updates });
      setFut(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating fut:', error);
      throw error;
    }
  }, [fut]);

  // Save announcement function
  const saveAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id'>) => {
    if (!fut) return;
    
    try {
      const announcementRef = ref(database, `futs/${fut.id}/announcements`);
      const newAnnouncementRef = push(announcementRef);
      await set(newAnnouncementRef, announcement);
      
      const newAnnouncement: Announcement = {
        id: newAnnouncementRef.key!,
        ...announcement
      };
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    } catch (error) {
      console.error('Error saving announcement:', error);
      throw error;
    }
  }, [fut]);

  // Delete announcement function
  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    if (!fut) return;
    
    try {
      const announcementRef = ref(database, `futs/${fut.id}/announcements/${announcementId}`);
      await remove(announcementRef);
      
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }, [fut]);

  return {
    fut,
    members,
    setMembers,
    announcements,
    futHistory,
    loading,
    updateFut,
    saveAnnouncement,
    deleteAnnouncement
  };
};
