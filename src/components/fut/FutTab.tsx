import { useState } from 'react';
import { Calendar, Users, Clock, MapPin, Play, CheckCircle } from 'lucide-react';

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

interface FutTabProps {
  fut: Fut;
  members: Record<string, UserData>;
  isAdmin: boolean;
}

export function FutTab({ fut, members, isAdmin }: FutTabProps) {
  const [listReleased, setListReleased] = useState(fut.listReleased || false);
  const [releasedVagas, setReleasedVagas] = useState(fut.releasedVagas || fut.maxVagas);
  const [confirmedMembers, setConfirmedMembers] = useState<string[]>(fut.confirmedMembers || []);
  const [futStarted, setFutStarted] = useState(fut.futStarted || false);
  const [teams, setTeams] = useState(fut.teams || {});
  const [teamStats, setTeamStats] = useState(fut.teamStats || {});
  const [playerStats, setPlayerStats] = useState(fut.playerStats || {});
  const [futEnded, setFutEnded] = useState(fut.futEnded || false);
  const [votingOpen, setVotingOpen] = useState(fut.votingOpen || false);
  const [votingEnded, setVotingEnded] = useState(fut.votingEnded || false);
  const [playerVotes, setPlayerVotes] = useState(fut.playerVotes || {});
  const [userVotes, setUserVotes] = useState(fut.userVotes || {});
  const [showRanking, setShowRanking] = useState(fut.showRanking || false);

  const memberCount = Object.keys(fut.members || {}).length;
  const availableSlots = fut.maxVagas - memberCount;

  const getRecurrenceText = () => {
    if (!fut.recurrence) return '';
    
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = days[fut.recurrence.day];
    
    if (fut.recurrence.kind === 'weekly') {
      return `Toda ${dayName}`;
    } else {
      return `Mensal - ${dayName}`;
    }
  };

  const getNextGameDate = () => {
    const today = new Date();
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + (2 - today.getDay() + 7) % 7);
    return nextTuesday.toLocaleDateString('pt-BR');
  };

  if (!futStarted) {
    return (
      <div className="space-y-4">
        {/* Next Game Section */}
        <div className="bg-primary-lighter rounded-lg p-3">
          <h3 className="text-white text-base font-semibold mb-3">Próximo Fut {getNextGameDate()}</h3>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="number"
                value={releasedVagas}
                onChange={(e) => setReleasedVagas(Number(e.target.value))}
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                placeholder="Vagas disponíveis"
                min="1"
                max={fut.maxVagas}
              />
              <button
                onClick={() => setListReleased(!listReleased)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  listReleased
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {listReleased ? 'Lista Liberada' : 'Liberar Lista'}
              </button>
            </div>
            
            {listReleased && (
              <div className="text-gray-400 text-sm">
                Lista liberada com {releasedVagas} vagas disponíveis
              </div>
            )}
          </div>
        </div>

        {/* Game Management */}
        <div className="bg-primary-lighter rounded-lg p-4">
          <h3 className="text-white text-base font-semibold mb-3">Gerenciamento do Jogo</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users size={20} className="text-gray-400" />
              <span className="text-white">
                {memberCount} de {fut.maxVagas} vagas preenchidas
              </span>
            </div>
            
            {availableSlots > 0 && (
              <div className="text-gray-400 text-sm">
                {availableSlots} vaga{availableSlots > 1 ? 's' : ''} disponível{availableSlots > 1 ? 'is' : ''}
              </div>
            )}
            
            <button
              onClick={() => setFutStarted(true)}
              className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors flex items-center justify-center space-x-2"
            >
              <Play size={20} />
              <span>Iniciar Fut</span>
            </button>
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-primary-lighter rounded-lg p-4">
          <h3 className="text-white text-base font-semibold mb-3">Informações do Jogo</h3>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-300 text-sm">{getRecurrenceText()}</span>
            </div>
            
            {fut.time && (
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm">{fut.time}</span>
              </div>
            )}
            
            {fut.location && (
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm">{fut.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-base font-semibold">Status do Jogo</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">Em Andamento</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-gray-300 text-sm">
              {memberCount} jogadores confirmados
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFutEnded(true)}
              className="flex-1 bg-orange-600 text-white py-2 rounded text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Finalizar Fut
            </button>
            
            <button
              onClick={() => setVotingOpen(!votingOpen)}
              className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                votingOpen
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {votingOpen ? 'Fechar Votação' : 'Abrir Votação'}
            </button>
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <h3 className="text-white text-base font-semibold mb-3">Times</h3>
        
        <div className="space-y-3">
          <div className="text-gray-400 text-sm">
            Os times serão formados automaticamente ou manualmente pelo administrador.
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
            Formar Times Automaticamente
          </button>
          
          <button className="w-full bg-gray-600 text-white py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors">
            Formar Times Manualmente
          </button>
        </div>
      </div>

      {/* Game Actions */}
      <div className="bg-primary-lighter rounded-lg p-4">
        <h3 className="text-white text-base font-semibold mb-3">Ações do Jogo</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors">
            Adicionar Gol
          </button>
          
          <button className="bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
            Adicionar Assistência
          </button>
          
          <button className="bg-purple-600 text-white py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors">
            Ver Estatísticas
          </button>
          
          <button className="bg-yellow-600 text-white py-2 rounded text-sm font-medium hover:bg-yellow-700 transition-colors">
            Ver Ranking
          </button>
        </div>
      </div>
    </div>
  );
}
