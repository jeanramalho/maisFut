import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ref, onValue, get } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ArrowLeft, Settings, Users, Calendar, MapPin, Crown } from 'lucide-react';
import Image from 'next/image';

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
  createdAt: number;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  position?: string;
}

export default function FutDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [fut, setFut] = useState<Fut | null>(null);
  const [members, setMembers] = useState<Record<string, UserData>>({});
  const [activeTab, setActiveTab] = useState<'members' | 'occurrences' | 'settings'>('members');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const futRef = ref(database, `futs/${id}`);
    const unsubscribe = onValue(futRef, async (snapshot) => {
      const futData = snapshot.val();
      
      if (!futData) {
        router.push('/');
        return;
      }

      // Check if user has access to this fut
      if (!futData.members?.[user.uid] && futData.adminId !== user.uid) {
        router.push('/');
        return;
      }

      setFut({ id: id as string, ...futData });

      // Fetch member data
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

      setLoading(false);
    });

    return unsubscribe;
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-secondary text-lg">Carregando...</div>
      </div>
    );
  }

  if (!fut) {
    return null;
  }

  const isAdmin = user?.uid === fut.adminId;
  const memberCount = Object.keys(fut.members || {}).length;

  const getRecurrenceText = () => {
    if (fut.type === 'avulso') return 'Partida única';
    
    if (fut.recurrence) {
      if (fut.recurrence.kind === 'weekly') {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return `Toda ${days[fut.recurrence.day]}`;
      } else {
        return `Todo dia ${fut.recurrence.day} do mês`;
      }
    }
    
    return 'Recorrência não definida';
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-primary-lighter border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white text-xl font-semibold">Detalhes do Fut</h1>
          </div>

          {/* Fut Info */}
          <div className="flex items-start space-x-4">
            {fut.photoURL ? (
              <Image
                src={fut.photoURL}
                alt={fut.name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold text-2xl">
                  {fut.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-white text-2xl font-bold">{fut.name}</h2>
                {isAdmin && (
                  <Crown size={20} className="text-yellow-500" />
                )}
              </div>
              
              {fut.description && (
                <p className="text-gray-400 mb-2">{fut.description}</p>
              )}

              <div className="space-y-1 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{getRecurrenceText()}</span>
                </div>
                
                {fut.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{fut.location}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>{memberCount}/{fut.maxVagas} jogadores</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  fut.type === 'mensal' 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-purple-900 text-purple-300'
                }`}>
                  {fut.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
                </span>
                
                {fut.privacy === 'invite' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                    Privado
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className="text-gray-400 hover:text-secondary transition-colors"
              >
                <Settings size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'members'
                  ? 'bg-primary text-secondary border-b-2 border-secondary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Membros ({memberCount})
            </button>
            <button
              onClick={() => setActiveTab('occurrences')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'occurrences'
                  ? 'bg-primary text-secondary border-b-2 border-secondary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Partidas
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary text-secondary border-b-2 border-secondary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Configurações
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Membros</h3>
              {isAdmin && (
                <button className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors">
                  Adicionar Membro
                </button>
              )}
            </div>

            <div className="space-y-3">
              {Object.entries(members).map(([memberId, memberData]) => (
                <div
                  key={memberId}
                  className="bg-primary-lighter rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    {memberData.photoURL ? (
                      <Image
                        src={memberData.photoURL}
                        alt={memberData.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {memberData.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">{memberData.name}</h4>
                        {memberId === fut.adminId && (
                          <Crown size={16} className="text-yellow-500" />
                        )}
                      </div>
                      {memberData.position && (
                        <p className="text-gray-400 text-sm">{memberData.position}</p>
                      )}
                    </div>

                    {/* Member stats would go here */}
                    <div className="text-right text-sm">
                      <div className="text-secondary font-semibold">0</div>
                      <div className="text-gray-400">Gols</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'occurrences' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Partidas</h3>
              {isAdmin && (
                <button className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors">
                  Nova Partida
                </button>
              )}
            </div>

            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Nenhuma partida ainda</div>
              <div className="text-gray-500 text-sm">
                As partidas aparecerão aqui quando forem criadas
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="space-y-6">
            <h3 className="text-white text-lg font-semibold">Configurações</h3>
            
            <div className="space-y-4">
              <button className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors">
                Editar Informações do Fut
              </button>
              
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Gerenciar Membros
              </button>
              
              <button className="w-full bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                Configurar Notificações
              </button>
              
              <div className="pt-4 border-t border-gray-700">
                <button className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                  Excluir Fut
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}