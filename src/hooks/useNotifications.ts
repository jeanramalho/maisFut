import { useEffect, useState } from 'react';
import { ref, onValue, get, set } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';

export interface Notification {
  id: string;
  futId: string;
  futName: string;
  title: string;
  message: string;
  authorName: string;
  createdAt: number;
  read: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carregar notificações do usuário
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const notificationsRef = ref(database, `users/${user.uid}/notifications`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      try {
        const notificationsData = snapshot.val() || {};
        const notificationsList = Object.entries(notificationsData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        })) as Notification[];
        
        // Ordenar por data de criação (mais recentes primeiro)
        notificationsList.sort((a, b) => b.createdAt - a.createdAt);
        
        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter(n => !n.read).length);
        setLoading(false);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user]);

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await set(ref(database, `users/${user.uid}/notifications/${notificationId}/read`), true);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const updates: Record<string, boolean> = {};
      notifications.forEach(notification => {
        if (!notification.read) {
          updates[`${notification.id}/read`] = true;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await set(ref(database, `users/${user.uid}/notifications`), updates);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Remover notificação
  const removeNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      await set(ref(database, `users/${user.uid}/notifications/${notificationId}`), null);
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
