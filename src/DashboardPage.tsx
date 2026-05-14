import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bus, MapPin, AlertCircle, Phone, Info, Map as MapIcon, ChevronRight, User, Users, CheckCircle2, Shield, LogOut, Navigation, Clock, Activity, X } from 'lucide-react';
import { auth, Route, CrowdReport, CrowdStatus } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { busService } from './services/busService';
import { cn, formatTimeAgo } from './lib/utils';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
const getMarkerIcon = (status: CrowdStatus) => {
  const color = status === 'full' ? '#F43F5E' : status === 'seated' ? '#F59E0B' : '#10B981';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Force a resize check in case container was hidden or animating
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

const CrowdMeter = ({ status }: { status: CrowdStatus | 'none' }) => {
  const getLevel = () => {
    switch (status) {
      case 'empty': return 30;
      case 'seated': return 65;
      case 'full': return 100;
      default: return 0;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'empty': return 'from-emerald-400 to-emerald-600 shadow-emerald-100';
      case 'seated': return 'from-orange-400 to-orange-600 shadow-orange-100';
      case 'full': return 'from-rose-500 to-rose-700 shadow-rose-100';
      default: return 'from-slate-200 to-slate-300';
    }
  };

  const getText = () => {
    switch (status) {
      case 'empty': return 'Plenty of Seats';
      case 'seated': return 'Standing Only';
      case 'full': return 'Crush Load';
      default: return 'Awaiting Reports';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Density Status</span>
          <span className={cn("text-lg font-display font-black leading-none", {
            'text-emerald-600': status === 'empty',
            'text-orange-600': status === 'seated',
            'text-rose-600': status === 'full',
            'text-slate-400': status === 'none',
          })}>
            {getText()}
          </span>
        </div>
        {status !== 'none' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
             <Activity size={10} className="text-slate-400" />
             <span className="text-[10px] font-black font-mono text-slate-400 uppercase">{getLevel()}%</span>
          </div>
        )}
      </div>
      <div className="h-6 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${getLevel()}%` }}
          transition={{ type: 'spring', damping: 20 }}
          className={cn("h-full rounded-xl bg-gradient-to-r transition-all duration-500 shadow-lg", getColor())}
        />
      </div>
    </div>
  );
};

export default function DashboardPage({ isAdmin }: { isAdmin: boolean }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const navigate = useNavigate();

  useEffect(() => {
    busService.getRoutes().then(data => {
      setRoutes(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError("Failed to load routes.");
      setLoading(false);
    });
  }, []);

  // For the Global Map: Aggregate latest reports from all routes
  const [allLatestReports, setAllLatestReports] = useState<CrowdReport[]>([]);
  useEffect(() => {
    if (viewMode === 'map') {
      const unsubscribes = routes.map(route => 
        busService.subscribeToReports(route.id, (reports) => {
          if (reports.length > 0) {
            setAllLatestReports(prev => {
              const others = prev.filter(r => r.routeId !== route.id);
              return [...others, reports[0]];
            });
          }
        })
      );
      return () => unsubscribes.forEach(unsub => unsub());
    }
  }, [viewMode, routes]);

  useEffect(() => {
    if (selectedRoute) {
      const unsub = busService.subscribeToReports(selectedRoute.id, (data) => {
        setReports(data);
      });
      return () => unsub();
    } else {
      setReports([]);
    }
  }, [selectedRoute]);

  const handleReport = async (status: CrowdStatus) => {
    if (!selectedRoute) return;
    setIsReporting(true);
    try {
      let location = undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (e) {
        console.warn("Location unavailable.");
      }
      await busService.submitReport(selectedRoute.id, status, location);
    } catch (err) {
      setError("Failed to submit report");
    } finally {
      setIsReporting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const currentStatus = reports.length > 0 ? reports[0].status : 'none';
  const lastReportTime = reports.length > 0 ? reports[0].timestamp.toMillis() : null;
  const latestReportWithLocation = reports.find(r => r.location);

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <div className="max-w-md mx-auto h-screen flex flex-col bg-white shadow-[0_0_80px_rgba(0,0,0,0.05)] border-x border-slate-100 relative">
        
        <header className="px-8 pt-12 pb-8 bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-100/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                <Bus size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-display font-black tracking-tight text-slate-950 leading-none">
                  Vidyarthi<span className="text-orange-600">Bus</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Hassan Hub Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {/* View Toggle */}
               <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 mr-2">
                 <button 
                  onClick={() => setViewMode('list')}
                  className={cn("px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", 
                    viewMode === 'list' ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                 >
                   List
                 </button>
                 <button 
                  onClick={() => setViewMode('map')}
                  className={cn("px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", 
                    viewMode === 'map' ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                 >
                   Map
                 </button>
               </div>

               {isAdmin && (
                 <button 
                  onClick={() => navigate('/admin')}
                  className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                  title="Admin Settings"
                 >
                   <Shield size={18} strokeWidth={2.5} />
                 </button>
               )}
               <button 
                onClick={handleSignOut}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"
               >
                 <LogOut size={18} strokeWidth={2.5} />
               </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-0 flex flex-col overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {viewMode === 'map' ? (
             <div className="flex-1 relative w-full h-full min-h-0">
                <MapContainer
                  center={[13.0072, 76.1030]}
                  zoom={13}
                  className="w-full h-full z-10"
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {allLatestReports.filter(r => r.location).map((r) => {
                    const route = routes.find(rt => rt.id === r.routeId);
                    return (
                      <Marker 
                        key={r.id} 
                        position={[r.location!.latitude, r.location!.longitude]}
                        icon={getMarkerIcon(r.status)}
                        eventHandlers={{
                          click: () => {
                            setSelectedRoute(route || null);
                            setViewMode('list');
                          },
                        }}
                      >
                        <Popup>
                          <div className="text-[10px] font-black uppercase tracking-widest">
                            {route?.number || 'Bus'} • {r.status.toUpperCase()}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
                
                {/* Overlay legend */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white shadow-2xl z-[100]">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Empty</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Seated</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Full</span>
                   </div>
                </div>
             </div>
          ) : (
            <div className="p-8 space-y-10 overflow-y-auto w-full">
              <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Transit Network</h2>
                <div className="text-sm font-bold text-slate-900">Active Fleet in Hassan</div>
              </div>
              {selectedRoute && (
                <div className="flex items-center gap-2">
                  <motion.button 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setShowMap(!showMap)}
                    className={cn(
                      "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-1.5 shadow-md active:scale-95",
                      showMap 
                        ? "bg-white border border-slate-200 text-slate-950" 
                        : "bg-orange-600 text-white shadow-orange-100"
                    )}
                  >
                    {showMap ? <Info size={12} strokeWidth={3} /> : <MapIcon size={12} strokeWidth={3} />}
                    {showMap ? "Route Info" : "Live Map"}
                  </motion.button>
                  <motion.button 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setSelectedRoute(null);
                      setShowMap(false);
                    }}
                    className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                    title="Change Route"
                  >
                    <X size={14} strokeWidth={3} />
                  </motion.button>
                </div>
              )}
            </div>

            {!selectedRoute ? (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="space-y-3"
              >
                {routes.map((route) => (
                  <motion.button
                    key={route.id}
                    variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedRoute(route)}
                    className="w-full p-6 flex items-center justify-between bg-white border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 rounded-3xl transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-950 font-black text-xl group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-500 transition-all duration-500 shadow-sm">
                        {route.number.replace('H-', '')}
                      </div>
                      <div>
                        <div className="font-display font-black text-slate-950 text-lg leading-tight">{route.number}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{route.name}</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors">
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </div>
                  </motion.button>
                ))}
                
                {!loading && routes.length === 0 && (
                  <div className="py-24 text-center px-8 border-2 border-dashed border-slate-100 rounded-[3rem]">
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bus size={40} className="text-orange-500" strokeWidth={1.5} />
                    </div>
                    <p className="font-display font-black text-slate-950 text-xl tracking-tight">No Active Fleets</p>
                    <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">Initialize the network or wait for administrator setup.</p>
                    <button 
                      onClick={async () => {
                        setLoading(true);
                        await busService.seedRoutes();
                        window.location.reload();
                      }}
                      className="mt-8 px-8 py-4 bg-slate-950 text-white font-bold text-sm rounded-[2rem] shadow-xl transition-all active:scale-95 hover:bg-orange-600"
                    >
                      Initialize Network
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {!showMap ? (
                    <motion.div 
                      key="details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bento-card p-8 group relative overflow-hidden"
                    >
                      <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-500/5 rounded-full blur-[60px] group-hover:bg-orange-500/10 transition-all duration-700" />
                      
                      <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md">Live Platform</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
                                        <MapPin size={10} className="text-rose-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Verified</span>
                                    </div>
                                </div>
                                <h3 className="text-5xl font-display font-black text-slate-950 tracking-tighter">
                                    {selectedRoute.number}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 w-fit px-3 py-1 rounded-lg">
                                    {selectedRoute.name}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                                 <Bus size={32} />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100/60">
                          <CrowdMeter status={currentStatus} />
                          
                          <div className="mt-8 flex items-center justify-between">
                            {lastReportTime ? (
                             <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Clock size={12} />
                                Updated {formatTimeAgo(lastReportTime)}
                             </div>
                            ) : <div />}
                            
                            <button 
                              onClick={() => setShowMap(true)}
                              className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 bg-orange-600 text-white shadow-orange-200"
                            >
                              <Navigation size={14} strokeWidth={3} />
                              Track Live
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="map"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-[3rem] overflow-hidden border-4 border-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] bg-slate-50 relative z-20 mx-1 h-[450px]"
                    >
                       <MapContainer
                         center={latestReportWithLocation ? [latestReportWithLocation.location!.latitude, latestReportWithLocation.location!.longitude] : [13.0072, 76.1030]}
                         zoom={15}
                         className="w-full h-full z-10"
                         style={{ height: '100%', width: '100%' }}
                         zoomControl={false}
                       >
                         <ChangeView 
                           center={latestReportWithLocation ? [latestReportWithLocation.location!.latitude, latestReportWithLocation.location!.longitude] : [13.0072, 76.1030]} 
                           zoom={15} 
                         />
                         <TileLayer
                           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                         />
                         {reports.filter(r => r.location).map((r) => (
                           <Marker 
                             key={r.id} 
                             position={[r.location!.latitude, r.location!.longitude]}
                             icon={getMarkerIcon(r.status)}
                           >
                             <Popup>
                               <div className="text-[10px] font-black uppercase tracking-widest">{r.status.toUpperCase()}</div>
                             </Popup>
                           </Marker>
                         ))}
                       </MapContainer>
                       {!latestReportWithLocation && (
                         <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-[100] p-10 text-center">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-[240px] border border-slate-100">
                               <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <MapIcon size={24} />
                               </div>
                               <p className="text-xs font-black text-slate-950 uppercase tracking-[0.2em] mb-1">Awaiting Telemetry</p>
                               <p className="text-[10px] text-slate-500 font-medium">Be the first to report from this route to enable live markers.</p>
                            </div>
                         </div>
                       )}
                       
                       {/* Floating toggle back inside map */}
                       <button 
                        onClick={() => setShowMap(false)}
                        className="absolute top-4 right-4 z-[101] bg-white/90 backdrop-blur-md text-slate-900 p-3 rounded-2xl shadow-xl border border-white hover:bg-white transition-all active:scale-90"
                       >
                          <Info size={16} strokeWidth={3} />
                       </button>

                       <div className="absolute bottom-4 left-4 z-[101] flex flex-col gap-1">
                          <div className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-white shadow-lg">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{selectedRoute.number} • {selectedRoute.name}</span>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {selectedRoute && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                         <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Quick Report</h2>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'empty', label: 'Seats', icon: CheckCircle2, gradient: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600' },
                          { id: 'seated', label: 'Seated', icon: Users, gradient: 'from-orange-400 to-orange-600', text: 'text-orange-600' },
                          { id: 'full', label: 'Full', icon: AlertCircle, gradient: 'from-rose-500 to-rose-700', text: 'text-rose-600' }
                        ].map((btn) => (
                          <motion.button
                            key={btn.id}
                            whileHover={{ y: -6, scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReport(btn.id as CrowdStatus)}
                            disabled={isReporting}
                            className={cn(
                              "flex flex-col items-center gap-3 p-6 rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-slate-100",
                              isReporting && "opacity-30 grayscale cursor-not-allowed"
                            )}
                          >
                            <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110", btn.text)}>
                                <btn.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">{btn.label}</span>
                            
                            {/* Hover Reveal Pattern */}
                            <div className={cn("absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500", btn.gradient)} />
                          </motion.button>
                        ))}
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedRoute && (
                    <motion.section
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4 pt-10 border-t border-slate-100/60"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Phone size={14} strokeWidth={2.5} /></div>
                          <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Alternative Fleets</h2>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {selectedRoute.sharedAutos.map((auto, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between hover:border-indigo-100 transition-colors shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <User size={20} strokeWidth={2.5} />
                              </div>
                              <div>
                                <div className="font-bold text-slate-950 text-sm">{auto.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verified Pilot</div>
                              </div>
                            </div>
                            <a 
                              href={`tel:${auto.phone}`}
                              className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg active:scale-90"
                            >
                              <Phone size={18} strokeWidth={2.5} />
                            </a>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      )}
    </main>

        <footer className="p-10 bg-slate-50/50 border-t border-slate-100/60 text-center">
          <div className="flex items-center justify-center gap-3 text-slate-200 mb-4 text-xs font-black uppercase tracking-[0.4em]">
             <div className="w-12 h-[1px] bg-slate-100" />
             <Activity size={14} className="text-slate-400" />
             <div className="w-12 h-[1px] bg-slate-100" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed px-6">
            Crowdsourced Safety Protocol <br /> Reports Auto-Expire in 15m
          </p>
        </footer>
      </div>
    </div>
  );
}
