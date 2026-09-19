import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTrain, FaQrcode, FaBrain, FaShieldAlt, FaChartLine, 
  FaTools, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt, 
  FaArrowRight, FaLock, FaFilePdf, FaCog, FaEye, FaNetworkWired,
  FaCheck, FaSlidersH, FaCalendarAlt, FaWrench, FaChartBar,
  FaSignal, FaMicrochip, FaDownload, FaUniversity, FaBroadcastTower,
  FaPlay, FaServer, FaChevronRight
} from 'react-icons/fa';

/* ==========================================================================
   HeroRailwayIllustration - Custom Indian Railways SVG Scene
   ========================================================================== */
function HeroRailwayIllustration() {
  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-slate-950 via-[#071326] to-[#0b1c38] border border-blue-500/30 shadow-2xl p-4 sm:p-6 overflow-hidden select-none">
      
      {/* Ambient Indian Railways Saffron & Cyan Atmosphere Glow */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-12 right-6 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main SVG Scene */}
      <svg 
        viewBox="0 0 640 400" 
        className="w-full h-auto drop-shadow-2xl"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a192f" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          
          <linearGradient id="railSteelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="45%" stopColor="#f1f5f9" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="clipBronzeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="laserBeamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="hudGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* BACKGROUND SCENERY */}
        <rect x="0" y="0" width="640" height="200" fill="url(#skyGrad)" rx="10" opacity="0.45" />
        <path d="M0 135 L90 100 L180 125 L310 85 L440 118 L560 92 L640 120 L640 160 L0 160 Z" fill="#1e293b" opacity="0.4" />

        {/* TRACK BALLAST BED */}
        <path d="M0 160 L640 160 L640 400 L0 400 Z" fill="#0f172a" />

        {/* PSC SLEEPERS */}
        <g id="sleepers-group">
          <polygon points="120,185 520,185 515,198 115,198" fill="#334155" stroke="#475569" strokeWidth="0.8" />
          <polygon points="100,215 540,215 532,232 92,232" fill="#334155" stroke="#475569" strokeWidth="1" />
          <polygon points="75,255 570,255 560,278 65,278" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
          <polygon points="40,310 610,310 595,345 25,345" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
          <polygon points="10,380 640,380 630,400 0,400" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        </g>

        {/* STEEL RAILS */}
        <g id="steel-rails">
          <polygon points="160,160 172,160 112,400 95,400" fill="url(#railSteelGrad)" stroke="#f8fafc" strokeWidth="1" />
          <polygon points="460,160 472,160 535,400 518,400" fill="url(#railSteelGrad)" stroke="#f8fafc" strokeWidth="1" />
        </g>

        {/* ERC CLIPS */}
        <g id="erc-clip-target" transform="translate(68, 304)">
          <rect x="0" y="6" width="40" height="26" rx="2" fill="#090d16" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M8 23 C4 14, 8 5, 19 5 C30 5, 34 14, 30 23 C25 29, 14 27, 16 18 C18 11, 25 13, 27 18" fill="none" stroke="url(#clipBronzeGrad)" strokeWidth="5.5" strokeLinecap="round" />
        </g>

        {/* HOLOGRAPHIC OVERLAY */}
        <g id="holographic-panel" transform="translate(18, 22)">
          <rect x="0" y="0" width="245" height="122" rx="9" fill="url(#hudGrad)" stroke="#0284c7" strokeWidth="1.6" />
          <rect x="0" y="0" width="245" height="26" rx="9" fill="#0369a1" fillOpacity="0.45" />
          <text x="52" y="17" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="monospace">
            SALEM DIV (KM 142/8)
          </text>
        </g>
      </svg>

      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-emerald-400 font-bold">LIVE SYSTEM SYNC</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
          <span>Broad Gauge (1676 mm)</span>
          <span>•</span>
          <span>ERC Fasteners</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">25T Heavy Axle Load</span>
        </div>
      </div>

    </div>
  );
}

export default function Landingpage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Poppins',sans-serif] selection:bg-blue-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. TOP BANNER STRIP */}
      <div className="bg-[#002855] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-bold tracking-wide text-amber-300">भारतीय रेल</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold tracking-wider">INDIAN RAILWAYS</span>
            <span className="hidden md:inline-block text-blue-200 font-normal">
              • Ministry of Railways, Government of India
            </span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200 py-3' 
          : 'bg-white border-b border-slate-100 py-3.5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003366] via-[#004b87] to-[#0284c7] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-900/20">
              <FaTrain className="text-lg text-amber-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  RailClip
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  IR PROPOSAL
                </span>
              </div>
              <span className="text-[10.5px] text-slate-500 font-semibold tracking-wider">
                TRACK FASTENER INTEGRITY & LIFECYCLE PLATFORM
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-700">
            <a href="#overview" className="hover:text-blue-600 transition-colors">Overview</a>
            <a href="#modules" className="hover:text-blue-600 transition-colors">IR Modules</a>
            <a href="#divisions" className="hover:text-blue-600 transition-colors">Zonal Deployment</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Officer Login
            </button>

            <button 
              onClick={() => navigate('/login')}
              className="px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#003366] to-[#0055a5] hover:from-[#002244] hover:to-[#004080] text-white transition-all shadow-md shadow-blue-900/20 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Command Center</span>
              <FaArrowRight className="text-xs" />
            </button>
          </div>

        </div>
      </header>

      {/* 3. HERO PROPOSAL SECTION */}
      <section id="overview" className="relative bg-gradient-to-b from-white via-slate-50 to-blue-50/50 pt-8 pb-16 px-4 sm:px-6 overflow-hidden">
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-5 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-300 text-blue-900 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Dedicated Solution Proposal for Indian Railways</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              AI-Powered Elastic Rail Clip Management for <span className="text-[#004b87]">Indian Railways</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              Helping Railway Track Engineers and Maintainers easily track rail clips with QR codes, predict clip wear, and generate inspection reports.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-sm shadow-lg shadow-orange-600/25 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request Indian Railways Demo</span>
                <FaArrowRight className="text-xs" />
              </button>

              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaPlay className="text-xs text-blue-600" />
                <span>Explore Live Platform</span>
              </button>
            </div>

            <div className="pt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
                <FaCheckCircle className="text-emerald-600 shrink-0" />
                <span className="leading-tight text-[11px]">Broad Gauge 1676mm</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
                <FaCheckCircle className="text-emerald-600 shrink-0" />
                <span className="leading-tight text-[11px]">AI Analytics Model</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-7 relative">
            <HeroRailwayIllustration />
          </div>

        </div>

      </section>

      {/* 4. CORE MODULES FOR INDIAN RAILWAYS P-WAY OPERATIONS */}
      <section id="modules" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <div className="text-xs uppercase font-bold tracking-wider text-blue-600">Enterprise Railway Architecture</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Indian Railways Track Maintenance Workflows
          </h2>
          <p className="text-slate-600 text-sm font-normal">
            Eliminating paper registers, preventing unrecorded clip fatigue, and ensuring zero-derailment fastener safety across high-density corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-2xl group-hover:scale-105 transition-transform">
              <FaQrcode />
            </div>
            <h3 className="text-lg font-bold text-slate-900">QR Code Tracking</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Every rail clip gets a unique QR code. Field staff can scan clips to log their location and track inspection details easily.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 text-2xl group-hover:scale-105 transition-transform">
              <FaBrain />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Wear Prediction</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Smart AI models check track conditions and usage to predict clip wear early and prevent rail damage.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-2xl group-hover:scale-105 transition-transform">
              <FaFilePdf />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant PDF Reports</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Instantly create and export clean inspection PDF reports with verified timestamps and officer signatures in one click.
            </p>
          </div>

        </div>
      </section>

      {/* 5. ZONAL RAILWAYS */}
      <section id="divisions" className="bg-[#003366] text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-7">
          
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
              Multi-Division Scalability
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tailored for Indian Railways Zonal & Divisional Hierarchies
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 font-light max-w-2xl mx-auto">
              Automated email-based division routing (<code className="text-amber-300">salem@gmail.com</code>, <code className="text-amber-300">coimbatore@gmail.com</code>, <code className="text-amber-300">delhi@gmail.com</code>, <code className="text-amber-300">mumbai@gmail.com</code>) ensures strict divisional access control.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 items-center justify-center max-w-5xl mx-auto">
            {[
              { name: 'Southern Railway (SR)', sub: 'Coimbatore, Salem, Palakkad & Chennai' },
              { name: 'Northern Railway (NR)', sub: 'Delhi, Lucknow, Moradabad & Firozpur' },
              { name: 'Western Railway (WR)', sub: 'Mumbai Central, Ahmedabad & Vadodara' },
              { name: 'Lucknow Wing', sub: 'Track Design & Fastener Standards' }
            ].map((lead, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                <div className="text-sm sm:text-base font-extrabold text-white tracking-wide">{lead.name}</div>
                <div className="text-[11px] text-blue-200 font-light mt-1">{lead.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. CLEAN FOOTER */}
      <footer className="bg-[#002244] text-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-blue-200 gap-4">
          <div className="flex items-center space-x-2 text-white font-extrabold text-base">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-amber-300 flex items-center justify-center text-sm">
              <FaTrain />
            </div>
            <span>RailClip</span>
          </div>

          <div>
            © {new Date().getFullYear()} RailClip System • Solution Proposal for Ministry of Railways, Govt. of India.
          </div>
        </div>
      </footer>

    </div>
  );
}
