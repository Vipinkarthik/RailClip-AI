import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaUserCircle, FaBars, FaTimes, 
  FaPlus, FaFilter, FaDownload, FaSync, FaEye, FaEdit, 
  FaTrash, FaPrint, FaMapMarkerAlt, FaCogs, FaSignOutAlt, 
  FaFolder, FaMicrochip, FaExclamationTriangle, FaCheckCircle, 
  FaTools, FaCalendarAlt, FaBuilding, FaIndustry, FaCheck,
  FaArrowRight, FaLayerGroup, FaHistory, FaInfoCircle, FaCamera,
  FaUpload, FaStop, FaCloudUploadAlt, FaSun, FaCloudRain, FaSmog, FaMoon, FaUserPlus
} from 'react-icons/fa';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

/* ==========================================================================
   MERGED COMPONENT 1: LiquidEther (WebGL Fluid simulation canvas)
   Identical to Dashboard.jsx background engine for visual consistency.
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
const mockComponentDetails = {
  qrId: 'QR-8842-109',
  compId: 'CLP-001',
  section: 'Sec 14, Track B',
  zone: 'Southern',
  division: 'Chennai',
  station: 'Katpadi Jn',
  lat: '12.9716° N',
  lng: '79.1312° E',
  installDate: '2026-01-15',
  manufacturer: 'Jindal Steel',
  trackType: 'Broad Gauge (1676 mm)',
  material: 'Spring Steel 60Si7',
  inspectionCount: 14,
  maintenanceCount: 2,
  lastInspectionDate: '2026-07-10',
  currentHealth: 88,
  currentPriority: 'Low',
  status: 'Active'
};

const mockInspectionRecords = [
  { id: '1', date: '2026-07-20 11:42', inspector: 'Officer K. Sharma', condition: 'Healthy', severity: 'Low', health: 96, maintenance: 'No', status: 'Healthy', remarks: 'Fastener tension optimal. Zero micro-fractures.' },
  { id: '2', date: '2026-07-10 14:15', inspector: 'Inspector R. Verma', condition: 'Loose', severity: 'Medium', health: 78, maintenance: 'Yes', status: 'Warning', remarks: 'Retightened clip housing assembly.' },
  { id: '3', date: '2026-06-25 09:30', inspector: 'Eng. P. Deshmukh', condition: 'Worn', severity: 'Low', health: 84, maintenance: 'No', status: 'Healthy', remarks: 'Minor surface oxidation observed.' },
  { id: '4', date: '2026-05-18 16:20', inspector: 'Inspector M. Khan', condition: 'Healthy', severity: 'Low', health: 91, maintenance: 'No', status: 'Healthy', remarks: 'Routine track audit cleared.' },
  { id: '5', date: '2026-04-12 10:05', inspector: 'Officer K. Sharma', condition: 'Corroded', severity: 'Medium', health: 70, maintenance: 'Yes', status: 'Warning', remarks: 'Anti-corrosion coating re-applied.' },
];

const mockComponentTimeline = [
  { title: 'Component Registered', time: '2026-01-10', desc: 'Laser QR code QR-8842-109 etched at factory.' },
  { title: 'Installed on Track', time: '2026-01-15', desc: 'Anchored at Sec 14, Track B, Katpadi Jn.' },
  { title: 'Initial Telemetry Inspection', time: '2026-03-01', desc: 'Baseline health score set to 100/100.' },
  { title: 'Maintenance Logged', time: '2026-07-10', desc: 'Slight looseness corrected by team.' },
  { title: 'Latest Inspection Completed', time: '2026-07-20', desc: 'Passed inspection with 96/100 rating.' }
];

const mockDailyTrend = [
  { day: 'Mon', count: 42 }, { day: 'Tue', count: 68 },
  { day: 'Wed', count: 55 }, { day: 'Thu', count: 89 },
  { day: 'Fri', count: 74 }, { day: 'Sat', count: 95 },
  { day: 'Sun', count: 60 }
];

const mockStatusDist = [
  { name: 'Healthy', value: 340, color: '#10B981' },
  { name: 'Warning / Loose', value: 45, color: '#F59E0B' },
  { name: 'Critical / Cracked', value: 12, color: '#EF4444' }
];

const mockSeverityDist = [
  { level: 'Low', count: 280 },
  { level: 'Medium', count: 85 },
  { level: 'High', count: 22 },
  { level: 'Critical', count: 10 }
];

const mockHealthTrend = [
  { month: 'Jan', health: 100 },
  { month: 'Feb', health: 98 },
  { month: 'Mar', health: 95 },
  { month: 'Apr', health: 90 },
  { month: 'May', health: 91 },
  { month: 'Jun', health: 84 },
  { month: 'Jul', health: 96 }
];

/* ==========================================================================
   MAIN COMPONENT: Inspection.jsx
   ========================================================================== */
export default function Inspection() {
  const navigate = useNavigate();

  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Inspections');
  const [currentTime, setCurrentTime] = useState(new Date());

  // QR Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(true);
  const [manualQrInput, setManualQrInput] = useState('QR-8842-109');
  const [activeComponent, setActiveComponent] = useState(mockComponentDetails);

  // Inspection Form State
  const [formState, setFormState] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: 'Officer K. Sharma',
    inspectorId: 'IR-88204',
    gpsLocation: '12.9716° N, 79.1312° E',
    condition: 'Healthy',
    maintenancePerformed: false,
    severity: 'Low',
    trackCondition: 'Good',
    weather: 'Sunny',
    remarks: 'Routine inspection completed. All clips securely fastened.'
  });

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [historyList, setHistoryList] = useState(mockInspectionRecords);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, msg: 'QR-8842-109 scan verified successfully', time: 'Just now' },
    { id: 2, msg: 'XGBoost model updated failure probability', time: '5m ago' }
  ]);

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

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Simulate QR Scan Completion
  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedSuccess(true);
      setActiveComponent(mockComponentDetails);
      setNotifications(prev => [{ id: Date.now(), msg: `Scanned ${manualQrInput} successfully`, time: 'Just now' }, ...prev]);
    }, 1500);
  };

  // Save Inspection
  const handleSaveInspection = (e) => {
    e.preventDefault();
    const newRecord = {
      id: String(Date.now()),
      date: `${formState.inspectionDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      inspector: formState.inspectorName,
      condition: formState.condition,
      severity: formState.severity,
      health: formState.condition === 'Healthy' ? 98 : formState.condition === 'Loose' ? 75 : 40,
      maintenance: formState.maintenancePerformed ? 'Yes' : 'No',
      status: formState.condition === 'Healthy' ? 'Healthy' : formState.condition === 'Loose' ? 'Warning' : 'Critical',
      remarks: formState.remarks
    };

    setHistoryList([newRecord, ...historyList]);
    setNotifications(prev => [{ id: Date.now(), msg: `Inspection logged for ${activeComponent.compId}`, time: 'Just now' }, ...prev]);
    alert('Inspection successfully saved to Cloud Firestore!');
  };

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
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">FIELD INSPECTOR</span>
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
              QR Inspection & Maintenance
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                FIELD TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">Scan Railway Track Clips and Update Inspection Records in Real Time</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Inspection Logs..."
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
                <span className="text-xs font-medium text-white leading-none">Officer K. Sharma</span>
                <span className="text-[10px] text-slate-400">Chief Track Inspector</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* 1. TOP STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: "Today's Inspections", count: '48', trend: '+12%', isPositive: true, icon: FaCalendarAlt, color: 'from-blue-600 to-cyan-400' },
              { title: 'Pending Inspections', count: '14', trend: '-5%', isPositive: true, icon: FaSync, color: 'from-amber-600 to-yellow-400' },
              { title: 'Completed Inspections', count: '1,280', trend: '+18%', isPositive: true, icon: FaCheckCircle, color: 'from-emerald-600 to-teal-400' },
              { title: 'Critical Components', count: '3', trend: '+1', isPositive: false, icon: FaExclamationTriangle, color: 'from-red-600 to-rose-400' },
              { title: 'Healthy Components', count: '1,215', trend: '95%', isPositive: true, icon: FaShieldAlt, color: 'from-purple-600 to-indigo-400' },
              { title: 'Avg Health Score', count: '91.4', trend: '+2.1', isPositive: true, icon: FaChartLine, color: 'from-cyan-600 to-blue-500' },
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

          {/* 2. QR SCANNER & COMPONENT INFO ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* QR Scanner Card (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaQrcode className="text-cyan-400" />
                    Scan Railway Clip Laser QR
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    CAMERA ACTIVE
                  </span>
                </div>

                {/* Camera View Finder Placeholder */}
                <div className="relative w-full h-52 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center overflow-hidden mb-4">
                  {isScanning ? (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-cyan-300 font-mono">Decoding Matrix QR...</span>
                    </div>
                  ) : scannedSuccess ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl border border-emerald-500/40">
                        <FaCheck />
                      </div>
                      <span className="text-xs text-emerald-400 font-mono font-bold">QR VERIFIED & DECODED</span>
                      <span className="text-[10px] text-slate-400">{manualQrInput}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-slate-500">
                      <FaCamera className="text-4xl animate-pulse" />
                      <span className="text-xs">Align Laser QR code inside scanner frame</span>
                    </div>
                  )}

                  {/* Corner Target Markers */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-400" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-400" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-400" />
                </div>

                {/* Manual Input */}
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block">Or enter Laser QR ID manually</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={manualQrInput}
                      onChange={(e) => setManualQrInput(e.target.value)}
                      placeholder="e.g. QR-8842-109"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-cyan-400 font-mono text-xs focus:outline-none"
                    />
                    <button onClick={handleTriggerScan} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 cursor-pointer">
                      Query
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                <button onClick={handleTriggerScan} className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer">
                  <FaCamera />
                  <span>Start Camera</span>
                </button>
                <button onClick={() => alert('Simulating image upload...')} className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-white/10 cursor-pointer">
                  <FaUpload />
                  <span>Upload QR Image</span>
                </button>
              </div>
            </div>

            {/* Component Information Card (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Retrieved Clip Profile
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                        {activeComponent.status}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Decoded from Firebase Firestore</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-400 font-mono">{activeComponent.qrId}</div>
                    <div className="text-[10px] text-slate-400">ID: {activeComponent.compId}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Track Section</span>
                    <span className="font-semibold text-white">{activeComponent.section}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Zone / Division</span>
                    <span className="font-semibold text-white">{activeComponent.zone} / {activeComponent.division}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Station</span>
                    <span className="font-semibold text-white">{activeComponent.station}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">GPS Coordinates</span>
                    <span className="font-mono text-cyan-300 text-[11px]">{activeComponent.lat}, {activeComponent.lng}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Installation Date</span>
                    <span className="font-mono text-slate-300">{activeComponent.installDate}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-500 text-[10px] block">Manufacturer</span>
                    <span className="font-semibold text-white">{activeComponent.manufacturer}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                  <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/20 text-center">
                    <span className="text-slate-400 text-[10px] block">Total Inspections</span>
                    <span className="text-lg font-bold text-purple-300">{activeComponent.inspectionCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/20 text-center">
                    <span className="text-slate-400 text-[10px] block">Current Health</span>
                    <span className="text-lg font-bold text-emerald-400">{activeComponent.currentHealth}/100</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-900/20 border border-cyan-500/20 text-center">
                    <span className="text-slate-400 text-[10px] block">AI Priority</span>
                    <span className="text-lg font-bold text-cyan-400">{activeComponent.currentPriority}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Last Inspected: <strong className="text-white">{activeComponent.lastInspectionDate}</strong></span>
                <span>Material: <strong className="text-slate-300">{activeComponent.material}</strong></span>
              </div>
            </div>

          </div>

          {/* 3. INSPECTION FORM & LIVE SUMMARY ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Inspection Form (8 cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Record Field Inspection Data</h3>
              <p className="text-[11px] text-slate-400 mb-6">Log clip physical state for AI telemetry analysis</p>

              <form onSubmit={handleSaveInspection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Inspection Date</label>
                    <input type="date" name="inspectionDate" value={formState.inspectionDate} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Inspector Name</label>
                    <input type="text" name="inspectorName" value={formState.inspectorName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Inspector Badge ID</label>
                    <input type="text" name="inspectorId" value={formState.inspectorId} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Clip Condition *</label>
                    <select name="condition" value={formState.condition} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none">
                      <option value="Healthy">Healthy / Normal</option>
                      <option value="Loose">Loose / Dislodged</option>
                      <option value="Worn">Worn / Surface Wear</option>
                      <option value="Cracked">Cracked</option>
                      <option value="Corroded">Corroded</option>
                      <option value="Broken">Broken / Severed</option>
                      <option value="Replacement Required">Replacement Required</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Severity Level *</label>
                    <select name="severity" value={formState.severity} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none">
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                      <option value="Critical">Critical Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Weather Conditions</label>
                    <select name="weather" value={formState.weather} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none">
                      <option value="Sunny">Clear / Sunny</option>
                      <option value="Rain">Rain / Monsoon</option>
                      <option value="Fog">Heavy Fog</option>
                      <option value="Night">Night Operation</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-black/40 border border-white/5">
                  <input type="checkbox" id="maint" name="maintenancePerformed" checked={formState.maintenancePerformed} onChange={handleInputChange} className="rounded accent-purple-600" />
                  <label htmlFor="maint" className="text-xs text-slate-300 cursor-pointer">Immediate Maintenance or Tightening Performed On-Site</label>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 mb-1 block">Inspector Field Remarks</label>
                  <textarea name="remarks" value={formState.remarks} onChange={handleInputChange} rows={3} placeholder="Enter observations..." className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none" />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 cursor-pointer">
                    Save Inspection to Cloud
                  </button>
                </div>
              </form>
            </div>

            {/* AI Prediction Preview (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-900 to-black border border-purple-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-3">
                  <FaBrain className="animate-pulse" />
                  <span>XGBOOST MODEL PREVIEW</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Predicted Health & Maintenance</h3>

                {/* Score Gauge Circle */}
                <div className="my-6 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 rounded-full border-4 border-cyan-400/20 flex items-center justify-center bg-black/40 shadow-inner">
                    <div className="text-center">
                      <span className="text-3xl font-extrabold text-white">92</span>
                      <span className="text-xs text-slate-400 block font-mono">/ 100</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 mt-2">OPTIMAL INTEGRITY</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-black/40">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="text-emerald-400 font-semibold">Low</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40">
                    <span className="text-slate-400">Failure Probability:</span>
                    <span className="text-cyan-400 font-mono">1.8%</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40">
                    <span className="text-slate-400">Expected Life:</span>
                    <span className="text-slate-200">14.2 Years</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-500 text-center font-mono">
                Model: Python XGBoost v2.4 | Sync Latency: 12ms
              </div>
            </div>

          </div>

          {/* 4. INSPECTION HISTORY TABLE SECTION */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Clip Inspection Audit Trail</h3>
                <p className="text-[11px] text-slate-400">Historical records for component {activeComponent.compId}</p>
              </div>
              <button onClick={() => alert('Exporting PDF Report...')} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium flex items-center space-x-2 cursor-pointer">
                <FaDownload className="text-[10px]" />
                <span>Export History PDF</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-4">Date & Time</th>
                    <th className="pb-3 px-4">Inspector</th>
                    <th className="pb-3 px-4">Condition</th>
                    <th className="pb-3 px-4">Severity</th>
                    <th className="pb-3 px-4">Health Score</th>
                    <th className="pb-3 px-4">Maintenance</th>
                    <th className="pb-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {historyList.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{row.date}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{row.inspector}</td>
                      <td className="py-3.5 px-4">{row.condition}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.severity === 'Low' ? 'bg-emerald-500/15 text-emerald-400' :
                          row.severity === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-cyan-400">{row.health}/100</td>
                      <td className="py-3.5 px-4">{row.maintenance}</td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{row.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. TIMELINE & RECHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Timeline Panel (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Lifecycle Events Timeline</h3>
              <p className="text-[11px] text-slate-400 mb-6">Component deployment milestones</p>

              <div className="relative pl-4 border-l border-white/10 space-y-6">
                {mockComponentTimeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
                    <div className="text-xs font-semibold text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recharts Health Trend (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Clip Health Progression</h3>
              <p className="text-[11px] text-slate-400 mb-6">Telemetry scores over time</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHealthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="health" stroke="#00D2FF" fill="#00D2FF" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 6. QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Start New QR Inspection', icon: FaQrcode, color: 'from-purple-600 to-blue-600', path: '/inspections' },
              { label: 'View Asset Inventory', icon: FaLayerGroup, color: 'from-cyan-600 to-teal-600', path: '/components' },
              { label: 'Run Full AI Analysis', icon: FaBrain, color: 'from-blue-600 to-indigo-600', path: '/ai-analysis' },
              { label: 'Export Telemetry Report', icon: FaFolder, color: 'from-slate-700 to-slate-800', path: '/reports' },
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

        {/* FOOTER */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>Inspection Engine: <span className="font-mono text-emerald-400">Firebase Live Sync</span> | Active Inspector: <span className="font-mono text-slate-300">IR-88204</span></div>
          <div>Powered by React, Firebase, Express & Python XGBoost</div>
        </footer>

      </div>
    </div>
  );
}