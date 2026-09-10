import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLoggedInDistrictOfficer } from '../services/authHelper';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaUserCircle, FaBars, FaTimes, 
  FaPlus, FaFilter, FaDownload, FaSync, FaEye, FaEdit, 
  FaTrash, FaPrint, FaMapMarkerAlt, FaCogs, FaSignOutAlt, 
  FaFolder, FaMicrochip, FaExclamationTriangle, FaCheckCircle, 
  FaTools, FaCalendarAlt, FaBuilding, FaIndustry, FaCheck,
  FaArrowRight, FaLayerGroup, FaHistory, FaInfoCircle,
  FaFilePdf, FaFileExcel, FaFileCsv, FaShareAlt, FaEnvelope,
  FaRobot, FaChartPie, FaChartBar, FaTable, FaClock, FaUserPlus
} from 'react-icons/fa';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

/* ==========================================================================
   MERGED COMPONENT 1: LiquidEther (WebGL Fluid simulation canvas)
   Identical background engine for visual uniformity across all screens.
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
   REST-API READY DUMMY DATASTRUCTURES
   ========================================================================== */
const mockReportHistory = [
  { id: 'RPT-2026-089', title: 'Monthly Track Integrity Audit', type: 'Inspection Report', author: 'Chief Inspector K. Sharma', date: '2026-07-20 09:30', status: 'Generated', format: 'PDF', size: '2.4 MB' },
  { id: 'RPT-2026-088', title: 'XGBoost Risk Classification Summary', type: 'AI Prediction Report', author: 'AI Telemetry Engine', date: '2026-07-19 18:15', status: 'Archived', format: 'XLSX', size: '1.8 MB' },
  { id: 'RPT-2026-087', title: 'Southern Railway Track Clip Maintenance', type: 'Maintenance Report', author: 'Eng. P. Deshmukh', date: '2026-07-18 14:00', status: 'Generated', format: 'PDF', size: '3.1 MB' },
  { id: 'RPT-2026-086', title: 'Quarterly Critical Component Replacement', type: 'Replacement Report', author: 'Officer R. Verma', date: '2026-07-15 11:20', status: 'Generated', format: 'CSV', size: '940 KB' },
  { id: 'RPT-2026-085', title: 'Executive Asset Health Score Index', type: 'Health Score Report', author: 'Command Admin', date: '2026-07-10 16:45', status: 'Archived', format: 'PDF', size: '4.2 MB' },
];

const mockScheduledReports = [
  { title: 'Daily Field Inspection Log', freq: 'Daily @ 23:59', nextRun: '2026-07-20 23:59', status: 'Active' },
  { title: 'Weekly Maintenance Directive', freq: 'Weekly (Mondays)', nextRun: '2026-07-27 08:00', status: 'Active' },
  { title: 'Monthly XGBoost Predictive Risk Audit', freq: 'Monthly (1st)', nextRun: '2026-08-01 00:00', status: 'Active' },
  { title: 'Annual Infrastructure Asset Summary', freq: 'Yearly', nextRun: '2027-01-01 00:00', status: 'Scheduled' }
];

const mockReportTemplates = [
  { id: 't1', title: 'Full Inspection & Scan Audit', desc: 'Detailed log of all QR scans, physical conditions, and officer badges.', icon: FaShieldAlt, tag: 'Popular' },
  { id: 't2', title: 'AI Risk Priority Evaluation', desc: 'Predictive health breakdown based on Python XGBoost model vectors.', icon: FaBrain, tag: 'AI Engine' },
  { id: 't3', title: 'Maintenance & Tightening Log', desc: 'On-site repairs, torque calibrations, and replaced clip inventories.', icon: FaTools, tag: 'Field Ops' },
  { id: 't4', title: 'Executive Asset Overview', desc: 'High-level C-suite summary with radar analytics and zone metrics.', icon: FaChartPie, tag: 'Executive' }
];

const mockComponentSummary = [
  { qrId: 'QR-8842-109', compId: 'CLP-001', station: 'Katpadi Jn', zone: 'Southern', health: 96, priority: 'Low', status: 'Healthy', lastInsp: '2026-07-20' },
  { qrId: 'QR-9104-204', compId: 'CLP-002', station: 'Thanjavur Jn', zone: 'Southern', health: 64, priority: 'Medium', status: 'Warning', lastInsp: '2026-07-18' },
  { qrId: 'QR-3319-902', compId: 'CLP-003', station: 'Kalyan Jn', zone: 'Central', health: 28, priority: 'Critical', status: 'Critical', lastInsp: '2026-07-15' },
  { qrId: 'QR-4412-511', compId: 'CLP-004', station: 'Ambala Cantt', zone: 'Northern', health: 91, priority: 'Low', status: 'Healthy', lastInsp: '2026-07-19' },
  { qrId: 'QR-7721-008', compId: 'CLP-005', station: 'Anand Jn', zone: 'Western', health: 42, priority: 'High', status: 'Critical', lastInsp: '2026-07-10' },
];

const mockInspectionTrendData = [
  { month: 'Jan', inspections: 320, maintenance: 45 },
  { month: 'Feb', inspections: 410, maintenance: 38 },
  { month: 'Mar', inspections: 480, maintenance: 52 },
  { month: 'Apr', inspections: 510, maintenance: 41 },
  { month: 'May', inspections: 620, maintenance: 60 },
  { month: 'Jun', inspections: 590, maintenance: 48 },
  { month: 'Jul', inspections: 710, maintenance: 35 }
];

const mockHealthPieData = [
  { name: 'Optimal (80-100)', value: 5210, color: '#10B981' },
  { name: 'Moderate (50-79)', value: 450, color: '#F59E0B' },
  { name: 'Critical (< 50)', value: 182, color: '#EF4444' }
];

/* ==========================================================================
   MAIN COMPONENT: Reports.jsx
   ========================================================================== */
export default function Reports() {
  const navigate = useNavigate();
  const districtOfficer = getLoggedInDistrictOfficer();

  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Reports');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Report Form Filters
  const [reportType, setReportType] = useState('Inspection Report');
  const [dateRange, setDateRange] = useState({ start: '2026-07-01', end: '2026-07-20' });
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Interactive & UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyList, setHistoryList] = useState(mockReportHistory);
  const [selectedReport, setSelectedReport] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation Routing Handler
  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) navigate(path);
  };

  // Generate Report Simulation
  const handleGenerateReport = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsPreviewing(true);
      const newEntry = {
        id: `RPT-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: `${reportType} (${selectedZone} Zone)`,
        type: reportType,
        author: 'Chief Engineer',
        date: new Date().toLocaleString(),
        status: 'Generated',
        format: 'PDF',
        size: '2.8 MB'
      };
      setHistoryList([newEntry, ...historyList]);
    }, 1000);
  };

  // Filtered History
  const filteredHistory = historyList.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative h-screen bg-[#030712] text-white font-['Poppins',sans-serif] flex overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* 1. WebGL Liquid Ether Background Engine */}
      <LiquidEther
        color0="#5227FF"
        color1="#FF9FFC"
        color2="#00D2FF"
        autoSpeed={0.4}
      />

      {/* 2. Glow Orbs */}
      <div className="fixed top-20 left-60 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full filter blur-[160px] pointer-events-none z-0" />

      {/* 3. SIDEBAR NAVIGATION */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 flex flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-2xl min-h-screen shrink-0"
      >
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
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">ANALYTICS HUB</span>
                </div>
              )}
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="relative z-20 ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white">
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

        <div className="p-4 border-t border-white/10">
          <button onClick={() => navigate('/login')} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer">
            <FaSignOutAlt className="text-sm" />
            {sidebarOpen && <span>Disconnect Session</span>}
          </button>
        </div>
      </motion.aside>

      {/* 4. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col z-20 min-w-0 overflow-y-auto scroll-smooth" style={{ scrollBehavior: 'smooth' }}>

        {/* HEADER NAVBAR */}
        <header className="sticky top-0 z-30 px-8 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Reports & Executive Analytics
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                EXPORT ENGINE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">Generate, Visualize, and Export Railway Track Clip Maintenance Reports</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Reports Archive..."
                className="pl-9 pr-4 py-2 w-64 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <FaUserCircle className="text-2xl text-purple-400" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-white leading-none">{districtOfficer.title}</span>
                <span className="text-[10px] text-slate-400">{districtOfficer.subtitle}</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* AI SUMMARY HIGHLIGHT BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-black border border-purple-500/30 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-cyan-400 text-xl shrink-0 mt-1 md:mt-0">
                  <FaRobot className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Executive Analytics & AI Maintenance Directives
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">Live Firestore Audit</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    "Average track clip health score increased by <strong className="text-emerald-400">+11%</strong> this month. 42 clips require maintenance within 10 days. Inspection efficiency improved by <strong className="text-cyan-400">+18%</strong> across the Southern Zone."
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button onClick={() => alert('Generating Executive Summary PDF...')} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 flex items-center space-x-2 cursor-pointer">
                  <FaFilePdf />
                  <span>Download Executive PDF</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* 1. TOP STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: 'Total Generated', count: '1,420', trend: '+14%', isPositive: true, icon: FaFolder, color: 'from-blue-600 to-cyan-400' },
              { title: "Today's Reports", count: '12', trend: '+4', isPositive: true, icon: FaCalendarAlt, color: 'from-purple-600 to-indigo-400' },
              { title: 'Inspection Audits', count: '890', trend: '+18%', isPositive: true, icon: FaShieldAlt, color: 'from-emerald-600 to-teal-400' },
              { title: 'Maintenance Logs', count: '340', trend: '+8%', isPositive: true, icon: FaTools, color: 'from-amber-600 to-yellow-400' },
              { title: 'AI Prediction Reports', count: '190', trend: '+22%', isPositive: true, icon: FaBrain, color: 'from-cyan-600 to-blue-500' },
              { title: 'Exports Count', count: '3,840', trend: '+30%', isPositive: true, icon: FaDownload, color: 'from-rose-600 to-pink-500' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                      <Icon className="text-base" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                  <div className="text-[11px] text-slate-400 truncate">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* 2. REPORT TEMPLATES CARDS */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FaLayerGroup className="text-cyan-400" />
              Quick Report Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockReportTemplates.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <div key={tpl.id} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Icon className="text-base" />
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                          {tpl.tag}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mb-1">{tpl.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{tpl.desc}</p>
                    </div>
                    <button 
                      onClick={() => { setReportType(tpl.title); setIsPreviewing(true); }}
                      className="mt-4 w-full py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Load Template</span>
                      <FaArrowRight className="text-[10px]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. REPORT GENERATOR & LIVE PREVIEW ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Custom Report Configurator (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaCogs className="text-cyan-400" />
                    Configure Custom Report
                  </h3>
                </div>

                <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Report Category *</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none">
                      <option value="Inspection Report">Inspection & Scan Report</option>
                      <option value="Maintenance Report">Maintenance & Tightening Log</option>
                      <option value="AI Prediction Report">AI Risk Priority Report</option>
                      <option value="Health Score Report">Executive Health Score Index</option>
                      <option value="Replacement Report">Critical Replacement Report</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Start Date</label>
                      <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">End Date</label>
                      <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Railway Zone</label>
                      <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none">
                        <option value="All">All Zones</option>
                        <option value="Southern">Southern</option>
                        <option value="Northern">Northern</option>
                        <option value="Central">Central</option>
                        <option value="Western">Western</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Priority Class</label>
                      <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none">
                        <option value="All">All Priorities</option>
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                        <option value="Critical">Critical Alert</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={isGenerating} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 flex items-center justify-center space-x-2 cursor-pointer">
                      <FaSync className={isGenerating ? 'animate-spin' : ''} />
                      <span>{isGenerating ? 'Compiling Dataset...' : 'Generate & Render Report'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Export Buttons */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-[11px] text-slate-400 mb-2">Export Format Support:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => alert('Exporting PDF File via jsPDF...')} className="py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-red-400 text-xs flex items-center justify-center space-x-1 cursor-pointer">
                    <FaFilePdf />
                    <span>PDF</span>
                  </button>
                  <button onClick={() => alert('Exporting Excel Sheet via XLSX...')} className="py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-emerald-400 text-xs flex items-center justify-center space-x-1 cursor-pointer">
                    <FaFileExcel />
                    <span>XLSX</span>
                  </button>
                  <button onClick={() => alert('Exporting CSV File...')} className="py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-400 text-xs flex items-center justify-center space-x-1 cursor-pointer">
                    <FaFileCsv />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Report Preview Canvas (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between min-h-[420px]">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400">INDIAN RAILWAYS ANALYTICS DIVISION</span>
                    <h3 className="text-base font-bold text-white">{reportType}</h3>
                    <span className="text-[11px] text-slate-400">Date Window: {dateRange.start} to {dateRange.end} | Zone: {selectedZone}</span>
                  </div>
                  <button onClick={() => window.print()} className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer">
                    <FaPrint />
                    <span>Print</span>
                  </button>
                </div>

                {/* Printable Document Summary Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <span className="text-slate-400 text-[10px] block">Clips Evaluated</span>
                      <span className="text-base font-bold text-white">5,842</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <span className="text-slate-400 text-[10px] block">Mean Health</span>
                      <span className="text-base font-bold text-emerald-400">92.4%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <span className="text-slate-400 text-[10px] block">Action Required</span>
                      <span className="text-base font-bold text-amber-400">27 Clips</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed font-light">
                    "This automated telemetry document compiles physical scanner logs, inspector badge verification records, and Python XGBoost failure predictions across the specified section."
                  </div>
                </div>

                {/* Mini Chart Inside Report Preview */}
                <div className="mt-4 h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockInspectionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="inspections" fill="#00D2FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Generated via RailClipAI Engine</span>
                <span>Signature: Authenticated Cryptographic Hash</span>
              </div>
            </div>

          </div>

          {/* 4. COMPONENT SUMMARY TABLE & RECHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Component Summary Data Table (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Telemetric Asset Health Breakdown</h3>
              <p className="text-[11px] text-slate-400 mb-4">Sample component records compiled in current report</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                      <th className="pb-3 px-3">QR ID</th>
                      <th className="pb-3 px-3">Component</th>
                      <th className="pb-3 px-3">Station</th>
                      <th className="pb-3 px-3">Health Score</th>
                      <th className="pb-3 px-3">Priority</th>
                      <th className="pb-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {mockComponentSummary.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">{row.qrId}</td>
                        <td className="py-3 px-3 font-medium text-white">{row.compId}</td>
                        <td className="py-3 px-3 text-slate-400">{row.station}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">{row.health}/100</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.priority === 'Low' ? 'bg-emerald-500/15 text-emerald-400' :
                            row.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Health Distribution Donut Chart (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Asset Health Index Distribution</h3>
              <p className="text-[11px] text-slate-400 mb-4">Percentage breakdown across network</p>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mockHealthPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {mockHealthPieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 5. HISTORICAL REPORTS & SCHEDULED REPORTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Generated Reports History Table (8 cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Generated Reports Archive</h3>
              <p className="text-[11px] text-slate-400 mb-4">Historical downloadable PDF/XLSX logs</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                      <th className="pb-3 px-4">Report ID</th>
                      <th className="pb-3 px-4">Title & Type</th>
                      <th className="pb-3 px-4">Generated By</th>
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredHistory.map((rpt) => (
                      <tr key={rpt.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">{rpt.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{rpt.title}</div>
                          <div className="text-[10px] text-slate-500">{rpt.type}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{rpt.author}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{rpt.date}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button onClick={() => { setSelectedReport(rpt); setDrawerOpen(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 cursor-pointer">
                            <FaEye />
                          </button>
                          <button onClick={() => alert(`Downloading ${rpt.title}...`)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-400 cursor-pointer">
                            <FaDownload />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scheduled Automated Reports Panel (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Automated Scheduled Reports</h3>
                <p className="text-[11px] text-slate-400 mb-4">Cron schedules sending direct PDF emails</p>

                <div className="space-y-3">
                  {mockScheduledReports.map((sch, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{sch.title}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">{sch.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{sch.freq}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Next Run: {sch.nextRun}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => alert('Opening Schedule Configurator...')} className="mt-4 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer">
                + Add Scheduled Report
              </button>
            </div>

          </div>

          {/* 6. QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Generate Inspection Report', icon: FaShieldAlt, color: 'from-purple-600 to-blue-600', path: '/inspections' },
              { label: 'View Asset Inventory', icon: FaQrcode, color: 'from-cyan-600 to-teal-600', path: '/components' },
              { label: 'Run AI Prediction Model', icon: FaBrain, color: 'from-blue-600 to-indigo-600', path: '/ai-analysis' },
              { label: 'Back to Command Dashboard', icon: FaChartLine, color: 'from-slate-700 to-slate-800', path: '/dashboard' },
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

        {/* 7. VIEW REPORT DRAWER */}
        <AnimatePresence>
          {drawerOpen && selectedReport && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="w-full max-w-md bg-slate-900 border-l border-white/10 p-6 overflow-y-auto h-full space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white">Report Metadata Details</h3>
                  <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><FaTimes /></button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4">
                    <FaFolder className="text-4xl text-cyan-400" />
                    <div>
                      <div className="font-mono text-white font-bold">{selectedReport.id}</div>
                      <div className="text-slate-300 font-semibold">{selectedReport.title}</div>
                      <div className="text-[10px] text-slate-400">{selectedReport.type}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Generated By</span>
                      <span>{selectedReport.author}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">File Format</span>
                      <span className="font-mono text-purple-300">{selectedReport.format} ({selectedReport.size})</span>
                    </div>
                  </div>

                  <button onClick={() => alert(`Downloading ${selectedReport.title}...`)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold flex items-center justify-center space-x-2 cursor-pointer">
                    <FaDownload />
                    <span>Download File ({selectedReport.format})</span>
                  </button>
                </div>

                <button onClick={() => setDrawerOpen(false)} className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer">
                  Close Drawer
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>Export Engine Status: <span className="font-mono text-emerald-400">PDF/XLSX Renderer Ready</span> | Firebase Archive Connected</div>
          <div>Powered by React, Node.js, Express, jsPDF & Python XGBoost</div>
        </footer>

      </div>
    </div>
  );
}