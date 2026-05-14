import { motion } from 'motion/react';
import { Bus, ArrowRight, ShieldCheck, Zap, Heart, MapPin, Search, Navigation } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-sans text-slate-900 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[60%] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[50%] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <nav className="relative z-50 px-6 py-8 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
            <Bus size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight text-slate-900 leading-none">
            Vidyarthi<span className="text-orange-600">Bus</span>
          </h1>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleLogin}
          className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-900 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2 group"
        >
          Sign In
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 md:pt-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-[1.2fr,0.8fr] gap-20 items-center"
        >
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="flex items-center gap-2">
                <span className="w-8 h-[1px] bg-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Hassan Transit Network</span>
              </motion.div>
              
              <motion.h2 variants={itemVariants} className="text-7xl md:text-9xl font-display font-black leading-[0.85] tracking-tighter text-slate-950">
                Arrive <br />
                <span className="text-gradient">Ready.</span>
              </motion.h2>
              
              <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl text-balance">
                The first community-driven bus intelligence system for students in Hassan. Real-time crowd tracking, verified locations, and instant alternatives.
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <button 
                onClick={handleLogin}
                className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] transition-all hover:bg-slate-900 active:scale-95 hover:shadow-orange-200/50"
              >
                Start Tracking
                <Navigation size={24} strokeWidth={2.5} />
              </button>
              
              <div className="flex items-center gap-4 pl-2">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden ring-1 ring-slate-100">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 leading-tight">
                  Real-time Transit <br /> Community Driven
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-slate-100/60 max-w-2xl">
              {[
                { icon: Zap, label: 'Real-time', desc: 'Live Local Hub', color: 'text-orange-500' },
                { icon: Heart, label: 'Community', desc: 'Report Driven', color: 'text-rose-500' },
                { icon: ShieldCheck, label: 'Verified', desc: 'GPS Secured', color: 'text-indigo-500' },
                { icon: Search, label: 'Alternatives', desc: 'Shared Autos', color: 'text-emerald-500' }
              ].map((feature, i) => (
                <div key={i} className="space-y-1">
                  <div className={feature.color}><feature.icon size={20} strokeWidth={3} /></div>
                  <div className="text-xs font-black text-slate-900 leading-none mt-2">{feature.label}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{feature.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="hidden lg:block relative group"
          >
            <div className="absolute inset-0 bg-orange-600/10 rounded-[4rem] -rotate-3 group-hover:rotate-0 transition-transform duration-700" />
            <div className="relative bento-card p-10 space-y-10 rotate-3 group-hover:rotate-0 transition-transform duration-700 backdrop-blur-sm border-2 border-white">
              <div className="flex items-center justify-between">
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Active Tracker</div>
                   <h3 className="text-3xl font-display font-black text-slate-950">H-12 KSRTC</h3>
                </div>
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 font-black text-xl">H1</div>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Crowd Level</span>
                  <span className="text-xs font-black text-rose-600 uppercase">Bus Full</span>
                </div>
                <div className="h-6 bg-white rounded-full p-1 border border-slate-100">
                  <div className="h-full w-full bg-rose-600 rounded-full" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Updated 2 mins ago at <span className="font-bold text-slate-900 underline underline-offset-4 decoration-rose-200">Hemavathi Nagar</span></p>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nearby Alternatives</div>
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Navigation size={18} /></div>
                      <div className="font-black text-sm">Shared Auto #42</div>
                    </div>
                    <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">AVAILABLE</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Accents */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-600/10 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl" />
          </motion.div>
        </motion.div>
      </main>

      {/* Feature Section with more rhythm */}
      <section className="bg-slate-950 py-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <div>
            <h3 className="text-5xl md:text-7xl font-display font-black text-white leading-[0.9] tracking-tighter mb-10">
              Built for the <br />
              <span className="text-orange-500 italic">Rural Commute.</span>
            </h3>
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-lg">
              Transit infrastructure is failing our students. VidyarthiBus bridges the gap with community data and instant coordination.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { title: "Smart Reporting", desc: "One-tap capacity updates from fellow students." },
                { title: "Auto Integration", desc: "Direct dial to local shared auto networks." },
                { title: "Live Maps", desc: "Visual GPS tracking for every fleet route." },
                { title: "Offline Ready", desc: "Designed for low signal patches in KA." }
              ].map((item, i) => (
                <div key={i} className="space-y-2 border-l-2 border-slate-800 pl-6 pb-2">
                  <h4 className="font-black text-white text-lg">{item.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-6 pb-12">
               <motion.div 
                whileHover={{ y: -10 }}
                className="h-80 bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800"
               >
                  <img src="https://picsum.photos/seed/transport/600/800?grayscale" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" referrerPolicy="no-referrer" />
               </motion.div>
               <motion.div 
                whileHover={{ y: -10 }}
                className="h-80 bg-orange-600 rounded-[3rem] p-10 flex flex-col justify-between"
               >
                  <Bus size={48} className="text-slate-950" strokeWidth={3} />
                  <div className="space-y-1">
                    <div className="text-5xl font-display font-black text-slate-950 leading-none">Live</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-950/60">Transit Updates</div>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <Bus size={20} strokeWidth={2.5} />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-slate-950">VidyarthiBus</span>
          </div>
          <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-xs">
            Open-source infrastructure for student safety and efficient transit. Join the movement to modernize rural travel.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors">Privacy</a>
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}
