'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const t = useTranslations('dashboard.notifications');
  const locale = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Start regular polling for notifications (every 30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/student/notifications?unreadOnly=false');
      const result = await response.json();
      if (result.success) {
        setNotifications((prev) => {
          // Optional: Check for new items to show system notification
          if (prev.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            const newItems = result.data.filter((newItem: Notification) => 
               !prev.some(oldItem => oldItem.id === newItem.id) && !newItem.isRead
            );
            newItems.forEach((n: Notification) => {
              new Notification(n.title, { body: n.message, icon: '/favicon.ico' });
            });
          }
          return result.data;
        });
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/student/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/student/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: false }), // This marks all as read
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'NORMAL':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-navy transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-navy">{t('title')}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-gold hover:text-gold-dark font-semibold"
                >
                  {t('markAllRead')}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="p-4 text-center text-gray-500">{t('loading')}</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>{t('noNotifications')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.isRead ? getPriorityColor(notification.priority) : 'bg-gray-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-navy text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">
                                {new Date(notification.createdAt).toLocaleDateString(locale)}
                              </span>
                            </div>
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                                title={t('markRead')}
                              >
                                <Check className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="text-sm text-gold hover:text-gold-dark font-semibold mt-2 inline-block"
                              onClick={() => {
                                markAsRead(notification.id);
                                setIsOpen(false);
                              }}
                            >
                              {t('view')} →
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

