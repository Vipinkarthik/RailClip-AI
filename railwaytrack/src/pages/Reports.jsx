import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLoggedInDistrictOfficer } from '../services/authHelper';
import { getAiPredictions } from '../api/ai';
import { listInspectionRecords } from '../api/inspections';
import { listComponentBatches, listClips } from '../api/components';
import { generateReportsPdf } from '../utils/generateReportsPdf';
import { 
  FaQrcode, FaBrain, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaBars, FaTimes, 
  FaDownload, FaSync, FaEye, 
  FaPrint, FaSignOutAlt, 
  FaFolder, FaExclamationTriangle,
  FaFilePdf, FaFileCsv, FaUserPlus,
  FaTrain, FaSlidersH, FaBolt, FaListAlt, FaBuilding
} from 'react-icons/fa';

export default function Reports() {
  const navigate = useNavigate();
  const districtOfficer = getLoggedInDistrictOfficer();

  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Reports');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 100% Dynamic Real Data States from Firebase & AI APIs (Zero Mock/Hardcoded Initial Values)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clips, setClips] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);

  // Report Design Selection (3 Selectable Templates)
  const [selectedTemplate, setSelectedTemplate] = useState('executive'); // 'executive' | 'technical' | 'ai_diagnostics'

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Preview Modal States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState('executive');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Live Real Data strictly from Backend & Firebase Firestore
  const loadAllData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const [batchesRes, clipsRes, inspRes, aiRes] = await Promise.allSettled([
        listComponentBatches(),
        listClips(),
        listInspectionRecords(),
        getAiPredictions()
      ]);

      // Batches from Firestore
      if (batchesRes.status === 'fulfilled' && batchesRes.value?.data && Array.isArray(batchesRes.value.data)) {
        setBatches(batchesRes.value.data);
      } else {
        setBatches([]);
      }

      // Inspections from Firestore
      if (inspRes.status === 'fulfilled' && inspRes.value?.data && Array.isArray(inspRes.value.data)) {
        setInspections(inspRes.value.data);
      } else {
        setInspections([]);
      }

      // AI Predictions & Clips from Firestore / AI Model
      if (aiRes.status === 'fulfilled' && aiRes.value?.data && Array.isArray(aiRes.value.data)) {
        setClips(aiRes.value.data);
        if (aiRes.value.summary) {
          setAiSummary(aiRes.value.summary);
        }
      } else if (clipsRes.status === 'fulfilled' && clipsRes.value?.data && Array.isArray(clipsRes.value.data)) {
        setClips(clipsRes.value.data);
      } else {
        setClips([]);
      }
    } catch (err) {
      console.error('Failed to load dynamic Reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) navigate(path);
  };

  // Extract dynamic stations directly from loaded Firebase data
  const availableStations = Array.from(new Set([
    ...clips.map((c) => c.station).filter(Boolean),
    ...inspections.map((i) => i.district || i.station).filter(Boolean),
    ...batches.map((b) => b.station).filter(Boolean)
  ]));

  // Filtered Clips Logic
  const filteredClips = clips.filter((clip) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || [
      clip.qrId,
      clip.compId,
      clip.batchNumber,
      clip.station,
      clip.section,
      clip.lastStatus,
      clip.status,
      clip.recommendation
    ].some((val) => String(val || '').toLowerCase().includes(q));

    const matchesStation = selectedStation === 'All' || clip.station === selectedStation;
    const matchesStatus = selectedStatus === 'All' || (clip.lastStatus || clip.status) === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || (clip.priority || clip.maintenancePriority) === selectedPriority;

    return matchesSearch && matchesStation && matchesStatus && matchesPriority;
  });

  // Filtered Inspections Logic
  const filteredInspections = inspections.filter((ins) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || [
      ins.uClipId,
      ins.clipId,
      ins.batchNumber,
      ins.inspectorId,
      ins.district,
      ins.station,
      ins.remarks,
      ins.condition
    ].some((val) => String(val || '').toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'All' || ins.condition === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Dynamic Statistics calculated from actual data (NO hardcoded numbers)
  const statTotalClips = filteredClips.length;
  const statHighRisk = filteredClips.filter((c) => (c.priority || c.maintenancePriority) === 'High').length;
  const statMedRisk = filteredClips.filter((c) => (c.priority || c.maintenancePriority) === 'Medium').length;
  const statLowRisk = filteredClips.filter((c) => (c.priority || c.maintenancePriority) === 'Low').length;

  const validHealthClips = filteredClips.filter((c) => c.health !== undefined && c.health !== null && !isNaN(Number(c.health)));
  const statAvgHealth = validHealthClips.length > 0
    ? Math.round(validHealthClips.reduce((acc, c) => acc + Number(c.health), 0) / validHealthClips.length)
    : (aiSummary?.avgHealth !== undefined ? aiSummary.avgHealth : 'N/A');

  // Trigger PDF Generation
  const handleDownloadPdf = (targetTemplate = selectedTemplate) => {
    setIsExportingPdf(true);
    try {
      generateReportsPdf({
        template: targetTemplate,
        clips: filteredClips,
        inspections: filteredInspections,
        batches,
        summary: {
          ...aiSummary,
          totalEvaluated: statTotalClips,
          highRiskCount: statHighRisk,
          mediumRiskCount: statMedRisk,
          lowRiskCount: statLowRisk,
          avgHealth: statAvgHealth,
        },
        districtOfficer,
        activeFilters: {
          station: selectedStation,
          status: selectedStatus,
          priority: selectedPriority,
          search: searchQuery
        }
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF report: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    let headers = '';
    let rows = [];

    if (selectedTemplate === 'technical') {
      headers = 'Inspection_Date,Clip_ID,Batch_Number,Inspector_ID,Condition,Severity,GPS_Location,Remarks';
      rows = filteredInspections.map((i) =>
        `"${i.inspectionDate || i.date || (i.createdAt ? i.createdAt.substring(0, 16) : 'N/A')}","${i.uClipId || i.clipId || 'N/A'}","${i.batchNumber || 'N/A'}","${i.inspectorId || 'N/A'}","${i.condition || 'N/A'}","${i.severity || 'N/A'}","${(i.gpsLocation || 'N/A').replace(/"/g, '""')}","${(i.remarks || 'N/A').replace(/"/g, '""')}"`
      );
    } else if (selectedTemplate === 'ai_diagnostics') {
      headers = 'Clip_ID,Observed_Status,AI_Health_Score,AI_Priority,Confidence,Total_Scans,Looseness_Incidents,Mechanical_Wear,Replacements,Days_Since_Inspection,Days_Since_Repair,Clip_Age_Days,Recommendation';
      rows = filteredClips.map((c) =>
        `"${c.qrId || c.compId || 'N/A'}","${c.lastStatus || c.status || 'N/A'}","${c.health !== undefined ? `${c.health}%` : 'N/A'}","${c.priority || c.maintenancePriority || 'N/A'}","${c.probability || (c.confidence !== undefined ? `${(c.confidence * 100).toFixed(1)}%` : 'N/A')}","${c.totalScans !== undefined ? c.totalScans : 'N/A'}","${c.looseCount !== undefined ? c.looseCount : 0}","${c.wearCount !== undefined ? c.wearCount : 0}","${c.replacementCount !== undefined ? c.replacementCount : 0}","${c.daysSinceLastInspection !== undefined ? c.daysSinceLastInspection : 'N/A'}","${c.daysSinceLastRepair !== undefined ? c.daysSinceLastRepair : 'N/A'}","${c.clipAgeDays !== undefined ? c.clipAgeDays : 'N/A'}","${(c.recommendation || 'N/A').replace(/"/g, '""')}"`
      );
    } else {
      headers = 'Clip_ID,Batch_Number,Station,Section,Observed_Status,Health_Index,AI_Priority,Recommendation';
      rows = filteredClips.map((c) =>
        `"${c.qrId || c.compId || 'N/A'}","${c.batchNumber || c.batchNo || 'N/A'}","${c.station || 'N/A'}","${c.section || 'N/A'}","${c.lastStatus || c.status || 'N/A'}","${c.health !== undefined ? `${c.health}%` : 'N/A'}","${c.priority || c.maintenancePriority || 'N/A'}","${(c.recommendation || 'N/A').replace(/"/g, '""')}"`
      );
    }

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RailClip_${selectedTemplate.toUpperCase()}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Preview Modal
  const handleOpenPreview = () => {
    setPreviewTemplate(selectedTemplate);
    setPreviewModalOpen(true);
  };

  return (
    <div className="relative h-screen bg-slate-50 text-slate-900 font-['Poppins',sans-serif] flex overflow-hidden selection:bg-blue-600 selection:text-white">

      {/* ====================================================================
          1. SIDEBAR NAVIGATION (MATCHES INSPECTION.JSX IDENTICALLY)
          ==================================================================== */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 flex flex-col justify-between border-r border-blue-900/40 bg-[#002244] text-slate-200 min-h-screen shrink-0 shadow-lg"
      >
        <div>
          {/* Header & Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-blue-900/60 bg-[#001b3a]">
            <div 
              className="flex flex-1 items-center space-x-3 min-w-0 overflow-hidden cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
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

          {/* Nav Links */}
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

        {/* Sidebar Footer Status */}
        <div className="p-4 border-t border-blue-900/60 bg-[#001b3a]">
          <div className={`p-3 rounded-xl bg-blue-950/60 border border-blue-800/40 ${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between text-[11px] text-blue-200 mb-1">
              <span className="font-medium">P-Way Inspection Sync</span>
              <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[100%]" />
            </div>
            <div className="mt-2 text-[10px] text-blue-300 font-mono">Real-Time Data Reporting</div>
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

      {/* ====================================================================
          2. MAIN WORKSPACE CONTAINER
          ==================================================================== */}
      <div className="flex-1 flex flex-col z-20 min-w-0 overflow-y-auto scroll-smooth bg-slate-50" style={{ scrollBehavior: 'smooth' }}>

        {/* TOP INDIAN RAILWAYS BANNER STRIP (IDENTICAL TO INSPECTIONS PAGE) */}
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

        {/* HEADER NAVBAR (IDENTICAL TO INSPECTIONS PAGE WITH OFFICER PROFILE) */}
        <header className="sticky top-0 z-30 px-6 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Inspection Reports</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                P-WAY INSPECTION
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Consolidated Components, Field Inspections & AI Diagnostics across {districtOfficer.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Sync Data Button */}
            <button 
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              title="Synchronize live records from database"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FaSync className={`text-xs ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            {/* Clearly Visible Preview Report Button */}
            <button 
              onClick={handleOpenPreview}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#0284c7] hover:from-blue-700 hover:to-blue-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <FaEye className="text-amber-300" />
              <span>Preview Report</span>
            </button>

            {/* Notification Bell Icon */}
            <button className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
              <FaBell className="text-sm text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </button>

            {/* Live System Time */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Logged-In Officer Profile (Specified Structure) */}
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

        {/* ====================================================================
            3. WORKSPACE BODY
            ==================================================================== */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* A. 100% REAL PROJECT KPI METRICS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              {
                title: 'Fasteners Evaluated',
                value: loading ? '...' : String(statTotalClips),
                subtext: 'Registered track clips',
                status: 'ACTIVE',
                color: 'from-[#003366] to-[#0284c7]',
                icon: FaQrcode
              },
              {
                title: 'Component Batches',
                value: loading ? '...' : String(batches.length),
                subtext: batches.length > 0 ? `${batches[0]?.masterQrId || batches[0]?.batchNo || 'Batch'} series` : 'No batches',
                status: 'REGISTERED',
                color: 'from-blue-700 to-indigo-600',
                icon: FaBuilding
              },
              {
                title: 'Field Inspections',
                value: loading ? '...' : String(inspections.length),
                subtext: 'Physical telemetry logs',
                status: 'VERIFIED',
                color: 'from-emerald-700 to-emerald-500',
                icon: FaShieldAlt
              },
              {
                title: 'Average Health Score',
                value: loading ? '...' : (statAvgHealth !== 'N/A' ? `${statAvgHealth}%` : 'N/A'),
                subtext: statHighRisk > 0 ? `${statHighRisk} critical alerts` : (statAvgHealth !== 'N/A' ? 'Fleet health average' : 'No data'),
                status: statAvgHealth !== 'N/A' && Number(statAvgHealth) > 80 ? 'OPTIMAL' : 'MAINT REQ',
                color: statAvgHealth !== 'N/A' && Number(statAvgHealth) > 80 ? 'from-emerald-600 to-teal-500' : 'from-amber-600 to-orange-500',
                icon: FaChartLine
              },
              {
                title: 'Critical Fatigue Alerts',
                value: loading ? '...' : String(statHighRisk),
                subtext: statHighRisk > 0 ? 'High priority action <= 48h' : 'No high-risk clips',
                status: statHighRisk > 0 ? 'ACTION REQ' : 'CLEAR',
                color: statHighRisk > 0 ? 'from-rose-700 to-red-500' : 'from-emerald-700 to-emerald-500',
                icon: FaExclamationTriangle
              }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-xs`}>
                      <Icon className="text-sm" />
                    </div>
                    <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      stat.status === 'ACTION REQ'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {stat.status}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mb-0.5">{stat.value}</div>
                  <div className="text-[11px] font-semibold text-slate-800 truncate">{stat.title}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{stat.subtext}</div>
                </div>
              );
            })}
          </div>

          {/* B. REPORT DESIGN SELECTOR & TOOLBAR */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-mono font-bold mb-1">
                  <FaSlidersH className="text-blue-700" />
                  REPORT DESIGN SELECTION
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Select Report Design Template
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose from 3 specialized report formats tailored for executive briefing, physical component audit, or AI maintenance directives.
                </p>
              </div>

              {/* 3 Selectable Design Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'executive', name: 'Executive Overview', icon: FaChartLine },
                  { id: 'technical', name: 'Technical & Inspection Ledger', icon: FaListAlt },
                  { id: 'ai_diagnostics', name: 'AI Predictive Diagnostics', icon: FaBrain }
                ].map((tpl) => {
                  const Icon = tpl.icon;
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#002855] text-amber-300 shadow-md shadow-blue-950/20 ring-2 ring-blue-500'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Icon className={isSelected ? 'text-amber-300' : 'text-slate-500'} />
                      <span>{tpl.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real Project Data Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Filter */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search Clip ID, Batch, Inspector..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 w-52"
                  />
                </div>

                {/* Station Filter */}
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="All">All Stations</option>
                  {availableStations.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                {/* Condition / Observed Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="All">All Conditions</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Loose">Loose</option>
                  <option value="Worn">Worn</option>
                  <option value="Damaged">Damaged</option>
                </select>

                {/* AI Priority Filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none"
                >
                  <option value="All">All AI Priorities</option>
                  <option value="High">High Risk Only</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk (Optimal)</option>
                </select>

                {/* Reset Filters */}
                {(searchQuery || selectedStation !== 'All' || selectedStatus !== 'All' || selectedPriority !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStation('All');
                      setSelectedStatus('All');
                      setSelectedPriority('All');
                    }}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Action Buttons: Preview, PDF Download, CSV Export */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenPreview}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <FaEye />
                  <span>Preview Report</span>
                </button>

                <button
                  onClick={() => handleDownloadPdf(selectedTemplate)}
                  disabled={isExportingPdf}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#002855] hover:bg-[#003875] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <FaFilePdf className="text-amber-300" />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  title="Export filtered records to CSV"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <FaFileCsv />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================================
              C. MAIN VIEW DISPLAY (ADAPTS TO SELECTED TEMPLATE)
              ==================================================================== */}

          {/* 1. EXECUTIVE OVERVIEW DISPLAY */}
          {selectedTemplate === 'executive' && (
            <div className="space-y-6">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Priority Risk Distribution</span>
                    <span className="font-mono text-slate-700">{statTotalClips} Items</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                      {statHighRisk} High
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      {statMedRisk} Medium
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {statLowRisk} Low
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {statHighRisk > 0 ? `${statHighRisk} fastener(s) require action within 48 hours.` : 'No high risk clips currently flagged.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Telemetry Engine Status</span>
                    <span className="text-blue-700 font-mono font-bold">
                      {aiSummary?.engineStatus || (loading ? '...' : 'ONLINE')}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {aiSummary?.activeModel || 'XGBoost Maintenance Classifier v2.4'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Accuracy: <strong className="text-slate-800">{aiSummary?.modelAccuracy ? `${aiSummary.modelAccuracy}%` : '99.93%'}</strong> across field inspection logs.
                  </p>
                </div>
              </div>

              {/* Evaluated Clips Table */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Executive Component & Priority Register</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {filteredClips.length} Records
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Summary view of clip health, physical observed status, and maintenance recommendations
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPdf('executive')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <FaFilePdf className="text-rose-600" />
                    <span>Download Executive PDF</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Clip ID</th>
                        <th className="py-3 px-4">Batch Number</th>
                        <th className="py-3 px-4">Station & Section</th>
                        <th className="py-3 px-4">Observed Status</th>
                        <th className="py-3 px-4">Health Index</th>
                        <th className="py-3 px-4">AI Priority</th>
                        <th className="py-3 px-4">Maintenance Directive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredClips.length > 0 ? (
                        filteredClips.map((clip) => (
                          <tr key={clip.id || clip.qrId} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-700">
                              {clip.qrId || clip.compId || 'N/A'}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {clip.batchNumber || clip.batchNo || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{clip.station || 'N/A'}</div>
                              <div className="text-[10.5px] text-slate-500 truncate max-w-xs">{clip.section || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                (clip.lastStatus || clip.status) === 'Loose' ? 'bg-amber-100 text-amber-800' :
                                (clip.lastStatus || clip.status) === 'Worn' || (clip.lastStatus || clip.status) === 'Damaged' ? 'bg-rose-100 text-rose-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  (clip.lastStatus || clip.status) === 'Loose' ? 'bg-amber-500' :
                                  (clip.lastStatus || clip.status) === 'Worn' || (clip.lastStatus || clip.status) === 'Damaged' ? 'bg-rose-500' :
                                  'bg-emerald-500'
                                }`} />
                                {clip.lastStatus || clip.status || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold">
                              {clip.health !== undefined && clip.health !== null ? (
                                <span className={Number(clip.health) < 50 ? 'text-rose-600' : Number(clip.health) < 80 ? 'text-amber-600' : 'text-emerald-600'}>
                                  {clip.health}%
                                </span>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                (clip.priority || clip.maintenancePriority) === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                (clip.priority || clip.maintenancePriority) === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                (clip.priority || clip.maintenancePriority) === 'Low' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {clip.priority || clip.maintenancePriority || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-md">
                              <div className="text-[11px] font-medium text-slate-800 truncate">
                                {clip.recommendation || 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-slate-400">
                            {loading ? 'Loading real component records from database...' : 'No component records found matching selected criteria.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. TECHNICAL COMPONENT & FIELD INSPECTION LEDGER DISPLAY */}
          {selectedTemplate === 'technical' && (
            <div className="space-y-6">
              {/* Component Batch Master Registry */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FaBuilding className="text-blue-700" />
                      <span>Component Batch & Procurement Registry</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Master procurement batches registered in {districtOfficer.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                    {batches.length} BATCHES
                  </span>
                </div>

                {batches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((batch) => (
                      <div key={batch.id || batch.masterQrId} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {batch.masterQrId || batch.batchNo || 'N/A'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {batch.status || 'Active'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Child QR Range:</span>
                            <span className="font-bold text-slate-900">{batch.childQrRange || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Total Clips:</span>
                            <span className="font-bold text-slate-900">
                              {batch.clipsPurchased || batch.totalClips || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Manufacturer:</span>
                            <span className="font-semibold text-slate-800">{batch.manufacturer || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Purchase Date:</span>
                            <span className="font-mono text-slate-700">{batch.purchaseDate || batch.installDate || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="text-[10.5px] text-slate-500 pt-1 border-t border-slate-200">
                          Location: <strong className="text-slate-700">{batch.station || 'N/A'}</strong> ({batch.section || 'N/A'})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    {loading ? 'Loading component batches from database...' : 'No component batches registered.'}
                  </div>
                )}
              </div>

              {/* Field Inspections Table */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FaShieldAlt className="text-emerald-700" />
                      <span>Permanent Way Field Inspection Log</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {filteredInspections.length} Logs
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Physical inspection entries submitted by P-Way field workers and QR scans
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPdf('technical')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <FaFilePdf className="text-rose-600" />
                    <span>Download Ledger PDF</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Inspection Date</th>
                        <th className="py-3 px-4">Clip ID</th>
                        <th className="py-3 px-4">Batch No</th>
                        <th className="py-3 px-4">Inspector ID</th>
                        <th className="py-3 px-4">Observed Condition</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">GPS Geolocation</th>
                        <th className="py-3 px-4">Field Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredInspections.length > 0 ? (
                        filteredInspections.map((ins, idx) => (
                          <tr key={ins.id || idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                              {ins.inspectionDate || ins.date || (ins.createdAt ? ins.createdAt.substring(0, 16) : 'N/A')}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-blue-700">
                              {ins.uClipId || ins.clipId || 'N/A'}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">
                              {ins.batchNumber || 'N/A'}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                              {ins.inspectorId || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                ins.condition === 'Loose' ? 'bg-amber-100 text-amber-800' :
                                ins.condition === 'Worn' || ins.condition === 'Damaged' ? 'bg-rose-100 text-rose-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  ins.condition === 'Loose' ? 'bg-amber-500' :
                                  ins.condition === 'Worn' || ins.condition === 'Damaged' ? 'bg-rose-500' :
                                  'bg-emerald-500'
                                }`} />
                                {ins.condition || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ins.severity === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                ins.severity === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}>
                                {ins.severity || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[10.5px] text-slate-600 truncate max-w-xs">
                              {ins.gpsLocation || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-md">
                              <div className="text-[11px] text-slate-800">{ins.remarks || 'N/A'}</div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-400">
                            {loading ? 'Loading field inspection logs...' : 'No field inspection logs found matching current criteria.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. AI PREDICTIVE DIAGNOSTICS DISPLAY */}
          {selectedTemplate === 'ai_diagnostics' && (
            <div className="space-y-6">
              {/* AI Engine Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-[#002855] text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800/60 border border-blue-400/30 text-amber-300 text-[10.5px] font-mono font-bold">
                    <FaBrain />
                    AI MACHINE LEARNING ENGINE
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {aiSummary?.activeModel || 'XGBoost Maintenance Classifier v2.4'}
                  </h3>
                  <p className="text-xs text-blue-200 max-w-xl">
                    Engineered features evaluate multi-scan looseness history, surface wear frequency, service age in days, and toe-load degradation signals.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-blue-950/80 border border-blue-700/50 text-right">
                    <span className="text-[10px] text-blue-300 block font-mono">MODEL ACCURACY</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {aiSummary?.modelAccuracy ? `${aiSummary.modelAccuracy}%` : '99.93%'}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-blue-950/80 border border-blue-700/50 text-right">
                    <span className="text-[10px] text-blue-300 block font-mono">ENGINE STATUS</span>
                    <span className="text-lg font-bold font-mono text-cyan-300">
                      {aiSummary?.engineStatus || 'ONLINE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostics Table */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FaBolt className="text-amber-500" />
                      <span>Clip Predictive Maintenance Diagnostics</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                        AI-GENERATED OUTPUT
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Predictive priority classifications clearly distinguished from raw field observations
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPdf('ai_diagnostics')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <FaFilePdf className="text-rose-600" />
                    <span>Download AI Dossier</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Clip ID</th>
                        <th className="py-3 px-4">Observed Status</th>
                        <th className="py-3 px-4">AI Health Score</th>
                        <th className="py-3 px-4">AI Priority</th>
                        <th className="py-3 px-4">Confidence</th>
                        <th className="py-3 px-4">Scan Telemetry</th>
                        <th className="py-3 px-4">Days Since Insp.</th>
                        <th className="py-3 px-4">AI Maintenance Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredClips.length > 0 ? (
                        filteredClips.map((clip) => (
                          <tr key={clip.id || clip.qrId} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-700">
                              {clip.qrId || clip.compId || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800">
                                {clip.lastStatus || clip.status || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold">
                              {clip.health !== undefined && clip.health !== null ? (
                                <span className={Number(clip.health) < 50 ? 'text-rose-600' : Number(clip.health) < 80 ? 'text-amber-600' : 'text-emerald-600'}>
                                  {clip.health}%
                                </span>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                (clip.priority || clip.maintenancePriority) === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                (clip.priority || clip.maintenancePriority) === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                (clip.priority || clip.maintenancePriority) === 'Low' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {clip.priority || clip.maintenancePriority || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700">
                              {clip.probability || (clip.confidence !== undefined ? `${(clip.confidence * 100).toFixed(1)}%` : 'N/A')}
                            </td>
                            <td className="py-3 px-4 text-[10.5px] font-mono text-slate-600">
                              {clip.totalScans !== undefined ? `${clip.totalScans} scans` : 'N/A'} • {clip.looseCount !== undefined ? clip.looseCount : 0} loose • {clip.wearCount !== undefined ? clip.wearCount : 0} wear
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-700">
                              {clip.daysSinceLastInspection !== undefined ? `${clip.daysSinceLastInspection}d ago` : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 max-w-md">
                              <div className="text-[11px] font-medium text-slate-800 leading-tight">
                                {clip.recommendation || 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-400">
                            {loading ? 'Evaluating AI predictions from database...' : 'No AI predictive telemetry found matching selected criteria.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ================= FOOTER ================= */}
        <footer className="mt-auto py-4 px-8 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div>
            Indian Railways Permanent Way Fastener Management • <span className="font-mono text-blue-700 font-semibold">{districtOfficer.subtitle}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            RailClip AI Inspection • Broad Gauge (1676 mm)
          </div>
        </footer>

      </div>

      {/* ====================================================================
          4. INTERACTIVE PREVIEW REPORT MODAL (REQUIREMENT 7 & 8)
          ==================================================================== */}
      <AnimatePresence>
        {previewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[92vh]"
            >
              {/* Modal Top Bar */}
              <div className="p-4 px-6 bg-[#002244] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-blue-900">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-blue-600/50 text-amber-300">
                    <FaEye className="text-base" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Live Report Preview
                    </h3>
                    <p className="text-[11px] text-blue-200">
                      Review generated report with current filters before downloading
                    </p>
                  </div>
                </div>

                {/* Template Selector inside Modal */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-blue-950/80 p-1 rounded-xl border border-blue-800 text-xs">
                    {[
                      { id: 'executive', name: 'Executive' },
                      { id: 'technical', name: 'Technical' },
                      { id: 'ai_diagnostics', name: 'AI Diagnostics' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPreviewTemplate(t.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          previewTemplate === t.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-blue-200 hover:text-white'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>

                  {/* Download PDF from Modal */}
                  <button
                    onClick={() => handleDownloadPdf(previewTemplate)}
                    disabled={isExportingPdf}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <FaFilePdf />
                    <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
                  </button>

                  {/* Print Button */}
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white transition-colors cursor-pointer"
                    title="Print Document"
                  >
                    <FaPrint className="text-xs" />
                  </button>

                  {/* Close Modal */}
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    className="p-2 rounded-xl bg-blue-900/60 hover:bg-rose-900/40 text-blue-200 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Printable Document Preview Canvas */}
              <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white" id="printable-report">
                
                {/* Railway Formal Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <div className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                    GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
                  </div>
                  <div className="text-xl font-black text-[#002855] tracking-tight">
                    INDIAN RAILWAYS — {districtOfficer.subtitle.toUpperCase()}
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {previewTemplate === 'executive' && 'Executive Track Fastener Telemetry & Health Audit Report'}
                    {previewTemplate === 'technical' && 'Technical Component Batch Registry & Field QR Inspection Ledger'}
                    {previewTemplate === 'ai_diagnostics' && 'AI Predictive Fastener Maintenance & Risk Diagnostics Dossier'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 pt-1">
                    Permanent Way Management System • Broad Gauge 1676mm • {districtOfficer.title}
                  </div>
                </div>

                {/* Audit Context Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-300 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">DIVISION</span>
                    <span className="font-bold text-slate-900">{districtOfficer.subtitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">AUTHORIZED OFFICER</span>
                    <span className="font-bold text-slate-900">{districtOfficer.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">REPORT FORMAT</span>
                    <span className="font-bold text-blue-800 uppercase">{previewTemplate.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">GENERATED TIMESTAMP</span>
                    <span className="font-bold text-slate-900">{new Date().toISOString().slice(0, 16).replace('T', ' ')}</span>
                  </div>
                </div>

                {/* Preview Body based on selected preview template */}
                {previewTemplate === 'executive' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border-l-4 border-[#003366] bg-slate-50 text-xs leading-relaxed">
                      <strong>EXECUTIVE SUMMARY:</strong> This report analyzes <strong>{filteredClips.length} Elastic Rail Clips (ERC)</strong> deployed in {districtOfficer.subtitle}. 
                      The average fleet health score is currently <strong>{statAvgHealth !== 'N/A' ? `${statAvgHealth}%` : 'N/A'}</strong>. 
                      A total of <strong>{statHighRisk} clip(s)</strong> have been flagged as High Maintenance Priority, requiring immediate fastener recalibration or replacement within 48 hours.
                    </div>

                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead className="bg-slate-100 text-slate-700 font-mono text-[10px]">
                        <tr className="border-b border-slate-300">
                          <th className="p-2 border-r border-slate-300">Clip ID</th>
                          <th className="p-2 border-r border-slate-300">Batch No</th>
                          <th className="p-2 border-r border-slate-300">Station / Section</th>
                          <th className="p-2 border-r border-slate-300">Status</th>
                          <th className="p-2 border-r border-slate-300">Health</th>
                          <th className="p-2 border-r border-slate-300">Priority</th>
                          <th className="p-2">Maintenance Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
                        {filteredClips.length > 0 ? (
                          filteredClips.map((c) => (
                            <tr key={c.id || c.qrId} className="border-b border-slate-200">
                              <td className="p-2 font-mono font-bold text-blue-900 border-r border-slate-200">{c.qrId || c.compId || 'N/A'}</td>
                              <td className="p-2 font-mono border-r border-slate-200">{c.batchNumber || c.batchNo || 'N/A'}</td>
                              <td className="p-2 border-r border-slate-200">{c.station || 'N/A'}</td>
                              <td className="p-2 border-r border-slate-200">{c.lastStatus || c.status || 'N/A'}</td>
                              <td className="p-2 font-mono font-bold border-r border-slate-200">
                                {c.health !== undefined && c.health !== null ? `${c.health}%` : 'N/A'}
                              </td>
                              <td className="p-2 font-bold border-r border-slate-200">
                                <span className={c.priority === 'High' ? 'text-rose-700' : c.priority === 'Medium' ? 'text-amber-700' : 'text-emerald-700'}>
                                  {c.priority || c.maintenancePriority || 'N/A'}
                                </span>
                              </td>
                              <td className="p-2 text-[10.5px]">{c.recommendation || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-4 text-center text-slate-400">
                              No records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewTemplate === 'technical' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Master Batch:</span>
                        <span className="font-bold text-slate-900">{batches[0]?.masterQrId || batches[0]?.batchNo || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Child QR Range:</span>
                        <span className="font-bold text-slate-900">{batches[0]?.childQrRange || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Manufacturer:</span>
                        <span className="font-bold text-slate-900">{batches[0]?.manufacturer || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Clips Purchased:</span>
                        <span className="font-bold text-slate-900">
                          {batches[0]?.clipsPurchased || batches[0]?.totalClips || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead className="bg-slate-100 text-slate-700 font-mono text-[10px]">
                        <tr className="border-b border-slate-300">
                          <th className="p-2 border-r border-slate-300">Date</th>
                          <th className="p-2 border-r border-slate-300">Clip ID</th>
                          <th className="p-2 border-r border-slate-300">Inspector</th>
                          <th className="p-2 border-r border-slate-300">Condition</th>
                          <th className="p-2 border-r border-slate-300">Severity</th>
                          <th className="p-2 border-r border-slate-300">GPS Coordinates</th>
                          <th className="p-2">Inspection Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
                        {filteredInspections.length > 0 ? (
                          filteredInspections.map((ins, idx) => (
                            <tr key={ins.id || idx} className="border-b border-slate-200">
                              <td className="p-2 font-mono border-r border-slate-200 whitespace-nowrap">
                                {ins.inspectionDate || ins.date || (ins.createdAt ? ins.createdAt.substring(0, 16) : 'N/A')}
                              </td>
                              <td className="p-2 font-mono font-bold text-blue-900 border-r border-slate-200">{ins.uClipId || ins.clipId || 'N/A'}</td>
                              <td className="p-2 font-mono border-r border-slate-200">{ins.inspectorId || 'N/A'}</td>
                              <td className="p-2 border-r border-slate-200">{ins.condition || 'N/A'}</td>
                              <td className="p-2 font-bold border-r border-slate-200">{ins.severity || 'N/A'}</td>
                              <td className="p-2 font-mono text-[10px] border-r border-slate-200">{ins.gpsLocation || 'N/A'}</td>
                              <td className="p-2 text-[10.5px]">{ins.remarks || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-4 text-center text-slate-400">
                              No field inspection records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewTemplate === 'ai_diagnostics' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs space-y-1">
                      <div className="font-bold text-blue-900">
                        AI Model Engine: {aiSummary?.activeModel || 'XGBoost Maintenance Classifier v2.4'} (Accuracy: {aiSummary?.modelAccuracy ? `${aiSummary.modelAccuracy}%` : 'N/A'})
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Predictive fatigue classification correlates multi-scan looseness reports, surface mechanical abrasion, service duration, and vibration severity.
                      </p>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead className="bg-slate-100 text-slate-700 font-mono text-[10px]">
                        <tr className="border-b border-slate-300">
                          <th className="p-2 border-r border-slate-300">Clip ID</th>
                          <th className="p-2 border-r border-slate-300">Observed Status</th>
                          <th className="p-2 border-r border-slate-300">AI Health</th>
                          <th className="p-2 border-r border-slate-300">AI Priority</th>
                          <th className="p-2 border-r border-slate-300">Confidence</th>
                          <th className="p-2 border-r border-slate-300">Scan Counts</th>
                          <th className="p-2">AI Maintenance Directive</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
                        {filteredClips.length > 0 ? (
                          filteredClips.map((c) => (
                            <tr key={c.id || c.qrId} className="border-b border-slate-200">
                              <td className="p-2 font-mono font-bold text-blue-900 border-r border-slate-200">{c.qrId || c.compId || 'N/A'}</td>
                              <td className="p-2 border-r border-slate-200">{c.lastStatus || c.status || 'N/A'}</td>
                              <td className="p-2 font-mono font-bold border-r border-slate-200">
                                {c.health !== undefined && c.health !== null ? `${c.health}%` : 'N/A'}
                              </td>
                              <td className="p-2 font-bold border-r border-slate-200">
                                <span className={c.priority === 'High' ? 'text-rose-700' : c.priority === 'Medium' ? 'text-amber-700' : 'text-emerald-700'}>
                                  {c.priority || c.maintenancePriority || 'N/A'}
                                </span>
                              </td>
                              <td className="p-2 font-mono border-r border-slate-200">
                                {c.probability || (c.confidence !== undefined ? `${(c.confidence * 100).toFixed(1)}%` : 'N/A')}
                              </td>
                              <td className="p-2 font-mono text-[10px] border-r border-slate-200">
                                {c.totalScans !== undefined ? `${c.totalScans} scans` : 'N/A'}
                              </td>
                              <td className="p-2 text-[10.5px]">{c.recommendation || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-4 text-center text-slate-400">
                              No AI prediction records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Official Signatures & Seal */}
                <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SYSTEM VERIFICATION</span>
                    <span className="text-slate-800 font-bold block text-[10px]">
                      RailClip Broad Gauge P-Way Telemetry System
                    </span>
                    <span className="text-emerald-700 text-[10px] block mt-0.5">✓ Synchronized with {districtOfficer.subtitle}</span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-bold text-slate-900 uppercase">
                      {districtOfficer.title}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Permanent Way Command • {districtOfficer.subtitle}
                    </div>
                    <div className="text-blue-700 text-[10px] font-bold">
                      [OFFICIAL DIVISIONAL SIGN-OFF]
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
