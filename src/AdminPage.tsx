import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bus, Plus, Trash2, Shield, ArrowLeft, LogOut, Phone, User, Check, X, Settings, BarChart3 } from 'lucide-react';
import { busService } from './services/busService';
import { Route, SharedAuto, auth } from './lib/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { cn } from './lib/utils';

export default function AdminPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoute, setNewRoute] = useState({ number: '', name: '' });
  const [newAuto, setNewAuto] = useState<SharedAuto>({ name: '', phone: '' });
  const [autos, setAutos] = useState<SharedAuto[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    const data = await busService.getRoutes();
    setRoutes(data);
    setLoading(false);
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.number || !newRoute.name) return;

    await busService.addRoute({
      ...newRoute,
      sharedAutos: autos
    });
    setNewRoute({ number: '', name: '' });
    setAutos([]);
    setShowAddForm(false);
    loadRoutes();
  };

  const handleAddAuto = () => {
    if (!newAuto.name || !newAuto.phone) return;
    setAutos([...autos, newAuto]);
    setNewAuto({ name: '', phone: '' });
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      await busService.deleteRoute(id);
      loadRoutes();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="glass sticky top-0 z-[100] px-8 py-4 flex items-center justify-between border-b border-slate-200/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight text-slate-950">Director Console</h1>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Restricted Access</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-950 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
          >
            <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8 md:p-12 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-slate-200/60">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-indigo-600">
                <Settings size={14} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Fleet Management</span>
             </div>
             <h2 className="text-5xl font-display font-black text-slate-950 tracking-tighter">Hassan Fleet Center</h2>
             <p className="text-lg text-slate-500 font-medium max-w-xl">Configure active bus lines and alternative transport drivers for the Vidyarthi community.</p>
          </div>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-8 py-4 bg-slate-950 text-white rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 shadow-2xl transition-all hover:bg-indigo-600 active:scale-95"
          >
            <Plus size={24} strokeWidth={3} />
            Provision Route
          </button>
        </header>

        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="bento-card p-10 border-2 border-indigo-100 shadow-indigo-100/30 space-y-10"
            >
              <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-display font-black text-slate-950">New Route manifest</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
              </div>

              <form onSubmit={handleAddRoute} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Bus Identifier</label>
                  <input 
                    type="text" 
                    value={newRoute.number}
                    onChange={e => setNewRoute({...newRoute, number: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-950"
                    placeholder="e.g. H-10"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Corridor Name</label>
                  <input 
                    type="text" 
                    value={newRoute.name}
                    onChange={e => setNewRoute({...newRoute, name: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-950"
                    placeholder="e.g. Malnad Tech Corridor"
                  />
                </div>

                <div className="md:col-span-2 space-y-6 pt-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center justify-between">
                     <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest">Shared Auto Pilot Registry</h4>
                     <div className="text-[10px] font-black text-slate-400 uppercase bg-white px-3 py-1 rounded-full border border-slate-100">{autos.length} Drivers</div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="Pilot Name"
                      value={newAuto.name}
                      onChange={e => setNewAuto({...newAuto, name: e.target.value})}
                      className="flex-1 p-4 bg-white border border-slate-100 rounded-2xl font-bold"
                    />
                    <input 
                      type="text" 
                      placeholder="Satellite Phone"
                      value={newAuto.phone}
                      onChange={e => setNewAuto({...newAuto, phone: e.target.value})}
                      className="flex-1 p-4 bg-white border border-slate-100 rounded-2xl font-mono"
                    />
                    <button 
                      type="button"
                      onClick={handleAddAuto}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-colors"
                    >
                      Enlist Pilot
                    </button>
                  </div>

                  <AnimatePresence>
                    {autos.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3">
                        {autos.map((a, i) => (
                          <motion.span 
                            key={i} 
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="pl-4 pr-2 py-2 bg-white text-indigo-600 rounded-[1.25rem] text-xs font-bold border border-indigo-100 flex items-center gap-3"
                          >
                            {a.name} <span className="opacity-50 font-mono">{a.phone}</span>
                            <button onClick={() => setAutos(autos.filter((_, idx) => idx !== i))} className="w-6 h-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">×</button>
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="md:col-span-2 flex justify-end items-center gap-6 pt-10 border-t border-slate-100/60">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="bg-slate-950 text-white px-12 py-5 rounded-[2rem] font-bold text-lg shadow-xl hover:shadow-indigo-100 transition-all hover:-translate-y-1"
                  >
                    Commit Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {routes.map(route => (
              <motion.div 
                key={route.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-card p-8 group relative overflow-hidden flex flex-col justify-between min-h-[280px]"
              >
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-xl shadow-slate-100 group-hover:bg-indigo-600 transition-colors">
                      {route.number.replace('H-', '')}
                    </div>
                    <button 
                      onClick={() => handleDeleteRoute(route.id)}
                      className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <h3 className="text-2xl font-display font-black text-slate-950 mb-1">{route.number}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{route.name}</p>
                </div>

                <div className="relative z-10 mt-8 pt-8 border-t border-slate-100/60 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {route.sharedAutos.slice(0, 3).map((_, i) => (
                           <div key={i} className="w-6 h-6 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-indigo-400">
                             <User size={10} />
                           </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{route.sharedAutos.length} Alternative Pilots</span>
                   </div>
                   <div className="text-emerald-500 flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg">
                      <Check size={12} strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase">Live</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
             <div className="col-span-full py-32 text-center bento-card border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                    <BarChart3 size={32} className="text-indigo-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                    <p className="text-xl font-display font-black text-slate-950">Synchronizing Database</p>
                    <p className="text-sm font-medium text-slate-400">Pulling latest fleet configuration from Hassan Hub...</p>
                </div>
             </div>
          )}
        </section>
      </main>
    </div>
  );
}
