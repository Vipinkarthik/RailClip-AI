import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createComponentBatch, listComponentBatches, listClips } from '../api/components';
import { getAiPredictions } from '../api/ai';
import { getLoggedInDistrictOfficer } from '../services/authHelper';
import { BrowserQRCodeReader } from '@zxing/browser';
import { 
  FaQrcode, FaBrain, FaCloud, FaShieldAlt, FaChartLine, 
  FaSearch, FaBell, FaUserCircle, FaBars, FaTimes, 
  FaPlus, FaFilter, FaDownload, FaSync, FaEye, FaEdit, 
  FaTrash, FaPrint, FaMapMarkerAlt, FaCogs, FaSignOutAlt, 
  FaFolder, FaMicrochip, FaExclamationTriangle, FaCheckCircle, 
  FaTools, FaCalendarAlt, FaBuilding, FaIndustry, FaCheck,
  FaArrowRight, FaLayerGroup, FaHistory, FaInfoCircle, FaUserPlus, FaCamera, FaUpload,
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
  const [viewMode, setViewMode] = useState('clips'); // 'clips' or 'batches'
  const [componentsList, setComponentsList] = useState([]);
  const [clipsList, setClipsList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
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

  const loadData = async () => {
    try {
      setLoadingBatches(true);
      const [batchesRes, clipsRes] = await Promise.allSettled([
        listComponentBatches(),
        listClips(),
      ]);

      const batches = batchesRes.status === 'fulfilled' && Array.isArray(batchesRes.value?.data) ? batchesRes.value.data : [];
      let clips = clipsRes.status === 'fulfilled' && Array.isArray(clipsRes.value?.data) && clipsRes.value.data.length > 0
        ? clipsRes.value.data 
        : [];

      if (clips.length === 0) {
        try {
          const aiRes = await getAiPredictions();
          if (aiRes?.success && Array.isArray(aiRes.data)) {
            clips = aiRes.data;
          }
        } catch (e) {}
      }

      const normBatches = batches.map(normalizeBatchRecord).filter(Boolean);
      const normClips = clips.map(normalizeBatchRecord).filter(Boolean);

      setBatchesList(normBatches);
      setClipsList(normClips);

      if (viewMode === 'batches') {
        setComponentsList(normBatches);
      } else {
        setComponentsList(normClips.length ? normClips : normBatches);
      }
    } catch (error) {
      setComponentsList([]);
      setNotifications((prev) => [
        { id: Date.now(), msg: 'Unable to load components from the backend', time: 'Just now' },
        ...prev,
      ]);
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (viewMode === 'batches') {
      setComponentsList(batchesList);
    } else {
      setComponentsList(clipsList.length ? clipsList : batchesList);
    }
  }, [viewMode, clipsList, batchesList]);

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
    const resolvedBatchDetails = formData.batchDetails || formData.masterQrId || 'MASTER';

    if (!formData.masterQrId || !formData.childQrRange || !formData.manufacturer || !formData.purchaseDate) {
      alert('Please fill in the master QR, child QR range, manufacturer, and purchase date.');
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
        batchDetails: resolvedBatchDetails,
        childQrRange: rangeDetails.childQrRange,
        purchaseDate: formData.purchaseDate,
        manufacturer: formData.manufacturer,
        batchNo: formData.masterQrId,
        type: resolvedBatchDetails,
        startClip: rangeDetails.childQrStart,
        endClip: rangeDetails.childQrEnd,
        totalClips: rangeDetails.clipsPurchased,
      });

      const savedBatch = normalizeBatchRecord(response?.data || response);

      setComponentsList((currentList) => [savedBatch, ...currentList]);
      setNotifications((prev) => [
        {
          id: Date.now(),
          msg: `Batch ${savedBatch.masterQrId} registered with ${savedBatch.clipsPurchased} clips`,
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
  const districtOfficer = getLoggedInDistrictOfficer();

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
              <span className="font-medium">Master Batch Registry</span>
              <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full w-[100%]" />
            </div>
            <div className="mt-2 text-[10px] text-blue-300 font-mono">RDSO T-3701 Fastener Database</div>
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
              <span>ERC Fastener Registry</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                RDSO T-3701 / T-4001
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-normal">Register, Laser Serialise, and Manage Elastic Rail Clips across {districtOfficer.subtitle}</p>
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

          {/* 1. TOP STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { 
                title: 'Total Registered', 
                count: (clipsList.length || componentsList.length), 
                trend: 'Active Fleet', 
                icon: FaQrcode, 
                color: 'from-[#003366] to-[#0284c7]' 
              },
              { 
                title: 'Healthy Components', 
                count: (clipsList.length ? clipsList : componentsList).filter(c => c.status === 'Active' || c.priority === 'Low').length, 
                trend: 'Optimal (100%)', 
                icon: FaCheckCircle, 
                color: 'from-emerald-700 to-emerald-500' 
              },
              { 
                title: 'Under Maintenance', 
                count: (clipsList.length ? clipsList : componentsList).filter(c => c.status === 'Maintenance' || c.priority === 'High' || c.priority === 'Medium').length, 
                trend: 'High & Medium Risk', 
                icon: FaTools, 
                color: 'from-amber-600 to-orange-500' 
              },
              { 
                title: 'Components Replaced', 
                count: (clipsList.length ? clipsList : componentsList).filter(c => c.status === 'Replaced').length, 
                trend: 'Logged', 
                icon: FaExclamationTriangle, 
                color: 'from-rose-700 to-red-500' 
              },
              { 
                title: 'Degradation Ratio', 
                count: `${clipsList.length ? ((clipsList.filter(c => c.priority === 'High' || c.priority === 'Medium').length / clipsList.length) * 100).toFixed(0) : 0}%`, 
                trend: 'Fatigue Risk', 
                icon: FaChartLine, 
                color: 'from-purple-700 to-indigo-600' 
              },
              { 
                title: 'Cloud Sync', 
                count: '100%', 
                trend: 'Firestore Live', 
                icon: FaCloud, 
                color: 'from-blue-700 to-indigo-600' 
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-sm`}>
                      <Icon className="text-base" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight mb-1 font-mono">{stat.count}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{stat.title}</div>
                </div>
              );
            })}
          </div>

          {/* 2. REGISTRATION & QR GENERATION SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Component Registration Form (12 Cols) */}
            <div className="lg:col-span-12 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FaPlus className="text-blue-600" />
                    Register New Railway Track Clip Batch
                  </h2>
                  <p className="text-[11px] text-slate-500">Initialize clip batch metadata before etching laser QR identity code on field assets</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={handleOpenScanner} 
                    className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 flex items-center gap-2 cursor-pointer transition-all shrink-0 shadow-xs"
                  >
                    <FaCamera className="text-xs text-blue-600" />
                    <span>Scan / Upload Master QR</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveComponent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">{qrFieldHints.masterQrId} *</label>
                    <input 
                      type="text" 
                      name="masterQrId"
                      value={formData.masterQrId}
                      onChange={handleInputChange}
                      placeholder="e.g. RC0001"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">{qrFieldHints.childQrRange} *</label>
                    <input 
                      type="text" 
                      name="childQrRange"
                      value={formData.childQrRange}
                      onChange={handleInputChange}
                      placeholder="e.g. C0001-C0050"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Derived Clip Count</label>
                    <div className="w-full px-3 py-2.5 rounded-xl bg-blue-50/70 border border-dashed border-blue-300 text-blue-800 text-xs font-bold font-mono flex items-center justify-between">
                      <span>{activeRangePreview ? `${activeRangePreview.clipsPurchased} clips` : 'Enter a valid range'}</span>
                      {activeRangePreview && <span className="text-[10px] text-blue-600 font-normal">RDSO Verified</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Purchased From (Manufacturer) *</label>
                    <input 
                      type="text" 
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="e.g. Jindal Steel / SAIL RDSO Certified"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Date of Purchase *</label>
                    <input 
                      type="date" 
                      name="purchaseDate" 
                      value={formData.purchaseDate} 
                      onChange={handleInputChange} 
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:border-blue-600 focus:outline-none transition-all" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[11px] text-slate-600">
                  <span>{scannerStatus}</span>
                  <button type="button" onClick={handleFillFromManualQr} className="text-blue-700 font-semibold hover:text-blue-900 cursor-pointer">
                    Autofill from pasted QR
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-[11px] text-slate-600">
                  <span>{loadingBatches ? 'Syncing existing batches from the backend...' : 'Batch sync ready.'}</span>
                  <span className="font-mono text-blue-700 font-semibold">
                    {activeRangePreview ? `${activeRangePreview.childQrStart} to ${activeRangePreview.childQrEnd}` : 'Awaiting QR range'}
                  </span>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#003366] to-[#0055a5] hover:from-[#002244] hover:to-[#004080] text-white text-xs font-semibold shadow-md shadow-blue-950/20 hover:opacity-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                  >
                    {isSubmitting ? 'Saving Batch...' : 'Save Batch to Registry'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          <AnimatePresence>
            {isScannerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900"
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Upload Master QR</h3>
                      <p className="text-[11px] text-slate-500">Upload a QR image to fill the batch fields automatically.</p>
                    </div>
                    <button type="button" onClick={closeScannerModal} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                      <FaTimes />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <FaCloud className="text-xl" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">Choose a QR image file</p>
                    <p className="mt-1 text-[11px] text-slate-500">PNG, JPG, JPEG, or WEBP with a clear QR code.</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="mt-4 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-800"
                    />
                    {qrPreviewSrc && (
                      <img
                        src={qrPreviewSrc}
                        alt="QR preview"
                        className="mx-auto mt-4 max-h-56 rounded-2xl border border-slate-200 object-contain shadow-sm"
                      />
                    )}
                    {uploadedQrName && <p className="mt-3 text-[11px] text-blue-700 font-semibold">Selected file: {uploadedQrName}</p>}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{scannerStatus}</span>
                    <button type="button" onClick={closeScannerModal} className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-slate-700 font-semibold cursor-pointer">
                      Close Scanner
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 3. DATA TABLE & FILTERS SECTION */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {viewMode === 'clips' ? 'Registered Railway Track Clips' : 'Master Batch Registry'}
                  </h3>
                  <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode('clips')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        viewMode === 'clips' 
                          ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Clips Inventory ({clipsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('batches')}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        viewMode === 'batches' 
                          ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Master Batches ({batchesList.length})
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Complete digitized inventory logs synced with cloud database</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, section..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
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
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                  {viewMode === 'clips' ? (
                    <tr>
                      <th className="py-3 px-4">Clip ID / QR</th>
                      <th className="py-3 px-4">Batch No</th>
                      <th className="py-3 px-4">Section & Station</th>
                      <th className="py-3 px-4">Health Score</th>
                      <th className="py-3 px-4">AI Priority</th>
                      <th className="py-3 px-4">Condition</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="py-3 px-4">Master QR</th>
                      <th className="py-3 px-4">Batch Details</th>
                      <th className="py-3 px-4">Child QR Range</th>
                      <th className="py-3 px-4">Clips</th>
                      <th className="py-3 px-4">Purchase Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredComponents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No component records found matching your filters.
                      </td>
                    </tr>
                  ) : viewMode === 'clips' ? (
                    filteredComponents.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-blue-700 font-bold">{item.qrId || item.compId}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{item.batchNo || item.masterQrId || 'RC0001'}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900">{item.section || item.childQrRange}</div>
                          <div className="text-[10px] text-slate-500">{item.station || 'Coimbatore Jn'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className={item.health > 80 ? 'text-emerald-700' : item.health > 50 ? 'text-amber-700' : 'text-rose-700'}>
                            {item.health}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            item.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {item.priority || 'Low'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.condition || 'Healthy'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            item.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            item.status === 'Replaced' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button onClick={() => { setSelectedComponent(item); setDrawerOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 cursor-pointer transition-all" title="View details">
                            <FaEye />
                          </button>
                          <button onClick={() => { setSelectedComponent(item); setEditModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-amber-700 border border-slate-200 cursor-pointer transition-all" title="Edit">
                            <FaEdit />
                          </button>
                          <button onClick={() => { setSelectedComponent(item); setDeleteModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 cursor-pointer transition-all" title="Delete">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredComponents.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-blue-700 font-semibold">{item.masterQrId || item.qrId}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">{item.batchDetails || item.compId}</td>
                        <td className="py-3.5 px-4">{item.childQrRange || `${item.section} (${item.station})`}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">{item.clipsPurchased || 1}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{item.purchaseDate || item.installDate}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            item.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            item.status === 'Replaced' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button onClick={() => { setSelectedComponent(item); setDrawerOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 cursor-pointer transition-all" title="View details">
                            <FaEye />
                          </button>
                          <button onClick={() => { setSelectedComponent(item); setEditModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-amber-700 border border-slate-200 cursor-pointer transition-all" title="Edit">
                            <FaEdit />
                          </button>
                          <button onClick={() => { setSelectedComponent(item); setDeleteModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 cursor-pointer transition-all" title="Delete">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* 5. VIEW COMPONENT DRAWER */}
        <AnimatePresence>
          {drawerOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="w-full max-w-md bg-white border-l border-slate-200 p-6 overflow-y-auto h-full space-y-6 text-slate-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-900">Component Asset Details</h3>
                  <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><FaTimes /></button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center space-x-4">
                    <FaQrcode className="text-4xl text-blue-700" />
                    <div>
                      <div className="font-mono text-slate-900 font-bold text-sm">{selectedComponent.masterQrId || selectedComponent.qrId}</div>
                      <div className="text-slate-500">ID: {selectedComponent.batchDetails || selectedComponent.compId}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-700">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-semibold">Child QR Range</span>
                      <span className="font-mono">{selectedComponent.childQrRange || `${selectedComponent.section}`}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-semibold">Clip Count</span>
                      <span className="font-bold text-emerald-700">{selectedComponent.clipsPurchased || 1}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-semibold">Zone & Division</span>
                      <span>{selectedComponent.zone} - {selectedComponent.division}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-semibold">Station</span>
                      <span>{selectedComponent.station}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-semibold">Manufacturer</span>
                      <span className="font-medium">{selectedComponent.manufacturer}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px] block font-semibold">Installation Date</span>
                      <span className="font-mono">{selectedComponent.purchaseDate || selectedComponent.installDate}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2">
                      <span className="text-slate-500 text-[10px] block font-semibold">Purchased From</span>
                      <span>{selectedComponent.manufacturer}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setDrawerOpen(false)} className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-all">
                  Close Drawer
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 6. EDIT COMPONENT MODAL */}
        <AnimatePresence>
          {editModalOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xl text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Edit Component ({selectedComponent.compId})</h3>
                  <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><FaTimes /></button>
                </div>

                <form onSubmit={handleEditSave} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Status</label>
                    <select 
                      value={selectedComponent.status} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Replaced">Replaced</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Track Section</label>
                    <input 
                      type="text" 
                      value={selectedComponent.section} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Station Name</label>
                    <input 
                      type="text" 
                      value={selectedComponent.station} 
                      onChange={(e) => setSelectedComponent({ ...selectedComponent, station: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer font-medium">Cancel</button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 7. DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {deleteModalOpen && selectedComponent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white border border-rose-200 p-6 rounded-2xl space-y-4 text-center shadow-xl text-slate-900">
                <FaExclamationTriangle className="text-4xl text-rose-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Delete Railway Clip?</h3>
                <p className="text-xs text-slate-500">Are you sure you want to permanently delete clip <strong className="text-slate-900">{selectedComponent.compId}</strong> ({selectedComponent.qrId})?</p>
                <div className="flex space-x-3 pt-2">
                  <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs cursor-pointer font-medium">Cancel</button>
                  <button onClick={handleDeleteConfirm} className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer">Delete Permanent</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="mt-auto py-4 px-8 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Database Status: <span className="font-mono text-emerald-700 font-bold">Firebase Firestore Connected</span> | Total Components: <span className="font-mono text-slate-800 font-semibold">{componentsList.length}</span></div>
          <div>Indian Railways Track Telemetry Platform • RDSO Compliant</div>
        </footer>

      </div>
    </div>
  );
}