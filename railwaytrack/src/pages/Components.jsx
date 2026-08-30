import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createComponentBatch, listComponentBatches } from '../api/components';
import { BrowserQRCodeReader } from '@zxing/browser';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaUserCircle, FaBars, FaTimes, 
  FaPlus, FaFilter, FaDownload, FaSync, FaEye, FaEdit, 
  FaTrash, FaPrint, FaMapMarkerAlt, FaCogs, FaSignOutAlt, 
  FaFolder, FaMicrochip, FaExclamationTriangle, FaCheckCircle, 
  FaTools, FaCalendarAlt, FaBuilding, FaIndustry, FaCheck,
  FaArrowRight, FaLayerGroup, FaHistory, FaInfoCircle, FaUserPlus, FaCamera, FaUpload
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
   BACKEND-DRIVEN DATA HELPERS
   ========================================================================== */
function buildStatusChartData(components) {
  const statusMeta = [
    { key: 'Active', name: 'Active / Healthy', color: '#10B981' },
    { key: 'Maintenance', name: 'Under Maintenance', color: '#F59E0B' },
    { key: 'Replaced', name: 'Replaced / Failed', color: '#EF4444' },
    { key: 'Inactive', name: 'Inactive / Pending', color: '#6B7280' },
  ];

  return statusMeta.map((entry) => ({
    name: entry.name,
    value: components.filter((component) => component.status === entry.key).length,
    color: entry.color,
  }));
}

function parseChildQrRange(childQrRange) {
  const normalizedRange = String(childQrRange || '').replace(/\s+/g, '').trim().toUpperCase();
  const match = normalizedRange.match(/^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/);

  if (!match) {
    return null;
  }

  const [, startPrefix, startNumber, endPrefix, endNumber] = match;

  if (startPrefix !== endPrefix) {
    return null;
  }

  const startValue = Number(startNumber);
  const endValue = Number(endNumber);

  if (!Number.isInteger(startValue) || !Number.isInteger(endValue) || endValue < startValue) {
    return null;
  }

  const paddedWidth = Math.max(startNumber.length, endNumber.length);

  return {
    childQrPrefix: startPrefix,
    childQrStart: `${startPrefix}${startNumber.padStart(paddedWidth, '0')}`,
    childQrEnd: `${endPrefix}${endNumber.padStart(paddedWidth, '0')}`,
    childQrRange: `${startPrefix}${startNumber.padStart(paddedWidth, '0')}-${endPrefix}${endNumber.padStart(paddedWidth, '0')}`,
    clipsPurchased: endValue - startValue + 1,
  };
}

function parseMasterQrPayload(rawValue) {
  const rawText = String(rawValue || '').trim();

  if (!rawText) {
    return null;
  }

  const readPayloadValue = (payload, keys) => {
    for (const key of keys) {
      const value = payload?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }

    return '';
  };

  const buildPayload = (payload) => {
    const masterQrId = String(
      readPayloadValue(payload, ['masterQrId', 'masterQr', 'qrId', 'qr', 'batchNo', 'batchNumber', 'batch_no', 'batch_id', 'id', 'code']) || rawText
    ).trim();
    const batchDetails = String(
      readPayloadValue(payload, ['batchDetails', 'batch', 'details', 'type', 'batchNo', 'batchNumber', 'batch_no', 'qrType', 'label', 'title'])
    ).trim();
    const childQrRange = String(
      readPayloadValue(payload, ['childQrRange', 'childRange', 'range', 'qrRange', 'child_qr_range'])
    ).trim();
    const startClip = String(
      readPayloadValue(payload, ['startClip', 'childQrStart', 'start_clip', 'child_qr_start'])
    ).trim();
    const endClip = String(
      readPayloadValue(payload, ['endClip', 'childQrEnd', 'end_clip', 'child_qr_end'])
    ).trim();
    const totalClips = Number(
      readPayloadValue(payload, ['totalClips', 'clipsPurchased', 'clipCount', 'total_clips'])
    );

    const resolvedRange = childQrRange || (startClip && endClip ? `${startClip}-${endClip}` : '');
    const resolvedBatchDetails = batchDetails || masterQrId;

    if (!masterQrId || !resolvedRange) {
      return null;
    }

    return {
      masterQrId,
      batchDetails: resolvedBatchDetails,
      childQrRange: resolvedRange,
      childQrStart: startClip || resolvedRange.split('-')[0] || '',
      childQrEnd: endClip || resolvedRange.split('-')[1] || '',
      clipsPurchased: Number.isFinite(totalClips) && totalClips > 0 ? totalClips : undefined,
    };
  };

  const buildPayloadFromLooseText = (text) => {
    const normalizedText = String(text || '').replace(/\uFEFF/g, '').trim();
    const extracted = {
      type: '',
      batchNo: '',
      batchNumber: '',
      batch_no: '',
      startClip: '',
      start_clip: '',
      endClip: '',
      end_clip: '',
      totalClips: '',
      total_clips: '',
      masterQrId: '',
      batchDetails: '',
      batch_details: '',
      childQrRange: '',
      child_qr_range: '',
    };

    const pattern = /(?:^|[\s,;{])(type|batchNo|batchNumber|batch_no|startClip|start_clip|endClip|end_clip|totalClips|total_clips|masterQrId|batchDetails|batch_details|childQrRange|child_qr_range|childRange|range|details|batch)\s*[:=]\s*"?([^",}\n]+)"?/gi;
    let match;

    while ((match = pattern.exec(normalizedText)) !== null) {
      const key = match[1].toLowerCase();
      const value = match[2].trim();

      if (key === 'batchnumber' || key === 'batchno') {
        extracted.batchNo = value;
      } else if (key === 'batch_no') {
        extracted.batch_no = value;
      } else if (key === 'childrange') {
        extracted.childQrRange = value;
      } else if (key === 'child_qr_range') {
        extracted.child_qr_range = value;
      } else if (key === 'batch_details') {
        extracted.batch_details = value;
      } else if (key === 'start_clip') {
        extracted.start_clip = value;
      } else if (key === 'end_clip') {
        extracted.end_clip = value;
      } else if (key === 'total_clips') {
        extracted.total_clips = value;
      } else {
        extracted[key] = value;
      }
    }

    const masterQrId = extracted.masterQrId || extracted.batchNo || extracted.batchNumber || extracted.batch_no;
    const batchDetails = extracted.batchDetails || extracted.batch_details || extracted.type || extracted.details || extracted.batch || '';
    const startClip = extracted.startClip || extracted.start_clip;
    const endClip = extracted.endClip || extracted.end_clip;
    const resolvedRange = extracted.childQrRange || extracted.child_qr_range || (startClip && endClip ? `${startClip}-${endClip}` : '');

    if (!masterQrId || !batchDetails || !resolvedRange) {
      return null;
    }

    return {
      masterQrId,
      batchDetails,
      childQrRange: resolvedRange,
    };
  };

  const buildPayloadFromHeuristics = (text) => {
    const normalizedText = String(text || '')
      .replace(/\uFEFF/g, '')
      .replace(/[{}()[\]<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const typeMatch = normalizedText.match(/\b(MASTER|BATCH|TYPE|CLIP)\b/i);
    const clipCodes = normalizedText.match(/\b[A-Z]{1,5}\d{1,6}\b/gi) || [];
    const batchMatch = clipCodes[0] || '';
    const rangeMatch = normalizedText.match(/\b([A-Z]{1,5}\d{1,6})\s*(?:-|to)\s*([A-Z]{1,5}\d{1,6})\b/i);
    const startClipMatch = normalizedText.match(/(?:startclip|start|from)\s*[:=]?\s*(\b[A-Z]{1,5}\d{1,6}\b)/i);
    const endClipMatch = normalizedText.match(/(?:endclip|end|to)\s*[:=]?\s*(\b[A-Z]{1,5}\d{1,6}\b)/i);
    const totalClipsMatch = normalizedText.match(/(?:totalclips|clips|count)\s*[:=]?\s*(\d+)/i);

    const inferredStartClip = rangeMatch?.[1] || startClipMatch?.[1] || clipCodes[0] || '';
    const inferredEndClip = rangeMatch?.[2] || endClipMatch?.[1] || clipCodes[clipCodes.length - 1] || '';
    const masterQrId = batchMatch || '';
    const batchDetails = typeMatch?.[1]?.toUpperCase() || 'MASTER';
    const startClip = inferredStartClip;
    const endClip = inferredEndClip;
    const resolvedRange = startClip && endClip ? `${startClip}-${endClip}` : '';

    if (!masterQrId || !resolvedRange) {
      return null;
    }

    return {
      masterQrId,
      batchDetails,
      childQrRange: resolvedRange,
      childQrStart: startClip,
      childQrEnd: endClip,
      clipsPurchased: totalClipsMatch ? Number(totalClipsMatch[1]) : undefined,
    };
  };

  try {
    const parsed = JSON.parse(rawText);
    if (parsed && typeof parsed === 'object') {
      const payload = buildPayload(parsed);
      if (payload) {
        return payload;
      }
    }
  } catch {
    const normalizedJson = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/:\s*'([^']*)'/g, ':"$1"');

    try {
      const parsedLooseJson = JSON.parse(normalizedJson);
      if (parsedLooseJson && typeof parsedLooseJson === 'object') {
        const payload = buildPayload(parsedLooseJson);
        if (payload) {
          return payload;
        }
      }
    } catch {
      // Fall through to delimited string parsing.
    }
  }

  const urlMatch = rawText.match(/https?:\/\/[^\s]+/i);

  if (urlMatch) {
    try {
      const url = new URL(urlMatch[0]);
      const queryPayload = {
        masterQrId: url.searchParams.get('masterQrId') || url.searchParams.get('batchNo') || url.searchParams.get('batchNumber') || '',
        batchDetails: url.searchParams.get('batchDetails') || url.searchParams.get('type') || url.searchParams.get('batch') || '',
        childQrRange: url.searchParams.get('childQrRange') || url.searchParams.get('range') || '',
        startClip: url.searchParams.get('startClip') || '',
        endClip: url.searchParams.get('endClip') || '',
        totalClips: url.searchParams.get('totalClips') || '',
      };

      const payload = buildPayload(queryPayload);

      if (payload) {
        return payload;
      }
    } catch {
      // Ignore URL parsing failures.
    }
  }

  const loosePayload = buildPayloadFromLooseText(rawText);

  if (loosePayload) {
    return loosePayload;
  }

  const heuristicPayload = buildPayloadFromHeuristics(rawText);

  if (heuristicPayload) {
    return heuristicPayload;
  }

  const segments = rawText.split(/[|;\n]+/).map((segment) => segment.trim()).filter(Boolean);

  if (segments.length >= 3) {
    const [masterQrId, batchDetails, childQrRange] = segments;
    return {
      masterQrId,
      batchDetails,
      childQrRange,
    };
  }

  const keyValuePairs = {};

  rawText.split(/[;\n]+/).forEach((segment) => {
    const [key, ...rest] = segment.split(/[:=]/);
    if (!key || !rest.length) {
      return;
    }

    keyValuePairs[key.trim().toLowerCase()] = rest.join('=').trim();
  });

    const payload = buildPayload({
      masterQrId: keyValuePairs.masterqrid || keyValuePairs.masterqr || keyValuePairs.qrid || keyValuePairs.qr || keyValuePairs.id || keyValuePairs.code,
      batchDetails: keyValuePairs.batchdetails || keyValuePairs.batch_details || keyValuePairs.batch || keyValuePairs.details || keyValuePairs.type || keyValuePairs.label || keyValuePairs.title,
      childQrRange: keyValuePairs.childqrrange || keyValuePairs.child_qr_range || keyValuePairs.childrange || keyValuePairs.range,
      batchNo: keyValuePairs.batchno || keyValuePairs.batchnumber || keyValuePairs.batch_no,
      startClip: keyValuePairs.startclip || keyValuePairs.start_clip,
      endClip: keyValuePairs.endclip || keyValuePairs.end_clip,
      totalClips: keyValuePairs.totalclips || keyValuePairs.total_clips,
    });

  return payload;
}

async function decodeQrTextFromImageFile(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const imageElement = new Image();

      imageElement.onload = () => resolve(imageElement);
      imageElement.onerror = () => reject(new Error('Unable to load the uploaded image.'));
      imageElement.src = objectUrl;
    });

    const reader = new BrowserQRCodeReader();
    const result = await reader.decodeFromImageElement(image);

    return result.getText();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function normalizeBatchRecord(batch) {
  if (!batch) {
    return batch;
  }

  return {
    ...batch,
    id: batch.id || String(Date.now()),
    qrId: batch.masterQrId || batch.qrId || '',
    masterQrId: batch.masterQrId || batch.qrId || '',
    compId: batch.batchDetails || batch.compId || batch.masterQrId || '',
    batchDetails: batch.batchDetails || batch.compId || '',
    childQrRange: batch.childQrRange || '',
    childQrStart: batch.childQrStart || '',
    childQrEnd: batch.childQrEnd || '',
    clipsPurchased: batch.clipsPurchased ?? batch.clipCount ?? batch.numberOfClips ?? '',
    purchaseDate: batch.purchaseDate || batch.installDate || '',
    manufacturer: batch.manufacturer || batch.batchManufacturer || '',
    section: batch.section || batch.batchDetails || batch.childQrRange || '',
    zone: batch.zone || 'Batch',
    division: batch.division || 'Procurement',
    station: batch.station || 'Warehouse',
    installDate: batch.installDate || batch.purchaseDate || '',
    status: batch.status || 'Active',
    health: Number(batch.health ?? 100),
    priority: batch.priority || 'Low',
    lastInspection: batch.lastInspection || 'Pending Inspection',
  };
}

function buildPayloadFromBatchRecord(batch) {
  const normalizedBatch = normalizeBatchRecord(batch);

  if (!normalizedBatch) {
    return null;
  }

  const masterQrId = String(normalizedBatch.masterQrId || normalizedBatch.qrId || normalizedBatch.batchNo || '').trim();
  const batchDetails = String(normalizedBatch.batchDetails || normalizedBatch.qrType || normalizedBatch.compId || '').trim();
  const childQrRange = String(normalizedBatch.childQrRange || '').trim();

  if (!masterQrId || !batchDetails || !childQrRange) {
    return null;
  }

  return {
    masterQrId,
    batchDetails,
    childQrRange,
    childQrStart: normalizedBatch.childQrStart || '',
    childQrEnd: normalizedBatch.childQrEnd || '',
    clipsPurchased: Number(normalizedBatch.clipsPurchased || normalizedBatch.totalClips) || undefined,
  };
}

/* ==========================================================================
   MAIN COMPONENT: Components.jsx
   ========================================================================== */
export default function Components() {
  const navigate = useNavigate();

  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Components');
  const [componentsList, setComponentsList] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Ready to scan master QR.');
  const [uploadedQrName, setUploadedQrName] = useState('');
  const [qrPreviewSrc, setQrPreviewSrc] = useState('');
  const qrPreviewUrlRef = useRef('');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    masterQrId: '',
    batchDetails: '',
    childQrRange: '',
    manufacturer: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [qrFieldHints, setQrFieldHints] = useState({
    masterQrId: 'Master QR / Batch No',
    batchDetails: 'Type / Batch Details',
    childQrRange: 'Child QR Range',
  });

  // Modal, Drawer & Notification States
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBatches = async () => {
      try {
        const response = await listComponentBatches();
        const batches = Array.isArray(response?.data) ? response.data : [];

        if (isMounted) {
          setComponentsList(batches.map(normalizeBatchRecord).filter(Boolean));
        }
      } catch (error) {
        if (isMounted) {
          setComponentsList([]);
          setNotifications((prev) => [
            { id: Date.now(), msg: 'Unable to load component batches from the backend', time: 'Just now' },
            ...prev,
          ]);
        }
      } finally {
        if (isMounted) {
          setLoadingBatches(false);
        }
      }
    };

    loadBatches();

    return () => {
      isMounted = false;
    };
  }, []);

  // Navigation Routing Handler
  const handleNavClick = (label, path) => {
    setActiveTab(label);
    if (path) {
      navigate(path);
    }
  };

  // Form Field Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resolveDecodedQrPayload = async (decodedText) => {
    const parsedPayload = parseMasterQrPayload(decodedText);

    if (parsedPayload) {
      return parsedPayload;
    }

    const normalizedCandidate = String(decodedText || '').trim().toUpperCase();

    if (!normalizedCandidate) {
      return null;
    }

    const recordMatchesCandidate = (record) => {
      const normalizedRecord = normalizeBatchRecord(record);

      return [
        normalizedRecord.masterQrId,
        normalizedRecord.qrId,
        normalizedRecord.batchNo,
        normalizedRecord.compId,
      ].some((value) => String(value || '').trim().toUpperCase() === normalizedCandidate);
    };

    const localMatch = componentsList.find(recordMatchesCandidate);

    if (localMatch) {
      return buildPayloadFromBatchRecord(localMatch);
    }

    try {
      const response = await listComponentBatches();
      const remoteBatches = Array.isArray(response?.data) ? response.data : [];
      const remoteMatch = remoteBatches.map(normalizeBatchRecord).find(recordMatchesCandidate);

      if (remoteMatch) {
        return buildPayloadFromBatchRecord(remoteMatch);
      }
    } catch {
      // Fall through to the existing error message.
    }

    return null;
  };

  const handleOpenScanner = () => {
    setScannerStatus('Upload a QR image to extract the batch data.');
    setUploadedQrName('');
    setQrPreviewSrc('');
    setIsScannerOpen(true);
  };

  const closeScannerModal = () => {
    if (qrPreviewUrlRef.current) {
      URL.revokeObjectURL(qrPreviewUrlRef.current);
      qrPreviewUrlRef.current = '';
    }

    setIsScannerOpen(false);
    setUploadedQrName('');
    setQrPreviewSrc('');
    setScannerStatus('Ready to scan master QR.');
  };

  const applyDecodedQrPayload = (payload, successMessagePrefix = 'Scanned') => {
    if (!payload) {
      setScannerStatus('QR scanned, but the payload did not include batch fields.');
      return;
    }

    const derivedRange = parseChildQrRange(payload.childQrRange);

    setFormData((prev) => ({
      ...prev,
      masterQrId: payload.masterQrId,
      batchDetails: payload.batchDetails,
      childQrRange: payload.childQrRange,
    }));

    setQrFieldHints({
      masterQrId: payload.masterQrId ? 'Batch No / Master QR' : 'Master QR / Batch No',
      batchDetails: payload.batchDetails ? 'Type / Batch Details' : 'Type / Batch Details',
      childQrRange: payload.childQrRange ? 'StartClip-EndClip derived as child QR range' : 'Child QR Range',
    });

    setScannerStatus(
      derivedRange
        ? `${successMessagePrefix} ${payload.masterQrId} and filled ${derivedRange.clipsPurchased} clips.`
        : `${successMessagePrefix} ${payload.masterQrId}.`
    );

    setNotifications((prev) => [
      { id: Date.now(), msg: `Master QR ${payload.masterQrId} scanned and batch fields filled`, time: 'Just now' },
      ...prev,
    ]);

    setIsScannerOpen(false);
  };

  const handleQrUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadedQrName(file.name);
    if (qrPreviewUrlRef.current) {
      URL.revokeObjectURL(qrPreviewUrlRef.current);
    }

    qrPreviewUrlRef.current = URL.createObjectURL(file);
    setQrPreviewSrc(qrPreviewUrlRef.current);
    setScannerStatus('Decoding uploaded QR image...');

    try {
      const decodedText = await decodeQrTextFromImageFile(file);
      const payload = await resolveDecodedQrPayload(decodedText);
      applyDecodedQrPayload(payload, 'Uploaded QR');
    } catch (error) {
      setScannerStatus(error?.message || 'Unable to decode the uploaded QR image.');
    } finally {
      event.target.value = '';
    }
  };

  const handleFillFromManualQr = () => {
    const payload = parseMasterQrPayload(formData.masterQrId);

    if (!payload) {
      alert('Enter or scan a master QR that contains masterQrId, batchDetails, and childQrRange.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      masterQrId: payload.masterQrId,
      batchDetails: payload.batchDetails,
      childQrRange: payload.childQrRange,
    }));

    setQrFieldHints({
      masterQrId: 'Batch No / Master QR',
      batchDetails: 'Type / Batch Details',
      childQrRange: 'StartClip-EndClip derived as child QR range',
    });
  };

  // Save Component
  const handleSaveComponent = async (e) => {
    e.preventDefault();

    const rangeDetails = parseChildQrRange(formData.childQrRange);

    if (!formData.masterQrId || !formData.batchDetails || !formData.childQrRange || !formData.manufacturer || !formData.purchaseDate) {
      alert('Please fill in the master QR, batch details, child QR range, manufacturer, and purchase date.');
      return;
    }

    if (!rangeDetails) {
      alert('Child QR range must use the format RL001-RL100.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createComponentBatch({
        masterQrId: formData.masterQrId,
        batchDetails: formData.batchDetails,
        childQrRange: rangeDetails.childQrRange,
        purchaseDate: formData.purchaseDate,
        manufacturer: formData.manufacturer,
        batchNo: formData.masterQrId,
        type: formData.batchDetails,
        startClip: rangeDetails.childQrStart,
        endClip: rangeDetails.childQrEnd,
        totalClips: rangeDetails.clipsPurchased,
      });

      const savedBatch = normalizeBatchRecord(response?.data || response);

      setComponentsList((currentList) => [savedBatch, ...currentList]);
      setNotifications((prev) => [
        {
          id: Date.now(),
          msg: `Batch ${savedBatch.batchDetails} registered with ${savedBatch.clipsPurchased} clips`,
          time: 'Just now',
        },
        ...prev,
      ]);

      setFormData({
        masterQrId: '',
        batchDetails: '',
        childQrRange: '',
        manufacturer: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || 'Unable to register the batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Component Save
  const handleEditSave = (e) => {
    e.preventDefault();
    if (!selectedComponent) return;

    setComponentsList(componentsList.map(comp => 
      comp.id === selectedComponent.id ? selectedComponent : comp
    ));
    setEditModalOpen(false);
    setSelectedComponent(null);
  };

  // Delete Component
  const handleDeleteConfirm = () => {
    if (!selectedComponent) return;
    setComponentsList(componentsList.filter(item => item.id !== selectedComponent.id));
    setNotifications([{ id: Date.now(), msg: `Deleted clip ${selectedComponent.compId}`, time: 'Just now' }, ...notifications]);
    setDeleteModalOpen(false);
    setSelectedComponent(null);
  };

  // Filter List Logic
  const filteredComponents = componentsList.filter(comp => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch = [
      comp.compId,
      comp.qrId,
      comp.masterQrId,
      comp.batchDetails,
      comp.childQrRange,
      comp.station,
    ].some((value) => String(value || '').toLowerCase().includes(searchTerm));
    const matchesStatus = statusFilter === 'All' || comp.status === statusFilter;
    const matchesZone = zoneFilter === 'All' || comp.zone === zoneFilter;
    return matchesSearch && matchesStatus && matchesZone;
  });

  const activeRangePreview = parseChildQrRange(formData.childQrRange);
  const statusChartData = buildStatusChartData(componentsList);

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
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">ASSET MANAGEMENT</span>
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
              Component Asset Management
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                LASER QR MODULE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-light">Register, Monitor, and Manage Railway Track Clip Identities</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search QR ID, Component ID..."
                className="pl-9 pr-4 py-2 w-64 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </button>

            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>SYS TIME: {currentTime.toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <FaUserCircle className="text-2xl text-purple-400" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-white leading-none">Track Administrator</span>
                <span className="text-[10px] text-slate-400">Railway Engineering</span>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">

          {/* 1. TOP STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: 'Total Registered', count: componentsList.length, trend: 'Active Database', icon: FaQrcode, color: 'from-blue-600 to-cyan-400' },
              { title: 'Healthy Components', count: componentsList.filter(c => c.status === 'Active').length, trend: '98% Integrity', icon: FaCheckCircle, color: 'from-emerald-600 to-teal-400' },
              { title: 'Under Maintenance', count: componentsList.filter(c => c.status === 'Maintenance').length, trend: 'In Progress', icon: FaTools, color: 'from-amber-600 to-yellow-400' },
              { title: 'Components Replaced', count: componentsList.filter(c => c.status === 'Replaced').length, trend: 'Logged Failure', icon: FaExclamationTriangle, color: 'from-red-600 to-rose-400' },
              { title: 'Inactive Assets', count: componentsList.filter(c => c.status === 'Inactive').length, trend: 'Offline', icon: FaInfoCircle, color: 'from-gray-600 to-slate-400' },
              { title: 'Pending QR Sync', count: 0, trend: 'All Synced', icon: FaCloud, color: 'from-purple-600 to-indigo-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                      <Icon className="text-base" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
                  <div className="text-[11px] text-slate-400 truncate">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* 2. REGISTRATION & QR GENERATION SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Component Registration Form (8 Cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaPlus className="text-cyan-400" />
                    Register New Railway Track Clip
                  </h2>
                  <p className="text-[11px] text-slate-400">Initialize clip metadata before etching laser QR identity code</p>
                </div>
              </div>

              <form onSubmit={handleSaveComponent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">{qrFieldHints.masterQrId} *</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="masterQrId"
                        value={formData.masterQrId}
                        onChange={handleInputChange}
                        placeholder="e.g. C0001"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500"
                        required
                      />
                      <button type="button" onClick={handleOpenScanner} className="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 shrink-0">
                        <span className="flex items-center gap-2"><FaCamera />Scan</span>
                      </button>
                      <button type="button" onClick={handleOpenScanner} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold hover:bg-white/10 shrink-0">
                        <span className="flex items-center gap-2"><FaUpload />Upload QR</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">{qrFieldHints.batchDetails} *</label>
                    <input 
                      type="text" 
                      name="batchDetails"
                      value={formData.batchDetails}
                      onChange={handleInputChange}
                      placeholder="e.g. MASTER"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">{qrFieldHints.childQrRange} *</label>
                    <input 
                      type="text" 
                      name="childQrRange"
                      value={formData.childQrRange}
                      onChange={handleInputChange}
                      placeholder="e.g. C0001-C0050"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Derived Clip Count</label>
                    <div className="w-full px-3 py-2 rounded-xl bg-black/20 border border-dashed border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                      {activeRangePreview ? `${activeRangePreview.clipsPurchased} clips` : 'Enter a valid range'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Purchased From *</label>
                    <input 
                      type="text" 
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="e.g. Jindal Steel"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-300 mb-1 block">Date of Purchase *</label>
                    <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs" required />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[11px] text-slate-400">
                  <span>{scannerStatus}</span>
                  <button type="button" onClick={handleFillFromManualQr} className="text-cyan-300 font-semibold hover:text-cyan-200">
                    Autofill from pasted QR
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-[11px] text-slate-400">
                  <span>{loadingBatches ? 'Syncing existing batches from the backend...' : 'Batch sync ready.'}</span>
                  <span className="font-mono text-cyan-300">
                    {activeRangePreview ? `${activeRangePreview.childQrStart} to ${activeRangePreview.childQrEnd}` : 'Awaiting QR range'}
                  </span>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? 'Saving Batch...' : 'Save Batch to Firebase'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          <AnimatePresence>
            {isScannerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-cyan-500/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Upload Master QR</h3>
                      <p className="text-[11px] text-slate-400">Upload a QR image to fill the batch fields automatically.</p>
                    </div>
                    <button type="button" onClick={closeScannerModal} className="text-slate-400 hover:text-white">
                      <FaTimes />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-dashed border-cyan-500/30 bg-black/40 p-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                      <FaCloud />
                    </div>
                    <p className="text-sm font-medium text-white">Choose a QR image file</p>
                    <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, JPEG, or WEBP with a clear QR code.</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="mt-4 block w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-cyan-400"
                    />
                    {qrPreviewSrc && (
                      <img
                        src={qrPreviewSrc}
                        alt="QR preview"
                        className="mx-auto mt-4 max-h-56 rounded-2xl border border-white/10 object-contain"
                      />
                    )}
                    {uploadedQrName && <p className="mt-3 text-[11px] text-cyan-300">Selected file: {uploadedQrName}</p>}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{scannerStatus}</span>
                    <button type="button" onClick={closeScannerModal} className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/15">
                      Close Scanner
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 3. DATA TABLE & FILTERS SECTION */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Registered Railway Track Clips</h3>
                <p className="text-[11px] text-slate-400">Complete digitized inventory logs synced with cloud database</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Replaced">Replaced</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select 
                  value={zoneFilter} 
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="All">All Zones</option>
                  <option value="Southern">Southern</option>
                  <option value="Northern">Northern</option>
                  <option value="Central">Central</option>
                  <option value="Western">Western</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-4">Master QR</th>
                    <th className="pb-3 px-4">Batch Details</th>
                    <th className="pb-3 px-4">Child QR Range</th>
                    <th className="pb-3 px-4">Clips</th>
                    <th className="pb-3 px-4">Purchase Date</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredComponents.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">{item.masterQrId || item.qrId}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{item.batchDetails || item.compId}</td>
                      <td className="py-3.5 px-4">{item.childQrRange || `${item.section} (${item.station})`}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{item.clipsPurchased || 1}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{item.purchaseDate || item.installDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' :
                          item.status === 'Maintenance' ? 'bg-amber-500/15 text-amber-400' :
                          item.status === 'Replaced' ? 'bg-red-500/15 text-red-400' : 'bg-gray-500/15 text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button onClick={() => { setSelectedComponent(item); setDrawerOpen(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 cursor-pointer">
                          <FaEye />
                        </button>
                        <button onClick={() => { setSelectedComponent(item); setEditModalOpen(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 cursor-pointer">
                          <FaEdit />
                        </button>
                        <button onClick={() => { setSelectedComponent(item); setDeleteModalOpen(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-red-400 cursor-pointer">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. ANALYTICS & AI PREVIEW PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Status Pie Chart (6 Cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-1">Component Distribution by Status</h3>
              <p className="text-[11px] text-slate-400 mb-4">Inventory health ratio across network</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={5}>
                        {statusChartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Integration Preview Card (6 Cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-900 to-black border border-purple-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-3">
                  <FaBrain className="animate-pulse" />
                  <span>XGBOOST AI PREDICTIVE MODULE</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Risk Analysis Engine</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light mb-6">
                  Once registered clips undergo their first mobile inspection scan, the XGBoost engine calculates maintenance priority (Low, Medium, High) evaluating wear history, environmental exposure, and stress load.
                </p>

                <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-400 flex items-center justify-between">
                  <span>Model Readiness Status:</span>
                  <span className="text-emerald-400 font-mono">Awaiting Inspection Stream</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
                <span>AI Accuracy: 98.2%</span>
                <span>Framework: Scikit-Learn & XGBoost</span>
              </div>
            </div>

          </div>

        </main>

        {/* 5. VIEW COMPONENT DRAWER */}
        <AnimatePresence>
          {drawerOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="w-full max-w-md bg-slate-900 border-l border-white/10 p-6 overflow-y-auto h-full space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-sm font-bold text-white">Component Asset Details</h3>
                  <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><FaTimes /></button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4">
                    <FaQrcode className="text-4xl text-cyan-400" />
                    <div>
                      <div className="font-mono text-white font-bold">{selectedComponent.masterQrId || selectedComponent.qrId}</div>
                      <div className="text-slate-400">ID: {selectedComponent.batchDetails || selectedComponent.compId}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Child QR Range</span>
                      <span>{selectedComponent.childQrRange || `${selectedComponent.section}`}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Clip Count</span>
                      <span>{selectedComponent.clipsPurchased || 1}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Zone & Division</span>
                      <span>{selectedComponent.zone} - {selectedComponent.division}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Station</span>
                      <span>{selectedComponent.station}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Manufacturer</span>
                      <span>{selectedComponent.manufacturer}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Installation Date</span>
                      <span>{selectedComponent.purchaseDate || selectedComponent.installDate}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40">
                      <span className="text-slate-500 text-[10px] block">Purchased From</span>
                      <span>{selectedComponent.manufacturer}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setDrawerOpen(false)} className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer">
                  Close Drawer
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 6. EDIT COMPONENT MODAL */}
        <AnimatePresence>
          {editModalOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md bg-slate-900 border border-white/15 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white">Edit Component ({selectedComponent.compId})</h3>
                  <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><FaTimes /></button>
                </div>

                <form onSubmit={handleEditSave} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Status</label>
                    <select 
                      value={selectedComponent.status} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Replaced">Replaced</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Track Section</label>
                    <input 
                      type="text" 
                      value={selectedComponent.section} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Station Name</label>
                    <input 
                      type="text" 
                      value={selectedComponent.station} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, station: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 7. DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {deleteModalOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-slate-900 border border-red-500/30 p-6 rounded-2xl space-y-4 text-center">
                <FaExclamationTriangle className="text-4xl text-red-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Delete Railway Clip?</h3>
                <p className="text-xs text-slate-400">Are you sure you want to permanently delete clip <strong className="text-white">{selectedComponent.compId}</strong> ({selectedComponent.qrId})?</p>
                <div className="flex space-x-3 pt-2">
                  <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs cursor-pointer">Cancel</button>
                  <button onClick={handleDeleteConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer">Delete Permanent</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="mt-auto py-6 px-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>Database Status: <span className="font-mono text-emerald-400">Firebase Firestore Connected</span> | Total Components: <span className="font-mono text-slate-300">{componentsList.length}</span></div>
          <div>Powered by React, Firebase & Laser QR Technology</div>
        </footer>

      </div>
    </div>
  );
}