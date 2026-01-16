import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };
  
  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-secondary transition-colors"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-bold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs mt-1">We'll notify you about new episodes!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 20).map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-secondary/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                      >
                        <Link
                          to={notification.animeId ? `/anime/${notification.animeId}` : '#'}
                          onClick={() => {
                            markAsRead(notification.id);
                            setIsOpen(false);
                          }}
                          className="flex gap-3"
                        >
                          {/* Poster */}
                          {notification.poster && (
                            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                              <img
                                src={notification.poster}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            
                            {/* Watch Button */}
                            {notification.animeId && notification.episodeNum && (
                              <motion.span
                                whileHover={{ scale: 1.02 }}
                                className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                              >
                                <Play className="w-3 h-3" fill="currentColor" />
                                Watch EP {notification.episodeNum}
                              </motion.span>
                            )}
                          </div>
                          
                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
