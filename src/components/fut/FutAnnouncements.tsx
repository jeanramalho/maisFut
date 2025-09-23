import { useState } from 'react';
import { ref, push, set, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface FutAnnouncementsProps {
  futId: string;
  announcements: any[];
  setAnnouncements: (announcements: any[]) => void;
}

export function FutAnnouncements({ futId, announcements, setAnnouncements }: FutAnnouncementsProps) {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  const handleSaveAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      const announcementData = {
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      if (editingAnnouncement) {
        // Update existing announcement
        await set(ref(database, `futs/${futId}/announcements/${editingAnnouncement.id}`), {
          ...announcementData,
          createdAt: editingAnnouncement.createdAt
        });
      } else {
        // Create new announcement
        await push(ref(database, `futs/${futId}/announcements`), announcementData);
      }

      // Update local state
      if (editingAnnouncement) {
        setAnnouncements(announcements.map(ann => 
          ann.id === editingAnnouncement.id 
            ? { ...ann, ...announcementData }
            : ann
        ));
      } else {
        setAnnouncements([announcementData, ...announcements]);
      }

      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setEditingAnnouncement(null);
      setShowAnnouncementModal(false);
      alert('Aviso salvo com sucesso!');
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Erro ao salvar aviso');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Tem certeza que deseja excluir este aviso?')) return;
    
    try {
      await remove(ref(database, `futs/${futId}/announcements/${announcementId}`));
      setAnnouncements(announcements.filter(ann => ann.id !== announcementId));
      alert('Aviso excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Erro ao excluir aviso');
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setAnnouncementTitle(announcement.title);
    setAnnouncementMessage(announcement.message);
    setShowAnnouncementModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Avisos</h3>
        <button 
          onClick={() => {
            setEditingAnnouncement(null);
            setAnnouncementTitle('');
            setAnnouncementMessage('');
            setShowAnnouncementModal(true);
          }}
          className="bg-secondary text-primary px-4 py-2 rounded text-sm font-medium hover:bg-secondary-darker transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Novo Aviso</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Nenhum aviso publicado ainda</p>
            <p className="text-gray-500 text-sm">Os avisos aparecerão aqui quando forem criados</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-primary-lighter rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{announcement.title}</h4>
                  <p className="text-gray-300 mb-3">{announcement.message}</p>
                  <div className="text-gray-500 text-sm">
                    {new Date(announcement.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditAnnouncement(announcement)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-lighter rounded-lg w-full max-w-md">
            <div className="p-4 space-y-4">
              <h3 className="text-white text-lg font-semibold">
                {editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none"
                    placeholder="Digite o título do aviso"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Mensagem
                  </label>
                  <textarea
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-secondary focus:outline-none h-24 resize-none"
                    placeholder="Digite a mensagem do aviso"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAnnouncement}
                  className="flex-1 bg-secondary text-primary py-2 rounded hover:bg-secondary-darker transition-colors"
                >
                  {editingAnnouncement ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
