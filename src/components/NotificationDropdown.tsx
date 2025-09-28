import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Bell, X, Eye } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida
    await markAsRead(notification.id);
    
    // Navegar para o fut e abrir a aba de avisos
    router.push(`/${notification.futId}?tab=avisos`);
    
    // Fechar dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRemoveNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await removeNotification(notificationId);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de notificação */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-secondary transition-colors relative"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-primary text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-primary-lighter rounded-lg shadow-lg border border-gray-600 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-secondary text-sm hover:text-secondary-darker transition-colors flex items-center space-x-1"
                >
                  <Eye size={14} />
                  <span>Marcar todas como lidas</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-primary-darker transition-colors ${
                    !notification.read ? 'bg-primary-darker/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">
                          {notification.futName}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveNotification(e, notification.id)}
                      className="ml-2 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
