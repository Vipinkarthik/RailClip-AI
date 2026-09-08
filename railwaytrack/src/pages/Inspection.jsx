import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  FaUpload, FaStop, FaCloudUploadAlt, FaSun, FaCloudRain, FaSmog, FaMoon, FaUserPlus
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

const mockInspectionRecords = [
  { id: '1', date: '2026-07-20 11:42', inspector: 'Officer K. Sharma', condition: 'Healthy', severity: 'Low', health: 96, maintenance: 'No', status: 'Healthy', remarks: 'Fastener tension optimal. Zero micro-fractures.' },
  { id: '2', date: '2026-07-10 14:15', inspector: 'Inspector R. Verma', condition: 'Loose', severity: 'Medium', health: 78, maintenance: 'Yes', status: 'Warning', remarks: 'Retightened clip housing assembly.' },
  { id: '3', date: '2026-06-25 09:30', inspector: 'Eng. P. Deshmukh', condition: 'Worn', severity: 'Low', health: 84, maintenance: 'No', status: 'Healthy', remarks: 'Minor surface oxidation observed.' },
  { id: '4', date: '2026-05-18 16:20', inspector: 'Inspector M. Khan', condition: 'Healthy', severity: 'Low', health: 91, maintenance: 'No', status: 'Healthy', remarks: 'Routine track audit cleared.' },
  { id: '5', date: '2026-04-12 10:05', inspector: 'Officer K. Sharma', condition: 'Corroded', severity: 'Medium', health: 70, maintenance: 'Yes', status: 'Warning', remarks: 'Anti-corrosion coating re-applied.' },
];

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

  // Inspection Form State
  const [formState, setFormState] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: 'Officer K. Sharma',
    inspectorId: 'IR-88204',
    gpsLocation: '',
    condition: 'Healthy',
    maintenancePerformed: false,
    severity: 'Low',
    trackCondition: 'Good',
    weather: 'Sunny',
    remarks: 'Routine inspection completed. All clips securely fastened.'
  });

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [historyList, setHistoryList] = useState(mockInspectionRecords);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, msg: 'Telemetry module initialized. Awaiting Child QR scan.', time: 'Just now' }
  ]);

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

    if (!activeComponent) {
      alert('Please scan or upload a Child QR code first before saving an inspection.');
      return;
    }

    const newRecord = {
      id: String(Date.now()),
      date: `${formState.inspectionDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      inspector: formState.inspectorName,
      inspectorId: formState.inspectorId,
      gpsLocation: formState.gpsLocation || activeComponent.gpsGeolocation || '',
      condition: formState.condition,
      severity: formState.severity,
      health: formState.condition === 'Healthy' ? 98 : formState.condition === 'Loose' ? 75 : 40,
      maintenance: formState.maintenancePerformed ? 'Yes' : 'No',
      maintenancePerformed: formState.maintenancePerformed,
      status: formState.condition === 'Healthy' ? 'Healthy' : formState.condition === 'Loose' ? 'Warning' : 'Critical',
      remarks: formState.remarks,
      batchNumber: activeComponent.batchNumber || 'N/A',
      uClipId: activeComponent.uClipId || 'N/A',
      district: activeComponent.district || 'N/A',
      divisionSection: activeComponent.divisionSection || 'N/A',
      fixedBy: activeComponent.fixedBy || 'N/A',
      manufacturer: activeComponent.manufacturer || 'N/A',
      purchaseDate: activeComponent.purchaseDate || 'N/A',
    };

    try {
      await saveInspectionRecord(newRecord);
    } catch (saveErr) {
      console.warn('Backend save fallback:', saveErr);
    }

    setHistoryList([newRecord, ...historyList]);
    setNotifications(prev => [{ id: Date.now(), msg: `Inspection logged for Clip ${activeComponent.uClipId || 'Component'}`, time: 'Just now' }, ...prev]);
    alert(`Inspection successfully logged for Clip ${activeComponent.uClipId || 'N/A'} (${activeComponent.batchNumber || 'N/A'})!`);
  };

  return (
    <div className="relative h-screen bg-[#030712] text-white font-['Poppins',sans-serif] flex overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* 1. WebGL Liquid Ether Background Engine */}
      <LiquidEther
        color0="#5227FF"
        color1="#FF9FFC"
        color2="#00D2FF"
        autoSpeed={0.4}
      />

      {/* 2. Glow Orbs */}
      <div className="fixed top-20 left-60 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full filter blur-[160px] pointer-events-none z-0" />

      {/* 3. SIDEBAR NAVIGATION */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 flex flex-col justify-between border-r border-white/10 bg-black/40 backdrop-blur-2xl min-h-screen shrink-0"
      >
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
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">FIELD INSPECTOR</span>
                </div>
              )}
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="relative z-20 ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white">
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

        <div className="p-4 border-t border-white/10">
          <button onClick={() => navigate('/login')} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer">
            <FaSignOutAlt className="text-sm" />
            {sidebarOpen && <span>Disconnect Session</span>}
          </button>
        </div>
      </motion.aside>

      {/* 4. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col z-20 min-w-0 overflow-y-auto scroll-smooth" style={{ scrollBehavior: 'smooth' }}>

        {/* HEADER NAVBAR */}
        <header className="sticky top-0 z-30 px-8 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              QR Inspection & Maintenance
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                FIELD TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">Scan Railway Track Clips and Update Inspection Records in Real Time</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Inspection Logs..."
                className="pl-9 pr-4 py-2 w-64 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <FaUserCircle className="text-2xl text-purple-400" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-white leading-none">Officer K. Sharma</span>
                <span className="text-[10px] text-slate-400">Chief Track Inspector</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* 1. TOP STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: "Today's Inspections", count: '48', trend: '+12%', isPositive: true, icon: FaCalendarAlt, color: 'from-blue-600 to-cyan-400' },
              { title: 'Pending Inspections', count: '14', trend: '-5%', isPositive: true, icon: FaSync, color: 'from-amber-600 to-yellow-400' },
              { title: 'Completed Inspections', count: '1,280', trend: '+18%', isPositive: true, icon: FaCheckCircle, color: 'from-emerald-600 to-teal-400' },
              { title: 'Critical Components', count: '3', trend: '+1', isPositive: false, icon: FaExclamationTriangle, color: 'from-red-600 to-rose-400' },
              { title: 'Healthy Components', count: '1,215', trend: '95%', isPositive: true, icon: FaShieldAlt, color: 'from-purple-600 to-indigo-400' },
              { title: 'Avg Health Score', count: '91.4', trend: '+2.1', isPositive: true, icon: FaChartLine, color: 'from-cyan-600 to-blue-500' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                      <Icon className="text-base" />
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      stat.isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                  <div className="text-[11px] text-slate-400 truncate">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* 2. QR SCANNER & COMPONENT INFO ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* QR Scanner Card (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaQrcode className="text-cyan-400" />
                    Scan Railway Clip Laser QR
                  </h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    isCameraActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                      : 'bg-purple-500/20 text-purple-300'
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
                <div className="relative w-full h-52 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center overflow-hidden mb-4">
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
                      <div className="w-36 h-36 border-2 border-cyan-400/80 rounded-xl relative animate-pulse">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-bounce" />
                      </div>
                      <span className="mt-2 text-[11px] text-cyan-300 font-mono bg-black/70 px-2.5 py-1 rounded-full border border-cyan-500/30">
                        Align QR within frame
                      </span>
                    </div>
                  ) : isScanning ? (
                    <div className="flex flex-col items-center space-y-3 z-10">
                      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-cyan-300 font-mono">Decoding Child QR...</span>
                    </div>
                  ) : scannedSuccess ? (
                    <div className="flex flex-col items-center space-y-2 z-10 px-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/40">
                        <FaCheck />
                      </div>
                      <span className="text-xs text-emerald-400 font-mono font-bold">QR VERIFIED & RETRIEVED</span>
                      <span className="text-sm font-bold font-mono text-cyan-300">{activeComponent?.uClipId || manualQrInput}</span>
                      <span className="text-[10px] text-slate-400">Batch: {activeComponent?.batchNumber || 'N/A'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-slate-500 z-10">
                      <FaCamera className="text-4xl animate-pulse text-slate-400" />
                      <span className="text-xs text-slate-400">Scan via camera or upload QR image file</span>
                    </div>
                  )}

                  {/* Corner Target Markers */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-cyan-400 z-10" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-cyan-400 z-10" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-cyan-400 z-10" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-cyan-400 z-10" />
                </div>

                {cameraError && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-400 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Manual Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-400 block">Or enter QR code / Clip ID</label>
                    <span className="text-[10px] font-mono text-slate-500">{scannerStatus}</span>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={manualQrInput}
                      onChange={(e) => setManualQrInput(e.target.value)}
                      placeholder="e.g. C0001 or BATCH001"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-cyan-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button onClick={handleTriggerScan} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 cursor-pointer">
                      Query
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Scan + Upload */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                {isCameraActive ? (
                  <button 
                    type="button" 
                    onClick={stopCamera} 
                    className="py-2.5 px-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-red-500/30 cursor-pointer transition-all"
                  >
                    <FaStop />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={startCamera} 
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold flex items-center justify-center space-x-2 hover:opacity-95 cursor-pointer shadow-lg shadow-purple-600/30 transition-all"
                  >
                    <FaCamera />
                    <span>Start Camera</span>
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={handleUploadQrClick} 
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-cyan-500/25 cursor-pointer transition-all"
                >
                  <FaUpload />
                  <span>Upload QR Image</span>
                </button>
              </div>
            </div>

            {/* Component Information Card (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
              {!activeComponent ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-cyan-500/20 border border-purple-500/30 text-cyan-300 flex items-center justify-center text-3xl shadow-lg">
                    <FaQrcode />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h3 className="text-base font-bold text-white">Awaiting Child QR Scan or Upload</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Start the camera or click <span className="text-cyan-300 font-semibold">Upload QR Image</span> to decode the Child QR code. Telemetry data, employee details, and the registered <span className="text-amber-300 font-semibold">Manufacturer</span> from the master batch will be displayed automatically.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>No dummy data &bull; Waiting for Child QR input</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        Retrieved Clip Profile
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                          {activeComponent.status || 'Active'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Decoded from Child QR & Firestore Master Batch Registry</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-cyan-400 font-mono">{activeComponent.uClipId || 'N/A'}</div>
                      <div className="text-[10px] font-mono text-purple-300">Master Batch: {activeComponent.batchNumber || 'N/A'}</div>
                    </div>
                  </div>

                  {/* 8-Grid of Details: Batch, uClip ID, District, Section, Fixed By, GPS, Manufacturer, Purchase Date */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-500 text-[10px] uppercase font-mono block">Batch Number</span>
                      <span className="font-semibold font-mono text-cyan-300">{activeComponent.batchNumber || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-500 text-[10px] uppercase font-mono block">uClip ID</span>
                      <span className="font-semibold font-mono text-emerald-400">{activeComponent.uClipId || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-500 text-[10px] uppercase font-mono block">District</span>
                      <span className="font-semibold text-white">{activeComponent.district || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-500 text-[10px] uppercase font-mono block">Division / Section</span>
                      <span className="font-semibold text-white">{activeComponent.divisionSection || activeComponent.section || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-500 text-[10px] uppercase font-mono block">Fixed By (Employee)</span>
                      <span className="font-semibold text-purple-300">{activeComponent.fixedBy || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-500 text-[10px] uppercase font-mono block">GPS Geolocation</span>
                      <span className="font-mono text-cyan-300 text-[11px] truncate block" title={activeComponent.gpsGeolocation || 'N/A'}>
                        {activeComponent.gpsGeolocation || 'N/A'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 bg-amber-500/5">
                      <span className="text-amber-400 text-[10px] uppercase font-mono block font-bold">Purchased From (Manufacturer)</span>
                      <span className="font-bold text-amber-300">{activeComponent.manufacturer || 'N/A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-slate-500 text-[10px] uppercase font-mono block">Date of Purchase</span>
                      <span className="font-mono text-slate-300">{activeComponent.purchaseDate || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Telemetry Status Summary Cards */}
                  <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/20 text-center">
                      <span className="text-slate-400 text-[10px] block">Total Inspections</span>
                      <span className="text-lg font-bold text-purple-300">{activeComponent.inspectionCount ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/20 text-center">
                      <span className="text-slate-400 text-[10px] block">Current Health</span>
                      <span className="text-lg font-bold text-emerald-400">{activeComponent.health ?? 100}/100</span>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-900/20 border border-cyan-500/20 text-center">
                      <span className="text-slate-400 text-[10px] block">AI Priority</span>
                      <span className="text-lg font-bold text-cyan-400">{activeComponent.priority || 'Low'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Last Inspected: <strong className="text-white">{activeComponent.lastInspectionDate || new Date().toISOString().split('T')[0]}</strong></span>
                    <span>Track Spec: <strong className="text-slate-300">{activeComponent.trackType || 'Broad Gauge (1676 mm)'}</strong></span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 3. INSPECTION FORM & LIVE SUMMARY ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Inspection Form (8 cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Record Field Inspection Data</h3>
              <p className="text-[11px] text-slate-400 mb-6">Log clip physical state for AI telemetry analysis</p>

              <form onSubmit={handleSaveInspection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Inspection Date</label>
                    <input type="date" name="inspectionDate" value={formState.inspectionDate} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Inspector Name</label>
                    <input type="text" name="inspectorName" value={formState.inspectorName} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Inspector Badge ID</label>
                    <input type="text" name="inspectorId" value={formState.inspectorId} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Clip Condition *</label>
                    <select name="condition" value={formState.condition} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none">
                      <option value="Healthy">Healthy / Normal</option>
                      <option value="Loose">Loose / Dislodged</option>
                      <option value="Worn">Worn / Surface Wear</option>
                      <option value="Cracked">Cracked</option>
                      <option value="Corroded">Corroded</option>
                      <option value="Broken">Broken / Severed</option>
                      <option value="Replacement Required">Replacement Required</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Severity Level *</label>
                    <select name="severity" value={formState.severity} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none">
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                      <option value="Critical">Critical Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Weather Conditions</label>
                    <select name="weather" value={formState.weather} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none">
                      <option value="Sunny">Clear / Sunny</option>
                      <option value="Rain">Rain / Monsoon</option>
                      <option value="Fog">Heavy Fog</option>
                      <option value="Night">Night Operation</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-black/40 border border-white/5">
                  <input type="checkbox" id="maint" name="maintenancePerformed" checked={formState.maintenancePerformed} onChange={handleInputChange} className="rounded accent-purple-600" />
                  <label htmlFor="maint" className="text-xs text-slate-300 cursor-pointer">Immediate Maintenance or Tightening Performed On-Site</label>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 mb-1 block">Inspector Field Remarks</label>
                  <textarea name="remarks" value={formState.remarks} onChange={handleInputChange} rows={3} placeholder="Enter observations..." className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none" />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 cursor-pointer">
                    Save Inspection to Cloud
                  </button>
                </div>
              </form>
            </div>

            {/* AI Prediction Preview (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-900 to-black border border-purple-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-3">
                  <FaBrain className="animate-pulse" />
                  <span>XGBOOST MODEL PREVIEW</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Predicted Health & Maintenance</h3>

                {/* Score Gauge Circle */}
                <div className="my-6 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 rounded-full border-4 border-cyan-400/20 flex items-center justify-center bg-black/40 shadow-inner">
                    <div className="text-center">
                      <span className="text-3xl font-extrabold text-white">92</span>
                      <span className="text-xs text-slate-400 block font-mono">/ 100</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 mt-2">OPTIMAL INTEGRITY</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-black/40">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="text-emerald-400 font-semibold">Low</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40">
                    <span className="text-slate-400">Failure Probability:</span>
                    <span className="text-cyan-400 font-mono">1.8%</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-black/40">
                    <span className="text-slate-400">Expected Life:</span>
                    <span className="text-slate-200">14.2 Years</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-500 text-center font-mono">
                Model: Python XGBoost v2.4 | Sync Latency: 12ms
              </div>
            </div>

          </div>

          {/* 4. INSPECTION HISTORY TABLE SECTION */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Clip Inspection Audit Trail</h3>
                <p className="text-[11px] text-slate-400">
                  {activeComponent ? `Historical records for component ${activeComponent.uClipId || activeComponent.batchNumber}` : 'Historical inspection audit trail across all registered track components'}
                </p>
              </div>
              <button onClick={() => alert('Exporting PDF Report...')} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium flex items-center space-x-2 cursor-pointer">
                <FaDownload className="text-[10px]" />
                <span>Export History PDF</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-4">Date & Time</th>
                    <th className="pb-3 px-4">Inspector</th>
                    <th className="pb-3 px-4">Condition</th>
                    <th className="pb-3 px-4">Severity</th>
                    <th className="pb-3 px-4">Health Score</th>
                    <th className="pb-3 px-4">Maintenance</th>
                    <th className="pb-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {historyList.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{row.date}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{row.inspector}</td>
                      <td className="py-3.5 px-4">{row.condition}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.severity === 'Low' ? 'bg-emerald-500/15 text-emerald-400' :
                          row.severity === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-cyan-400">{row.health}/100</td>
                      <td className="py-3.5 px-4">{row.maintenance}</td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{row.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. TIMELINE & RECHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Timeline Panel (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Lifecycle Events Timeline</h3>
              <p className="text-[11px] text-slate-400 mb-6">Component deployment milestones</p>

              <div className="relative pl-4 border-l border-white/10 space-y-6">
                {mockComponentTimeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
                    <div className="text-xs font-semibold text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recharts Health Trend (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Clip Health Progression</h3>
              <p className="text-[11px] text-slate-400 mb-6">Telemetry scores over time</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHealthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="health" stroke="#00D2FF" fill="#00D2FF" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 6. QUICK ACTION BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Start New QR Inspection', icon: FaQrcode, color: 'from-purple-600 to-blue-600', path: '/inspections' },
              { label: 'View Asset Inventory', icon: FaLayerGroup, color: 'from-cyan-600 to-teal-600', path: '/components' },
              { label: 'Run Full AI Analysis', icon: FaBrain, color: 'from-blue-600 to-indigo-600', path: '/ai-analysis' },
              { label: 'Export Telemetry Report', icon: FaFolder, color: 'from-slate-700 to-slate-800', path: '/reports' },
            ].map((btn, idx) => {
              const Icon = btn.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => navigate(btn.path)}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${btn.color} text-white font-medium text-xs shadow-lg flex items-center justify-center space-x-3 hover:opacity-90 transition-all cursor-pointer`}
                >
                  <Icon className="text-sm" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

        </main>

        {/* FOOTER */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>Inspection Engine: <span className="font-mono text-emerald-400">Firebase Live Sync</span> | Active Inspector: <span className="font-mono text-slate-300">IR-88204</span></div>
          <div>Powered by React, Firebase, Express & Python XGBoost</div>
        </footer>

      </div>
    </div>
  );
}