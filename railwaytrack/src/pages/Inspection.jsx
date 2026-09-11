import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLoggedInDistrictOfficer } from '../services/authHelper';
import { BrowserQRCodeReader } from '@zxing/browser';
import { lookupComponentByQr, saveInspectionRecord, listInspectionRecords } from '../api/inspections';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaUserCircle, FaBars, FaTimes, 
  FaPlus, FaFilter, FaDownload, FaSync, FaEye, FaEdit, 
  FaTrash, FaPrint, FaMapMarkerAlt, FaCogs, FaSignOutAlt, 
  FaFolder, FaMicrochip, FaExclamationTriangle, FaCheckCircle, 
  FaTools, FaCalendarAlt, FaBuilding, FaIndustry, FaCheck,
  FaArrowRight, FaLayerGroup, FaHistory, FaInfoCircle, FaCamera,
  FaUpload, FaStop, FaCloudUploadAlt, FaSun, FaCloudRain, FaSmog, FaMoon, FaUserPlus,
  FaTrain
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

/* ==========================================================================
   REST-API READY DATASTRUCTURES & HELPERS
   ========================================================================== */

async function decodeQrTextFromImageFile(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Unable to load image file.'));
      img.src = objectUrl;
    });
    const reader = new BrowserQRCodeReader();
    const result = await reader.decodeFromImageElement(image);
    return result.getText();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function parseChildQrText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: false, error: 'Invalid QR Code: Empty QR data.' };
  }
  const text = rawText.trim();
  if (!text) {
    return { isValid: false, error: 'Invalid QR Code: Empty QR data.' };
  }

  let batchNo = '';
  let uClipID = '';

  // 1. JSON format (with case-insensitive key normalization)
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      const normalized = {};
      for (const k of Object.keys(parsed)) {
        normalized[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = parsed[k];
      }
      batchNo = String(normalized.batchno || normalized.batchnumber || normalized.batch || normalized.masterqrid || '').trim();
      uClipID = String(normalized.uclipid || normalized.clipid || normalized.compid || normalized.uclip || '').trim();

      if (batchNo && uClipID) {
        return {
          isValid: true,
          batchNumber: batchNo,
          uClipId: uClipID,
          district: normalized.district || normalized.districtname || '',
          divisionSection: normalized.divisionsection || normalized.dsection || normalized.section || normalized.division || '',
          fixedBy: normalized.fixedby || normalized.employee || normalized.worker || '',
          gpsGeolocation: normalized.gpsgeolocation || normalized.geolocation || normalized.gps || (normalized.latitude && normalized.longitude ? `${normalized.latitude}, ${normalized.longitude}` : (normalized.lat && normalized.lng ? `${normalized.lat}, ${normalized.lng}` : '')),
          manufacturer: normalized.manufacturer || normalized.purchasedfrom || '',
          purchaseDate: normalized.purchasedate || normalized.dateofpurchase || '',
        };
      } else {
        return {
          isValid: false,
          error: 'Invalid QR Code: Missing required fields ("batchNo" and "uClipID").',
        };
      }
    }
  } catch {}

  // 2. Multiline / Key-Value / Pipe format
  const lines = text.split(/[\r\n;]+/).map((l) => l.trim()).filter(Boolean);
  const result = {
    batchNumber: '',
    uClipId: '',
    district: '',
    divisionSection: '',
    fixedBy: '',
    gpsGeolocation: '',
    manufacturer: '',
    purchaseDate: '',
  };

  // First pass: Direct Key: Value or Key = Value
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kvMatch = line.match(/^([^:=]+)[:=]\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const val = kvMatch[2].trim();
      if (key.includes('batch')) result.batchNumber = val;
      else if (key.includes('clip') || key.includes('uclip')) result.uClipId = val;
      else if (key.includes('district')) result.district = val;
      else if (key.includes('section') || key.includes('division') || key.includes('dsection')) result.divisionSection = val;
      else if (key.includes('fixed') || key.includes('employee') || key.includes('worker')) result.fixedBy = val;
      else if (key.includes('gps') || key.includes('geo') || key.includes('location') || key.includes('coord')) result.gpsGeolocation = val;
      else if (key.includes('manufacturer') || key.includes('purchasedfrom')) result.manufacturer = val;
      else if (key.includes('purchase') || key.includes('date')) result.purchaseDate = val;
    }
  }

  // Fallback token extraction for multiline child QR
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!result.batchNumber && (line.match(/^BATCH\d+$/i) || line.match(/^MB\d+$/i) || line.toLowerCase() === 'batchnumber' || line.toLowerCase() === 'batchno')) {
      if (line.match(/^[A-Z]+\d+$/i)) result.batchNumber = line.toUpperCase();
      else if (lines[i + 1]) { result.batchNumber = lines[i + 1]; }
    }
    if (!result.uClipId && (line.match(/^[A-Z]\d{3,5}$/i) || line.match(/^RL\d{3,5}$/i) || line.toLowerCase() === 'uclipid' || line.toLowerCase() === 'clipid')) {
      if (line.match(/^[A-Z]+\d+$/i)) result.uClipId = line.toUpperCase();
      else if (lines[i + 1]) { result.uClipId = lines[i + 1]; }
      else if (lines[i - 1]) { result.uClipId = lines[i - 1]; }
    }
    if (!result.district && line.match(/^(COIMBATORE|CHENNAI|MADURAI|SALEM|TRICHY|TIRUPPUR|ERODE|TIRUNELVELI|VELLORE)$/i)) {
      result.district = line.toUpperCase();
    }
    if (!result.divisionSection && line.match(/^D-?\d+$/i)) {
      result.divisionSection = line.toUpperCase();
    }
    if (!result.fixedBy && (line.includes('(RT') || line.match(/^RT[A-Z]{2,4}\d{3,5}$/i))) {
      result.fixedBy = line;
    }
    if (!result.gpsGeolocation && line.match(/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/)) {
      result.gpsGeolocation = line;
    }
  }

  if (result.batchNumber && result.uClipId) {
    return {
      isValid: true,
      ...result,
    };
  }

  return {
    isValid: false,
    error: 'Invalid QR Code: Scanned QR must contain both "batchNo" and "uClipID" fields.',
  };
}

const mockComponentTimeline = [
  { title: 'Component Registered', time: '2026-01-10', desc: 'Laser QR code C0001 etched at factory.' },
  { title: 'Installed on Track', time: '2026-01-15', desc: 'Anchored at D-1 Section, Coimbatore Track.' },
  { title: 'Initial Telemetry Inspection', time: '2026-03-01', desc: 'Baseline health score set to 100/100.' },
  { title: 'Maintenance Logged', time: '2026-07-10', desc: 'Slight looseness corrected by team.' },
  { title: 'Latest Inspection Completed', time: '2026-07-20', desc: 'Passed inspection with 96/100 rating.' }
];

const mockDailyTrend = [
  { day: 'Mon', count: 42 }, { day: 'Tue', count: 68 },
  { day: 'Wed', count: 55 }, { day: 'Thu', count: 89 },
  { day: 'Fri', count: 74 }, { day: 'Sat', count: 95 },
  { day: 'Sun', count: 60 }
];

const mockStatusDist = [
  { name: 'Healthy', value: 340, color: '#10B981' },
  { name: 'Warning / Loose', value: 45, color: '#F59E0B' },
  { name: 'Critical Defect', value: 12, color: '#EF4444' },
];

const mockSeverityDist = [
  { level: 'Low', count: 280 },
  { level: 'Medium', count: 85 },
  { level: 'High', count: 22 },
  { level: 'Critical', count: 10 }
];

const mockHealthTrend = [
  { month: 'Jan', health: 100 },
  { month: 'Feb', health: 98 },
  { month: 'Mar', health: 95 },
  { month: 'Apr', health: 90 },
  { month: 'May', health: 91 },
  { month: 'Jun', health: 84 },
  { month: 'Jul', health: 96 }
];

/* ==========================================================================
   MAIN COMPONENT: Inspection.jsx
   ========================================================================== */
export default function Inspection() {
  const navigate = useNavigate();
  const districtOfficer = getLoggedInDistrictOfficer();

  // Navigation & View State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Inspections');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Hardware Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Scanner ready. Waiting for Child QR...');
  const [manualQrInput, setManualQrInput] = useState('');
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Inspection Form State (clean, without predefined samples)
  const [formState, setFormState] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorId: '',
    gpsLocation: '',
    condition: 'Healthy',
    severity: 'Low',
    remarks: ''
  });

  // Table State from database
  const [searchQuery, setSearchQuery] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, msg: 'Telemetry module initialized. Ready to log inspections.', time: 'Just now' }
  ]);

  // Fetch inspection records from database
  const fetchInspections = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await listInspectionRecords();
      if (res?.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.error('Failed to load inspections from database:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Navigation Click Handler
  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) navigate(path);
  };

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Central QR Process Handler (from Camera, Upload, or Manual Input)
  const handleProcessQrCode = async (decodedText) => {
    setIsScanning(false);
    stopCamera();
    setCameraError('');

    try {
      const parsed = parseChildQrText(decodedText);

      // Strict validation: must contain batchNo and uClipID
      if (!parsed.isValid) {
        const errorMsg = parsed.error || 'Invalid QR Code: Scanned QR must contain both "batchNo" and "uClipID" fields.';
        setCameraError(errorMsg);
        setScannerStatus(errorMsg);
        setScannedSuccess(false);
        setActiveComponent(null);
        setNotifications(prev => [
          { id: Date.now(), msg: `⚠️ ${errorMsg}`, time: 'Just now' },
          ...prev
        ]);
        return;
      }

      setScannerStatus('Looking up clip & master batch in database...');
      let profileData = null;

      try {
        const res = await lookupComponentByQr({
          qrText: decodedText,
          ...parsed,
        });
        if (res?.success && res.data) {
          profileData = res.data;
        } else if (res?.message) {
          setCameraError(res.message);
          setScannerStatus(res.message);
          setScannedSuccess(false);
          setActiveComponent(null);
          return;
        }
      } catch (lookupErr) {
        console.warn('Remote lookup fallback:', lookupErr);
      }

      if (!profileData) {
        profileData = {
          batchNumber: parsed.batchNumber || 'N/A',
          uClipId: parsed.uClipId || 'N/A',
          district: parsed.district || 'N/A',
          divisionSection: parsed.divisionSection || 'N/A',
          fixedBy: parsed.fixedBy || 'N/A',
          gpsGeolocation: parsed.gpsGeolocation || 'N/A',
          manufacturer: parsed.manufacturer || 'N/A',
          purchaseDate: parsed.purchaseDate || 'N/A',
          status: 'Active',
          health: 100,
          priority: 'Low',
          section: parsed.divisionSection || 'N/A',
          zone: 'N/A',
          division: 'N/A',
          station: 'N/A',
          trackType: 'Broad Gauge (1676 mm)',
          material: 'Spring Steel 60Si7',
          inspectionCount: 0,
          maintenanceCount: 0,
          lastInspectionDate: new Date().toISOString().split('T')[0],
        };
      }

      setActiveComponent(profileData);
      setManualQrInput(profileData.uClipId !== 'N/A' ? profileData.uClipId : decodedText);
      setScannedSuccess(true);
      setScannerStatus(`Verified ${profileData.uClipId} (Batch: ${profileData.batchNumber})`);

      // Autofill GPS location
      if (profileData.gpsGeolocation && profileData.gpsGeolocation !== 'N/A') {
        setFormState(prev => ({
          ...prev,
          gpsLocation: profileData.gpsGeolocation,
        }));
      }

      setNotifications(prev => [
        { 
          id: Date.now(), 
          msg: `Retrieved: ${profileData.uClipId} | Batch: ${profileData.batchNumber} | Manufacturer: ${profileData.manufacturer} | Purchased: ${profileData.purchaseDate}`, 
          time: 'Just now' 
        }, 
        ...prev
      ]);
    } catch (err) {
      const errMsg = 'Invalid QR Code: ' + (err.message || 'Required fields missing');
      setCameraError(errMsg);
      setScannerStatus(errMsg);
      setScannedSuccess(false);
      setActiveComponent(null);
    }
  };

  // Live Camera Scanner
  const startCamera = async () => {
    setIsScanning(true);
    setIsCameraActive(true);
    setCameraError('');
    setScannedSuccess(false);
    setScannerStatus('Point camera at Child QR Code...');

    try {
      const codeReader = new BrowserQRCodeReader();
      readerRef.current = codeReader;

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices.length > 0 
        ? videoInputDevices[videoInputDevices.length - 1].deviceId 
        : undefined;

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result) => {
          if (result) {
            const text = result.getText();
            codeReader.reset();
            setIsCameraActive(false);
            handleProcessQrCode(text);
          }
        }
      );
    } catch (err) {
      setCameraError('Camera unavailable: ' + (err.message || 'Permission denied'));
      setIsScanning(false);
      setIsCameraActive(false);
      setScannerStatus('Camera access failed. Please try Uploading QR Image.');
    }
  };

  const stopCamera = () => {
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch {}
      readerRef.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  // Upload QR Image
  const handleUploadQrClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannerStatus(`Decoding image: ${file.name}...`);
    try {
      const decodedText = await decodeQrTextFromImageFile(file);
      await handleProcessQrCode(decodedText);
    } catch (err) {
      setIsScanning(false);
      alert('Could not decode QR code from image. Please ensure the QR code is clearly visible.');
      setScannerStatus('Image QR decode failed. Try another image or camera.');
    } finally {
      event.target.value = '';
    }
  };

  // Manual Trigger / Query
  const handleTriggerScan = () => {
    if (!manualQrInput.trim()) {
      alert('Please enter a QR code or Clip ID');
      return;
    }
    handleProcessQrCode(manualQrInput.trim());
  };

  // Save Inspection
  const handleSaveInspection = async (e) => {
    e.preventDefault();

    if (!formState.inspectorId.trim()) {
      alert('Please enter a valid Inspector ID.');
      return;
    }

    const currentDistrict = (districtOfficer?.district || 'COIMBATORE').toUpperCase().trim();

    const payload = {
      inspectionDate: formState.inspectionDate,
      inspectorId: formState.inspectorId.trim(),
      condition: formState.condition,
      severity: formState.severity,
      gpsLocation: formState.gpsLocation.trim() || activeComponent?.gpsGeolocation || '',
      remarks: formState.remarks.trim(),
      district: currentDistrict,
      batchNumber: activeComponent?.batchNumber || '',
      uClipId: activeComponent?.uClipId || '',
    };

    try {
      const res = await saveInspectionRecord(payload);
      const savedRecord = res?.data || {
        id: String(Date.now()),
        ...payload,
        date: `${payload.inspectionDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: new Date().toISOString(),
      };

      setHistoryList((prev) => [savedRecord, ...prev]);
      setNotifications((prev) => [
        {
          id: Date.now(),
          msg: `Inspection logged in database for Inspector ${payload.inspectorId} (${payload.district})`,
          time: 'Just now',
        },
        ...prev,
      ]);

      alert(`Inspection record successfully stored in database for district ${payload.district}!`);

      // Reset remarks while retaining session inspector/date
      setFormState((prev) => ({
        ...prev,
        remarks: '',
      }));
    } catch (saveErr) {
      console.error('Backend save error:', saveErr);
      alert('Unable to save inspection to database: ' + (saveErr?.response?.data?.message || saveErr.message || 'Server error'));
    }
  };

  return (
    <div className="relative h-screen bg-slate-50 text-slate-900 font-['Poppins',sans-serif] flex overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 flex flex-col justify-between border-r border-blue-900/40 bg-[#002244] text-slate-200 min-h-screen shrink-0 shadow-lg"
      >
        <div>
          <div className="flex items-center gap-3 p-4 border-b border-blue-900/60 bg-[#001b3a]">
            <div className="flex flex-1 items-center space-x-3 min-w-0 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#003366] via-[#004b87] to-[#0284c7] text-amber-300 shrink-0 shadow-md shadow-blue-900/40">
                <FaTrain className="text-lg" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col whitespace-nowrap">
                  <span className="font-extrabold text-base text-white tracking-wide">
                    RailClip<span className="text-blue-400">AI</span>
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

        <div className="p-4 border-t border-blue-900/60 bg-[#001b3a]">
          <div className={`p-3 rounded-xl bg-blue-950/60 border border-blue-800/40 ${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between text-[11px] text-blue-200 mb-1">
              <span className="font-medium">P-Way Telemetry Sync</span>
              <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[100%]" />
            </div>
            <div className="mt-2 text-[10px] text-blue-300 font-mono">Field Camera & QR Scanner</div>
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

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col z-20 min-w-0 overflow-y-auto scroll-smooth bg-slate-50" style={{ scrollBehavior: 'smooth' }}>

        {/* TOP INDIAN RAILWAYS BANNER STRIP */}
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

        {/* HEADER NAVBAR */}
        <header className="sticky top-0 z-30 px-6 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>QR Field Inspection</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                P-WAY TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-normal">Scan Elastic Rail Clips and Record Inspection Telemetry in Real Time across {districtOfficer.subtitle}</p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
              <FaBell className="text-sm text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </button>

            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
            </div>

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

        {/* WORKSPACE BODY */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* 1. QR SCANNER & COMPONENT INFO ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* QR Scanner Card (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FaQrcode className="text-blue-600" />
                    Scan Railway Clip Laser QR
                  </h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    isCameraActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {isCameraActive ? 'LIVE CAMERA SCANNING' : 'SCANNER READY'}
                  </span>
                </div>

                {/* Hidden File Input for QR Upload */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />

                {/* Camera View Finder / Video Box */}
                <div className="relative w-full h-52 rounded-2xl bg-slate-900 border border-slate-200 flex flex-col items-center justify-center overflow-hidden mb-4 shadow-inner">
                  {/* Live Video Stream */}
                  <video 
                    ref={videoRef} 
                    className={`absolute inset-0 w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`} 
                    autoPlay 
                    muted 
                    playsInline 
                  />

                  {isCameraActive ? (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="w-36 h-36 border-2 border-cyan-400 rounded-xl relative animate-pulse shadow-lg">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-bounce" />
                      </div>
                      <span className="mt-2 text-[11px] text-cyan-300 font-mono bg-black/70 px-2.5 py-1 rounded-full border border-cyan-500/30">
                        Align QR within frame
                      </span>
                    </div>
                  ) : isScanning ? (
                    <div className="flex flex-col items-center space-y-3 z-10">
                      <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-cyan-300 font-mono font-medium">Decoding Child QR...</span>
                    </div>
                  ) : scannedSuccess ? (
                    <div className="flex flex-col items-center space-y-2 z-10 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/40">
                        <FaCheck />
                      </div>
                      <span className="text-xs text-emerald-400 font-mono font-bold">QR VERIFIED & RETRIEVED</span>
                      <span className="text-sm font-bold font-mono text-cyan-300">{activeComponent?.uClipId || manualQrInput}</span>
                      <span className="text-[10px] text-slate-300 font-medium">Batch: {activeComponent?.batchNumber || 'N/A'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-slate-400 z-10">
                      <FaCamera className="text-3xl text-slate-400" />
                      <span className="text-xs text-slate-300">Scan via camera or upload QR image file</span>
                    </div>
                  )}

                  {/* Corner Target Markers */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-400 z-10" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-400 z-10" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-400 z-10" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-400 z-10" />
                </div>

                {cameraError && (
                  <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                    <FaExclamationTriangle className="text-rose-600 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Manual Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700 block">Or enter QR code / Clip ID</label>
                    <span className="text-[10px] font-mono text-slate-500">{scannerStatus}</span>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={manualQrInput}
                      onChange={(e) => setManualQrInput(e.target.value)}
                      placeholder="e.g. C0001 or BATCH001"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                    <button 
                      onClick={handleTriggerScan} 
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-all"
                    >
                      Query
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Scan + Upload */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                {isCameraActive ? (
                  <button 
                    type="button" 
                    onClick={stopCamera} 
                    className="py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-rose-100 cursor-pointer transition-all"
                  >
                    <FaStop />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={startCamera} 
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#003366] to-[#0055a5] hover:from-[#002244] hover:to-[#004080] text-white text-xs font-semibold flex items-center justify-center space-x-2 hover:opacity-95 cursor-pointer shadow-sm transition-all"
                  >
                    <FaCamera />
                    <span>Start Camera</span>
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={handleUploadQrClick} 
                  className="py-2.5 px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-blue-100 cursor-pointer transition-all shadow-xs"
                >
                  <FaUpload />
                  <span>Upload QR Image</span>
                </button>
              </div>
            </div>

            {/* Component Information Card (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              {!activeComponent ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-3xl shadow-xs">
                    <FaQrcode />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h3 className="text-base font-bold text-slate-900">Awaiting Child QR Scan or Upload</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Start the camera or click <span className="text-blue-700 font-semibold">Upload QR Image</span> to decode the Child QR code. Telemetry data, employee details, and the registered <span className="text-amber-700 font-semibold">Manufacturer</span> from the master batch will be displayed automatically.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>Waiting for Child QR input</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        Retrieved Clip Profile
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                          {activeComponent.status || 'Active'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Decoded from Child QR & Firestore Master Batch Registry</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-700 font-mono">{activeComponent.uClipId || 'N/A'}</div>
                      <div className="text-[10px] font-mono text-slate-500">Master Batch: {activeComponent.batchNumber || 'N/A'}</div>
                    </div>
                  </div>

                  {/* 8-Grid of Details: Batch, uClip ID, District, Section, Fixed By, GPS, Manufacturer, Purchase Date */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold block">Batch Number</span>
                      <span className="font-semibold font-mono text-blue-700">{activeComponent.batchNumber || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold block">uClip ID</span>
                      <span className="font-semibold font-mono text-emerald-700">{activeComponent.uClipId || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold block">District</span>
                      <span className="font-semibold text-slate-900">{activeComponent.district || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold block">Division / Section</span>
                      <span className="font-semibold text-slate-900">{activeComponent.divisionSection || activeComponent.section || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold block">Fixed By (Employee)</span>
                      <span className="font-semibold text-slate-800">{activeComponent.fixedBy || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold block">GPS Geolocation</span>
                      <span className="font-mono text-blue-700 text-[11px] truncate block" title={activeComponent.gpsGeolocation || 'N/A'}>
                        {activeComponent.gpsGeolocation || 'N/A'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                      <span className="text-amber-800 text-[10px] uppercase font-mono block font-bold">Purchased From</span>
                      <span className="font-bold text-amber-900">{activeComponent.manufacturer || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold block">Date of Purchase</span>
                      <span className="font-mono text-slate-700">{activeComponent.purchaseDate || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Telemetry Status Summary Cards */}
                  <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                      <span className="text-slate-500 text-[10px] block font-medium">Total Inspections</span>
                      <span className="text-lg font-bold text-blue-800">{activeComponent.inspectionCount ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                      <span className="text-slate-500 text-[10px] block font-medium">Current Health</span>
                      <span className="text-lg font-bold text-emerald-700">{activeComponent.health ?? 100}/100</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-slate-500 text-[10px] block font-medium">AI Priority</span>
                      <span className="text-lg font-bold text-slate-800">{activeComponent.priority || 'Low'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Last Inspected: <strong className="text-slate-900">{activeComponent.lastInspectionDate || new Date().toISOString().split('T')[0]}</strong></span>
                    <span>Track Spec: <strong className="text-slate-700">{activeComponent.trackType || 'Broad Gauge (1676 mm)'}</strong></span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 2. INSPECTION LOG FORM & DATA TABLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form to submit inspection (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FaTools className="text-blue-600" />
                  Log Field Inspection
                </h3>
                <p className="text-[11px] text-slate-500">Record on-track physical condition & torque assessment</p>
              </div>

              <form onSubmit={handleSaveInspection} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Inspection Date *</label>
                    <input 
                      type="date" 
                      name="inspectionDate" 
                      value={formState.inspectionDate} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Inspector ID *</label>
                    <input 
                      type="text" 
                      name="inspectorId" 
                      value={formState.inspectorId} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Clip Condition *</label>
                    <select 
                      name="condition" 
                      value={formState.condition} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Healthy">Healthy (Optimal)</option>
                      <option value="Loose">Loose Fastener</option>
                      <option value="Worn">Surface Worn</option>
                      <option value="Corroded">Corroded</option>
                      <option value="Fractured">Fractured / Broken</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Severity Rating</label>
                    <select 
                      name="severity" 
                      value={formState.severity} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Severity</option>
                      <option value="High">High Severity</option>
                      <option value="Critical">Critical Alert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">GPS Coordinates</label>
                  <input 
                    type="text" 
                    name="gpsLocation" 
                    value={formState.gpsLocation} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 11.0168, 76.9558" 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:bg-white focus:border-blue-600 focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Inspector Remarks</label>
                  <textarea 
                    name="remarks" 
                    rows={2} 
                    value={formState.remarks} 
                    onChange={handleInputChange} 
                    placeholder="Notes on clip integrity, ballast condition, or torque applied..." 
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none" 
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#0055a5] hover:from-[#002244] hover:to-[#004080] text-white text-xs font-semibold shadow-md shadow-blue-950/20 hover:opacity-95 cursor-pointer transition-all"
                  >
                    Submit Inspection Record
                  </button>
                </div>
              </form>
            </div>

            {/* Inspection History Log Table (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent P-Way Inspection Records</h3>
                    <p className="text-[11px] text-slate-500">Live verified inspections from database</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={fetchInspections}
                      disabled={isLoadingHistory}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
                      title="Refresh Database Records"
                    >
                      <FaSync className={isLoadingHistory ? 'animate-spin' : ''} />
                    </button>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {historyList.length} LOGS
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">District</th>
                        <th className="py-2.5 px-3">Inspector ID</th>
                        <th className="py-2.5 px-3">Condition</th>
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3">GPS Location</th>
                        <th className="py-2.5 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {isLoadingHistory ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                            <div className="flex items-center justify-center space-x-2">
                              <FaSync className="animate-spin text-blue-600 text-sm" />
                              <span>Fetching inspection logs from database...</span>
                            </div>
                          </td>
                        </tr>
                      ) : historyList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                            No inspection records found in database. Log a new inspection using the form.
                          </td>
                        </tr>
                      ) : (
                        historyList.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                              {row.inspectionDate || row.date?.split(' ')[0] || 'N/A'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-bold whitespace-nowrap">
                                {row.district || districtOfficer?.district || 'N/A'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                              {row.inspectorId || 'N/A'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                                row.condition === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                row.condition === 'Loose' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {row.condition || 'Healthy'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                                row.severity === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                row.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {row.severity || 'Low'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                              {row.gpsLocation || 'N/A'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate" title={row.remarks || '—'}>
                              {row.remarks || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total records in database: <strong className="text-slate-800 font-mono">{historyList.length}</strong></span>
                <button onClick={() => alert('Exporting inspection history...')} className="text-blue-700 font-semibold hover:text-blue-900 cursor-pointer">
                  Export Inspection Log
                </button>
              </div>
            </div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="mt-auto py-4 px-8 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Inspection Engine: <span className="font-mono text-emerald-700 font-bold">Firebase Live Sync</span> | Active Inspector: <span className="font-mono text-slate-800 font-semibold">IR-88204</span></div>
          <div>Indian Railways Track Telemetry Platform • RDSO Compliant</div>
        </footer>

      </div>
    </div>
  );
}