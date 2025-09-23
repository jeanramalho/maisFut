import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import Header from '@/components/Header';
import FutCard from '@/components/FutCard';
import CreateFutModal from '@/components/CreateFutModal';
import { Plus, Trophy, Target, Calendar, MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  time?: string;
  listReleased?: boolean;
  confirmedMembers?: string[];
  releasedVagas?: number;
  playerStats?: Record<string, { goals: number; assists: number }>;
}

export default function Home() {
  const { user, userData, loading } = useAuth();
  const [futs, setFuts] = useState<Fut[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  // Função para calcular a próxima data do fut
  const getNextFutDate = (fut: Fut) => {
    if (fut.type === 'avulso') {
      return 'Data a definir';
    }

    if (!fut.recurrence) {
      return 'Data a definir';
    }

    const now = new Date();
    const { kind, day } = fut.recurrence;

    if (kind === 'weekly') {
      // Calcular próxima ocorrência semanal
      const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const targetDay = day; // 0 = Domingo, 1 = Segunda, etc.
      const currentDay = now.getDay();
      
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Próxima semana
      }
      
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysUntilTarget);
      
      return `Próximo fut ${nextDate.toLocaleDateString('pt-BR')}`;
    } else if (kind === 'monthly') {
      // Calcular próxima ocorrência mensal
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let nextDate = new Date(currentYear, currentMonth, day);
      
      // Se o dia já passou este mês, ir para o próximo mês
      if (day < currentDay) {
        nextDate = new Date(currentYear, currentMonth + 1, day);
      }
      
      return `Próximo fut ${nextDate.toLocaleDateString('pt-BR')}`;
    }

    return 'Data a definir';
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Listen to user's futs
      const futsRef = ref(database, 'futs');
      const unsubscribeFuts = onValue(futsRef, (snapshot) => {
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

      // Listen to user's stats for real-time updates
      const userRef = ref(database, `users/${user.uid}`);
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          // Update userData in context by triggering a re-render
          // This will be handled by the AuthContext
        }
      });

      return () => {
        unsubscribeFuts();
        unsubscribeUser();
      };
    }
  }, [user, loading, router]);

  // Use stats from Firebase user data
  const userStats = {
    totalGoals: userData?.totalGoals || 0,
    totalAssists: userData?.totalAssists || 0
  };

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
              <span className="text-white">{userStats.totalGoals} gols</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target size={16} className="text-secondary" />
              <span className="text-white">{userStats.totalAssists} assists</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-primary-lighter rounded-lg p-4 mb-6">
            <div className="flex justify-around">
              <div className="text-center">
                <Trophy size={24} className="text-secondary mx-auto mb-2" />
                <div className="text-white text-2xl font-bold">{userStats.totalGoals}</div>
                <div className="text-gray-400 text-sm">Gols</div>
              </div>
              <div className="text-center">
                <Target size={24} className="text-secondary mx-auto mb-2" />
                <div className="text-white text-2xl font-bold">{userStats.totalAssists}</div>
                <div className="text-gray-400 text-sm">Assistências</div>
              </div>
              <div className="text-center">
                <Calendar size={24} className="text-secondary mx-auto mb-2" />
                <div className="text-white text-2xl font-bold">{futs.length}</div>
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
          
          {mensalFuts.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="w-full"
            >
              {mensalFuts.map(fut => (
                <SwiperSlide key={fut.id}>
                  <div 
                    className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => router.push(`/${fut.id}`)}
                    style={{ height: '240px' }}
                  >
                    {/* Background Image */}
                    {fut.photoURL && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${fut.photoURL})` }}
                      />
                    )}
                    
                    {/* Blur Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
                    
                    {/* Content */}
                    <div className="relative bg-primary-lighter p-4">
                      <div className="flex items-start space-x-4">
                        {/* Fut Icon */}
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {fut.photoURL ? (
                            <Image
                              src={fut.photoURL}
                              alt={fut.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-bold text-lg">
                              {fut.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Fut Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-semibold text-sm truncate line-clamp-1">{fut.name}</h3>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-2">
                            {fut.recurrence?.kind === 'monthly' 
                              ? `Todo dia ${fut.recurrence.day}`
                              : fut.recurrence?.kind === 'weekly'
                              ? (() => {
                                  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                                  const dayName = days[fut.recurrence.day];
                                  return fut.recurrence.day === 0 || fut.recurrence.day === 6 
                                    ? `Todo ${dayName.toLowerCase()}`
                                    : `Toda ${dayName}`;
                                })()
                              : 'Recorrente'
                            }
                          </p>

                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-white">{getNextFutDate(fut)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-white">{fut.location || 'Local não definido'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users size={14} className="text-gray-400" />
                              <span className="text-white">
                                {Object.keys(fut.members || {}).length} membros
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-400 text-sm">
                                {fut.maxVagas} vagas sugeridas
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar - Only show if list is released */}
                          {fut.listReleased && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-secondary h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(((fut.confirmedMembers?.length || 0) / (fut.releasedVagas || fut.maxVagas)) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Side */}
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-1">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-white text-sm">{fut.time || '19:00'}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Nenhum fut mensal ainda. Que tal criar o primeiro?
            </div>
          )}
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
          
          {avulsoFuts.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              className="w-full"
            >
              {avulsoFuts.map(fut => (
                <SwiperSlide key={fut.id}>
                  <div 
                    className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => router.push(`/${fut.id}`)}
                    style={{ height: '240px' }}
                  >
                    {/* Background Image */}
                    {fut.photoURL && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${fut.photoURL})` }}
                      />
                    )}
                    
                    {/* Blur Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
                    
                    {/* Content */}
                    <div className="relative bg-primary-lighter p-4">
                      <div className="flex items-start space-x-4">
                        {/* Fut Icon */}
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {fut.photoURL ? (
                            <Image
                              src={fut.photoURL}
                              alt={fut.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary font-bold text-lg">
                              {fut.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Fut Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-semibold text-sm truncate line-clamp-1">{fut.name}</h3>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-2">
                            {fut.recurrence?.kind === 'monthly' 
                              ? `Todo dia ${fut.recurrence.day}`
                              : fut.recurrence?.kind === 'weekly'
                              ? (() => {
                                  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                                  const dayName = days[fut.recurrence.day];
                                  return fut.recurrence.day === 0 || fut.recurrence.day === 6 
                                    ? `Todo ${dayName.toLowerCase()}`
                                    : `Toda ${dayName}`;
                                })()
                              : 'Recorrente'
                            }
                          </p>

                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-white">{getNextFutDate(fut)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-white">{fut.location || 'Local não definido'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users size={14} className="text-gray-400" />
                              <span className="text-white">
                                {Object.keys(fut.members || {}).length} membros
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-400 text-sm">
                                {fut.maxVagas} vagas sugeridas
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar - Only show if list is released */}
                          {fut.listReleased && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-secondary h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(((fut.confirmedMembers?.length || 0) / (fut.releasedVagas || fut.maxVagas)) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Side */}
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-1">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-white text-sm">{fut.time || '19:00'}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Nenhum fut avulso ainda. Que tal criar o primeiro?
            </div>
          )}
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