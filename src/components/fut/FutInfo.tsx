import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';

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
}

interface UserData {
  name: string;
  email: string;
  photoURL?: string;
  totalGoals?: number;
  totalAssists?: number;
}

interface FutInfoProps {
  fut: Fut;
  members: Record<string, UserData>;
}

export function FutInfo({ fut, members }: FutInfoProps) {
  const memberCount = Object.keys(fut.members || {}).length;

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

  return (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-semibold">Informações do Fut</h3>
      
      {/* Fut Image */}
      {fut.photoURL && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <Image
            src={fut.photoURL}
            alt={fut.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Fut Details */}
      <div className="bg-primary-lighter rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-gray-400" />
          <span className="text-white">Tipo: {fut.type === 'mensal' ? 'Mensal' : 'Avulso'}</span>
        </div>
        
        {fut.recurrence && (
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-400" />
            <span className="text-white">Recorrência: {getRecurrenceText()}</span>
          </div>
        )}
        
        {fut.time && (
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-400" />
            <span className="text-white">Horário: {fut.time}</span>
          </div>
        )}
        
        {fut.location && (
          <div className="flex items-center space-x-2">
            <MapPin size={20} className="text-gray-400" />
            <span className="text-white">Local: {fut.location}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Users size={20} className="text-gray-400" />
          <span className="text-white">Membros: {memberCount}/{fut.maxVagas}</span>
        </div>
        
        {fut.description && (
          <div>
            <h4 className="text-white font-medium mb-2">Descrição:</h4>
            <p className="text-gray-300">{fut.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
