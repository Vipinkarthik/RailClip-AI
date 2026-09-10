import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLoggedInDistrictOfficer } from '../services/authHelper';
import { createWorkerAccount } from '../api/workers';
import {
  FaQrcode,
  FaBrain,
  FaShieldAlt,
  FaChartLine,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaUserPlus,
  FaFolder,
  FaSignOutAlt,
  FaMobileAlt,
  FaIdCard,
  FaEnvelope,
  FaKey,
  FaHardHat,
  FaUserShield,
  FaSpinner,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaCloud,
  FaLock,
  FaArrowLeft
} from 'react-icons/fa';

/* ==========================================================================
   LiquidEther (WebGL Fluid simulation canvas)
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
        canvas.width * 0.3 + Math.sin(time) * 100,
        canvas.height * 0.3 + Math.cos(time * 0.7) * 80,
        10,
        canvas.width * 0.3,
        canvas.height * 0.3,
        canvas.width * 0.6
      );
      grad1.addColorStop(0, 'rgba(82, 39, 255, 0.15)');
      grad1.addColorStop(1, 'rgba(3, 7, 18, 0)');

      const grad2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.8) * 90,
        canvas.height * 0.6 + Math.sin(time * 0.6) * 100,
        10,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      );
      grad2.addColorStop(0, 'rgba(0, 210, 255, 0.1)');
      grad2.addColorStop(1, 'rgba(3, 7, 18, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [autoSpeed]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}

export default function WorkerAccount() {
  const navigate = useNavigate();
  const districtOfficer = getLoggedInDistrictOfficer();

  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Worker Accounts');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form State
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dSection, setDSection] = useState('');
  const [accessRole, setAccessRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdWorkers, setCreatedWorkers] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const mobilePattern = /^[0-9]{10}$/;
    const aadhaarPattern = /^[0-9]{12}$/;

    if (!mobilePattern.test(mobileNumber)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    if (!aadhaarPattern.test(aadhaarNumber)) {
      setError('Enter a valid 12-digit Aadhaar number.');
      return;
    }

    if (!email || !password) {
      setError('Mobile number, Aadhaar number, email, and password are required.');
      return;
    }

    if (!dSection) {
      setError('Please select an assigned D-Section.');
      return;
    }

    if (!accessRole) {
      setError('Please select an access role.');
      return;
    }

    setLoading(true);

    try {
      const response = await createWorkerAccount({
        mobileNumber,
        aadhaarNumber,
        email,
        password,
        dSection,
        accessRole,
      });

      const generatedId = response?.data?.employeeId || `EMP-${Date.now().toString().slice(-4)}`;
      const createdEmail = response?.data?.email || email.toLowerCase();
      
      setSuccess(`Worker account created successfully! Employee ID: ${generatedId} | Email: ${createdEmail}`);
      
      setCreatedWorkers(prev => [
        {
          employeeId: generatedId,
          email: createdEmail,
          mobile: mobileNumber,
          dSection,
          role: accessRole,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);

      // Reset form
      setMobileNumber('');
      setAadhaarNumber('');
      setEmail('');
      setPassword('');
      setDSection('');
      setAccessRole('');
    } catch (submissionError) {
      setError(submissionError?.response?.data?.message || submissionError?.message || 'Unable to create worker account.');
    } finally {
      setLoading(false);
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
        className="relative z-30 flex flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-2xl min-h-screen shrink-0"
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

          {/* Nav Items */}
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
              <span>Security Engine</span>
              <span className="text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full w-[100%]" />
            </div>
            <div className="mt-2 text-[10px] text-slate-500">Encrypted AES-256 Auth</div>
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
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Worker Account Provisioning
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                ONBOARDING REGISTRY
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">
              Register and provision track worker credentials for mobile field operations
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            {/* Live Clock Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
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

        {/* ================= WORKSPACE BODY ================= */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Info & Guidelines (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Highlight Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-cyan-900/20 border border-white/10 backdrop-blur-xl space-y-4"
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                  <FaShieldAlt className="text-emerald-400 animate-pulse" />
                  <span>Restricted Worker Onboarding</span>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">
                  Track Staff Credential Center
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Provision unique login credentials for trackmen, keymen, gangmates, and field inspectors. Accounts will automatically be assigned an official Indian Railways Employee ID upon creation.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { icon: <FaMobileAlt className="text-cyan-400" />, label: 'Mobile Linked' },
                    { icon: <FaIdCard className="text-emerald-400" />, label: 'Aadhaar Verified' },
                    { icon: <FaCloud className="text-blue-400" />, label: 'Cloud Synced' },
                    { icon: <FaLock className="text-purple-400" />, label: 'AES Password' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center space-x-2 text-xs font-medium text-slate-300">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recently Provisioned in this session */}
              {createdWorkers.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-emerald-500/30 backdrop-blur-xl space-y-3"
                >
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <FaCheckCircle /> Recently Created Accounts
                  </h3>
                  <div className="space-y-2">
                    {createdWorkers.map((w, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{w.employeeId} - {w.role}</div>
                          <div className="text-[11px] text-slate-400">{w.email} | Sec: {w.dSection}</div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{w.createdAt}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>

            {/* Right Form Card (7 cols) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7"
            >
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-purple-950/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FaUserPlus className="text-cyan-400" />
                      Create New Worker Account
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fill out the form below. Worker credentials can immediately be used on the mobile inspection scanner.
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2"
                    >
                      <FaExclamationCircle className="text-red-400 shrink-0 text-sm" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2"
                    >
                      <FaCheckCircle className="text-emerald-400 shrink-0 text-sm" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Mobile Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Mobile Number *</label>
                      <div className="relative flex items-center">
                        <FaMobileAlt className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength="10"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Aadhaar Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Aadhaar Number *</label>
                      <div className="relative flex items-center">
                        <FaIdCard className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength="12"
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="12-digit Aadhaar number"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Official / Worker Email *</label>
                      <div className="relative flex items-center">
                        <FaEnvelope className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="worker@railways.gov.in"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Password *</label>
                      <div className="relative flex items-center">
                        <FaKey className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a secure password"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-slate-400 hover:text-white transition-colors text-xs"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Assigned D-Section */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Assigned D-Section *</label>
                      <div className="relative flex items-center">
                        <FaHardHat className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <select
                          value={dSection}
                          onChange={(e) => setDSection(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled className="bg-slate-900 text-slate-400">Select D-Section</option>
                          <option value="D-1" className="bg-slate-900">D-1</option>
                          <option value="D-2" className="bg-slate-900">D-2</option>
                          <option value="D-3" className="bg-slate-900">D-3</option>
                          <option value="D-4" className="bg-slate-900">D-4</option>
                          <option value="D-5" className="bg-slate-900">D-5</option>
                          <option value="D-6" className="bg-slate-900">D-6</option>
                        </select>
                      </div>
                    </div>

                    {/* Access Role */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Access Role *</label>
                      <div className="relative flex items-center">
                        <FaUserShield className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <select
                          value={accessRole}
                          onChange={(e) => setAccessRole(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled className="bg-slate-900 text-slate-400">Select Access Role</option>
                          <option value="Trackman" className="bg-slate-900">Trackman</option>
                          <option value="Keyman" className="bg-slate-900">Keyman</option>
                          <option value="Gangmate" className="bg-slate-900">Gangmate</option>
                          <option value="PWI (Permanent Way Inspector)" className="bg-slate-900">PWI (Permanent Way Inspector)</option>
                          <option value="SSE (Senior Section Engineer)" className="bg-slate-900">SSE (Senior Section Engineer)</option>
                          <option value="JE (Junior Engineer)" className="bg-slate-900">JE (Junior Engineer)</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin text-sm" />
                          <span>Provisioning Worker Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Worker Account</span>
                          <FaArrowRight className="text-xs" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono">ADMIN PRIVILEGED SESSION</span>
                  </div>
                  <span className="font-mono text-slate-500">Auto-Generates Employee ID</span>
                </div>

              </div>
            </motion.div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>Worker Auth Registry: <span className="font-mono text-emerald-400">Active</span> | Scoped to <span className="font-mono text-cyan-300">{districtOfficer.district}</span></div>
          <div>Protected by Indian Railways Track Telemetry Platform</div>
        </footer>

      </div>
    </div>
  );
}