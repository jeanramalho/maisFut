import React from 'react';
import { ArrowLeft, Settings, Crown, Calendar, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import { Fut } from './types';

interface FutHeaderProps {
  fut: Fut;
  isAdmin: boolean;
  memberCount: number;
  getRecurrenceText: () => string;
  onBack: () => void;
  onSettingsClick: () => void;
  onImageClick: () => void;
}

export default function FutHeader({ 
  fut, 
  isAdmin, 
  memberCount, 
  getRecurrenceText, 
  onBack, 
  onSettingsClick, 
  onImageClick 
}: FutHeaderProps) {
  return (
    <>
      {/* Header with back button */}
      <div className="bg-primary-lighter border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white text-xl font-semibold">Detalhes do Fut</h1>
            {isAdmin && (
              <button
                onClick={onSettingsClick}
                className="ml-auto text-gray-400 hover:text-secondary transition-colors"
              >
                <Settings size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fut Image Section */}
      <div className="relative">
        {fut.photoURL ? (
          <div 
            className="w-full h-64 bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url(${fut.photoURL})` }}
            onClick={onImageClick}
          >
            {/* Blur overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
            
            {/* Fut Info over blur */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
              <FutInfo 
                fut={fut} 
                isAdmin={isAdmin} 
                memberCount={memberCount} 
                getRecurrenceText={getRecurrenceText} 
                isOverlay={true}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-primary-lighter flex items-center justify-center px-4">
            <div className="text-center max-w-full">
              <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-3xl">
                  {fut.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <FutInfo 
                fut={fut} 
                isAdmin={isAdmin} 
                memberCount={memberCount} 
                getRecurrenceText={getRecurrenceText} 
                isOverlay={false}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface FutInfoProps {
  fut: Fut;
  isAdmin: boolean;
  memberCount: number;
  getRecurrenceText: () => string;
  isOverlay: boolean;
}

function FutInfo({ fut, isAdmin, memberCount, getRecurrenceText, isOverlay }: FutInfoProps) {
  const textClass = isOverlay 
    ? "text-white drop-shadow-lg shadow-black" 
    : "text-white";
    
  const iconClass = isOverlay 
    ? "text-white drop-shadow-lg shadow-black flex-shrink-0" 
    : "flex-shrink-0";

  return (
    <>
      <div className={`flex items-center space-x-2 mb-2 ${isOverlay ? 'justify-start' : 'justify-center'}`}>
        <h2 className={`${textClass} text-xl font-bold truncate`}>{fut.name}</h2>
        {isAdmin && (
          <Crown size={18} className="text-yellow-500 drop-shadow-lg shadow-black flex-shrink-0" />
        )}
      </div>
      
      {fut.description && (
        <p className={`${textClass} mb-3 text-sm font-medium line-clamp-2`}>
          {fut.description}
        </p>
      )}

      <div className={`space-y-1 text-xs ${isOverlay ? '' : 'text-gray-400'}`}>
        <div className={`flex items-center space-x-2 ${isOverlay ? '' : 'justify-center'}`}>
          <Calendar size={14} className={iconClass} />
          <span className={`${textClass} font-medium truncate`}>
            {getRecurrenceText()}
          </span>
        </div>
        
        {fut.location && (
          <div className={`flex items-center space-x-2 ${isOverlay ? '' : 'justify-center'}`}>
            <MapPin size={14} className={iconClass} />
            <span className={`${textClass} font-medium truncate`}>
              {fut.location}
            </span>
          </div>
        )}
        
        <div className={`flex items-center space-x-2 ${isOverlay ? '' : 'justify-center'}`}>
          <Users size={14} className={iconClass} />
          <span className={`${textClass} font-medium`}>
            {memberCount} membros
          </span>
        </div>
        
        <div className={`flex items-center space-x-2 ${isOverlay ? '' : 'justify-center'}`}>
          <Calendar size={14} className={iconClass} />
          <span className={`${textClass} font-medium`}>
            {fut.maxVagas} vagas sugeridas
          </span>
        </div>
      </div>

      <div className={`flex items-center space-x-2 mt-3 flex-wrap gap-1 ${isOverlay ? '' : 'justify-center'}`}>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isOverlay ? 'drop-shadow-lg shadow-black' : ''} ${
          fut.type === 'mensal' 
            ? isOverlay ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'
            : isOverlay ? 'bg-purple-600 text-white' : 'bg-purple-900 text-purple-300'
        }`}>
          {fut.type === 'mensal' ? 'Fut Mensal' : 'Fut Avulso'}
        </span>
        
        {fut.privacy === 'invite' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isOverlay ? 'bg-yellow-600 text-white drop-shadow-lg shadow-black' : 'bg-yellow-900 text-yellow-300'}`}>
            Privado
          </span>
        )}
      </div>
    </>
  );
}
