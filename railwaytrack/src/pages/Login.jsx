import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaLock, 
  FaEnvelope, FaKey, FaEye, FaEyeSlash, FaGoogle, 
  FaCheckCircle, FaExclamationCircle, FaSpinner, 
  FaMicrochip, FaArrowRight, FaArrowLeft 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Aurora from '../components/Aurora';

/* ==========================================================================
   MERGED CANVAS COMPONENT: ShapeGrid
   Renders an interactive canvas grid overlay for modern tech visuals.
   ========================================================================== */
function ShapeGrid({
  speed = 0.5,
  squareSize = 40,
  direction = 'diagonal',
  borderColor = '#2F293A',
  hoverFillColor = '#222222',
  shape = 'square',
  hoverTrailAmount = 0
}) {
  const canvasRef = useRef(null);
  const hoverPos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      hoverPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      hoverPos.current = { x: -1000, y: -1000 };
    };

    canvas.parentElement.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      offset += speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / squareSize) + 2;
      const rows = Math.ceil(canvas.height / squareSize) + 2;

      let offsetX = 0;
      let offsetY = 0;

      if (direction === 'diagonal') {
        offsetX = offset % squareSize;
        offsetY = offset % squareSize;
      } else if (direction === 'right') {
        offsetX = offset % squareSize;
      } else if (direction === 'down') {
        offsetY = offset % squareSize;
      } else if (direction === 'left') {
        offsetX = -(offset % squareSize);
      } else if (direction === 'up') {
        offsetY = -(offset % squareSize);
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          const x = i * squareSize + offsetX;
          const y = j * squareSize + offsetY;

          // Check hover proximity
          const dist = Math.hypot(x + squareSize / 2 - hoverPos.current.x, y + squareSize / 2 - hoverPos.current.y);
          
          if (dist < squareSize * (1 + hoverTrailAmount)) {
            ctx.fillStyle = hoverFillColor;
            if (shape === 'square') {
              ctx.fillRect(x, y, squareSize, squareSize);
            } else if (shape === 'circle') {
              ctx.beginPath();
              ctx.arc(x + squareSize / 2, y + squareSize / 2, squareSize / 2 - 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Draw shape borders
          if (shape === 'square') {
            ctx.strokeRect(x, y, squareSize, squareSize);
          } else if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(x + squareSize / 2, y + squareSize / 2, squareSize / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener('mousemove', handleMouseMove);
        canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [speed, squareSize, direction, borderColor, hoverFillColor, shape, hoverTrailAmount]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto z-0" />;
}

/* ==========================================================================
   MAIN PAGE COMPONENT: Login.jsx
   ========================================================================== */
export default function Login() {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Interaction / Network State
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Updated Login Handler redirecting to Dashboard
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in both Email and Password fields.');
      return;
    }

    setLoading(true);

    try {
      // Simulate authentication request delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSuccess('Authentication successful! Redirecting to command dashboard...');
      
      // Redirect to the Dashboard route
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError('Failed to authenticate. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setGoogleLoading(true);

    try {
      // Simulate Google OAuth authentication
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setSuccess('Google SSO verified! Redirecting to command dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError('Google Single Sign-On failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-white font-['Poppins',sans-serif] selection:bg-purple-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. LAYER 1: WebGL Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <Aurora
          colorStops={["#5227FF", "#7cff67", "#00d2ff"]}
          blend={0.6}
          amplitude={1.2}
          speed={0.8}
        />
      </div>

      {/* 2. LAYER 2: Interactive ShapeGrid Overlay */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <ShapeGrid 
          speed={0.4}
          squareSize={45}
          direction="diagonal"
          borderColor="#3b82f6"
          hoverFillColor="#8b5cf6"
          shape="square"
          hoverTrailAmount={1}
        />
      </div>

      {/* 3. LAYER 3: Ambient Glow Orbs */}
      <div className="fixed top-1/4 left-10 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full filter blur-[150px] pointer-events-none z-0" />

      {/* Page Content Structure */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">

        {/* ================= HEADER NAVBAR ================= */}
        <header className="w-full px-6 py-4 fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Back to landing page"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              {/* Logo Brand */}
              <div 
                onClick={() => navigate('/')} 
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 via-blue-600 to-cyan-400 text-white shadow-lg shadow-purple-500/20">
                  <FaQrcode className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent leading-none">
                    RailClip<span className="text-cyan-400">AI</span>
                  </span>
                  <span className="text-[10px] text-slate-400 tracking-wider font-mono">TRACK MAINTENANCE ENGINE</span>
                </div>
              </div>
            </div>

            {/* Time Indicator & Live Security Metric */}
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SYS REALTIME: {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ================= MAIN SPLIT CONTENT ================= */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-16 flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            
            {/* LEFT SECTION (55% / 7 cols): Product Value Proposition */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-medium backdrop-blur-md shadow-inner shadow-purple-500/10">
                <FaBrain className="text-cyan-400 animate-pulse" />
                <span>Next-Gen Railway Predictive Intelligence</span>
              </div>

              {/* Title & Subheading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Welcome to the Future of Railway Maintenance
                </h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                  Manage railway infrastructure intelligently through AI-powered inspection, laser QR identification, cloud asset tracking, and predictive maintenance.
                </p>
              </div>

              {/* Four Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <FaBrain className="text-purple-400" />, label: 'AI Powered' },
                  { icon: <FaQrcode className="text-cyan-400" />, label: 'QR Enabled' },
                  { icon: <FaCloud className="text-blue-400" />, label: 'Cloud Connected' },
                  { icon: <FaShieldAlt className="text-emerald-400" />, label: 'Predictive Care' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-2 text-xs font-medium text-slate-200">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Neural Micro-Graphic / Visual Element */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-black/40 to-cyan-900/20 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                    <FaMicrochip className="text-cyan-400" />
                    <span>XGBOOST MAINTENANCE RISK ENGINE</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">ONLINE</span>
                </div>
                
                {/* Stats Counter */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { value: '5,000+', label: 'Railway Assets' },
                    { value: '25,000+', label: 'QR Scans' },
                    { value: '98%', label: 'Prediction Acc.' },
                    { value: '365 Days', label: 'Tracking' },
                  ].map((stat, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RIGHT SECTION (45% / 5 cols): Glassmorphism Login Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 w-full max-w-md mx-auto"
            >
              <div className="relative p-8 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-purple-950/40 overflow-hidden group">
                
                {/* Glowing Top Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />

                {/* Card Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-white/10 mb-3 shadow-lg">
                    <FaQrcode className="text-2xl text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to continue managing railway infrastructure securely.
                  </p>
                </div>

                {/* Status Messages (Error Shake & Success Alerts) */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: [0, -5, 5, -5, 0] }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2"
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
                      className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2"
                    >
                      <FaCheckCircle className="text-emerald-400 shrink-0 text-sm" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                    <div className="relative flex items-center">
                      <FaEnvelope className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="inspector@railways.gov.in"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
                    <div className="relative flex items-center">
                      <FaKey className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-slate-400 hover:text-white transition-colors text-xs"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Options: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-black/50 border-white/20 text-purple-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Remember Me</span>
                    </label>
                    <a href="#forgot" className="text-purple-400 hover:text-purple-300 transition-colors">Forgot Password?</a>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to System</span>
                        <FaArrowRight className="text-xs" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <span className="relative px-3 bg-slate-900/90 text-[10px] text-slate-500 font-mono tracking-widest uppercase">OR</span>
                </div>

                {/* Continue with Google SSO */}
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {googleLoading ? <FaSpinner className="animate-spin text-sm" /> : <FaGoogle className="text-red-400" />}
                  <span>Continue with Google</span>
                </button>

                {/* Secure Indicator & Version Tag */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono">256-BIT ENCRYPTED</span>
                  </div>
                  <span className="font-mono text-slate-600">v1.0.4-PROD</span>
                </div>

              </div>

              {/* Technology Stack Chips Box */}
              <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Engine Tech:</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs">AI</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs">Firebase</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs">XGBoost</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs">QR</span>
                </div>
              </div>
            </motion.div>

          </div>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="w-full py-6 px-6 border-t border-white/10 bg-black/40 backdrop-blur-md text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div>
              <span className="text-slate-400 font-medium">AI-Enabled Railway Track Clip Management System</span> — Smart Railway Infrastructure
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}