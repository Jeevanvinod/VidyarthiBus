import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../lib/utils';

type NotificationType = 'error' | 'success' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-6 space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto p-4 rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] border flex items-start gap-3 backdrop-blur-md",
                {
                  'bg-rose-50/90 border-rose-100 text-rose-600': notification.type === 'error',
                  'bg-emerald-50/90 border-emerald-100 text-emerald-600': notification.type === 'success',
                  'bg-slate-900/90 border-slate-800 text-white': notification.type === 'info',
                }
              )}
            >
              <div className="shrink-0 mt-0.5">
                {notification.type === 'error' && <AlertCircle size={18} />}
                {notification.type === 'success' && <CheckCircle2 size={18} />}
                {notification.type === 'info' && <Info size={18} />}
              </div>
              <div className="flex-1 text-xs font-bold leading-tight">
                {notification.message}
              </div>
              <button 
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 text-current opacity-40 hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
