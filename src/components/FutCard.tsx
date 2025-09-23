import { useRouter } from 'next/router';
import { Calendar, MapPin, Users } from 'lucide-react';
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
  time?: string;
}

interface FutCardProps {
  fut: Fut;
}

export default function FutCard({ fut }: FutCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/${fut.id}`);
  };

  // Calculate next occurrence date based on recurrence
  const getNextOccurrence = () => {
    if (fut.type === 'avulso') {
      return 'Data a definir';
    }

    if (fut.recurrence) {
      const now = new Date();
      let nextDate = new Date();

      if (fut.recurrence.kind === 'monthly') {
        nextDate.setDate(fut.recurrence.day);
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
      } else if (fut.recurrence.kind === 'weekly') {
        const dayOfWeek = fut.recurrence.day; // 0 = Sunday, 1 = Monday, etc.
        const currentDay = now.getDay();
        const daysUntilNext = (dayOfWeek - currentDay + 7) % 7 || 7;
        nextDate.setDate(now.getDate() + daysUntilNext);
      }

      return nextDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    }

    return 'Data a definir';
  };

  const memberCount = Object.keys(fut.members || {}).length;

  return (
    <div
      onClick={handleCardClick}
      className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity h-52"
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
      <div className="relative bg-primary-lighter p-4 h-full flex flex-col">
        <div className="flex items-start space-x-4 flex-1">
          {/* Fut Icon */}
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-lg">
              {fut.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Fut Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="text-white font-semibold text-lg mb-1 truncate">{fut.name}</h3>
            
            {fut.description && (
              <p className="text-gray-400 text-sm mb-2 line-clamp-1 flex-shrink-0">
                {fut.description}
              </p>
            )}

            <div className="space-y-1 text-sm text-gray-400 flex-1">
              {/* Next Date */}
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="flex-shrink-0" />
                <span className="truncate">Próximo: {getNextOccurrence()}</span>
              </div>

              {/* Location */}
              {fut.location && (
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span className="truncate">{fut.location}</span>
                </div>
              )}

              {/* Members */}
              <div className="flex items-center space-x-2">
                <Users size={14} className="flex-shrink-0" />
                <span className="truncate">{memberCount}/{fut.maxVagas} jogadores</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between mt-3 flex-shrink-0">
              <div className="flex space-x-1 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  fut.type === 'mensal' 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-purple-900 text-purple-300'
                }`}>
                  {fut.type === 'mensal' ? 'Mensal' : 'Avulso'}
                </span>
                
                {fut.privacy === 'invite' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                    Privado
                  </span>
                )}
              </div>

              {/* Availability indicator */}
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                memberCount < fut.maxVagas ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}