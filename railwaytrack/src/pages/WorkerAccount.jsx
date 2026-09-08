import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createWorkerAccount } from '../api/workers';
import {
  FaArrowLeft,
  FaArrowRight,
  FaBrain,
  FaCheckCircle,
  FaCloud,
  FaEnvelope,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaHardHat,
  FaIdCard,
  FaKey,
  FaMobileAlt,
  FaQrcode,
  FaShieldAlt,
  FaSpinner,
  FaUserPlus,
  FaUserShield
} from 'react-icons/fa';
import Aurora from '../components/Aurora';

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
          const dist = Math.hypot(x + squareSize / 2 - hoverPos.current.x, y + squareSize / 2 - hoverPos.current.y);

          if (dist < squareSize * (1 + hoverTrailAmount)) {
            ctx.fillStyle = hoverFillColor;
            if (shape === 'square') {
              ctx.fillRect(x, y, squareSize, squareSize);
            } else {
              ctx.beginPath();
              ctx.arc(x + squareSize / 2, y + squareSize / 2, squareSize / 2 - 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          if (shape === 'square') {
            ctx.strokeRect(x, y, squareSize, squareSize);
          } else {
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

export default function WorkerAccount() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

      const generatedId = response?.data?.employeeId || '';
      const createdEmail = response?.data?.email || email.toLowerCase();
      setSuccess(`Worker account created! Employee ID: ${generatedId} | Email: ${createdEmail}. Redirecting to login...`);
      setTimeout(() => navigate('/login'), 2000);
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
    <div className="relative min-h-screen bg-[#050816] text-white font-['Poppins',sans-serif] selection:bg-cyan-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <Aurora colorStops={['#5227FF', '#7cff67', '#00d2ff']} blend={0.6} amplitude={1.2} speed={0.8} />
      </div>

      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <ShapeGrid
          speed={0.4}
          squareSize={45}
          direction="diagonal"
          borderColor="#3b82f6"
          hoverFillColor="#06b6d4"
          shape="square"
          hoverTrailAmount={1}
        />
      </div>

      <div className="fixed top-1/4 left-10 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full filter blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        <header className="w-full px-6 py-4 fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Back to login"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/login')}>
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-500 text-white shadow-lg shadow-cyan-500/20">
                  <FaUserPlus className="text-xl" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent leading-none">
                    RailClip<span className="text-cyan-400">AI</span>
                  </span>
                  <span className="text-[10px] text-slate-400 tracking-wider font-mono">WORKER ACCESS REGISTRY</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SYS REALTIME: {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-16 flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-medium backdrop-blur-md shadow-inner shadow-cyan-500/10">
                <FaShieldAlt className="text-emerald-400 animate-pulse" />
                <span>Restricted Worker Onboarding</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Create Secure Access for Track Workers
                </h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                  Register a worker account with mobile verification, Aadhaar identity, email access, and password protection for field operations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <FaMobileAlt className="text-cyan-400" />, label: 'Mobile Verified' },
                  { icon: <FaIdCard className="text-emerald-400" />, label: 'Aadhaar Linked' },
                  { icon: <FaCloud className="text-blue-400" />, label: 'Cloud Ready' },
                  { icon: <FaBrain className="text-purple-400" />, label: 'AI Access' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center space-x-2 text-xs font-medium text-slate-200">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="relative p-6 rounded-2xl bg-gradient-to-r from-cyan-900/20 via-black/40 to-purple-900/20 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                    <FaQrcode className="text-cyan-400" />
                    <span>WORKER AUTHENTICATION MODULE</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">ONLINE</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { value: '10 Digit', label: 'Mobile Check' },
                    { value: '12 Digit', label: 'Aadhaar Check' },
                    { value: 'Secure', label: 'Password Gate' },
                    { value: 'Admin', label: 'Controlled Access' },
                  ].map((stat, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">{stat.value}</div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 w-full max-w-md mx-auto"
            >
              <div className="relative p-8 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-400" />

                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-white/10 mb-3 shadow-lg">
                    <FaUserPlus className="text-2xl text-cyan-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Create Worker Account</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Add worker details. Employee ID will be auto-generated.
                  </p>
                </div>

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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Mobile Number</label>
                    <div className="relative flex items-center">
                      <FaMobileAlt className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength="10"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Aadhaar Number</label>
                    <div className="relative flex items-center">
                      <FaIdCard className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength="12"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="12-digit Aadhaar number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                    <div className="relative flex items-center">
                      <FaEnvelope className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="worker@railways.gov.in"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
                    <div className="relative flex items-center">
                      <FaKey className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Assigned D-Section</label>
                    <div className="relative flex items-center">
                      <FaHardHat className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <select
                        value={dSection}
                        onChange={(e) => setDSection(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
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

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Access Role</label>
                    <div className="relative flex items-center">
                      <FaUserShield className="absolute left-4 text-slate-400 text-xs pointer-events-none" />
                      <select
                        value={accessRole}
                        onChange={(e) => setAccessRole(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Worker Account</span>
                        <FaArrowRight className="text-xs" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono">ACCESS LOGGED</span>
                  </div>
                  <span className="font-mono text-slate-600">v1.0.4-PROD</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Security:</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs">Verified</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs">Protected</span>
                    <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs">Scoped by Admin</span>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <footer className="w-full py-6 px-6 border-t border-white/10 bg-black/40 backdrop-blur-md text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div>
              <span className="text-slate-400 font-medium">Worker account onboarding</span> - Admin controlled railway access
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}