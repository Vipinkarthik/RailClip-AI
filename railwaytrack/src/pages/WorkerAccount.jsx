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
  FaArrowLeft,
  FaTrain
} from 'react-icons/fa';

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
    <div className="relative h-screen bg-slate-50 text-slate-900 font-['Poppins',sans-serif] flex overflow-hidden selection:bg-blue-600 selection:text-white">

      {/* SIDEBAR NAVIGATION */}
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
                    RailClip
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
              <span className="font-medium">Security Engine</span>
              <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[100%]" />
            </div>
            <div className="mt-2 text-[10px] text-blue-300 font-mono">Encrypted AES-256 Auth</div>
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

      {/* MAIN CONTENT WORKSPACE */}
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
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Worker Account Provisioning</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                ONBOARDING REGISTRY
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Register and provision track worker credentials for mobile field operations
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
              <FaBell className="text-sm text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </button>

            {/* Live Clock Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Profile Menu */}
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

        {/* ================= WORKSPACE BODY ================= */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Info & Guidelines (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Highlight Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                  <FaShieldAlt className="text-blue-700" />
                  <span>Restricted Worker Onboarding</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Track Staff Credential Center
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Provision unique login credentials for trackmen, keymen, gangmates, and field inspectors. Accounts will automatically be assigned an official Indian Railways Employee ID upon creation.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { icon: <FaMobileAlt className="text-blue-700" />, label: 'Mobile Linked' },
                    { icon: <FaIdCard className="text-emerald-700" />, label: 'Aadhaar Verified' },
                    { icon: <FaCloud className="text-blue-600" />, label: 'Cloud Synced' },
                    { icon: <FaLock className="text-amber-700" />, label: 'AES Password' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs font-medium text-slate-700">
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
                  className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-3"
                >
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono flex items-center gap-2">
                    <FaCheckCircle /> Recently Created Accounts
                  </h3>
                  <div className="space-y-2">
                    {createdWorkers.map((w, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{w.employeeId} - {w.role}</div>
                          <div className="text-[11px] text-slate-600">{w.email} | Sec: {w.dSection}</div>
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
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600" />

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FaUserPlus className="text-blue-700" />
                      Create New Worker Account
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">
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
                      className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2"
                    >
                      <FaExclamationCircle className="text-red-600 shrink-0 text-sm" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2"
                    >
                      <FaCheckCircle className="text-emerald-600 shrink-0 text-sm" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Mobile Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Mobile Number *</label>
                      <div className="relative flex items-center">
                        <FaMobileAlt className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength="10"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Aadhaar Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Aadhaar Number *</label>
                      <div className="relative flex items-center">
                        <FaIdCard className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength="12"
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="12-digit Aadhaar number"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Official / Worker Email *</label>
                      <div className="relative flex items-center">
                        <FaEnvelope className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="worker@railways.gov.in"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Password *</label>
                      <div className="relative flex items-center">
                        <FaKey className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a secure password"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-slate-400 hover:text-slate-700 transition-colors text-xs cursor-pointer"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Assigned D-Section */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Assigned D-Section *</label>
                      <div className="relative flex items-center">
                        <FaHardHat className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <select
                          value={dSection}
                          onChange={(e) => setDSection(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer font-medium"
                          required
                        >
                          <option value="" disabled>Select D-Section</option>
                          <option value="D-1">D-1</option>
                          <option value="D-2">D-2</option>
                          <option value="D-3">D-3</option>
                          <option value="D-4">D-4</option>
                          <option value="D-5">D-5</option>
                          <option value="D-6">D-6</option>
                        </select>
                      </div>
                    </div>

                    {/* Access Role */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Access Role *</label>
                      <div className="relative flex items-center">
                        <FaUserShield className="absolute left-3.5 text-slate-400 text-xs pointer-events-none" />
                        <select
                          value={accessRole}
                          onChange={(e) => setAccessRole(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer font-medium"
                          required
                        >
                          <option value="" disabled>Select Access Role</option>
                          <option value="Trackman">Trackman</option>
                          <option value="Keyman">Keyman</option>
                          <option value="Gangmate">Gangmate</option>
                          <option value="PWI (Permanent Way Inspector)">PWI (Permanent Way Inspector)</option>
                          <option value="SSE (Senior Section Engineer)">SSE (Senior Section Engineer)</option>
                          <option value="JE (Junior Engineer)">JE (Junior Engineer)</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-white text-xs font-semibold shadow-md shadow-orange-600/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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

                <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="font-mono">ADMIN PRIVILEGED SESSION</span>
                  </div>
                  <span className="font-mono text-slate-500 font-medium">Auto-Generates Employee ID</span>
                </div>

              </div>
            </motion.div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="mt-auto py-4 px-6 sm:px-8 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>Worker Auth Registry: <span className="font-mono text-emerald-700 font-semibold">Active</span> | Scoped to <span className="font-mono text-blue-700 font-semibold">{districtOfficer.district}</span></div>
          <div>Protected by Indian Railways Track Telemetry Platform • RDSO Compliant</div>
        </footer>

      </div>
    </div>
  );
}