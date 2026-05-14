import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LandingPage from './LandingPage';
import DashboardPage from './DashboardPage';
import AdminPage from './AdminPage';
import { ChatBot } from './components/ChatBot';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Handle redirect result for mobile/native first
    const initNative = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#F59E0B' });
        } catch (e) {
          console.error('Error initializing native plugins:', e);
        }
      }
    };
    initNative();

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      
      if (u) {
        const checkAdmin = async () => {
          try {
            const adminCheckPromise = getDoc(doc(db, 'admins', u.uid));
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000));
            const adminDoc = await Promise.race([adminCheckPromise, timeoutPromise]) as any;
            setIsAdmin(adminDoc?.exists?.() || u.email === "jeevanvinod2004@gmail.com");
          } catch (error) {
            console.error("Admin check background fail:", error);
            setIsAdmin(u.email === "jeevanvinod2004@gmail.com");
          }
        };
        checkAdmin();
      } else {
        setIsAdmin(false);
      }
      
      if (Capacitor.isNativePlatform()) {
        SplashScreen.hide().catch(() => {});
      }
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage isAdmin={isAdmin} />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ChatBot />
    </Router>
  );
}

// --- Sub-components (DashboardPage logic separated for clarity) ---
// Actually, I'll create DashboardPage.tsx as a separate file as well for better architecture.
