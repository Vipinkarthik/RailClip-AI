import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaQrcode, FaCloud, FaMobileAlt, FaBrain, FaHistory, 
  FaChartLine, FaShieldAlt, FaSyncAlt, FaMicrochip, 
  FaGithub, FaEnvelope, FaChevronRight, FaDatabase, FaLayerGroup
} from 'react-icons/fa';
import Aurora from '../components/Aurora';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate(); // Add this line
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030712] text-white font-['Poppins',sans-serif] selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* Fixed Aurora Animation Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <Aurora
          colorStops={["#5227FF", "#7cff67", "#00d2ff"]}
          blend={0.6}
          amplitude={1.2}
          speed={0.8}
        />
      </div>

      {/* Floating Glowing Circles */}
      <div className="fixed top-1/4 left-10 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-1/3 right-10 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* Content Wrapper */}
      <div className="relative z-10">

        {/* ================= NAVIGATION BAR ================= */}
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
          <nav 
            className={`w-full max-w-7xl transition-all duration-300 rounded-2xl backdrop-blur-xl border border-white/10 ${
              scrolled ? 'bg-black/60 py-3 shadow-2xl shadow-purple-950/20' : 'bg-white/5 py-5'
            }`}
          >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
              {/* Brand Logo */}
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-lg shadow-purple-500/20">
                  <FaQrcode className="text-xl" />
                </div>
                <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                  RailClip<span className="text-cyan-400">AI</span>
                </span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
                {['Home', 'Workflow', 'Features', 'AI Intelligence', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="relative py-1 hover:text-white transition-colors duration-200 group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <a 
                  href="#dashboard" 
                  className="hidden sm:inline-block text-sm px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-colors border border-white/10 hover:border-white/30"
                >
                  Dashboard
                </a>
                {/* NEW CODE */}
<button 
  onClick={() => navigate('/login')} 
  className="text-sm px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 cursor-pointer"
>
  Get Started
</button>
              </div>
            </div>
          </nav>
        </header>

        {/* ================= HERO SECTION ================= */}
        <section id="home" className="pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
          <div className="text-center max-w-4xl mx-auto">
            {/* AI Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-inner shadow-purple-500/20"
            >
              <FaBrain className="text-cyan-400 animate-pulse" />
              <span>AI Powered Predictive Maintenance Platform</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
            >
              AI-Enabled Railway Track Clip Management
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-400 text-base sm:text-xl max-w-3xl mx-auto font-light leading-relaxed mb-10"
            >
              Digitizing Railway Infrastructure through Laser QR Identification, Intelligent Asset Tracking, Cloud-Based Inspection Management, and AI-Driven Predictive Maintenance.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <a 
                href="#features" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Explore Platform
              </a>
              <a 
                href="#dashboard" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-slate-200 font-semibold text-sm backdrop-blur-md transition-all hover:bg-white/10"
              >
                View Dashboard
              </a>
            </motion.div>

            {/* Floating Statistics Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              {[
                { value: '5,000+', label: 'Railway Clips', icon: <FaQrcode className="text-purple-400" /> },
                { value: '25,000+', label: 'QR Inspections', icon: <FaMobileAlt className="text-cyan-400" /> },
                { value: '98%', label: 'Prediction Accuracy', icon: <FaBrain className="text-emerald-400" /> },
                { value: '100%', label: 'Digital Traceability', icon: <FaShieldAlt className="text-blue-400" /> },
              ].map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/5 text-left">
                  <div className="text-xl mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= SECTION 2: HOW IT WORKS ================= */}
        <section id="workflow" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">Lifecycle Process</h2>
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              How The Platform Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Laser Engraved QR', desc: 'Permanent QR code laser-etched onto clips during manufacturing.' },
              { step: '02', title: 'Scan QR Code', desc: 'Inspectors scan clips on-site via mobile app.' },
              { step: '03', title: 'Retrieve Asset Details', desc: 'Instant access to installation and historical data.' },
              { step: '04', title: 'Perform Inspection', desc: 'Log condition, looseness, GPS location, and remarks.' },
              { step: '05', title: 'Save Inspection History', desc: 'Records synced to centralized Firebase Cloud storage.' },
              { step: '06', title: 'AI Maintenance Prediction', desc: 'XGBoost model evaluates risk levels (Low, Med, High).' },
              { step: '07', title: 'Dashboard Updated', desc: 'Real-time telemetry updated across central consoles.' },
              { step: '08', title: 'Generate Reports', desc: 'Automate analytical reports for maintenance planning.' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative p-6 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="text-3xl font-black text-white/10 group-hover:text-purple-400/20 transition-colors mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-xs text-purple-400 font-medium">
                  Next Step <FaChevronRight className="ml-1 text-[10px]" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 3: PLATFORM FEATURES ================= */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-3">Enterprise Suite</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white">Platform Capabilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <FaQrcode />, title: 'Laser QR Identification', desc: 'Every railway clip receives a permanent laser engraved QR code for infallible identity tracking.' },
              { icon: <FaCloud />, title: 'Cloud Database', desc: 'Centralized Firebase storage storing complete lifecycle records and real-time maintenance logs.' },
              { icon: <FaMobileAlt />, title: 'Mobile Inspection', desc: 'Inspectors scan QR codes and update condition logs instantly from the field.' },
              { icon: <FaBrain />, title: 'AI Maintenance Prediction', desc: 'Predicts Low, Medium, or High maintenance priority using trained XGBoost algorithms.' },
              { icon: <FaHistory />, title: 'Maintenance History', desc: 'Auditable historical timelines tracking replacements, wear patterns, and environmental exposure.' },
              { icon: <FaChartLine />, title: 'Reports & Analytics', desc: 'Automated executive summaries, safety metrics, and predictive lifecycle analytics.' }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-cyan-400 text-xl mb-6">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: ARTIFICIAL INTELLIGENCE ================= */}
        <section id="ai-intelligence" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Neural Concept Illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 via-black to-slate-900/40 border border-purple-500/20 backdrop-blur-xl overflow-hidden"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-3xl blur opacity-20" />
              
              <div className="relative z-10 flex flex-col items-center justify-center py-12">
                <div className="w-32 h-32 rounded-full bg-purple-600/20 border-2 border-cyan-400 flex items-center justify-center text-5xl text-cyan-400 shadow-2xl shadow-cyan-500/50 mb-8 animate-pulse">
                  <FaMicrochip />
                </div>
                
                {/* Simulated Real-Time Predictions */}
                <div className="w-full space-y-3">
                  <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 flex justify-between items-center text-xs">
                    <span className="text-slate-300">Clip #RC-8842 Status</span>
                    <span className="text-emerald-400 font-semibold">Priority: LOW</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 flex justify-between items-center text-xs">
                    <span className="text-slate-300">Clip #RC-9104 Status</span>
                    <span className="text-amber-400 font-semibold">Priority: MEDIUM</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-red-500/30 flex justify-between items-center text-xs">
                    <span className="text-slate-300">Clip #RC-3319 Status</span>
                    <span className="text-red-400 font-semibold">Priority: HIGH</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Descriptions & Details */}
            <div>
              <h2 className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-3">Intelligent Engine</h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">AI Predictive Maintenance Engine</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                Powered by XGBoost, the engine processes multi-variable parameters including age, load metrics, wear logs, repair counts, and ambient conditions to generate accurate health assessments.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Health Score', val: '94/100', detail: 'Optimal structural elasticity' },
                  { label: 'Maintenance Priority', val: 'Low Risk', detail: 'No action required' },
                  { label: 'Risk Level', val: '0.04%', detail: 'Minimal failure propensity' },
                  { label: 'AI Recommendation', val: 'Inspect', detail: 'Next scheduled in 90 days' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="text-xs text-purple-300 mb-1">{item.label}</div>
                    <div className="text-lg font-bold text-white">{item.val}</div>
                    <div className="text-[10px] text-slate-400">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ================= STATISTICS COUNTERS ================= */}
        <section className="py-20 px-6 max-w-7xl mx-auto border-y border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5000+', label: 'Railway Components' },
              { value: '25000+', label: 'QR Inspections' },
              { value: '98%', label: 'Prediction Accuracy' },
              { value: '365 Days', label: 'Inspection Tracking' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= WHY CHOOSE THIS PLATFORM ================= */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-3">Value Proposition</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white">Why Choose This Platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FaQrcode />, title: 'Digital Asset Tracking', desc: 'Eliminates paper logging by maintaining individual laser-coded identities.' },
              { icon: <FaBrain />, title: 'AI Decision Making', desc: 'Replaces guessing with algorithmic failure likelihood estimations.' },
              { icon: <FaSyncAlt />, title: 'Cloud Synchronization', desc: 'Seamless synchronization between remote track workers and command hubs.' },
              { icon: <FaShieldAlt />, title: 'Predictive Maintenance', desc: 'Transitions infrastructure strategy from reactive repair to proactive safety.' }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-2xl text-purple-400 mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= FINAL CALL TO ACTION ================= */}
        <section id="get-started" className="py-24 px-6 max-w-5xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-b from-purple-900/30 via-slate-900 to-black border border-purple-500/30 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
              Ready to Modernize Railway Maintenance?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-light">
              Transition from manual inspection cycles to AI-driven predictive intelligence today. Protect critical rail infrastructure with enterprise confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 hover:opacity-90 transition-all">
                Get Started
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white font-semibold text-sm backdrop-blur-md transition-all">
                View Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer id="contact" className="py-16 px-6 border-t border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm text-slate-400 mb-12">
            
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 text-white font-bold text-lg mb-4">
                <FaQrcode className="text-purple-400" />
                <span>RailClipAI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart AI-Enabled Railway Track Clip Management System for modern railway safety and infrastructure intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">Workflow</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#ai-intelligence" className="hover:text-white transition-colors">AI Intelligence</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Technology Stack</h4>
              <ul className="space-y-2 text-xs">
                <li>React.js & Vite</li>
                <li>Tailwind CSS & Framer Motion</li>
                <li>Firebase Firestore</li>
                <li>Python & XGBoost</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Connect</h4>
              <div className="flex space-x-4 text-lg text-slate-300">
                <a href="#github" className="hover:text-purple-400 transition-colors"><FaGithub /></a>
                <a href="#email" className="hover:text-purple-400 transition-colors"><FaEnvelope /></a>
              </div>
            </div>

          </div>

          <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>© {new Date().getFullYear()} RailClipAI. All rights reserved.</div>
            <div>Made with ❤️ for Smart Railway Infrastructure</div>
          </div>
        </footer>

      </div>
    </div>
  );
}