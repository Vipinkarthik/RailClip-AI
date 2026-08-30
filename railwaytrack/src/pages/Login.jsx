import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  FaKey,
  FaMicrochip,
  FaQrcode,
  FaShieldAlt,
  FaSpinner
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';
import Aurora from '../components/Aurora';
import { auth } from '../services/firebase';
import { loginUser, setAuthToken } from '../services/api';

function getAuthErrorMessage(error) {
  const code = error?.code || '';

  if (code === 'auth/invalid-credential') {
    return 'Invalid email or password. Also confirm Email/Password is enabled in Firebase Authentication.';
  }
  if (code === 'auth/user-not-found') {
    return 'No account found for this email in the configured Firebase project.';
  }
  if (code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Try again later or reset password.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error while contacting Firebase. Check your internet connection.';
  }

  return error?.response?.data?.message || error?.message || 'Failed to sign in.';
}

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

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      hoverPos.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      hoverPos.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('resize', resize);
    resize();

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

      for (let i = -1; i < cols; i += 1) {
        for (let j = -1; j < rows; j += 1) {
          const x = i * squareSize + offsetX;
          const y = j * squareSize + offsetY;

          const dist = Math.hypot(
            x + squareSize / 2 - hoverPos.current.x,
            y + squareSize / 2 - hoverPos.current.y
          );

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

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-auto" />;
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in both Email and Password fields.');
      return;
    }

    setLoading(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      const response = await loginUser({ idToken, rememberMe });
      const storage = rememberMe ? window.localStorage : window.sessionStorage;

      storage.setItem('railclip-auth', JSON.stringify(response));
      if (response.token) {
        setAuthToken(response.token);
      }

      setSuccess('Authentication successful! Redirecting to command dashboard...');
      window.setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#050816] font-['Poppins',sans-serif] text-white selection:bg-purple-500 selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <Aurora colorStops={['#5227FF', '#7cff67', '#00d2ff']} blend={0.6} amplitude={1.2} speed={0.8} />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 opacity-20">
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

      <div className="pointer-events-none fixed left-10 top-1/4 z-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-10 right-10 z-0 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[150px]" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Back to landing page"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              <div onClick={() => navigate('/')} className="flex cursor-pointer items-center space-x-3">
                <div className="rounded-xl bg-gradient-to-tr from-purple-600 via-blue-600 to-cyan-400 p-2.5 text-white shadow-lg shadow-purple-500/20">
                  <FaQrcode className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-none bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-base font-bold tracking-wide text-transparent">
                    RailClip<span className="text-cyan-400">AI</span>
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-slate-400">TRACK MAINTENANCE ENGINE</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 font-mono text-xs text-slate-400">
              <div className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                <span>SYS REALTIME: {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 pb-16 pt-32">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 lg:col-span-7"
            >
              <div className="inline-flex items-center space-x-2 rounded-full border border-purple-500/30 bg-purple-950/50 px-3.5 py-1.5 text-xs font-medium text-purple-300 shadow-inner shadow-purple-500/10 backdrop-blur-md">
                <FaBrain className="animate-pulse text-cyan-400" />
                <span>Next-Gen Railway Predictive Intelligence</span>
              </div>

              <div className="space-y-4">
                <h1 className="bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                  Welcome to the Future of Railway Maintenance
                </h1>
                <p className="max-w-xl text-sm font-light leading-relaxed text-slate-400 sm:text-base">
                  Manage railway infrastructure intelligently through AI-powered inspection, laser QR identification, cloud asset tracking, and predictive maintenance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <FaBrain className="text-purple-400" />, label: 'AI Powered' },
                  { icon: <FaQrcode className="text-cyan-400" />, label: 'QR Enabled' },
                  { icon: <FaCloud className="text-blue-400" />, label: 'Cloud Connected' },
                  { icon: <FaShieldAlt className="text-emerald-400" />, label: 'Predictive Care' }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-medium text-slate-200 backdrop-blur-md"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-purple-900/20 via-black/40 to-cyan-900/20 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono text-xs text-slate-300">
                    <FaMicrochip className="text-cyan-400" />
                    <span>XGBOOST MAINTENANCE RISK ENGINE</span>
                  </div>
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                    ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                  {[
                    { value: '5,000+', label: 'Railway Assets' },
                    { value: '25,000+', label: 'QR Scans' },
                    { value: '98%', label: 'Prediction Acc.' },
                    { value: '365 Days', label: 'Tracking' }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-white/5 bg-black/40 p-3">
                      <div className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
                        {stat.value}
                      </div>
                      <div className="mt-0.5 font-sans text-[10px] text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto w-full max-w-md lg:col-span-5"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60 p-8 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />

                <div className="mb-6 text-center">
                  <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 p-3 shadow-lg">
                    <FaQrcode className="text-2xl text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
                  <p className="mt-1 text-xs text-slate-400">Sign in to continue managing railway infrastructure securely.</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: [0, -5, 5, -5, 0] }}
                      exit={{ opacity: 0 }}
                      className="mb-4 flex items-center space-x-2 rounded-xl border border-red-500/30 bg-red-500/15 p-3 text-xs text-red-300"
                    >
                      <FaExclamationCircle className="shrink-0 text-sm text-red-400" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs text-emerald-300"
                    >
                      <FaCheckCircle className="shrink-0 text-sm text-emerald-400" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-medium text-slate-300">Email Address</label>
                    <div className="relative flex items-center">
                      <FaEnvelope className="pointer-events-none absolute left-4 text-xs text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="inspector@railways.gov.in"
                        className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-medium text-slate-300">Password</label>
                    <div className="relative flex items-center">
                      <FaKey className="pointer-events-none absolute left-4 text-xs text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-10 text-xs text-white placeholder:text-slate-600 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 text-xs text-slate-400 transition-colors hover:text-white"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex cursor-pointer items-center space-x-2 text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="rounded border-white/20 bg-black/50 text-purple-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Remember Me</span>
                    </label>
                    <a href="#forgot" className="text-purple-400 transition-colors hover:text-purple-300">
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-3.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:opacity-95 hover:shadow-cyan-500/40 active:scale-[0.99] disabled:opacity-50"
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

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-[10px] text-slate-500">
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="font-mono">256-BIT ENCRYPTED</span>
                  </div>
                  <span className="font-mono text-slate-600">v1.0.4-PROD</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] text-slate-400 backdrop-blur-md">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Engine Tech:</span>
                <div className="flex items-center space-x-2">
                  <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-xs">AI</span>
                  <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-xs">Firebase</span>
                  <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-xs">XGBoost</span>
                  <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-xs">QR</span>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <footer className="w-full border-t border-white/10 bg-black/40 px-6 py-6 text-center text-xs text-slate-500 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-center">
            <div>
              <span className="font-medium text-slate-400">AI-Enabled Railway Track Clip Management System</span> - Smart Railway Infrastructure
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
