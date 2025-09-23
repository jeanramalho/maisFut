import React from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { Announcement } from './types';

interface AnnouncementsTabProps {
  announcements: Announcement[];
  showAnnouncementModal: boolean;
  announcementTitle: string;
  announcementMessage: string;
  editingAnnouncement: Announcement | null;
  onShowAnnouncementModal: () => void;
  onHideAnnouncementModal: () => void;
  onAnnouncementTitleChange: (title: string) => void;
  onAnnouncementMessageChange: (message: string) => void;
  onSaveAnnouncement: () => void;
  onEditAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
}

export default function AnnouncementsTab({
  announcements,
  showAnnouncementModal,
  announcementTitle,
  announcementMessage,
  editingAnnouncement,
  onShowAnnouncementModal,
  onHideAnnouncementModal,
  onAnnouncementTitleChange,
  onAnnouncementMessageChange,
  onSaveAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement
}: AnnouncementsTabProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Avisos</h3>
        <button 
          onClick={onShowAnnouncementModal}
          className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Novo Aviso</span>
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-primary-lighter rounded-lg p-6 text-center">
          <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Nenhum aviso publicado ainda</p>
          <p className="text-gray-500 text-sm">Clique em "Novo Aviso" para criar o primeiro aviso</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-primary-lighter rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg mb-2">
                    {announcement.title}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {announcement.message}
                  </p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEditAnnouncement(announcement)}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteAnnouncement(announcement.id)}
                    className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Por: {announcement.authorName}</span>
                <span>{formatDate(announcement.createdAt)}</span>
              </div>
              
              {announcement.updatedAt !== announcement.createdAt && (
                <div className="text-xs text-gray-500 mt-1">
                  Editado em: {formatDate(announcement.updatedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h2 className="text-white text-xl font-semibold">
                {editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
              </h2>
              <button 
                onClick={onHideAnnouncementModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => onAnnouncementTitleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Digite o título do aviso"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Mensagem
                </label>
                <textarea
                  value={announcementMessage}
                  onChange={(e) => onAnnouncementMessageChange(e.target.value)}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-secondary h-32 resize-none"
                  placeholder="Digite a mensagem do aviso"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onHideAnnouncementModal}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onSaveAnnouncement}
                  className="flex-1 px-4 py-2 bg-secondary text-primary rounded text-sm font-medium hover:bg-secondary-darker transition-colors"
                >
                  {editingAnnouncement ? 'Atualizar' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
