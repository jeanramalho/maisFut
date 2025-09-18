import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import Header from '@/components/Header';
import FutCard from '@/components/FutCard';
import CreateFutModal from '@/components/CreateFutModal';
import { Plus, Trophy, Target, Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react';

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
        {/* User Stats */}
        <div className="mb-6">
          <div className="flex items-center space-x-6 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <Trophy size={16} className="text-secondary" />
              <span className="text-white">12 gols</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-secondary" />
              <span className="text-white">8 assists</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-primary-lighter rounded-lg p-4 mb-6">
            <div className="flex justify-between">
              <div className="text-center">
                <Trophy size={24} className="text-secondary mx-auto mb-2" />
                <div className="text-white text-2xl font-bold">12</div>
                <div className="text-gray-400 text-sm">Gols</div>
              </div>
              <div className="text-center">
                <Target size={24} className="text-secondary mx-auto mb-2" />
                <div className="text-white text-2xl font-bold">8</div>
                <div className="text-gray-400 text-sm">Assistências</div>
              </div>
              <div className="text-center">
                <Calendar size={24} className="text-secondary mx-auto mb-2" />
                <div className="text-white text-2xl font-bold">3</div>
                <div className="text-gray-400 text-sm">Futs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Futs Mensais */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-secondary text-lg font-semibold">Futs Mensais</h2>
              <p className="text-gray-400 text-sm">Jogos recorrentes</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Novo</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {mensalFuts.length > 0 ? (
              mensalFuts.map(fut => (
                <div key={fut.id} className="bg-primary-lighter rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* Fut Icon */}
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg">
                        {fut.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Fut Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold text-lg">{fut.name}</h3>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">👑</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-2">
                        {fut.recurrence?.kind === 'monthly' 
                          ? `Todo dia ${fut.recurrence.day}`
                          : fut.recurrence?.kind === 'weekly'
                          ? `Toda ${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][fut.recurrence.day]}`
                          : 'Recorrente'
                        }
                      </p>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-white">Em -246 dias</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-white">{fut.location || 'Local não definido'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-white">
                            {Object.keys(fut.members || {}).length} / {fut.maxVagas} confirmados
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-secondary h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((Object.keys(fut.members || {}).length / fut.maxVagas) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-white text-sm">19:00</span>
                      </div>
                      <button className="bg-secondary text-primary px-3 py-1 rounded-lg text-xs font-medium hover:bg-secondary-darker transition-colors">
                        Vagas
                      </button>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
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
            <div>
              <h2 className="text-secondary text-lg font-semibold">Futs Avulsos</h2>
              <p className="text-gray-400 text-sm">Jogos únicos</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Novo</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {avulsoFuts.length > 0 ? (
              avulsoFuts.map(fut => (
                <div key={fut.id} className="bg-primary-lighter rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* Fut Icon */}
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg">
                        {fut.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Fut Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-semibold text-lg">{fut.name}</h3>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">👑</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-2">
                        {fut.recurrence?.kind === 'monthly' 
                          ? `Todo dia ${fut.recurrence.day}`
                          : fut.recurrence?.kind === 'weekly'
                          ? `Toda ${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][fut.recurrence.day]}`
                          : 'Recorrente'
                        }
                      </p>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-white">Em -246 dias</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-white">{fut.location || 'Local não definido'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-white">
                            {Object.keys(fut.members || {}).length} / {fut.maxVagas} confirmados
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-secondary h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((Object.keys(fut.members || {}).length / fut.maxVagas) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-white text-sm">19:00</span>
                      </div>
                      <button className="bg-secondary text-primary px-3 py-1 rounded-lg text-xs font-medium hover:bg-secondary-darker transition-colors">
                        Vagas
                      </button>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
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