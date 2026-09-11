import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLoggedInDistrictOfficer } from '../services/authHelper';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaUserCircle, FaMoon, FaSun, FaBars, 
  FaTimes, FaMicrochip, FaExclamationTriangle, FaCheckCircle, 
  FaTools, FaDownload, FaPlus, FaFilter, FaMapMarkerAlt, 
  FaDatabase, FaSync, FaServer, FaSignOutAlt, FaFolder, FaUserPlus,
  FaTrain, FaWrench, FaSlidersH, FaFilePdf
} from 'react-icons/fa';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

/* ==========================================================================
   LiquidEther - Railway Atmospheric Blue Ambient Canvas
   ========================================================================== */
function LiquidEther({
  autoSpeed = 0.4,
  color0 = '#0284c7',
  color1 = '#003366',
  color2 = '#075985'
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      time += autoSpeed * 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad1 = ctx.createRadialGradient(
        canvas.width * (0.3 + 0.2 * Math.sin(time)),
        canvas.height * (0.4 + 0.2 * Math.cos(time * 0.8)),
        10,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7
      );
      grad1.addColorStop(0, color0);
      grad1.addColorStop(0.5, color1);
      grad1.addColorStop(1, 'transparent');

      const grad2 = ctx.createRadialGradient(
        canvas.width * (0.7 + 0.2 * Math.cos(time * 1.1)),
        canvas.height * (0.6 + 0.2 * Math.sin(time * 0.9)),
        10,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.6
      );
      grad2.addColorStop(0, color2);
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [autoSpeed, color0, color1, color2]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-20" />;
}

/* ==========================================================================
   INDIAN RAILWAYS FASTENER DATA STRUCTURES
   ========================================================================== */
const mockStats = [
  { id: 'total', title: 'Total Registered Clips', count: '5,842', trend: '+12%', isPositive: true, icon: FaQrcode, color: 'from-[#003366] to-[#0284c7]', path: '/components' },
  { id: 'healthy', title: 'Optimal Integrity (Nominal)', count: '5,210', trend: '+98.4%', isPositive: true, icon: FaCheckCircle, color: 'from-emerald-700 to-emerald-500', path: '/components' },
  { id: 'maintenance', title: 'Pending Maintenance', count: '148', trend: '-4%', isPositive: false, icon: FaTools, color: 'from-amber-600 to-orange-500', path: '/inspections' },
  { id: 'high_risk', title: 'High Fatigue Risk', count: '27', trend: '+2', isPositive: false, icon: FaExclamationTriangle, color: 'from-rose-700 to-red-500', path: '/ai-analysis' },
  { id: 'pending', title: 'Scheduled P-Way Inspections', count: '89', trend: '-15%', isPositive: true, icon: FaShieldAlt, color: 'from-blue-700 to-indigo-600', path: '/inspections' },
  { id: 'completed', title: 'Verified Audit Logs', count: '25,480', trend: '+18%', isPositive: true, icon: FaTrain, color: 'from-cyan-700 to-blue-600', path: '/inspections' },
];

const mockInspectionTrend = [
  { day: 'Mon', count: 320 }, { day: 'Tue', count: 450 },
  { day: 'Wed', count: 410 }, { day: 'Thu', count: 580 },
  { day: 'Fri', count: 510 }, { day: 'Sat', count: 620 },
  { day: 'Sun', count: 490 }
];

const mockPriorityDist = [
  { name: 'Optimal (Low Risk)', value: 4800, color: '#10B981' },
  { name: 'Moderate Wear', value: 890, color: '#F59E0B' },
  { name: 'Critical Fatigue', value: 152, color: '#EF4444' }
];

const mockInspectionTable = [
  { qrId: 'IR-ERC-8842', compId: 'ERC Mk-V', location: 'KM 142/8, Up Line', inspector: 'Officer K. Sharma', date: '2026-07-20 11:42', health: 96, priority: 'Low Risk', status: 'Optimal' },
  { qrId: 'IR-ERC-9104', compId: 'ERC Mk-III', location: 'KM 088/2, Down Line', inspector: 'Inspector R. Verma', date: '2026-07-20 10:15', health: 64, priority: 'Moderate', status: 'Warning' },
  { qrId: 'IR-ERC-3319', compId: 'ERC Mk-V', location: 'KM 034/6, Curve 4', inspector: 'Eng. P. Deshmukh', date: '2026-07-20 09:30', health: 28, priority: 'High Risk', status: 'Critical' },
  { qrId: 'IR-ERC-4412', compId: 'ERC Mk-III', location: 'KM 122/4, Mainline', inspector: 'Inspector M. Khan', date: '2026-07-19 16:20', health: 91, priority: 'Low Risk', status: 'Optimal' },
  { qrId: 'IR-ERC-7721', compId: 'ERC Mk-V', location: 'KM 210/1, Loop Line', inspector: 'Officer K. Sharma', date: '2026-07-19 14:05', health: 42, priority: 'High Risk', status: 'Critical' },
];

const mockTimeline = [
  { id: 1, title: 'IR-ERC-8842 Verified (KM 142/8)', time: '2 mins ago', type: 'healthy', desc: 'Toe load 10.2 kN verified nominal. Zero structural looseness detected.' },
  { id: 2, title: 'IR-ERC-9104 Maintenance Logged', time: '15 mins ago', type: 'warning', desc: 'Slight elasticity relaxation logged. Scheduled for torque check in 14 days.' },
  { id: 3, title: 'IR-ERC-3319 AI Critical Alert', time: '30 mins ago', type: 'critical', desc: 'XGBoost predicted high probability of toe load loss under 25T axle traffic.' },
  { id: 4, title: 'RDSO Inspection Sheet Exported', time: '1 hour ago', type: 'info', desc: 'Divisional P-Way safety inspection sheet generated and archived.' }
];

/* ==========================================================================
   MAIN DASHBOARD COMPONENT
   ========================================================================== */
export default function Dashboard() {
  const navigate = useNavigate();
  const districtOfficer = getLoggedInDistrictOfficer();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="relative h-screen bg-slate-50 text-slate-900 font-['Poppins',sans-serif] flex overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 flex flex-col justify-between border-r border-blue-900/40 bg-[#002244] text-slate-200 min-h-screen shrink-0 shadow-lg"
      >
        {/* Sidebar Header */}
        <div>
          <div className="flex items-center gap-3 p-4 border-b border-blue-900/60 bg-[#001b3a]">
            <div className="flex flex-1 items-center space-x-3 min-w-0 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#003366] via-[#004b87] to-[#0284c7] text-amber-300 shrink-0 shadow-md shadow-blue-900/40">
                <FaTrain className="text-lg" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col whitespace-nowrap">
                  <span className="font-extrabold text-base text-white tracking-wide">
                    RailClip<span className="text-blue-400">AI</span>
                  </span>
                  <span className="text-[9px] text-blue-200 font-mono tracking-widest font-semibold">
                    IR COMMAND CENTER
                  </span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative z-20 ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-800/60 bg-blue-900/30 text-blue-200 transition-all hover:bg-blue-800 hover:text-white cursor-pointer"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={sidebarOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, scale: 0.7, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center leading-none origin-center"
                >
                  {sidebarOpen ? <FaTimes /> : <FaBars />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3.5 space-y-1.5">
            {[
              { label: 'Dashboard', icon: FaChartLine, path: '/dashboard' },
              { label: 'Components', icon: FaQrcode, path: '/components' },
              { label: 'Inspections', icon: FaShieldAlt, path: '/inspections' },
              { label: 'AI Analysis', icon: FaBrain, path: '/ai-analysis' },
              { label: 'Reports', icon: FaFolder, path: '/reports' },
              { label: 'Worker Accounts', icon: FaUserPlus, path: '/worker-account' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.label, item.path)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-[#0284c7] text-white border border-blue-400/40 shadow-md shadow-blue-950/30' 
                      : 'text-blue-100/80 hover:bg-blue-900/40 hover:text-white'
                  }`}
                >
                  <Icon className={`text-base ${isActive ? 'text-amber-300' : 'text-blue-300'}`} />
                  {sidebarOpen && <span className="whitespace-nowrap font-semibold">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / System Status */}
        <div className="p-4 border-t border-blue-900/60 bg-[#001b3a]">
          <div className={`p-3 rounded-xl bg-blue-950/60 border border-blue-800/40 ${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between text-[11px] text-blue-200 mb-1">
              <span className="font-medium">XGBoost ML Engine</span>
              <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[98%]" />
            </div>
            <div className="mt-2 text-[10px] text-blue-300 font-mono">RDSO T-3701 • 12ms Latency</div>
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="w-full mt-3 flex items-center space-x-3 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-900/20 text-xs font-medium transition-colors cursor-pointer"
          >
            <FaSignOutAlt className="text-sm" />
            {sidebarOpen && <span>Disconnect Session</span>}
          </button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col z-20 min-w-0 overflow-y-auto scroll-smooth bg-slate-50" style={{ scrollBehavior: 'smooth' }}>

        {/* ================= TOP INDIAN RAILWAYS BANNER STRIP ================= */}
        <div className="bg-[#002855] text-white text-[11px] sm:text-xs py-1.5 px-6 sm:px-8 border-b border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="font-bold tracking-wide text-amber-300">भारतीय रेल</span>
            <span className="text-blue-300">|</span>
            <span className="font-bold text-white">INDIAN RAILWAYS</span>
            <span className="hidden md:inline text-blue-200 font-normal">• Ministry of Railways, Government of India</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[10.5px] text-blue-200">
            <span className="text-amber-300 font-semibold">{districtOfficer.subtitle}</span>
            <span className="text-blue-400">|</span>
            <span className="text-emerald-400">BROAD GAUGE 1676mm</span>
          </div>
        </div>

        {/* ================= HEADER NAVBAR ================= */}
        <header className="sticky top-0 z-30 px-6 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-xs">
          
          {/* Welcome Message */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{districtOfficer.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                P-WAY COMMAND
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Indian Railways Elastic Rail Clip (ERC) Telemetry & Safety Dashboard
            </p>
          </div>

          {/* Quick Actions & Header Tools */}
          <div className="flex items-center space-x-4">
            {/* Notifications Indicator */}
            <button className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
              <FaBell className="text-sm text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            </button>

            {/* Live Clock Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* District Officer Profile Menu */}
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#003366] to-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <FaTrain className="text-amber-300" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-none">{districtOfficer.title}</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">{districtOfficer.subtitle}</span>
              </div>
            </div>

          </div>
        </header>

        {/* ================= DASHBOARD BODY ================= */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* AI SMART ASSISTANT INSIGHT BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-[#002855] via-[#003366] to-[#004b87] text-white border border-blue-900/60 shadow-md relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-amber-300 text-xl shrink-0 mt-1 md:mt-0">
                  <FaBrain className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Indian Railways Fastener Telemetry Directives
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-400/30">
                      XGBoost Model Active
                    </span>
                  </h2>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    "27 elastic rail clips require torque recalibration within the next 7 days on 25T freight corridors. Overall fastener integrity index is <strong className="text-emerald-300">98.4/100</strong> across {districtOfficer.subtitle}."
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/ai-analysis')} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-orange-600/30 shrink-0 whitespace-nowrap cursor-pointer">
                Run AI Diagnostics
              </button>
            </div>
          </motion.div>

          {/* 1. TOP METRICS STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {mockStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(stat.path)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-sm`}>
                      <Icon className="text-base" />
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      stat.isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight mb-1 font-mono">{stat.count}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{stat.title}</div>
                </motion.div>
              );
            })}
          </div>

          {/* 2. RECHARTS VISUALIZATION GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Daily Inspection Trend (Line Chart - 7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Field Scan Velocity</h3>
                  <p className="text-[11px] text-slate-500">P-Way Keymen & Inspector scans across {districtOfficer.subtitle}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-mono font-semibold">
                  Weekly Feed
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockInspectionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={3} dot={{ fill: '#0284c7', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Maintenance Priority Distribution (Pie Chart - 5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fastener Health Classification</h3>
                  <p className="text-[11px] text-slate-500">RDSO toe-load stress tolerance categories</p>
                </div>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPriorityDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mockPriorityDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 text-[11px] text-slate-600 mt-2 font-medium">
                {mockPriorityDist.map((item) => (
                  <div key={item.name} className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. RECENT INSPECTION TABLE SECTION */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Track Clip Inspection Logs</h3>
                <p className="text-[11px] text-slate-500">Live telemetric scans recorded by Permanent Way inspectors</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => navigate('/inspections')} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs text-slate-700 font-semibold cursor-pointer">
                  <FaFilter className="text-[10px]" />
                  <span>Filter</span>
                </button>
                <button onClick={() => navigate('/reports')} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#0055a5] hover:from-[#002244] hover:to-[#004080] text-xs text-white font-semibold shadow-sm cursor-pointer">
                  <FaFilePdf className="text-[10px]" />
                  <span>RDSO Report</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Clip Serial</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Track Location</th>
                    <th className="py-3 px-4">Inspecting Officer</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Health Index</th>
                    <th className="py-3 px-4">Risk Category</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mockInspectionTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => navigate('/inspections')}>
                      <td className="py-3.5 px-4 font-mono text-blue-700 font-bold">{row.qrId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.compId}</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.location}</td>
                      <td className="py-3.5 px-4 font-medium">{row.inspector}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.date}</td>
                      <td className="py-3.5 px-4 font-bold font-mono">
                        <span className={row.health > 80 ? 'text-emerald-600' : row.health > 50 ? 'text-amber-600' : 'text-rose-600'}>
                          {row.health}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.priority === 'Low Risk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          row.priority === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center space-x-1.5 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            row.status === 'Optimal' ? 'bg-emerald-500' : row.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                          }`} />
                          <span>{row.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. SPLIT PANELS: AI RECOMMENDATIONS & LIVE TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AI Top Risk Recommendations Panel (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Preventive Fastener Directives</h3>
              <p className="text-[11px] text-slate-500 mb-6">AI generated maintenance priorities to prevent broken clip derailment risks</p>

              <div className="space-y-3">
                {[
                  { qr: 'IR-ERC-3319', action: 'Immediate Clip Replacement', cause: 'Elasticity fatigue risk 92.4% on high-curvature track', level: 'High' },
                  { qr: 'IR-ERC-7721', action: 'Toe Load Recalibration', cause: 'Toe load below 8.5 kN specification threshold', level: 'High' },
                  { qr: 'IR-ERC-9104', action: 'Scheduled GFN Liner Inspection', cause: 'Liner friction wear threshold reached', level: 'Medium' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg text-xs font-bold mt-0.5 ${
                        item.level === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <FaExclamationTriangle />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span className="font-mono text-blue-700">{item.qr}</span>
                          <span>— {item.action}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.cause}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/ai-analysis')} 
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shrink-0 cursor-pointer shadow-xs"
                    >
                      View Telemetry
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Timeline Panel (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Field Activity Stream</h3>
              <p className="text-[11px] text-slate-500 mb-6">Real-time inspections recorded across track sections</p>

              <div className="relative pl-4 border-l border-slate-200 space-y-6">
                {mockTimeline.map((evt) => (
                  <div key={evt.id} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                    <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{evt.desc}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{evt.time}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5. QUICK ACTIONS & SYSTEM METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Register New ERC Fastener', icon: FaPlus, color: 'from-[#003366] to-[#0055a5]', path: '/components' },
              { label: 'Run XGBoost AI Risk Diagnostics', icon: FaBrain, color: 'from-orange-600 to-amber-600', path: '/ai-analysis' },
              { label: 'Generate RDSO Safety Compliance PDF', icon: FaFolder, color: 'from-slate-700 to-slate-800', path: '/reports' },
            ].map((btn, idx) => {
              const Icon = btn.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => navigate(btn.path)}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${btn.color} text-white font-semibold text-xs shadow-md flex items-center justify-center space-x-3 hover:opacity-90 transition-all cursor-pointer`}
                >
                  <Icon className="text-sm text-amber-300" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

        </main>

        {/* ================= FOOTER ================= */}
        <footer className="mt-auto py-4 px-8 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            Indian Railways Permanent Way Fastener Management • <span className="font-mono text-blue-700 font-semibold">{districtOfficer.subtitle}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            RDSO T-3701 / T-4001 • Broad Gauge 1676mm
          </div>
        </footer>

      </div>
    </div>
  );
}
