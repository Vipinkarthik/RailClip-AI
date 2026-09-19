const { db } = require('../config/firebase');
const { evaluateAndSaveClipPrediction } = require('./aiController');

const componentBatchesCollection = db.collection('component_batches');
const inspectionsCollection = db.collection('inspections');

function parseRangeStartEnd(childQrRange) {
	const normalizedRange = String(childQrRange || '').replace(/\s+/g, '').trim().toUpperCase();
	const match = normalizedRange.match(/^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/);
	if (!match) return null;
	const [, startPrefix, startNumber, endPrefix, endNumber] = match;
	if (startPrefix !== endPrefix) return null;
	return {
		prefix: startPrefix,
		start: Number(startNumber),
		end: Number(endNumber),
	};
}

function isClipInRange(clipId, childQrRange) {
	if (!clipId || !childQrRange) return false;
	const normalizedClip = String(clipId).trim().toUpperCase();
	const clipMatch = normalizedClip.match(/^([A-Z]+)(\d+)$/);
	if (!clipMatch) return false;
	const [, clipPrefix, clipNumber] = clipMatch;
	const range = parseRangeStartEnd(childQrRange);
	if (!range || range.prefix !== clipPrefix) return false;
	const num = Number(clipNumber);
	return num >= range.start && num <= range.end;
}

function parseRawQrText(rawText) {
	if (!rawText || typeof rawText !== 'string') {
		return { isValid: false, error: 'Invalid QR Code: Empty QR data.' };
	}
	const text = rawText.trim();
	if (!text) {
		return { isValid: false, error: 'Invalid QR Code: Empty QR data.' };
	}

	let batchNo = '';
	let uClipID = '';

	// 1. Try JSON format (with case-insensitive key normalization)
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

	// Single token fallback (e.g. user entered "C0015" or "BATCH001")
	if (!result.uClipId && text.match(/^[A-Za-z]\d{3,5}$/)) {
		result.uClipId = text.toUpperCase();
	}
	if (!result.batchNumber && text.match(/^(?:BATCH|RC|MB)\d{3,5}$/i)) {
		result.batchNumber = text.toUpperCase();
	}

	if (result.batchNumber || result.uClipId) {
		return {
			isValid: true,
			...result,
		};
	}

	return {
		isValid: false,
		error: 'Invalid QR Code / Input: Please scan or enter a valid Clip ID or Batch Number.',
	};
}

async function lookupComponent(req, res) {
	try {
		const {
			qrText = '',
			batchNumber: reqBatch,
			batchNo: reqBatchNo,
			uClipId: reqClip,
			clipId: reqClipId,
			district: reqDistrict,
			divisionSection: reqSection,
			dSection: reqDSection,
			fixedBy: reqFixedBy,
			gpsGeolocation: reqGps,
			geolocation: reqGeo,
			manufacturer: reqManufacturer,
			purchaseDate: reqPurchaseDate,
		} = req.body || {};

		const parsedFromQr = parseRawQrText(qrText);

		let batchNumber = String(reqBatch || reqBatchNo || parsedFromQr.batchNumber || '').trim();
		let uClipId = String(reqClip || reqClipId || parsedFromQr.uClipId || '').trim();
		let district = String(reqDistrict || parsedFromQr.district || '').trim();
		let divisionSection = String(reqSection || reqDSection || parsedFromQr.divisionSection || '').trim();
		let fixedBy = String(reqFixedBy || parsedFromQr.fixedBy || '').trim();
		let gpsGeolocation = String(reqGps || reqGeo || parsedFromQr.gpsGeolocation || '').trim();

		// Fallback: check if qrText is directly a clip ID like C0015
		if (!uClipId && qrText && /^[A-Za-z]\d{2,5}$/.test(qrText.trim())) {
			uClipId = qrText.trim().toUpperCase();
		}

		// Validation: At least one identifier must be present
		if (!batchNumber && !uClipId) {
			return res.status(400).json({
				success: false,
				message: parsedFromQr.error || 'Invalid QR / Clip ID: Scanned QR or input must contain a valid Clip ID or Batch Number.',
			});
		}

		let clipData = null;

		// 1. Query clip record from Firestore railway_clips collection
		if (uClipId) {
			const cleanClipId = uClipId.toUpperCase().trim();
			const directDoc = await db.collection('railway_clips').doc(cleanClipId).get();
			if (directDoc.exists) {
				clipData = directDoc.data();
			} else {
				const qSnap = await db.collection('railway_clips').where('uClipID', '==', cleanClipId).limit(1).get();
				if (!qSnap.empty) {
					clipData = qSnap.docs[0].data();
				} else {
					const qSnapLower = await db.collection('railway_clips').where('qrId', '==', cleanClipId).limit(1).get();
					if (!qSnapLower.empty) {
						clipData = qSnapLower.docs[0].data();
					}
				}
			}
		}

		// 2. If not found in railway_clips, search across section-based collections (e.g. clips_coimbatore_D-1)
		if (!clipData && uClipId) {
			const cleanClipId = uClipId.toUpperCase().trim();
			try {
				const allCollections = await db.listCollections();
				const clipCollections = allCollections.filter((c) => c.id.startsWith('clips_'));
				for (const col of clipCollections) {
					const docSnap = await col.doc(cleanClipId).get();
					if (docSnap.exists) {
						clipData = docSnap.data();
						break;
					}
					const qSnap = await col.where('uClipID', '==', cleanClipId).limit(1).get();
					if (!qSnap.empty) {
						clipData = qSnap.docs[0].data();
						break;
					}
				}
			} catch (colErr) {
				console.warn('Error querying section collections:', colErr);
			}
		}

		// Merge clip database fields
		if (clipData) {
			if (!batchNumber && clipData.batchNo) batchNumber = clipData.batchNo;
			if (!district && clipData.district) district = clipData.district.toUpperCase();
			if (!divisionSection && (clipData.dSection || clipData.division || clipData.trackSection)) {
				divisionSection = clipData.dSection || clipData.division || clipData.trackSection;
			}
			if (!fixedBy && clipData.fixedBy) fixedBy = clipData.fixedBy;

			// Resolve Worker details if employeeId exists in workers collection
			if (clipData.employeeId) {
				try {
					const workerDoc = await db.collection('workers').doc(clipData.employeeId).get();
					if (workerDoc.exists) {
						const wData = workerDoc.data();
						const empCode = wData.employeeId || wData.workerId || '';
						const empName = wData.displayName || clipData.fixedBy || '';
						if (empCode && !fixedBy.includes(empCode)) {
							fixedBy = empName ? `${empName} (${empCode})` : empCode;
						}
					}
				} catch (wErr) {
					console.warn('Worker lookup error:', wErr);
				}
			}

			// Format GPS location
			if (!gpsGeolocation) {
				if (clipData.latitude && clipData.longitude) {
					gpsGeolocation = `${Number(clipData.latitude).toFixed(4)}, ${Number(clipData.longitude).toFixed(4)}`;
				} else if (clipData.address) {
					gpsGeolocation = clipData.address.replace(/^Lat:\s*/i, '').replace(/,\s*Long:\s*/i, ', ');
				}
			}
		}

		// 3. Query master batches from Firestore component_batches collection
		let matchedBatch = null;
		const allBatchesSnap = await componentBatchesCollection.get();
		const allBatches = allBatchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

		const targetBatch = batchNumber || clipData?.batchNo || '';

		// A. Match by master batch ID or batchNo
		if (targetBatch) {
			const cleanBatch = targetBatch.toUpperCase().trim();
			matchedBatch = allBatches.find(
				(b) =>
					String(b.masterQrId || '').toUpperCase().trim() === cleanBatch ||
					String(b.batchNo || '').toUpperCase().trim() === cleanBatch ||
					String(b.id || '').toUpperCase().trim() === cleanBatch
			);
		}

		// B. Match if uClipId is contained in childQrRange
		if (!matchedBatch && uClipId) {
			matchedBatch = allBatches.find((b) => isClipInRange(uClipId, b.childQrRange));
		}

		// 4. Extract manufacturer and purchase date
		const manufacturer =
			matchedBatch?.manufacturer ||
			parsedFromQr.manufacturer ||
			reqManufacturer ||
			(matchedBatch ? 'N/A' : 'Batch not found in registry');

		const purchaseDate =
			matchedBatch?.purchaseDate ||
			matchedBatch?.installDate ||
			clipData?.installationDate ||
			parsedFromQr.purchaseDate ||
			reqPurchaseDate ||
			'N/A';

		const totalScans = clipData?.scanCount || clipData?.stats?.totalScans || 0;
		const looseCount = clipData?.looseCount || clipData?.stats?.looseCount || 0;
		const healthScore = clipData?.health !== undefined ? clipData.health : (looseCount > 0 ? Math.max(40, 100 - looseCount * 10) : (matchedBatch?.health ?? 100));

		const resolvedProfile = {
			batchNumber: targetBatch || matchedBatch?.masterQrId || matchedBatch?.batchNo || 'N/A',
			uClipId: uClipId || clipData?.uClipID || clipData?.qrId || 'N/A',
			district: (district || clipData?.district || '').toUpperCase() || 'N/A',
			divisionSection: divisionSection || clipData?.section || clipData?.dSection || clipData?.division || matchedBatch?.section || 'N/A',
			fixedBy: fixedBy || clipData?.fixedBy || 'N/A',
			gpsGeolocation: gpsGeolocation || 'N/A',
			manufacturer: clipData?.manufacturer || manufacturer,
			purchaseDate: clipData?.installationDate || purchaseDate,
			status: clipData?.status || matchedBatch?.status || 'Active',
			condition: clipData?.condition || 'Good Condition',
			health: healthScore,
			priority: clipData?.priority || clipData?.stats?.lastPriority || matchedBatch?.priority || 'Low',
			zone: clipData?.zone || matchedBatch?.zone || 'N/A',
			division: clipData?.division || matchedBatch?.division || 'N/A',
			station: clipData?.station || matchedBatch?.station || 'N/A',
			trackType: 'Broad Gauge (1676 mm)',
			material: 'Spring Steel 60Si7',
			lastInspectionDate: clipData?.lastScannedAt ? clipData.lastScannedAt.split('T')[0] : new Date().toISOString().split('T')[0],
			inspectionCount: totalScans,
			maintenanceCount: looseCount,
		};

		return res.json({
			success: true,
			data: resolvedProfile,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'Unable to lookup component details.',
		});
	}
}

async function createInspection(req, res) {
	try {
		const {
			inspectionDate,
			inspectorId,
			condition,
			severity,
			gpsLocation,
			remarks,
			district,
			batchNumber,
			uClipId,
		} = req.body || {};

		if (!inspectorId) {
			return res.status(400).json({
				success: false,
				message: 'Inspector ID is required.',
			});
		}

		const formattedDate = inspectionDate || new Date().toISOString().split('T')[0];
		const cleanCondition = condition || 'Healthy';
		const cleanSeverity = severity || 'Low';

		const newRecord = {
			inspectionDate: formattedDate,
			inspectorId: String(inspectorId || '').trim(),
			condition: cleanCondition,
			severity: cleanSeverity,
			gpsLocation: String(gpsLocation || '').trim(),
			remarks: String(remarks || '').trim(),
			district: String(district || '').toUpperCase().trim(),
			date: `${formattedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
			createdAt: new Date().toISOString(),
		};

		if (batchNumber && batchNumber !== 'N/A') newRecord.batchNumber = String(batchNumber).trim();
		if (uClipId && uClipId !== 'N/A') newRecord.uClipId = String(uClipId).trim();

		const docRef = await inspectionsCollection.add(newRecord);

		// Trigger real-time AI evaluation across all merged scans for this clip
		let aiEvaluation = null;
		if (newRecord.uClipId) {
			try {
				aiEvaluation = await evaluateAndSaveClipPrediction(newRecord.uClipId, newRecord.batchNumber);
			} catch (evalErr) {
				console.warn('Auto AI evaluation after inspection log error:', evalErr.message);
			}
		}

		return res.status(201).json({
			success: true,
			message: 'Inspection logged successfully and AI telemetry synchronized.',
			data: {
				id: docRef.id,
				...newRecord,
				aiEvaluation,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'Unable to save inspection.',
		});
	}
}

async function listInspections(req, res) {
	try {
		let snapshot;
		try {
			snapshot = await inspectionsCollection.orderBy('createdAt', 'desc').limit(100).get();
		} catch (orderErr) {
			console.warn('Fallback ordering for inspections:', orderErr.message);
			snapshot = await inspectionsCollection.get();
		}

		let data = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		data.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));

		return res.json({
			success: true,
			data,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'Unable to list inspections.',
		});
	}
}

module.exports = {
	lookupComponent,
	createInspection,
	listInspections,
};
