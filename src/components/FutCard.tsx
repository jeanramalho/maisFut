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
      className="bg-primary-lighter rounded-lg p-4 border border-gray-700 hover:border-secondary transition-colors cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        {/* Fut Photo */}
        <div className="flex-shrink-0">
          {fut.photoURL ? (
            <Image
              src={fut.photoURL}
              alt={fut.name}
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-15 h-15 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">
                {fut.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Fut Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-1">{fut.name}</h3>
          
          {fut.description && (
            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
              {fut.description}
            </p>
          )}

          <div className="space-y-1 text-sm text-gray-400">
            {/* Next Date */}
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>Próximo: {getNextOccurrence()}</span>
            </div>

            {/* Location */}
            {fut.location && (
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span className="truncate">{fut.location}</span>
              </div>
            )}

            {/* Members */}
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>{memberCount}/{fut.maxVagas} jogadores</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-2">
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
            <div className={`w-3 h-3 rounded-full ${
              memberCount < fut.maxVagas ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
}