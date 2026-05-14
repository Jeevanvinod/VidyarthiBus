import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LandingPage from './LandingPage';
import DashboardPage from './DashboardPage';
import AdminPage from './AdminPage';
import { ChatBot } from './components/ChatBot';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          setIsAdmin(adminDoc.exists() || u.email === "jeevanvinod2004@gmail.com");
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(u.email === "jeevanvinod2004@gmail.com");
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 rounded-2xl" />
          <div className="w-16 h-16 border-4 border-slate-950 border-t-transparent rounded-2xl animate-spin absolute top-0" />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Network...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/dashboard" element={user ? <DashboardPage isAdmin={isAdmin} /> : <Navigate to="/" />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ChatBot />
    </Router>
  );
}

// --- Sub-components (DashboardPage logic separated for clarity) ---
// Actually, I'll create DashboardPage.tsx as a separate file as well for better architecture.
