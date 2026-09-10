import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLoggedInDistrictOfficer } from '../services/authHelper';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaUserCircle, FaMoon, FaSun, FaBars, 
  FaTimes, FaMicrochip, FaExclamationTriangle, FaCheckCircle, 
  FaTools, FaDownload, FaPlus, FaFilter, FaMapMarkerAlt, 
  FaDatabase, FaSync, FaServer, FaSignOutAlt, FaFolder, FaUserPlus
} from 'react-icons/fa';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

/* ==========================================================================
   MERGED COMPONENT 1: LiquidEther (WebGL Fluid simulation canvas)
   Renders a fluid background effect for liquid glass UI aesthetics.
   ========================================================================== */
function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  mouseForce = 20,
  cursorSize = 100,
  isViscous = true,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution = 0.5,
  isBounce = false,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  color0 = '#5227FF',
  color1 = '#FF9FFC',
  color2 = '#B497CF'
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

    // Canvas fluid motion rendering fallback mechanism
    const render = () => {
      time += autoSpeed * 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create flowing gradient mesh
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
   DUMMY REST-API COMPATIBLE DATASTRUCTURES
   ========================================================================== */
const mockStats = [
  { id: 'total', title: 'Total Railway Clips', count: '5,842', trend: '+12%', isPositive: true, icon: FaQrcode, color: 'from-blue-600 to-cyan-400', path: '/components' },
  { id: 'healthy', title: 'Healthy Components', count: '5,210', trend: '+98.4%', isPositive: true, icon: FaCheckCircle, color: 'from-emerald-600 to-teal-400', path: '/components' },
  { id: 'maintenance', title: 'Under Maintenance', count: '148', trend: '-4%', isPositive: false, icon: FaTools, color: 'from-amber-600 to-yellow-400', path: '/inspections' },
  { id: 'high_risk', title: 'High Risk Components', count: '27', trend: '+2', isPositive: false, icon: FaExclamationTriangle, color: 'from-red-600 to-rose-400', path: '/ai-analysis' },
  { id: 'pending', title: 'Pending Inspections', count: '89', trend: '-15%', isPositive: true, icon: FaClockIcon, color: 'from-purple-600 to-indigo-400', path: '/inspections' },
  { id: 'completed', title: 'Completed Inspections', count: '25,480', trend: '+18%', isPositive: true, icon: FaShieldAlt, color: 'from-cyan-600 to-blue-500', path: '/inspections' },
];

function FaClockIcon(props) {
  return <FaShieldAlt {...props} />;
}

const mockInspectionTrend = [
  { day: 'Mon', count: 320 }, { day: 'Tue', count: 450 },
  { day: 'Wed', count: 410 }, { day: 'Thu', count: 580 },
  { day: 'Fri', count: 510 }, { day: 'Sat', count: 620 },
  { day: 'Sun', count: 490 }
];

const mockPriorityDist = [
  { name: 'Low Priority', value: 4800, color: '#10B981' },
  { name: 'Medium Priority', value: 890, color: '#F59E0B' },
  { name: 'High Priority', value: 152, color: '#EF4444' }
];

const mockInspectionTable = [
  { qrId: 'QR-8842-109', compId: 'CLP-01', location: 'Sec 14, Track B', inspector: 'Officer K. Sharma', date: '2026-07-20 11:42', health: 96, priority: 'Low', status: 'Healthy' },
  { qrId: 'QR-9104-204', compId: 'CLP-02', location: 'Sec 08, Track A', inspector: 'Inspector R. Verma', date: '2026-07-20 10:15', health: 64, priority: 'Medium', status: 'Warning' },
  { qrId: 'QR-3319-902', compId: 'CLP-03', location: 'Sec 03, Track C', inspector: 'Eng. P. Deshmukh', date: '2026-07-20 09:30', health: 28, priority: 'High', status: 'Critical' },
  { qrId: 'QR-4412-511', compId: 'CLP-04', location: 'Sec 12, Track A', inspector: 'Inspector M. Khan', date: '2026-07-19 16:20', health: 91, priority: 'Low', status: 'Healthy' },
  { qrId: 'QR-7721-008', compId: 'CLP-05', location: 'Sec 21, Track B', inspector: 'Officer K. Sharma', date: '2026-07-19 14:05', health: 42, priority: 'High', status: 'Critical' },
];

const mockTimeline = [
  { id: 1, title: 'QR-8842-109 Inspected', time: '2 mins ago', type: 'healthy', desc: 'Condition verified. Zero structural looseness detected.' },
  { id: 2, title: 'QR-9104-204 Maintenance Logged', time: '15 mins ago', type: 'warning', desc: 'Slight elasticity loss logged. Scheduled for check in 14 days.' },
  { id: 3, title: 'QR-3319-902 Critical Alert', time: '30 mins ago', type: 'critical', desc: 'XGBoost predicted high risk of clip dislodgement within 72 hours.' },
  { id: 4, title: 'Batch Report Generated', time: '1 hour ago', type: 'info', desc: 'Sector 07 monthly telemetry report exported to Cloud.' }
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

  // Navigation Click Handler
  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="relative h-screen bg-[#030712] text-white font-['Poppins',sans-serif] flex overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* 1. FLUID CANVAS ETHER BACKGROUND */}
      <LiquidEther
        color0="#5227FF"
        color1="#FF9FFC"
        color2="#00D2FF"
        autoSpeed={0.4}
      />

      {/* 2. GLOW ORBS */}
      <div className="fixed top-20 left-60 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full filter blur-[160px] pointer-events-none z-0" />

      {/* 3. SIDEBAR NAVIGATION */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 flex flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-2xl min-h-screen"
      >
        {/* Sidebar Header */}
        <div>
          <div className="flex items-center gap-3 p-5 border-b border-white/10">
            <div className="flex flex-1 items-center space-x-3 min-w-0 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 via-blue-600 to-cyan-400 text-white shrink-0 shadow-lg shadow-purple-500/20">
                <FaQrcode className="text-xl" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col whitespace-nowrap">
                  <span className="font-bold text-base bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                    RailClip<span className="text-cyan-400">AI</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">COMMAND CENTER</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative z-20 ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
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

          {/* Nav Items (Settings Removed) */}
          <nav className="p-4 space-y-2">
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-xs cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/30' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`text-base ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / System Status */}
        <div className="p-4 border-t border-white/10">
          <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>XGBoost Model</span>
              <span className="text-emerald-400 font-mono">v2.4 ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full w-[98%]" />
            </div>
            <div className="mt-2 text-[10px] text-slate-500">Latency: 14ms | Acc: 98.2%</div>
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="w-full mt-3 flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
          >
            <FaSignOutAlt className="text-sm" />
            {sidebarOpen && <span>Disconnect Session</span>}
          </button>
        </div>
      </motion.aside>

      {/* 4. MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col z-20 min-w-0 overflow-y-auto scroll-smooth" style={{ scrollBehavior: 'smooth' }}>

        {/* ================= HEADER NAVBAR ================= */}
        <header className="sticky top-0 z-30 px-8 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          
          {/* Welcome Message */}
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Welcome Back, Railway Administrator
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                PROD HUB
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">Real-time track safety & AI-driven clip risk assessment</p>
          </div>

          {/* Quick Actions & Header Tools */}
          <div className="flex items-center space-x-4">
            
            {/* Search Input */}
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search QR ID, Sector, Inspector..."
                className="pl-9 pr-4 py-2 w-64 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Notifications Indicator */}
            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            {/* Live Clock Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <FaUserCircle className="text-2xl text-purple-400" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-white leading-none">{districtOfficer.title}</span>
                <span className="text-[10px] text-slate-400">{districtOfficer.subtitle}</span>
              </div>
            </div>

          </div>
        </header>

        {/* ================= DASHBOARD BODY ================= */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* AI SMART ASSISTANT INSIGHT BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-black border border-purple-500/30 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-cyan-400 text-xl shrink-0 mt-1 md:mt-0">
                  <FaBrain className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Predictive Summary & Key Directives
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">XGBoost Sync Active</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    "27 railway clips require maintenance within the next 7 days. Overall system health score improved by <strong className="text-emerald-400">+8%</strong> compared to last month. Inspection completion rate increased by <strong className="text-cyan-400">+15%</strong> across Sector 08."
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/ai-analysis')} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 shrink-0 whitespace-nowrap cursor-pointer">
                Run Full Diagnostic
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
                  className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                      <Icon className="text-base" />
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      stat.isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight mb-1">{stat.count}</div>
                  <div className="text-[11px] text-slate-400 truncate">{stat.title}</div>
                </motion.div>
              );
            })}
          </div>

          {/* 2. RECHARTS VISUALIZATION GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Daily Inspection Trend (Line Chart - 7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Inspection Activity Trend</h3>
                  <p className="text-[11px] text-slate-400">Daily logged QR scans across railway sectors</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono">
                  Weekly Log
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockInspectionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#00D2FF" strokeWidth={3} dot={{ fill: '#00D2FF', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Maintenance Priority Distribution (Pie Chart - 5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Maintenance Priority Distribution</h3>
                  <p className="text-[11px] text-slate-400">XGBoost classified risk priority classes</p>
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
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 text-[11px] text-slate-400 mt-2">
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
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Track Clip Inspections</h3>
                <p className="text-[11px] text-slate-400">Real-time telemetric logs synced with Firebase Firestore</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => navigate('/inspections')} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 cursor-pointer">
                  <FaFilter className="text-[10px]" />
                  <span>Filter</span>
                </button>
                <button onClick={() => navigate('/reports')} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-xs text-white shadow-md cursor-pointer">
                  <FaDownload className="text-[10px]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-4">QR ID</th>
                    <th className="pb-3 px-4">Component</th>
                    <th className="pb-3 px-4">Location</th>
                    <th className="pb-3 px-4">Inspector</th>
                    <th className="pb-3 px-4">Date</th>
                    <th className="pb-3 px-4">Health Score</th>
                    <th className="pb-3 px-4">AI Priority</th>
                    <th className="pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {mockInspectionTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/inspections')}>
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">{row.qrId}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{row.compId}</td>
                      <td className="py-3.5 px-4 text-slate-400">{row.location}</td>
                      <td className="py-3.5 px-4">{row.inspector}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.date}</td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={row.health > 80 ? 'text-emerald-400' : row.health > 50 ? 'text-amber-400' : 'text-red-400'}>
                          {row.health}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.priority === 'Low' ? 'bg-emerald-500/15 text-emerald-400' :
                          row.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center space-x-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            row.status === 'Healthy' ? 'bg-emerald-400' : row.status === 'Warning' ? 'bg-amber-400' : 'bg-red-400 animate-pulse'
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
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Top Priority AI Directives</h3>
              <p className="text-[11px] text-slate-400 mb-6">Immediate preventive maintenance recommendations generated by model</p>

              <div className="space-y-3">
                {[
                  { qr: 'QR-3319-902', action: 'Immediate Replacement Required', cause: 'Structural elasticity failure risk 92.4%', level: 'High' },
                  { qr: 'QR-7721-008', action: 'Tightening & Torque Calibration', cause: 'Vibration-induced looseness detected', level: 'High' },
                  { qr: 'QR-9104-204', action: 'Scheduled Inspection', cause: 'Environmental corrosion wear curve threshold reached', level: 'Medium' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg text-xs font-bold mt-0.5 ${
                        item.level === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        <FaExclamationTriangle />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="font-mono text-cyan-400">{item.qr}</span>
                          <span>— {item.action}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.cause}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/ai-analysis')} 
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium shrink-0 cursor-pointer"
                    >
                      View AI Risk
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Timeline Panel (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Maintenance Activity Stream</h3>
              <p className="text-[11px] text-slate-400 mb-6">Real-time operational events from field inspectors</p>

              <div className="relative pl-4 border-l border-white/10 space-y-6">
                {mockTimeline.map((evt) => (
                  <div key={evt.id} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
                    <div className="text-xs font-semibold text-white">{evt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{evt.desc}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{evt.time}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5. QUICK ACTIONS & SYSTEM METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Register New Railway Clip', icon: FaPlus, color: 'from-purple-600 to-blue-600', path: '/components' },
              { label: 'Run AI Failure Analysis', icon: FaBrain, color: 'from-blue-600 to-indigo-600', path: '/ai-analysis' },
              { label: 'Generate Analytical Reports', icon: FaFolder, color: 'from-slate-700 to-slate-800', path: '/reports' },
            ].map((btn, idx) => {
              const Icon = btn.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => navigate(btn.path)}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${btn.color} text-white font-medium text-xs shadow-lg flex items-center justify-center space-x-3 hover:opacity-90 transition-all cursor-pointer`}
                >
                  <Icon className="text-sm" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

        </main>

        {/* ================= FOOTER ================= */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            System Version: <span className="font-mono text-slate-400">v1.0.4-PROD</span> | Last Sync: <span className="font-mono text-emerald-400">Firestore Connected</span>
          </div>
          <div>
            Powered by React, Firebase, Node.js & Python XGBoost
          </div>
        </footer>

      </div>
    </div>
  );
}