import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue, get } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { FutHeader } from './FutHeader';
import { FutTabs } from './FutTabs';
import { FutTab } from './FutTab';
import { FutTimes } from './FutTimes';
import { FutData } from './FutData';
import { FutInfo } from './FutInfo';
import { FutMembers } from './FutMembers';
import { FutAnnouncements } from './FutAnnouncements';
import { FutSettings } from './FutSettings';
import { RankingTab } from '../ranking/RankingTab';

interface Fut {
  id: string;
  name: string;
  description?: string;
  type: 'mensal' | 'avulso';
  time?: string;
  location?: string;
  maxVagas: number;
  adminId: string;
  admins?: Record<string, boolean>;
  members: Record<string, boolean>;
  photoURL?: string;
  createdAt: number;
  recurrence?: {
    kind: 'weekly' | 'monthly';
    day: number;
  };
  privacy: 'public' | 'invite';
  listReleased?: boolean;
  releasedVagas?: number;
  confirmedMembers?: string[];
  futStarted?: boolean;
  teams?: any;
  teamStats?: any;
  playerStats?: any;
  futEnded?: boolean;
  votingOpen?: boolean;
  votingEnded?: boolean;
  playerVotes?: any;
  userVotes?: any;
  showRanking?: boolean;
  ranking?: any;
}

interface UserData {
  name: string;
  email: string;
  photoURL?: string;
  totalGoals?: number;
  totalAssists?: number;
}

export function FutDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  
  // Estados principais
  const [fut, setFut] = useState<Fut | null>(null);
  const [members, setMembers] = useState<Record<string, UserData>>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [futHistory, setFutHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fut' | 'members' | 'times' | 'data' | 'ranking' | 'info' | 'announcements' | 'settings'>('fut');

  // Estados de controle
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Estados do fut
  const [futStarted, setFutStarted] = useState(false);
  const [listReleased, setListReleased] = useState(false);
  const [releasedVagas, setReleasedVagas] = useState(0);

  // Carregar dados do fut
  useEffect(() => {
    if (!id || !user || authLoading || dataLoaded) {
      if (!authLoading) setLoading(false);
      return;
    }

    console.log('Loading fut data for:', id);

    const futRef = ref(database, `futs/${id}`);
    const unsubscribe = onValue(futRef, async (snapshot) => {
      try {
        const futData = snapshot.val();
        
        if (!futData) {
          router.push('/');
          return;
        }

        // Verificar acesso
        if (!futData.members?.[user.uid] && futData.adminId !== user.uid) {
          router.push('/');
          return;
        }

        setFut({ id: id as string, ...futData });

        // Carregar estados do fut
        if (futData.listReleased !== undefined) {
          setListReleased(futData.listReleased);
        }
        if (futData.releasedVagas !== undefined) {
          setReleasedVagas(futData.releasedVagas);
        }
        if (futData.futStarted !== undefined) {
          setFutStarted(futData.futStarted);
        }

        // Carregar dados dos membros
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

        // Carregar anúncios
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

        // Carregar histórico
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

        setDataLoaded(true);
        setLoading(false);
        console.log('Fut data loaded successfully');

      } catch (error) {
        console.error('Error loading fut data:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, user, authLoading, dataLoaded, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-secondary text-lg">Carregando...</div>
      </div>
    );
  }

  if (!fut) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary text-lg mb-4">Fut não encontrado</div>
          <button
            onClick={() => router.push('/')}
            className="bg-secondary text-primary px-4 py-2 rounded hover:bg-secondary-darker transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = !!(user && fut && (fut.adminId === user.uid || fut.admins?.[user.uid]));
  const isOriginalAdmin = !!(user && fut && fut.adminId === user.uid);

  return (
    <div className="min-h-screen bg-primary">
      <FutHeader fut={fut} />
      
      <FutTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin}
        futStarted={futStarted}
      />

      <div className="p-6">
        {activeTab === 'fut' && isAdmin && (
          <FutTab 
            fut={fut} 
            members={members} 
            isAdmin={isAdmin}
          />
        )}
        
        {activeTab === 'times' && isAdmin && futStarted && (
          <FutTimes 
            fut={fut} 
            members={members} 
            isAdmin={isAdmin}
          />
        )}
        
        {activeTab === 'data' && isAdmin && futStarted && (
          <FutData 
            fut={fut} 
            members={members} 
            isAdmin={isAdmin}
          />
        )}
        
        {activeTab === 'info' && (
          <FutInfo fut={fut} members={members} />
        )}
        
        {activeTab === 'members' && (
          <FutMembers 
            fut={fut} 
            members={members} 
            isAdmin={isAdmin}
            isOriginalAdmin={isOriginalAdmin}
            user={user}
          />
        )}
        
        {activeTab === 'announcements' && isAdmin && (
          <FutAnnouncements 
            futId={id as string}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
          />
        )}
        
        {activeTab === 'ranking' && (
          <RankingTab 
            futId={id as string} 
            members={members} 
            isAdmin={isAdmin} 
          />
        )}
        
        {activeTab === 'settings' && isAdmin && (
          <FutSettings 
            fut={fut}
            members={members}
            isOriginalAdmin={isOriginalAdmin}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
