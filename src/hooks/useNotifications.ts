import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'new_episode' | 'announcement' | 'system';
  title: string;
  message: string;
  animeId?: string;
  episodeNum?: number;
  poster?: string;
  timestamp: number;
  read: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const NOTIFICATIONS_KEY = 'anicrew-notifications';
const LAST_CHECK_KEY = 'anicrew-last-check';
const POLL_INTERVAL = 30000; // 30 seconds

// Simulated new episodes data - In production, this would come from API or WebSocket
const MOCK_NEW_RELEASES = [
  { animeId: 'one-piece-100', name: 'One Piece', episode: 1125, poster: 'https://cdn.noitatnemucod.net/thumbnail/300x400/100/bcd84731a3eda4f4a306250769675065.jpg' },
  { animeId: 'jujutsu-kaisen-2nd-season-18413', name: 'Jujutsu Kaisen Season 2', episode: 24, poster: 'https://cdn.noitatnemucod.net/thumbnail/300x400/100/b5d5b6e7-d5f5-4c8e-9f23-3db9896d4f9b.jpg' },
  { animeId: 'demon-slayer-47', name: 'Demon Slayer', episode: 55, poster: 'https://cdn.noitatnemucod.net/thumbnail/300x400/100/9b89992a3ce87f5c66a7b6e8c8a9cb14.jpg' },
];

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
  }, []);
  
  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);
  
  // Polling for new episodes (simulated)
  useEffect(() => {
    const checkForNewEpisodes = () => {
      const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0');
      const now = Date.now();
      
      // Only check if more than 5 minutes since last check
      if (now - lastCheck > 5 * 60 * 1000) {
        // Randomly simulate new episode release (10% chance per poll)
        if (Math.random() < 0.1) {
          const randomAnime = MOCK_NEW_RELEASES[Math.floor(Math.random() * MOCK_NEW_RELEASES.length)];
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            type: 'new_episode',
            title: `New Episode Released!`,
            message: `${randomAnime.name} Episode ${randomAnime.episode} is now available`,
            animeId: randomAnime.animeId,
            episodeNum: randomAnime.episode,
            poster: randomAnime.poster,
            timestamp: now,
            read: false,
          };
          
          // Check if we haven't already notified about this
          const existingIds = notifications.map(n => `${n.animeId}-${n.episodeNum}`);
          if (!existingIds.includes(`${randomAnime.animeId}-${randomAnime.episode}`)) {
            setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50
            
            // Show toast notification
            toast.success(newNotification.title, {
              description: newNotification.message,
              action: {
                label: 'Watch Now',
                onClick: () => {
                  window.location.href = `/anime/${randomAnime.animeId}`;
                },
              },
            });
          }
        }
        
        localStorage.setItem(LAST_CHECK_KEY, now.toString());
      }
    };
    
    // Initial check
    checkForNewEpisodes();
    
    // Set up polling
    const interval = setInterval(checkForNewEpisodes, POLL_INTERVAL);
    
    return () => clearInterval(interval);
  }, [notifications]);
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
  };
}

// Notification display component hook
export function useNotificationToasts() {
  const { notifications, markAsRead } = useNotifications();
  
  // Show toast for unread notifications on mount
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).slice(0, 3);
    unread.forEach((n, index) => {
      setTimeout(() => {
        toast(n.title, {
          description: n.message,
          action: n.animeId ? {
            label: 'View',
            onClick: () => {
              markAsRead(n.id);
              window.location.href = `/anime/${n.animeId}`;
            },
          } : undefined,
        });
      }, index * 1000);
    });
  }, []);
  
  return { notifications, markAsRead };
}
