import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaQrcode, FaCloud, FaMobileAlt, FaBrain, FaHistory, 
  FaChartLine, FaShieldAlt, FaSyncAlt, FaTrain, FaTools, 
  FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt, 
  FaHardHat, FaArrowRight, FaPlay, FaLock, FaChevronRight,
  FaFilePdf, FaFileAlt, FaCog, FaEye, FaNetworkWired,
  FaCheck, FaSlidersH, FaCalendarAlt, FaWrench, FaChartBar,
  FaSignal, FaBroadcastTower, FaMicrochip, FaDownload,
  FaUniversity, FaRegCheckCircle, FaProjectDiagram, FaServer
} from 'react-icons/fa';

/* ==========================================================================
   HeroRailwayIllustration - Custom Indian Railways SVG Scene
   Features: WAP-7 / Vande Bharat Locomotive, 25kV OHE Catenary, 
   UIC 60kg Rail, Concrete Sleepers, RDSO ERC Mk-III / Mk-V Clips,
   Kneeling IR Track Maintainer with Rugged Handheld Scanner & Telemetry HUD.
   ========================================================================== */
function HeroRailwayIllustration({ onClipSelect, selectedClip }) {
  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-slate-950 via-[#071326] to-[#0b1c38] border border-blue-500/30 shadow-2xl p-4 sm:p-6 overflow-hidden select-none">
      
      {/* Ambient Indian Railways Saffron & Cyan Atmosphere Glow */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-12 right-6 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main SVG Scene */}
      <svg 
        viewBox="0 0 640 400" 
        className="w-full h-auto drop-shadow-2xl"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a192f" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          
          {/* WAP-7 / Vande Bharat Locomotive Gradients */}
          <linearGradient id="irLocoBodyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="35%" stopColor="#0369a1" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="railSteelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="45%" stopColor="#f1f5f9" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="clipBronzeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="laserBeamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="hudGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 1. BACKGROUND SCENERY & 25kV OVERHEAD TRACTION (OHE) CATENARY */}
        <rect x="0" y="0" width="640" height="200" fill="url(#skyGrad)" rx="10" opacity="0.45" />
        
        {/* Distant Hills / Western Ghats Silhouette */}
        <path d="M0 135 L90 100 L180 125 L310 85 L440 118 L560 92 L640 120 L640 160 L0 160 Z" fill="#1e293b" opacity="0.4" />

        {/* Catenary 25kV AC Electric Traction Masts & Portal Girder */}
        <g stroke="#64748b" strokeWidth="1.5" opacity="0.7">
          {/* Mast Left */}
          <line x1="70" y1="35" x2="70" y2="180" strokeWidth="2.5" stroke="#475569" />
          <line x1="55" y1="40" x2="90" y2="40" strokeWidth="2" stroke="#94a3b8" />
          <line x1="70" y1="40" x2="90" y2="55" />
          {/* Mast Mid-Right */}
          <line x1="290" y1="25" x2="290" y2="180" strokeWidth="2.5" stroke="#475569" />
          <line x1="275" y1="30" x2="310" y2="30" strokeWidth="2" stroke="#94a3b8" />
          {/* Mast Far Right */}
          <line x1="530" y1="15" x2="530" y2="180" strokeWidth="2.5" stroke="#475569" />
          <line x1="510" y1="20" x2="550" y2="20" strokeWidth="2" stroke="#94a3b8" />
          
          {/* Overhead Contact Wires */}
          <path d="M0 45 Q190 62 390 40 T640 25" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.5" />
          <path d="M0 55 Q190 70 390 50 T640 35" fill="none" stroke="#94a3b8" strokeWidth="0.8" opacity="0.3" />
          {/* Droppers */}
          <line x1="160" y1="52" x2="160" y2="60" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="220" y1="50" x2="220" y2="58" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="440" y1="38" x2="440" y2="46" stroke="#38bdf8" strokeWidth="0.8" />
        </g>

        {/* 2. INDIAN RAILWAYS WAP-7 / EXPRESS ELECTRIC LOCOMOTIVE */}
        <g id="train-group" transform="translate(310, 58)">
          {/* Pantograph */}
          <path d="M120 30 L135 5 L160 5 L175 30" fill="none" stroke="#ea580c" strokeWidth="2" />
          <line x1="130" y1="5" x2="165" y2="5" stroke="#f8fafc" strokeWidth="2.5" />
          
          {/* Locomotive Aerodynamic Front & Body */}
          <path d="M20 30 L220 30 Q248 30 250 55 L250 86 L15 86 L15 45 Q15 30 20 30 Z" fill="url(#irLocoBodyGrad)" />
          
          {/* IR Red & Yellow Safety Stripe Band */}
          <rect x="20" y="58" width="230" height="7" fill="#facc15" />
          <rect x="20" y="65" width="230" height="4" fill="#dc2626" />
          
          {/* Cab Windshield with Green Glare Tint */}
          <polygon points="180,36 235,36 242,54 180,54" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          <line x1="208" y1="36" x2="208" y2="54" stroke="#0f172a" strokeWidth="1.5" />
          
          {/* Front Indian Railways Emblem Roundel */}
          <circle cx="245" cy="65" r="5" fill="#f8fafc" stroke="#dc2626" strokeWidth="1" />
          <circle cx="245" cy="65" r="2" fill="#0284c7" />

          {/* High-Intensity LED Twin Headlamp */}
          <circle cx="248" cy="46" r="4.5" fill="#fef08a" />
          <circle cx="248" cy="46" r="9" fill="#facc15" opacity="0.4" className="animate-pulse" />
          
          {/* Warning Cowcatcher / Cattle Guard */}
          <polygon points="242,82 255,88 238,88" fill="#e2e8f0" stroke="#dc2626" strokeWidth="1" />

          {/* Heavy Co-Co Bogies & Steel Wheels */}
          <rect x="20" y="86" width="220" height="10" fill="#1e293b" />
          <circle cx="45" cy="96" r="8" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="80" cy="96" r="8" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="155" cy="96" r="8" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="190" cy="96" r="8" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="225" cy="96" r="8" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />

          {/* Trailing LHB Stainless Steel Coaches */}
          <rect x="-130" y="34" width="145" height="52" rx="3" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
          {/* LHB Windows */}
          <rect x="-115" y="44" width="20" height="15" rx="2" fill="#38bdf8" opacity="0.8" />
          <rect x="-85" y="44" width="20" height="15" rx="2" fill="#38bdf8" opacity="0.8" />
          <rect x="-55" y="44" width="20" height="15" rx="2" fill="#38bdf8" opacity="0.8" />
          <rect x="-25" y="44" width="20" height="15" rx="2" fill="#38bdf8" opacity="0.8" />
          <rect x="-125" y="86" width="135" height="10" fill="#1e293b" />
          <circle cx="-100" cy="96" r="7.5" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="-40" cy="96" r="7.5" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>

        {/* 3. TRACK BALLAST BED (STONE GRAVEL CRUSHED ROCK) */}
        <path d="M0 160 L640 160 L640 400 L0 400 Z" fill="#0f172a" />
        {/* Ballast Particle Granules */}
        <g fill="#334155" opacity="0.7">
          <circle cx="35" cy="180" r="3" />
          <circle cx="115" cy="195" r="4" />
          <circle cx="210" cy="175" r="3.5" />
          <circle cx="330" cy="190" r="3" />
          <circle cx="450" cy="185" r="4.5" />
          <circle cx="570" cy="195" r="3" />
          <circle cx="75" cy="240" r="4" />
          <circle cx="190" cy="260" r="5" />
          <circle cx="370" cy="250" r="4" />
          <circle cx="490" cy="270" r="4.5" />
          <circle cx="130" cy="360" r="5.5" />
          <circle cx="430" cy="370" r="5" />
        </g>

        {/* 4. PRE-STRESSED CONCRETE (PSC) SLEEPERS (INDIAN RAILWAYS STANDARD) */}
        <g id="sleepers-group">
          {/* Sleeper 1 (Far) */}
          <polygon points="120,185 520,185 515,198 115,198" fill="#334155" stroke="#475569" strokeWidth="0.8" />
          {/* Sleeper 2 */}
          <polygon points="100,215 540,215 532,232 92,232" fill="#334155" stroke="#475569" strokeWidth="1" />
          {/* Sleeper 3 */}
          <polygon points="75,255 570,255 560,278 65,278" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
          {/* Sleeper 4 (Foreground Primary Inspection Sleeper) */}
          <polygon points="40,310 610,310 595,345 25,345" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
          {/* Sleeper 5 (Bottom) */}
          <polygon points="10,380 640,380 630,400 0,400" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        </g>

        {/* 5. UIC 60kg / 52kg STEEL RAIL PROFILE (BROAD GAUGE - 1676mm) */}
        <g id="steel-rails">
          {/* Left Rail */}
          <polygon points="160,160 172,160 112,400 95,400" fill="url(#railSteelGrad)" stroke="#f8fafc" strokeWidth="1" />
          <polygon points="160,160 164,160 95,400 89,400" fill="#475569" />
          <line x1="166" y1="160" x2="104" y2="400" stroke="#f8fafc" strokeWidth="1.8" opacity="0.95" />

          {/* Right Rail */}
          <polygon points="460,160 472,160 535,400 518,400" fill="url(#railSteelGrad)" stroke="#f8fafc" strokeWidth="1" />
          <polygon points="472,160 476,160 541,400 535,400" fill="#334155" />
          <line x1="466" y1="160" x2="526" y2="400" stroke="#f8fafc" strokeWidth="1.8" opacity="0.95" />
        </g>

        {/* 6. RDSO ELASTIC RAIL CLIPS (ERC MK-III / MK-V) */}
        {/* Clip 1: Target Active Scanned Clip (Foreground Left) */}
        <g id="erc-clip-target" className="cursor-pointer" transform="translate(68, 304)">
          {/* Cast Iron Shoulder & GFN-66 Insulating Liner Base */}
          <rect x="0" y="6" width="40" height="26" rx="2" fill="#090d16" stroke="#0284c7" strokeWidth="1.5" />
          
          {/* Spring Steel Elastic Rail Clip Curled Helix */}
          <path 
            d="M8 23 C4 14, 8 5, 19 5 C30 5, 34 14, 30 23 C25 29, 14 27, 16 18 C18 11, 25 13, 27 18" 
            fill="none" 
            stroke="url(#clipBronzeGrad)" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
          />
          
          {/* Laser QR Holographic Target Ring */}
          <circle cx="19" cy="14" r="16" fill="#0284c7" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" className="animate-spin" style={{ animationDuration: '6s' }} />
          
          {/* Permanent Laser QR Matrix Tag */}
          <rect x="11" y="8" width="16" height="13" rx="2" fill="#0369a1" stroke="#38bdf8" strokeWidth="0.8" />
          <path d="M14 10 H17 V13 H14 Z M20 10 H23 V13 H20 Z M14 14 H17 V17 H14 Z M20 15 H22" stroke="#ffffff" strokeWidth="1" />
          
          {/* Live Telemetry Floating Pill */}
          <g transform="translate(-20, -32)">
            <rect x="0" y="0" width="84" height="22" rx="5" fill="#0284c7" stroke="#67e8f9" strokeWidth="1.2" />
            <text x="42" y="14" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              IR-ERC-9402 • 98.8%
            </text>
          </g>
        </g>

        {/* Clip 2: Foreground Right Clip */}
        <g id="erc-clip-right" transform="translate(508, 304)">
          <rect x="0" y="6" width="40" height="26" rx="2" fill="#090d16" stroke="#475569" strokeWidth="1" />
          <path 
            d="M8 23 C4 14, 8 5, 19 5 C30 5, 34 14, 30 23 C25 29, 14 27, 16 18 C18 11, 25 13, 27 18" 
            fill="none" 
            stroke="url(#clipBronzeGrad)" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
          />
          <circle cx="19" cy="14" r="14" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeWidth="1.2" />
        </g>

        {/* Clip 3: Midground Left */}
        <g id="erc-clip-mid-left" transform="translate(95, 250) scale(0.82)">
          <rect x="0" y="6" width="38" height="24" rx="2" fill="#090d16" stroke="#475569" strokeWidth="1" />
          <path 
            d="M8 23 C4 14, 8 5, 19 5 C30 5, 34 14, 30 23 C25 29, 14 27, 16 18 C18 11, 25 13, 27 18" 
            fill="none" 
            stroke="url(#clipBronzeGrad)" 
            strokeWidth="4.5" 
            strokeLinecap="round" 
          />
        </g>

        {/* Clip 4: Midground Right */}
        <g id="erc-clip-mid-right" transform="translate(485, 250) scale(0.82)">
          <rect x="0" y="6" width="38" height="24" rx="2" fill="#090d16" stroke="#475569" strokeWidth="1" />
          <path 
            d="M8 23 C4 14, 8 5, 19 5 C30 5, 34 14, 30 23 C25 29, 14 27, 16 18 C18 11, 25 13, 27 18" 
            fill="none" 
            stroke="url(#clipBronzeGrad)" 
            strokeWidth="4.5" 
            strokeLinecap="round" 
          />
        </g>

        {/* 7. KNEELING INDIAN RAILWAYS SECTION ENGINEER / TRACK MAINTAINER */}
        <g id="railway-inspector" transform="translate(335, 182)">
          
          {/* Active Laser Cone Projector from Tablet to Scanned Clip */}
          <polygon points="52,112 -250,132 -250,148" fill="url(#laserBeamGrad)" opacity="0.75" />

          {/* Heavy Safety Steel-Toe Boots */}
          <ellipse cx="65" cy="182" rx="15" ry="7" fill="#020617" stroke="#334155" strokeWidth="1" />
          <ellipse cx="115" cy="182" rx="16" ry="7" fill="#020617" stroke="#334155" strokeWidth="1" />
          
          {/* Navy Blue IR P-Way Uniform Trousers */}
          <path d="M40 140 L65 182 L80 182 L70 145 L100 145 L115 182 L132 182 L115 128 Z" fill="#0f2942" />
          
          {/* High-Visibility Fluorescent Orange Safety Vest */}
          <path d="M35 85 L90 85 Q102 110 96 142 L45 142 Q33 110 35 85 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />
          
          {/* High-Grade Retroreflective 3M Silver Stripes */}
          <rect x="42" y="98" width="50" height="7" fill="#f1f5f9" rx="1" />
          <rect x="45" y="119" width="46" height="7" fill="#f1f5f9" rx="1" />
          {/* Indian Railways Chest Badge Pocket */}
          <rect x="44" y="88" width="16" height="8" rx="1" fill="#0369a1" />
          <text x="52" y="94" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">IR</text>

          {/* Dark Navy Shirt Sleeves */}
          <path d="M35 85 L15 116 L30 121 L50 95 Z" fill="#0c4a6e" />
          <path d="M88 85 L108 112 L97 122 L76 95 Z" fill="#0c4a6e" />
          
          {/* Head & Face */}
          <circle cx="68" cy="62" r="13" fill="#fed7aa" />
          <path d="M68 55 Q78 55 76 68 Q68 72 65 68 Z" fill="#1e293b" />
          
          {/* Safety Hardhat Helmet with IR Emblem Stripe */}
          <path d="M50 55 Q68 38 86 55 L89 60 L46 60 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <rect x="44" y="58" width="48" height="4" rx="2" fill="#d97706" />
          <rect x="64" y="44" width="8" height="4" rx="1" fill="#dc2626" />

          {/* Hands holding Rugged IP67 P-Way Smart Diagnostic Tablet */}
          <circle cx="48" cy="118" r="6" fill="#fed7aa" />
          <circle cx="28" cy="122" r="5.5" fill="#fed7aa" />

          {/* Rugged Field Tablet */}
          <g transform="translate(14, 93) rotate(-14)">
            <rect x="0" y="0" width="50" height="34" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1.8" />
            <rect x="3" y="3" width="44" height="28" rx="2" fill="#0369a1" />
            {/* Live AI Waveform / Real-time Toe Load Graph */}
            <path d="M6 18 L14 18 L18 8 L22 26 L26 18 L40 18" fill="none" stroke="#67e8f9" strokeWidth="1.8" />
            <circle cx="38" cy="9" r="2.5" fill="#4ade80" />
            <text x="7" y="10" fill="#ffffff" fontSize="4.5" fontFamily="monospace">TOE: 10.2kN</text>
          </g>

        </g>

        {/* 8. FLOATING HOLOGRAPHIC TELEMETRY DASHBOARD OVERLAY */}
        <g id="holographic-panel" transform="translate(18, 22)">
          {/* Panel Card Base */}
          <rect x="0" y="0" width="245" height="122" rx="9" fill="url(#hudGrad)" stroke="#0284c7" strokeWidth="1.6" />
          
          {/* Panel Header */}
          <rect x="0" y="0" width="245" height="26" rx="9" fill="#0369a1" fillOpacity="0.45" />
          <circle cx="14" cy="13" r="4" fill="#ef4444" />
          <circle cx="26" cy="13" r="4" fill="#f59e0b" />
          <circle cx="38" cy="13" r="4" fill="#10b981" />
          <text x="52" y="17" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="monospace">
            IR-TELEMETRY: SALEM DIV (KM 142/8)
          </text>

          {/* GIS Map & Track Marker */}
          <g transform="translate(10, 34)">
            <rect x="0" y="0" width="105" height="46" rx="4" fill="#020617" stroke="#334155" strokeWidth="1" />
            {/* Grid */}
            <line x1="0" y1="15" x2="105" y2="15" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="30" x2="105" y2="30" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="35" y1="0" x2="35" y2="46" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="70" y1="0" x2="70" y2="46" stroke="#1e293b" strokeWidth="0.8" />
            {/* Broad Gauge Mainline Path */}
            <path d="M5 38 Q50 12 100 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeDasharray="4 2" />
            {/* GPS Inspector Node */}
            <circle cx="52" cy="24" r="4" fill="#38bdf8" />
            <circle cx="52" cy="24" r="8" fill="#38bdf8" fillOpacity="0.3" className="animate-ping" />
            <text x="52" y="41" fill="#94a3b8" fontSize="6.5" textAnchor="middle" fontFamily="monospace">UP-LINE TRACK 1</text>
          </g>

          {/* Fastener Diagnostic Real-Time Metrics */}
          <g transform="translate(124, 34)">
            <text x="0" y="10" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">ERC Toe Load (Nominal)</text>
            <text x="0" y="24" fill="#4ade80" fontSize="13" fontWeight="bold" fontFamily="monospace">10.2 kN (98.8%)</text>
            <text x="0" y="36" fill="#38bdf8" fontSize="7.5" fontFamily="sans-serif">RDSO Spec: T-3701 / Mk-V</text>
            <text x="0" y="45" fill="#cbd5e1" fontSize="7" fontFamily="sans-serif">Fatigue Risk: 0.12%</text>
          </g>

          {/* Bottom Status Bar */}
          <g transform="translate(10, 88)">
            <rect x="0" y="0" width="225" height="24" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <text x="8" y="16" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
              AI MODEL: <tspan fill="#4ade80" fontWeight="bold">OPTIMAL</tspan> | SSE/P-WAY: IR-88204
            </text>
            <circle cx="212" cy="12" r="4" fill="#10b981" />
          </g>
        </g>

      </svg>

      {/* Interactive Bottom Control Bar */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-emerald-400 font-bold">LIVE TELEMETRY: 12ms CLOUD SYNC</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
          <span>Broad Gauge (1676 mm)</span>
          <span>•</span>
          <span>RDSO ERC Mk-III / Mk-V</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">25T Heavy Axle Load</span>
        </div>
      </div>

    </div>
  );
}

export default function Landingpage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Poppins',sans-serif] selection:bg-blue-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* ================= 1. OFFICIAL GOVT OF INDIA / INDIAN RAILWAYS TOP BANNER ================= */}
      <div className="bg-[#002855] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-bold tracking-wide text-amber-300">भारतीय रेल</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold tracking-wider">INDIAN RAILWAYS</span>
            <span className="hidden md:inline-block text-blue-200 font-normal">
              • Ministry of Railways, Government of India
            </span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[10.5px] text-blue-200">
            <span className="hidden sm:inline bg-blue-900/80 px-2 py-0.5 rounded border border-blue-700/50">
              RDSO Spec T-3701 / T-4001
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TMS Interoperable
            </span>
          </div>
        </div>
      </div>

      {/* ================= 2. ENTERPRISE NAVIGATION BAR ================= */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200 py-3' 
          : 'bg-white border-b border-slate-100 py-3.5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Brand Logo with Indian Railways Rail Symbol */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003366] via-[#004b87] to-[#0284c7] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-900/20">
              <FaTrain className="text-lg text-amber-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  RailClip
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  IR PROPOSAL
                </span>
              </div>
              <span className="text-[10.5px] text-slate-500 font-semibold tracking-wider">
                TRACK FASTENER INTEGRITY & LIFECYCLE PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-700">
            <a href="#overview" className="hover:text-blue-600 transition-colors">Overview</a>
            <a href="#modules" className="hover:text-blue-600 transition-colors">IR Modules</a>
            <a href="#ai-diagnostics" className="hover:text-blue-600 transition-colors">AI Telemetry</a>
            <a href="#specifications" className="hover:text-blue-600 transition-colors">RDSO Standards</a>
            <a href="#divisions" className="hover:text-blue-600 transition-colors">Zonal Deployment</a>
          </nav>

          {/* Action Buttons: Sign In & Command Center */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Officer Login
            </button>

            <button 
              onClick={() => navigate('/login')}
              className="px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#003366] to-[#0055a5] hover:from-[#002244] hover:to-[#004080] text-white transition-all shadow-md shadow-blue-900/20 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Command Center</span>
              <FaArrowRight className="text-xs" />
            </button>
          </div>

        </div>
      </header>

      {/* ================= 3. HERO PROPOSAL SECTION ================= */}
      <section id="overview" className="relative bg-gradient-to-b from-white via-slate-50 to-blue-50/50 pt-8 pb-16 px-4 sm:px-6 overflow-hidden">
        
        {/* Subtle Tech Grid Pattern */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Column: Headline & Action Buttons (5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-300 text-blue-900 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Dedicated Solution Proposal for Indian Railways</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              AI-Powered Elastic Rail Clip Management for <span className="text-[#004b87]">Indian Railways</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              Empowering <strong>Permanent Way (P-Way) Engineers</strong>, <strong>ADENs</strong>, and <strong>Track Maintainers</strong> with permanent laser QR serialization, XGBoost predictive toe-load loss estimation, and automated RDSO safety audit logs.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-sm shadow-lg shadow-orange-600/25 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request Indian Railways Demo</span>
                <FaArrowRight className="text-xs" />
              </button>

              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaPlay className="text-xs text-blue-600" />
                <span>Explore Live Platform</span>
              </button>
            </div>

            {/* Quick Badges aligned with Indian Railways standards */}
            <div className="pt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
                <FaCheckCircle className="text-emerald-600 shrink-0" />
                <span className="leading-tight text-[11px]">RDSO T-3701 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
                <FaCheckCircle className="text-emerald-600 shrink-0" />
                <span className="leading-tight text-[11px]">Broad Gauge 1676mm</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-slate-200">
                <FaCheckCircle className="text-emerald-600 shrink-0" />
                <span className="leading-tight text-[11px]">XGBoost AI Model</span>
              </div>
            </div>

          </div>

          {/* Right Hero Column: Detailed SVG Railway Track & Inspector Scene (7 cols) */}
          <div className="lg:col-span-7 relative">
            <HeroRailwayIllustration />
          </div>

        </div>

      </section>

      {/* ================= 4. CORE MODULES FOR INDIAN RAILWAYS P-WAY OPERATIONS ================= */}
      <section id="modules" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <div className="text-xs uppercase font-bold tracking-wider text-blue-600">Enterprise Railway Architecture</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Indian Railways Track Maintenance Workflows
          </h2>
          <p className="text-slate-600 text-sm font-normal">
            Eliminating paper registers, preventing unrecorded clip fatigue, and ensuring zero-derailment fastener safety across high-density corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Module 1: Laser QR Asset Tracking */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-2xl group-hover:scale-105 transition-transform">
              <FaQrcode />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Laser QR Serialization</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Every single <strong>ERC Mk-III & Mk-V clip</strong> receives a permanent laser-etched QR code. Field Keymen scan clips with instant GPS geotagging down to exact kilometer marks (e.g. KM 142/8).
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center text-xs font-semibold text-blue-600">
                100% Traceability per Sleeper <FaChevronRight className="ml-1 text-[10px]" />
              </span>
            </div>
          </div>

          {/* Module 2: Predictive XGBoost AI Telemetry */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 text-2xl group-hover:scale-105 transition-transform">
              <FaBrain />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Predictive AI Toe-Load Loss</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Machine learning models analyze axle gross tonnage (GMT), coastal humidity, curve radius, and temperature cycles to predict clip toe load loss before plastic failure occurs.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center text-xs font-semibold text-orange-600">
                Proactive Maintenance Alerts <FaChevronRight className="ml-1 text-[10px]" />
              </span>
            </div>
          </div>

          {/* Module 3: RDSO Compliance & Automated Audit Reports */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-2xl group-hover:scale-105 transition-transform">
              <FaFilePdf />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated RDSO PDF Dossiers</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Instant generation of standard <strong>Indian Railways P-Way inspection sheets</strong> with digital officer signatures, tamper-proof timestamps, and single-click compliance exports.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                Single-Click Inspection Export <FaChevronRight className="ml-1 text-[10px]" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 5. BLUE BAND: ZONAL RAILWAYS & RDSO ADHERENCE ================= */}
      <section id="divisions" className="bg-[#003366] text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-7">
          
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
              Multi-Division Scalability
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tailored for Indian Railways Zonal & Divisional Hierarchies
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 font-light max-w-2xl mx-auto">
              Automated email-based division routing (<code className="text-amber-300">salem@gmail.com</code>, <code className="text-amber-300">coimbatore@gmail.com</code>, <code className="text-amber-300">delhi@gmail.com</code>, <code className="text-amber-300">mumbai@gmail.com</code>) ensures strict divisional access control.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 items-center justify-center max-w-5xl mx-auto">
            {[
              { name: 'Southern Railway (SR)', sub: 'Coimbatore, Salem, Palakkad & Chennai' },
              { name: 'Northern Railway (NR)', sub: 'Delhi, Lucknow, Moradabad & Firozpur' },
              { name: 'Western Railway (WR)', sub: 'Mumbai Central, Ahmedabad & Vadodara' },
              { name: 'RDSO Lucknow', sub: 'Track Design & Fastener Standards Wing' }
            ].map((lead, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                <div className="text-sm sm:text-base font-extrabold text-white tracking-wide">{lead.name}</div>
                <div className="text-[11px] text-blue-200 font-light mt-1">{lead.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= 6. RDSO SPECIFICATIONS & FASTENER TECHNICAL BREAKDOWN ================= */}
      <section id="specifications" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text / Specs */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="text-xs uppercase font-bold tracking-wider text-blue-600">Track Fastener Engineering</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Full Compliance with Indian Railways Permanent Way Specifications
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              The <strong>RailClip platform</strong> directly maps to standard Indian Railways fastener components, allowing maintenance teams to log and monitor:
            </p>

            <div className="space-y-3">
              {[
                { title: 'ERC Mk-III (RDSO Spec T-3701)', desc: 'Standard 20.6mm spring steel bar clip with 850-1100 kg toe load for PSC sleepers.' },
                { title: 'ERC Mk-V (RDSO Spec T-4001)', desc: 'Heavy-haul 23mm bar clip designed for 25T axle load and dedicated freight corridors (DFC).' },
                { title: 'GFN-66 Insulating Liners', desc: 'Glass Filled Nylon liners tracked for track-circuit insulation and lateral rail hold.' },
                { title: 'Grooved Rubber Sole Plates (GRSP)', desc: '6mm & 10mm composite pads monitored for dynamic attenuation and stress dampening.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Technical Metric Showcase */}
          <div className="lg:col-span-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white shadow-xl border border-slate-700 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-amber-400 font-mono font-bold">INDIAN RAILWAYS BENCHMARK</div>
                <h3 className="text-xl font-bold text-white mt-0.5">Track Fastener Health Metrics</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-slate-400">Toe Load Tolerance</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">8.5 - 11.0 kN</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Automated out-of-range flag</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-slate-400">Axle Capacity</div>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">25.0 Tonnes</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Heavy freight & 160km/h passenger</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-slate-400">Track Gauge</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">1676 mm</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Broad Gauge standard</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-slate-400">Sync Latency</div>
                <div className="text-2xl font-black text-purple-400 font-mono mt-1">&lt; 12 ms</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Cloud Firestore backend</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-900/40 border border-blue-700/50 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Ready for pilot installation in your division?</span>
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all cursor-pointer"
              >
                Access Portal
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* ================= 7. OFFICIAL FOOTER FOR PROPOSAL ================= */}
      <footer className="bg-[#002244] text-white pt-14 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-xs text-blue-200 pb-10 border-b border-white/10">
          
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-amber-300 flex items-center justify-center text-base">
                <FaTrain />
              </div>
              <span>RailClip</span>
            </div>
            <p className="text-blue-200 leading-relaxed font-light text-xs">
              Advanced Elastic Rail Clip (ERC) Lifecycle & Integrity Telemetry System designed for Indian Railways (भारतीय रेल) infrastructure safety and digital track maintenance.
            </p>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">System Modules</h4>
            <ul className="space-y-2 text-blue-200 font-light">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Divisional Command Dashboard</button></li>
              <li><button onClick={() => navigate('/components')} className="hover:text-white transition-colors">ERC Clip Asset Registry</button></li>
              <li><button onClick={() => navigate('/inspections')} className="hover:text-white transition-colors">Field Inspection & QR Scanner</button></li>
              <li><button onClick={() => navigate('/ai-analysis')} className="hover:text-white transition-colors">XGBoost ML Analytics</button></li>
              <li><button onClick={() => navigate('/reports')} className="hover:text-white transition-colors">RDSO Compliance Reports</button></li>
            </ul>
          </div>

          {/* Col 3: Specifications */}
          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Railway Standards</h4>
            <ul className="space-y-2 text-blue-200 font-light">
              <li>RDSO Specification T-3701 (Mk-III)</li>
              <li>RDSO Specification T-4001 (Mk-V)</li>
              <li>Indian Railways Broad Gauge (1676 mm)</li>
              <li>Pre-stressed Concrete (PSC) Sleepers</li>
              <li>Cloud Firestore & Offline Edge Cache</li>
            </ul>
          </div>

          {/* Col 4: Officer Authentication */}
          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Divisional Access</h4>
            <p className="text-blue-200 mb-3 leading-relaxed font-light text-xs">
              Authorized Senior Section Engineers (P-Way), ADENs, and Divisional Railway Managers:
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
            >
              Sign In to Command Portal
            </button>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-blue-300 gap-3">
          <div>
            © {new Date().getFullYear()} RailClip System • Suggested Solution Proposal for Ministry of Railways, Govt. of India.
          </div>
          <div className="flex space-x-5">
            <span className="hover:text-white cursor-pointer">Security Standards</span>
            <span className="hover:text-white cursor-pointer">RDSO Protocols</span>
            <span className="hover:text-white cursor-pointer">P-Way Manual Guidelines</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

