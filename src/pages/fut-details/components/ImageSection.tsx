import React, { useRef } from 'react';
import { Calendar, MapPin, Users, Crown, UploadCloud } from 'lucide-react';
import { Fut } from '../types';

interface ImageSectionProps {
  fut: Fut | null;
  isAdmin: boolean;
  onOpenImage: () => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageSection({ fut, isAdmin, onOpenImage, onUploadImage }: ImageSectionProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  if (!fut) return null;

  const memberCount = Object.keys(fut.members || {}).length;

  const getRecurrenceText = () => {
    if (fut.type === 'avulso') return 'Partida única';
    if (fut.recurrence) {
      if (fut.recurrence.kind === 'weekly') {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return `Toda ${days[fut.recurrence.day]}`;
      }
      return `Todo dia ${fut.recurrence.day} do mês`;
    }
    return 'Recorrência não definida';
  };

  return (
    <div className="relative">
      {fut.photoURL ? (
        <div 
          className="w-full h-64 bg-cover bg-center cursor-pointer" 
          style={{ backgroundImage: `url(${fut.photoURL})` }} 
          onClick={onOpenImage}
        >
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-white text-xl font-bold drop-shadow-lg shadow-black truncate">{fut.name}</h2>
              {isAdmin && <Crown size={18} className="text-yellow-500 drop-shadow-lg shadow-black" />}
            </div>
            {fut.description && (
              <p className="text-white mb-3 text-sm drop-shadow-lg shadow-black font-medium line-clamp-2">
                {fut.description}
              </p>
            )}
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-white" />
                <span className="text-white">{getRecurrenceText()}</span>
              </div>
              {fut.location && (
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-white" />
                  <span className="text-white">{fut.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Users size={14} className="text-white" />
                <span className="text-white">{memberCount} membros</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-64 bg-primary-lighter flex items-center justify-center px-4">
          <div className="text-center max-w-full">
            <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold text-3xl">
                {fut.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h2 className="text-white text-xl font-bold truncate">{fut.name}</h2>
              {isAdmin && <Crown size={18} className="text-yellow-500" />}
            </div>
            {fut.description && (
              <p className="text-gray-400 mb-3 text-sm line-clamp-2">{fut.description}</p>
            )}
            <div className="flex items-center justify-center space-x-2 mt-3 flex-wrap gap-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                fut.type === 'mensal' 
                  ? 'bg-blue-900 text-blue-300' 
                  : 'bg-purple-900 text-purple-300'
              }`}>
                {fut.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
              </span>
              {fut.privacy === 'invite' && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                  Privado
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload control para admin */}
      {isAdmin && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <UploadCloud size={16} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onUploadImage}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
