import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import Header from '@/components/Header';
import FutCard from '@/components/FutCard';
import CreateFutModal from '@/components/CreateFutModal';
import { Plus } from 'lucide-react';

interface Fut {
  id: string;
  name: string;
  photoURL?: string;
  adminId: string;
  type: 'mensal' | 'avulso';
  recurrence?: {
    kind: 'weekly' | 'monthly';
    day: number;
  };
  maxVagas: number;
  privacy: 'public' | 'invite';
  members: Record<string, boolean>;
  location?: string;
  description?: string;
}

export default function Home() {
  const { user, userData, loading } = useAuth();
  const [futs, setFuts] = useState<Fut[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Listen to user's futs
      const futsRef = ref(database, 'futs');
      const unsubscribe = onValue(futsRef, (snapshot) => {
        const futsData = snapshot.val() || {};
        const userFuts: Fut[] = [];

        Object.entries(futsData).forEach(([id, futData]: [string, any]) => {
          // Only show futs where user is a member or admin
          if (futData.members?.[user.uid] || futData.adminId === user.uid) {
            userFuts.push({
              id,
              ...futData,
            });
          }
        });

        setFuts(userFuts);
      });

      return unsubscribe;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-secondary text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const mensalFuts = futs.filter(fut => fut.type === 'mensal');
  const avulsoFuts = futs.filter(fut => fut.type === 'avulso');

  return (
    <div className="min-h-screen bg-primary">
      <Header />
      
      <div className="px-6 pb-6">
        {/* Futs Mensais */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold">Futs Mensais</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-secondary text-primary p-2 rounded-full hover:bg-secondary-darker transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {mensalFuts.length > 0 ? (
              mensalFuts.map(fut => (
                <FutCard key={fut.id} fut={fut} />
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                Nenhum fut mensal ainda. Que tal criar o primeiro?
              </div>
            )}
          </div>
        </section>

        {/* Futs Avulsos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold">Futs Avulsos</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-secondary text-primary p-2 rounded-full hover:bg-secondary-darker transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {avulsoFuts.length > 0 ? (
              avulsoFuts.map(fut => (
                <FutCard key={fut.id} fut={fut} />
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                Nenhum fut avulso ainda. Que tal criar o primeiro?
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Create Fut Modal */}
      {showCreateModal && (
        <CreateFutModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}