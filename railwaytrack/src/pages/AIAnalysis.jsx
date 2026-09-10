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
  FaRobot, FaSlidersH, FaBolt, FaFlask, FaDatabase, FaServer, FaUserPlus
} from 'react-icons/fa';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

/* ==========================================================================
   MERGED COMPONENT 1: LiquidEther (WebGL Fluid simulation canvas)
   Identical background engine to Dashboard.jsx for visual uniformity.
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
   REST-API READY DUMMY DATASTRUCTURES (PYTHON XGBOOST MODEL INTEGRATION)
   ========================================================================== */
const mockPredictions = [
  { id: '1', qrId: 'QR-3319-902', compId: 'CLP-003', section: 'Sec 03, Track C', station: 'Kalyan Jn', health: 28, priority: 'Critical', risk: 'Critical', probability: '92.4%', remLife: '4 Days', recommendation: 'Immediate replacement required due to stress fracture risk.', date: '2026-07-20 13:40' },
  { id: '2', qrId: 'QR-7721-008', compId: 'CLP-005', section: 'Sec 21, Track B', station: 'Anand Jn', health: 42, priority: 'High', risk: 'High', probability: '74.1%', remLife: '14 Days', recommendation: 'Tighten fastener assembly & recalibrate torque.', date: '2026-07-20 12:15' },
  { id: '3', qrId: 'QR-9104-204', compId: 'CLP-002', section: 'Sec 08, Track A', station: 'Thanjavur Jn', health: 64, priority: 'Medium', risk: 'Medium', probability: '38.6%', remLife: '45 Days', recommendation: 'Schedule routine anti-corrosion coating & inspection.', date: '2026-07-20 11:02' },
  { id: '4', qrId: 'QR-8842-109', compId: 'CLP-001', section: 'Sec 14, Track B', station: 'Katpadi Jn', health: 96, priority: 'Low', risk: 'Low', probability: '1.2%', remLife: '14.8 Years', recommendation: 'No action required. Structural integrity optimal.', date: '2026-07-20 10:20' },
  { id: '5', qrId: 'QR-4412-511', compId: 'CLP-004', section: 'Sec 12, Track A', station: 'Ambala Cantt', health: 91, priority: 'Low', risk: 'Low', probability: '2.8%', remLife: '12.5 Years', recommendation: 'Perform bi-monthly standard telemetry monitoring.', date: '2026-07-20 09:15' },
];

const mockFeatureImportance = [
  { feature: 'Clip Age (Days)', importance: 38 },
  { feature: 'Inspection Count', importance: 24 },
  { feature: 'Wear History Index', importance: 18 },
  { feature: 'Looseness Reports', importance: 11 },
  { feature: 'Traffic Load (MGT)', importance: 6 },
  { feature: 'Corrosion Exposure', importance: 3 }
];

const mockHealthRadar = [
  { subject: 'Elasticity', A: 92, fullMark: 100 },
  { subject: 'Fastener Torque', A: 88, fullMark: 100 },
  { subject: 'Corrosion Resistance', A: 75, fullMark: 100 },
  { subject: 'Vibration Tolerance', A: 85, fullMark: 100 },
  { subject: 'Load Distribution', A: 90, fullMark: 100 },
  { subject: 'Micro-Fracture Index', A: 95, fullMark: 100 }
];

const mockPredictionTrend = [
  { month: 'Feb', highRisk: 18, lowRisk: 420 },
  { month: 'Mar', highRisk: 22, lowRisk: 450 },
  { month: 'Apr', highRisk: 15, lowRisk: 480 },
  { month: 'May', highRisk: 27, lowRisk: 510 },
  { month: 'Jun', highRisk: 31, lowRisk: 530 },
  { month: 'Jul', highRisk: 27, lowRisk: 584 }
];

const mockPriorityDist = [
  { name: 'Low Priority', value: 5210, color: '#10B981' },
  { name: 'Medium Priority', value: 450, color: '#F59E0B' },
  { name: 'High Priority', value: 155, color: '#F97316' },
  { name: 'Critical Alert', value: 27, color: '#EF4444' }
];

/* ==========================================================================
   MAIN COMPONENT: AIAnalysis.jsx
   ========================================================================== */
export default function AIAnalysis() {
  const navigate = useNavigate();
  const districtOfficer = getLoggedInDistrictOfficer();

  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('AI Analysis');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [predictionList, setPredictionList] = useState(mockPredictions);

  // Drawer / Details Modal
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isRefreshingModel, setIsRefreshingModel] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation Click Handler
  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) navigate(path);
  };

  // Re-run AI Inference Simulation
  const handleRefreshInference = () => {
    setIsRefreshingModel(true);
    setTimeout(() => {
      setIsRefreshingModel(false);
      alert('XGBoost model inference completed. 5,842 component risk vectors updated!');
    }, 1200);
  };

  // Filter Logic
  const filteredPredictions = predictionList.filter(item => {
    const matchesQuery = item.compId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.qrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.station.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    return matchesQuery && matchesPriority;
  });

  return (
    <div className="relative h-screen bg-[#030712] text-white font-['Poppins',sans-serif] flex overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* 1. WebGL Liquid Ether Canvas Background */}
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
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">PREDICTIVE CENTER</span>
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
              AI Maintenance Analysis
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                XGBOOST ENGINE v2.4
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">Predictive Maintenance and Intelligent Railway Asset Monitoring</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI Predictions..."
                className="pl-9 pr-4 py-2 w-64 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>INFERENCE: 14ms</span>
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

          {/* AI SMART ASSISTANT HIGHLIGHT BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-black border border-purple-500/30 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-cyan-400 text-xl shrink-0 mt-1 md:mt-0">
                  <FaRobot className="animate-bounce" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    Python AI Model Diagnostic Insights
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">XGBoost Pickle Loaded</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    "23 railway clips require maintenance within the next 7 days. System-wide health score improved by <strong className="text-emerald-400">+12%</strong> post-tightening cycle. Critical component failures reduced by <strong className="text-cyan-400">18%</strong>."
                  </p>
                </div>
              </div>
              <button 
                onClick={handleRefreshInference} 
                disabled={isRefreshingModel}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 shrink-0 flex items-center space-x-2 cursor-pointer"
              >
                <FaSync className={isRefreshingModel ? 'animate-spin' : ''} />
                <span>{isRefreshingModel ? 'Running Model...' : 'Re-run Inference'}</span>
              </button>
            </div>
          </motion.div>

          {/* 1. TOP OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: 'Avg Health Score', count: '92.4', trend: '+1.8', isPositive: true, icon: FaChartLine, color: 'from-blue-600 to-cyan-400' },
              { title: 'Prediction Accuracy', count: '98.2%', trend: '+0.4%', isPositive: true, icon: FaCheckCircle, color: 'from-emerald-600 to-teal-400' },
              { title: 'High Risk Clips', count: '27', trend: '-3', isPositive: true, icon: FaExclamationTriangle, color: 'from-red-600 to-rose-400' },
              { title: 'Low Risk Clips', count: '5,210', trend: '+98%', isPositive: true, icon: FaShieldAlt, color: 'from-purple-600 to-indigo-400' },
              { title: 'Predictions Today', count: '5,842', trend: 'Live Sync', isPositive: true, icon: FaBrain, color: 'from-cyan-600 to-blue-500' },
              { title: 'Model Confidence', count: '99.1%', trend: 'Optimal', isPositive: true, icon: FaBolt, color: 'from-amber-600 to-yellow-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all">
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
                  <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                  <div className="text-[11px] text-slate-400 truncate">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* 2. AI MODEL METRICS & FEATURE IMPORTANCE SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* AI Engine Status Card (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaServer className="text-cyan-400" />
                    AI Model Engine
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Model Framework:</span>
                    <span className="font-mono text-cyan-300">XGBoost Regressor</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Model Version:</span>
                    <span className="font-mono text-white">v2.4.0-prod</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Last Training Date:</span>
                    <span className="font-mono text-slate-300">2026-07-01</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Total Vectors Evaluated:</span>
                    <span className="font-mono text-purple-300 font-bold">5,842 Clips</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Inference Latency:</span>
                    <span className="font-mono text-emerald-400">14 ms</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Pickle File: <strong className="text-slate-300">model_v2.pkl</strong></span>
                <span>Accuracy: <strong className="text-emerald-400">98.2%</strong></span>
              </div>
            </div>

            {/* Feature Importance Horizontal Chart (8 cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">XGBoost Feature Importance Weights</h3>
                  <p className="text-[11px] text-slate-400">Key track factors influencing AI failure probability predictions</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10">
                  SHAP VALUES
                </span>
              </div>

              <div className="space-y-3">
                {mockFeatureImportance.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{feat.feature}</span>
                      <span className="font-mono text-cyan-400 font-bold">{feat.importance}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${feat.importance * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3. AI PREDICTION DATA TABLE */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">AI Maintenance Priority Predictions</h3>
                <p className="text-[11px] text-slate-400">Real-time risk classification generated for field operations</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button onClick={() => alert('Exporting AI Predictions CSV...')} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium flex items-center space-x-2 cursor-pointer">
                  <FaDownload className="text-[10px]" />
                  <span>Export Predictions</span>
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
                    <th className="pb-3 px-4">Health Score</th>
                    <th className="pb-3 px-4">Priority</th>
                    <th className="pb-3 px-4">Failure Prob.</th>
                    <th className="pb-3 px-4">Remaining Life</th>
                    <th className="pb-3 px-4">AI Recommendation</th>
                    <th className="pb-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredPredictions.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">{row.qrId}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{row.compId}</td>
                      <td className="py-3.5 px-4 text-slate-400">{row.station}</td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={row.health > 80 ? 'text-emerald-400' : row.health > 50 ? 'text-amber-400' : 'text-red-400'}>
                          {row.health}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.priority === 'Low' ? 'bg-emerald-500/15 text-emerald-400' :
                          row.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400' :
                          row.priority === 'High' ? 'bg-orange-500/15 text-orange-400' : 'bg-red-500/15 text-red-400 animate-pulse'
                        }`}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{row.probability}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-300">{row.remLife}</td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{row.recommendation}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => { setSelectedPrediction(row); setDrawerOpen(true); }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 text-[11px] font-medium cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. RADAR & RECHARTS RISK DISTRIBUTION ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Component Radar Health Analysis (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Clip Structural Radar Vectors</h3>
              <p className="text-[11px] text-slate-400 mb-4">Multidimensional telemetry health comparison</p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockHealthRadar}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                    <PolarRadiusAxis stroke="#475569" fontSize={10} />
                    <Radar name="Clip CLP-001" dataKey="A" stroke="#00D2FF" fill="#00D2FF" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Maintenance Priority Distribution Pie Chart (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Risk Priority Classification Breakdown</h3>
              <p className="text-[11px] text-slate-400 mb-4">Total components categorized by prediction engine</p>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mockPriorityDist} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      {mockPriorityDist.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
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

          {/* 5. QUICK ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Run Full Fleet Diagnostics', icon: FaBrain, color: 'from-purple-600 to-blue-600', path: '/ai-analysis' },
              { label: 'Register New Track Clip', icon: FaQrcode, color: 'from-cyan-600 to-teal-600', path: '/components' },
              { label: 'Scan QR Inspection', icon: FaShieldAlt, color: 'from-blue-600 to-indigo-600', path: '/inspections' },
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

        {/* 6. PREDICTION DETAILS DRAWER */}
        <AnimatePresence>
          {drawerOpen && selectedPrediction && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }} 
                className="w-full max-w-md bg-slate-900 border-l border-white/10 p-6 overflow-y-auto h-full space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaBrain className="text-cyan-400" />
                    AI Prediction Profile
                  </h3>
                  <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><FaTimes /></button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4">
                    <FaQrcode className="text-4xl text-cyan-400" />
                    <div>
                      <div className="font-mono text-white font-bold">{selectedPrediction.qrId}</div>
                      <div className="text-slate-400">ID: {selectedPrediction.compId}</div>
                      <div className="text-[10px] text-purple-300">{selectedPrediction.section}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Calculated Health Score</span>
                      <span className="text-lg font-bold text-emerald-400">{selectedPrediction.health}/100</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Failure Probability</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">{selectedPrediction.probability}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 space-y-2">
                    <div className="text-xs font-bold text-white">AI Maintenance Recommendation</div>
                    <p className="text-slate-300 text-xs leading-relaxed">{selectedPrediction.recommendation}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 text-slate-400 space-y-1">
                    <div>Estimated Remaining Life: <strong className="text-white">{selectedPrediction.remLife}</strong></div>
                    <div>Prediction Timestamp: <strong className="text-slate-300">{selectedPrediction.date}</strong></div>
                  </div>
                </div>

                <button onClick={() => setDrawerOpen(false)} className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer">
                  Close Prediction Profile
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>AI Engine Status: <span className="font-mono text-emerald-400">XGBoost API Connected</span> | Total Vectors: <span className="font-mono text-slate-300">5,842</span></div>
          <div>Powered by React, Node.js, Express & Python XGBoost</div>
        </footer>

      </div>
    </div>
  );
}