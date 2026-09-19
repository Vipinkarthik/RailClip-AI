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
  FaSpinner,
  FaTrain,
  FaTools,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';
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
      const idTokenResult = await credential.user.getIdTokenResult(true);

      if (idTokenResult.claims?.role === 'worker') {
        await auth.signOut();
        setError('Access Denied: Worker accounts are not authorized to access the admin dashboard.');
        return;
      }

      const idToken = idTokenResult.token;
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
      await auth.signOut().catch(() => {});
      setError(getAuthErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-slate-50 font-['Poppins',sans-serif] text-slate-900 selection:bg-blue-600 selection:text-white">
      
      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        
        {/* Top Official Indian Railways Banner Strip */}
        <div className="bg-[#002855] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 border-b border-blue-900/60">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-bold tracking-wide text-amber-300">भारतीय रेल</span>
              <span className="text-blue-300">|</span>
              <span className="font-semibold tracking-wider">INDIAN RAILWAYS</span>
              <span className="hidden md:inline-block text-blue-200 font-normal">
                • Ministry of Railways, Government of India
              </span>
            </div>
            <div className="flex items-center space-x-4 font-mono text-[10.5px] text-blue-200">
              <span className="text-emerald-400 font-semibold">RDSO T-3701 COMPLIANT</span>
              <span className="hidden md:inline text-blue-400">|</span>
              <span className="hidden md:inline text-blue-200">BROAD GAUGE 1676mm</span>
            </div>
          </div>
        </div>

        {/* Enterprise Navbar */}
        <header className="border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                aria-label="Back to landing page"
              >
                <FaArrowLeft className="text-xs" />
              </button>

              <div onClick={() => navigate('/')} className="flex cursor-pointer items-center space-x-3">
                <div className="rounded-xl bg-gradient-to-tr from-[#003366] via-[#004b87] to-[#0284c7] p-2 text-white shadow-md shadow-blue-900/20">
                  <FaTrain className="text-lg text-amber-300" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-none text-base font-black tracking-wide text-slate-900">
                    RailClip
                  </span>
                  <span className="font-mono text-[9.5px] font-semibold tracking-wider text-slate-500">
                    INDIAN RAILWAYS FASTENER TELEMETRY
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 font-mono text-xs text-slate-600">
              <div className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-700">SYS TIME: {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Main Login Workspace */}
        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-10">
          <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12">
            
            {/* Left Column: Indian Railways P-Way Technical Showcase */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 lg:col-span-7"
            >
              <div className="inline-flex items-center space-x-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-900">
                <FaTrain className="text-amber-600" />
                <span>Divisional Permanent Way (P-Way) Safety Portal</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-900">
                  Intelligent Elastic Rail Clip Management for <span className="text-[#004b87]">Indian Railways</span>
                </h1>
                <p className="max-w-xl text-xs sm:text-sm font-normal leading-relaxed text-slate-600">
                  Authorised portal for <strong>Senior Section Engineers (P-Way)</strong>, <strong>ADENs</strong>, and <strong>Track Officers</strong> to monitor laser-QR serialized rail clips, predictive toe-load loss analytics, and RDSO safety compliance.
                </p>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <FaBrain className="text-amber-600" />, label: 'XGBoost AI Risk' },
                  { icon: <FaQrcode className="text-blue-600" />, label: 'Laser QR Coding' },
                  { icon: <FaMapMarkerAlt className="text-blue-600" />, label: 'GIS GPS Tagging' },
                  { icon: <FaShieldAlt className="text-emerald-600" />, label: 'RDSO Verified' }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 shadow-xs"
                  >
                    {item.icon}
                    <span className="text-[11px] font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Engineering Stats Box */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2 font-mono text-xs text-slate-700 font-bold">
                    <FaMicrochip className="text-blue-600" />
                    <span>INDIAN RAILWAYS FASTENER NETWORK STATUS</span>
                  </div>
                  <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700 font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                  {[
                    { value: '5,842+', label: 'Registered ERC Clips' },
                    { value: '1676 mm', label: 'Broad Gauge Track' },
                    { value: '25.0 T', label: 'Heavy Axle Load' },
                    { value: '< 12 ms', label: 'Sync Telemetry' }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <div className="text-base sm:text-lg font-black font-mono text-[#003366]">
                        {stat.value}
                      </div>
                      <div className="mt-0.5 font-sans text-[10px] text-slate-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column: Authentication Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto w-full max-w-md lg:col-span-5"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xl">
                <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-[#003366] via-blue-500 to-orange-500" />

                <div className="mb-5 text-center">
                  <div className="mb-2 inline-flex rounded-2xl border border-blue-200 bg-blue-50 p-3 shadow-sm">
                    <FaTrain className="text-2xl text-blue-700" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Officer Authentication</h2>
                  <p className="mt-1 text-xs text-slate-500">Sign in with your Indian Railways divisional email credentials.</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: [0, -5, 5, -5, 0] }}
                      exit={{ opacity: 0 }}
                      className="mb-4 flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium"
                    >
                      <FaExclamationCircle className="shrink-0 text-sm text-red-600" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-medium"
                    >
                      <FaCheckCircle className="shrink-0 text-sm text-emerald-600" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-semibold text-slate-700">Divisional Officer Email</label>
                    <div className="relative flex items-center">
                      <FaEnvelope className="pointer-events-none absolute left-3.5 text-xs text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="e.g. salem@gmail.com / coimbatore@gmail.com"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="ml-1 text-xs font-semibold text-slate-700">Password</label>
                    <div className="relative flex items-center">
                      <FaKey className="pointer-events-none absolute left-3.5 text-xs text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3.5 text-xs text-slate-400 transition-colors hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex cursor-pointer items-center space-x-2 text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Keep Session Active</span>
                    </label>
                    <span className="text-slate-500 text-[11px] font-mono">Division Auto-Detect</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 py-3 text-xs font-bold text-white shadow-lg shadow-orange-600/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Command Portal</span>
                        <FaArrowRight className="text-xs" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                  <div className="flex items-center space-x-1.5 text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
                    <span className="font-mono font-semibold">SECURE ENCRYPTED CHANNEL</span>
                  </div>
                  <span className="font-mono text-slate-400">v2.4-PROD</span>
                </div>
              </div>
            </motion.div>

          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-600">
          <div className="mx-auto flex max-w-7xl items-center justify-between flex-wrap gap-2 text-[11px]">
            <div>
              <span className="font-semibold text-slate-900">RailClip System</span> • Dedicated Track Fastener Integrity Platform for Indian Railways
            </div>
            <div className="text-slate-500 font-mono">
              RDSO Spec T-3701 / T-4001 • Broad Gauge 1676mm
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

