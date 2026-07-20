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
  FaArrowRight, FaLayerGroup, FaHistory, FaInfoCircle
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
const initialComponents = [
  { id: '1', qrId: 'QR-8842-109', compId: 'CLP-001', section: 'Sec 14, Track B', zone: 'Southern', division: 'Chennai', station: 'Katpadi Jn', lat: '12.9716', lng: '79.1312', installDate: '2026-01-15', manufacturer: 'Jindal Steel', material: 'Spring Steel 60Si7', trackType: 'Broad Gauge', status: 'Active', health: 96, priority: 'Low', expectedLife: 15, lastInspection: '2026-07-20' },
  { id: '2', qrId: 'QR-9104-204', compId: 'CLP-002', section: 'Sec 08, Track A', zone: 'Southern', division: 'Tiruchirappalli', station: 'Thanjavur Jn', lat: '10.7870', lng: '79.1378', installDate: '2025-11-20', manufacturer: 'Tata Steel', material: 'Alloy Steel', trackType: 'Broad Gauge', status: 'Maintenance', health: 64, priority: 'Medium', expectedLife: 12, lastInspection: '2026-07-18' },
  { id: '3', qrId: 'QR-3319-902', compId: 'CLP-003', section: 'Sec 03, Track C', zone: 'Central', division: 'Mumbai', station: 'Kalyan Jn', lat: '19.2403', lng: '73.1305', installDate: '2024-03-10', manufacturer: 'Sail Rail Corp', material: 'High Tensile Steel', trackType: 'High Speed', status: 'Replaced', health: 28, priority: 'High', expectedLife: 10, lastInspection: '2026-07-15' },
  { id: '4', qrId: 'QR-4412-511', compId: 'CLP-004', section: 'Sec 12, Track A', zone: 'Northern', division: 'Delhi', station: 'Ambala Cantt', lat: '30.3340', lng: '76.8376', installDate: '2026-02-01', manufacturer: 'Jindal Steel', material: 'Spring Steel 60Si7', trackType: 'Broad Gauge', status: 'Active', health: 91, priority: 'Low', expectedLife: 15, lastInspection: '2026-07-19' },
  { id: '5', qrId: 'QR-7721-008', compId: 'CLP-005', section: 'Sec 21, Track B', zone: 'Western', division: 'Vadodara', station: 'Anand Jn', lat: '22.5645', lng: '72.9289', installDate: '2025-08-12', manufacturer: 'Tata Steel', material: 'Alloy Steel', trackType: 'Freight Corridor', status: 'Inactive', health: 42, priority: 'High', expectedLife: 12, lastInspection: '2026-07-10' },
];

const mockStatusChart = [
  { name: 'Active / Healthy', value: 4210, color: '#10B981' },
  { name: 'Under Maintenance', value: 348, color: '#F59E0B' },
  { name: 'Replaced / Failed', value: 127, color: '#EF4444' },
  { name: 'Inactive / Pending', value: 89, color: '#6B7280' }
];

/* ==========================================================================
   MAIN COMPONENT: Components.jsx
   ========================================================================== */
export default function Components() {
  const navigate = useNavigate();

  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Components');
  const [componentsList, setComponentsList] = useState(initialComponents);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    compId: '',
    qrId: '',
    section: '',
    zone: 'Southern',
    division: 'Chennai',
    station: '',
    lat: '',
    lng: '',
    installDate: new Date().toISOString().split('T')[0],
    manufacturer: 'Jindal Steel',
    material: 'Spring Steel 60Si7',
    trackType: 'Broad Gauge',
    status: 'Active',
    expectedLife: '15',
    remarks: ''
  });

  // Modal, Drawer & Notification States
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, msg: 'Component CLP-001 registered successfully', time: '10m ago' },
    { id: 2, msg: 'QR-8842-109 laser code generated', time: '1h ago' }
  ]);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation Routing Handler
  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) {
      navigate(path);
    }
  };

  // Form Field Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generate QR Preview
  const handleGenerateQr = () => {
    const generatedId = `QR-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    setFormData(prev => ({ ...prev, qrId: generatedId }));
    setGeneratedQr({
      qrId: generatedId,
      compId: formData.compId || 'CLP-NEW',
      timestamp: new Date().toLocaleString()
    });
  };

  // Save Component
  const handleSaveComponent = (e) => {
    e.preventDefault();
    if (!formData.compId || !formData.qrId) {
      alert('Please fill in Component ID and Generate QR ID first.');
      return;
    }

    const newComp = {
      id: String(Date.now()),
      ...formData,
      health: 100,
      priority: 'Low',
      lastInspection: 'Pending Inspection'
    };

    setComponentsList([newComp, ...componentsList]);
    setNotifications([{ id: Date.now(), msg: `New Clip ${newComp.compId} Registered`, time: 'Just now' }, ...notifications]);
    
    // Reset Form
    setFormData({
      compId: '', qrId: '', section: '', zone: 'Southern', division: 'Chennai',
      station: '', lat: '', lng: '', installDate: new Date().toISOString().split('T')[0],
      manufacturer: 'Jindal Steel', material: 'Spring Steel 60Si7', trackType: 'Broad Gauge',
      status: 'Active', expectedLife: '15', remarks: ''
    });
    setGeneratedQr(null);
  };

  // Edit Component Save
  const handleEditSave = (e) => {
    e.preventDefault();
    if (!selectedComponent) return;

    setComponentsList(componentsList.map(comp => 
      comp.id === selectedComponent.id ? selectedComponent : comp
    ));
    setEditModalOpen(false);
    setSelectedComponent(null);
  };

  // Delete Component
  const handleDeleteConfirm = () => {
    if (!selectedComponent) return;
    setComponentsList(componentsList.filter(item => item.id !== selectedComponent.id));
    setNotifications([{ id: Date.now(), msg: `Deleted clip ${selectedComponent.compId}`, time: 'Just now' }, ...notifications]);
    setDeleteModalOpen(false);
    setSelectedComponent(null);
  };

  // Filter List Logic
  const filteredComponents = componentsList.filter(comp => {
    const matchesSearch = comp.compId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          comp.qrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comp.station.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || comp.status === statusFilter;
    const matchesZone = zoneFilter === 'All' || comp.zone === zoneFilter;
    return matchesSearch && matchesStatus && matchesZone;
  });

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
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">ASSET MANAGEMENT</span>
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
              Component Asset Management
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                LASER QR MODULE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">Register, Monitor, and Manage Railway Track Clip Identities</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search QR ID, Component ID..."
                className="pl-9 pr-4 py-2 w-64 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </button>

            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <FaUserCircle className="text-2xl text-purple-400" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-white leading-none">Track Administrator</span>
                <span className="text-[10px] text-slate-400">Railway Engineering</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* 1. TOP STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: 'Total Registered', count: componentsList.length, trend: 'Active Database', icon: FaQrcode, color: 'from-blue-600 to-cyan-400' },
              { title: 'Healthy Components', count: componentsList.filter(c => c.status === 'Active').length, trend: '98% Integrity', icon: FaCheckCircle, color: 'from-emerald-600 to-teal-400' },
              { title: 'Under Maintenance', count: componentsList.filter(c => c.status === 'Maintenance').length, trend: 'In Progress', icon: FaTools, color: 'from-amber-600 to-yellow-400' },
              { title: 'Components Replaced', count: componentsList.filter(c => c.status === 'Replaced').length, trend: 'Logged Failure', icon: FaExclamationTriangle, color: 'from-red-600 to-rose-400' },
              { title: 'Inactive Assets', count: componentsList.filter(c => c.status === 'Inactive').length, trend: 'Offline', icon: FaInfoCircle, color: 'from-gray-600 to-slate-400' },
              { title: 'Pending QR Sync', count: 0, trend: 'All Synced', icon: FaCloud, color: 'from-purple-600 to-indigo-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                      <Icon className="text-base" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                  <div className="text-[11px] text-slate-400 truncate">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* 2. REGISTRATION & QR GENERATION SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Component Registration Form (8 Cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaPlus className="text-cyan-400" />
                    Register New Railway Track Clip
                  </h2>
                  <p className="text-[11px] text-slate-400">Initialize clip metadata before etching laser QR identity code</p>
                </div>
              </div>

              <form onSubmit={handleSaveComponent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Component ID *</label>
                    <input 
                      type="text" 
                      name="compId"
                      value={formData.compId}
                      onChange={handleInputChange}
                      placeholder="e.g. CLP-009"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Laser QR ID *</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        name="qrId"
                        value={formData.qrId}
                        onChange={handleInputChange}
                        placeholder="Click Generate"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-cyan-400 font-mono placeholder:text-slate-600 text-xs focus:outline-none"
                        readOnly
                      />
                      <button 
                        type="button"
                        onClick={handleGenerateQr}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Track Section *</label>
                    <input 
                      type="text" 
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      placeholder="Sec 14, Track B"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Zone</label>
                    <select name="zone" value={formData.zone} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none">
                      <option value="Southern">Southern</option>
                      <option value="Northern">Northern</option>
                      <option value="Central">Central</option>
                      <option value="Western">Western</option>
                      <option value="Eastern">Eastern</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Division</label>
                    <input type="text" name="division" value={formData.division} onChange={handleInputChange} placeholder="Chennai" className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Station Name</label>
                    <input type="text" name="station" value={formData.station} onChange={handleInputChange} placeholder="Katpadi Jn" className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Manufacturer</label>
                    <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Material Type</label>
                    <input type="text" name="material" value={formData.material} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Installation Date</label>
                    <input type="date" name="installDate" value={formData.installDate} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 cursor-pointer">
                    Save Asset to Firebase
                  </button>
                </div>
              </form>
            </div>

            {/* QR Code Preview Card (4 Cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">QR Code Generator Preview</h3>
                <p className="text-[11px] text-slate-400 mb-6">Laser engraver matrix digital tag output</p>

                {generatedQr ? (
                  <div className="p-6 rounded-2xl bg-white/5 border border-cyan-500/30 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-xl bg-white p-3 flex items-center justify-center shadow-xl mb-4">
                      <FaQrcode className="text-7xl text-black" />
                    </div>
                    <div className="font-mono text-cyan-400 font-bold text-sm">{generatedQr.qrId}</div>
                    <div className="text-xs text-slate-300 mt-1">Component: {generatedQr.compId}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Generated: {generatedQr.timestamp}</div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-black/30 border border-dashed border-white/10 flex flex-col items-center text-center">
                    <FaQrcode className="text-5xl text-slate-600 mb-3 animate-pulse" />
                    <p className="text-xs text-slate-400">Click "Generate" in registration form to preview laser QR code</p>
                  </div>
                )}
              </div>

              {generatedQr && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button onClick={() => alert('Downloading QR PNG vector file...')} className="py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 cursor-pointer">
                    Download Vector
                  </button>
                  <button onClick={() => window.print()} className="py-2 rounded-xl bg-cyan-600 text-white text-xs hover:bg-cyan-500 font-semibold cursor-pointer">
                    Print Laser Tag
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 3. DATA TABLE & FILTERS SECTION */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Registered Railway Track Clips</h3>
                <p className="text-[11px] text-slate-400">Complete digitized inventory logs synced with cloud database</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Replaced">Replaced</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select 
                  value={zoneFilter} 
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Zones</option>
                  <option value="Southern">Southern</option>
                  <option value="Northern">Northern</option>
                  <option value="Central">Central</option>
                  <option value="Western">Western</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-4">QR ID</th>
                    <th className="pb-3 px-4">Component</th>
                    <th className="pb-3 px-4">Section & Station</th>
                    <th className="pb-3 px-4">Zone</th>
                    <th className="pb-3 px-4">Installation Date</th>
                    <th className="pb-3 px-4">Health Score</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredComponents.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">{item.qrId}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{item.compId}</td>
                      <td className="py-3.5 px-4">{item.section} ({item.station})</td>
                      <td className="py-3.5 px-4 text-slate-400">{item.zone}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{item.installDate}</td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={item.health > 80 ? 'text-emerald-400' : item.health > 50 ? 'text-amber-400' : 'text-red-400'}>
                          {item.health}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' :
                          item.status === 'Maintenance' ? 'bg-amber-500/15 text-amber-400' :
                          item.status === 'Replaced' ? 'bg-red-500/15 text-red-400' : 'bg-gray-500/15 text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button onClick={() => { setSelectedComponent(item); setDrawerOpen(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 cursor-pointer">
                          <FaEye />
                        </button>
                        <button onClick={() => { setSelectedComponent(item); setEditModalOpen(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 cursor-pointer">
                          <FaEdit />
                        </button>
                        <button onClick={() => { setSelectedComponent(item); setDeleteModalOpen(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-red-400 cursor-pointer">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. ANALYTICS & AI PREVIEW PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Status Pie Chart (6 Cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Component Distribution by Status</h3>
              <p className="text-[11px] text-slate-400 mb-4">Inventory health ratio across network</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mockStatusChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={5}>
                      {mockStatusChart.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Integration Preview Card (6 Cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-900 to-black border border-purple-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-3">
                  <FaBrain className="animate-pulse" />
                  <span>XGBOOST AI PREDICTIVE MODULE</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Risk Analysis Engine</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light mb-6">
                  Once registered clips undergo their first mobile inspection scan, the XGBoost engine calculates maintenance priority (Low, Medium, High) evaluating wear history, environmental exposure, and stress load.
                </p>

                <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-400 flex items-center justify-between">
                  <span>Model Readiness Status:</span>
                  <span className="text-emerald-400 font-mono">Awaiting Inspection Stream</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
                <span>AI Accuracy: 98.2%</span>
                <span>Framework: Scikit-Learn & XGBoost</span>
              </div>
            </div>

          </div>

        </main>

        {/* 5. VIEW COMPONENT DRAWER */}
        <AnimatePresence>
          {drawerOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="w-full max-w-md bg-slate-900 border-l border-white/10 p-6 overflow-y-auto h-full space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white">Component Asset Details</h3>
                  <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><FaTimes /></button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4">
                    <FaQrcode className="text-4xl text-cyan-400" />
                    <div>
                      <div className="font-mono text-white font-bold">{selectedComponent.qrId}</div>
                      <div className="text-slate-400">ID: {selectedComponent.compId}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Zone & Division</span>
                      <span>{selectedComponent.zone} - {selectedComponent.division}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Station</span>
                      <span>{selectedComponent.station}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Manufacturer</span>
                      <span>{selectedComponent.manufacturer}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Installation Date</span>
                      <span>{selectedComponent.installDate}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setDrawerOpen(false)} className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer">
                  Close Drawer
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 6. EDIT COMPONENT MODAL */}
        <AnimatePresence>
          {editModalOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md bg-slate-900 border border-white/15 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white">Edit Component ({selectedComponent.compId})</h3>
                  <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><FaTimes /></button>
                </div>

                <form onSubmit={handleEditSave} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Status</label>
                    <select 
                      value={selectedComponent.status} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Replaced">Replaced</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Track Section</label>
                    <input 
                      type="text" 
                      value={selectedComponent.section} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Station Name</label>
                    <input 
                      type="text" 
                      value={selectedComponent.station} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, station: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 7. DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {deleteModalOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-slate-900 border border-red-500/30 p-6 rounded-2xl space-y-4 text-center">
                <FaExclamationTriangle className="text-4xl text-red-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Delete Railway Clip?</h3>
                <p className="text-xs text-slate-400">Are you sure you want to permanently delete clip <strong className="text-white">{selectedComponent.compId}</strong> ({selectedComponent.qrId})?</p>
                <div className="flex space-x-3 pt-2">
                  <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs cursor-pointer">Cancel</button>
                  <button onClick={handleDeleteConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer">Delete Permanent</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>Database Status: <span className="font-mono text-emerald-400">Firebase Firestore Connected</span> | Total Components: <span className="font-mono text-slate-300">{componentsList.length}</span></div>
          <div>Powered by React, Firebase & Laser QR Technology</div>
        </footer>

      </div>
    </div>
  );
}