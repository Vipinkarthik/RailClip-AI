const { db } = require('../config/firebase');

const componentBatchesCollection = db.collection('component_batches');

function normalizeRangeValue(value) {
	return String(value || '').replace(/\s+/g, '').trim();
}

function parseChildQrRange(childQrRange) {
	const normalizedRange = normalizeRangeValue(childQrRange).toUpperCase();
	const match = normalizedRange.match(/^([A-Z]+)(\d+)-([A-Z]+)(\d+)$/);

	if (!match) {
		throw new Error('Child QR range must use the format RL001-RL100.');
	}

	const [, startPrefix, startNumber, endPrefix, endNumber] = match;

	if (startPrefix !== endPrefix) {
		throw new Error('Child QR range must use the same prefix for start and end values.');
	}

	const startValue = Number(startNumber);
	const endValue = Number(endNumber);

	if (!Number.isInteger(startValue) || !Number.isInteger(endValue)) {
		throw new Error('Child QR range numbers must be valid integers.');
	}

	if (endValue < startValue) {
		throw new Error('Child QR range end must be greater than or equal to the start.');
	}

	return {
		childQrPrefix: startPrefix,
		childQrStart: `${startPrefix}${startNumber}`,
		childQrEnd: `${endPrefix}${endNumber}`,
		childQrRange: `${startPrefix}${startNumber}-${endPrefix}${endNumber}`,
		clipsPurchased: endValue - startValue + 1,
	};
}

function parseScannedQrPayload(payload = {}) {
	const qrType = String(payload.type || payload.qrType || '').trim();
	const batchNo = String(payload.batchNo || payload.batchNumber || payload.masterQrId || payload.batchDetails || '').trim();
	const startClip = String(payload.startClip || payload.childQrStart || '').trim();
	const endClip = String(payload.endClip || payload.childQrEnd || '').trim();
	const totalClips = Number(payload.totalClips || payload.clipsPurchased || payload.clipCount);

	if (!batchNo || !startClip || !endClip) {
		return null;
	}

	const childQrRange = `${startClip}-${endClip}`;
	const range = parseChildQrRange(childQrRange);

	return {
		qrType,
		batchNo,
		masterQrId: batchNo,
		batchDetails: qrType || batchNo,
		childQrRange: range.childQrRange,
		childQrStart: range.childQrStart,
		childQrEnd: range.childQrEnd,
		clipsPurchased: Number.isFinite(totalClips) && totalClips > 0 ? totalClips : range.clipsPurchased,
	};
}

function mapBatchDocument(doc) {
	const data = doc.data();

	return {
		id: doc.id,
		masterQrId: data.masterQrId,
		qrId: data.masterQrId,
		batchNo: data.batchNo || data.masterQrId,
		qrType: data.qrType || data.batchDetails,
		batchDetails: data.batchDetails,
		compId: data.batchNo || data.batchDetails,
		childQrRange: data.childQrRange,
		childQrStart: data.childQrStart,
		childQrEnd: data.childQrEnd,
		clipsPurchased: data.clipsPurchased,
		totalClips: data.totalClips || data.clipsPurchased,
		purchaseDate: data.purchaseDate,
		manufacturer: data.manufacturer,
		zone: data.zone || 'Batch',
		division: data.division || 'Procurement',
		station: data.station || 'Warehouse',
		section: data.section || data.childQrRange,
		installDate: data.purchaseDate,
		status: data.status || 'Active',
		health: data.health ?? 100,
		priority: data.priority || 'Low',
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
	};
}

async function createBatch(req, res) {
	try {
		const {
			masterQrId,
			batchDetails,
			childQrRange,
			purchaseDate,
			manufacturer,
			batchNo,
			type,
			startClip,
			endClip,
			totalClips,
			status = 'Active',
		} = req.body || {};

		const scannedQr = parseScannedQrPayload({
			type,
			batchNo,
			masterQrId,
			batchDetails,
			startClip,
			endClip,
			totalClips,
		});

		const normalizedMasterQrId = String(masterQrId || scannedQr?.masterQrId || '').trim();
		const normalizedBatchDetails = String(batchDetails || scannedQr?.batchDetails || normalizedMasterQrId || 'MASTER').trim();
		const normalizedChildQrRange = String(childQrRange || scannedQr?.childQrRange || '').trim();

		if (!normalizedMasterQrId || !normalizedChildQrRange || !purchaseDate || !manufacturer) {
			return res.status(400).json({
				success: false,
				message: 'Master QR, child QR range, purchase date, and manufacturer are required.',
			});
		}

		const range = parseChildQrRange(normalizedChildQrRange);
		const parsedTotalClips = Number(totalClips || scannedQr?.clipsPurchased || range.clipsPurchased);
		const resolvedTotalClips = Number.isFinite(parsedTotalClips) && parsedTotalClips > 0 ? parsedTotalClips : range.clipsPurchased;
		const createdAt = new Date().toISOString();

		const batchRecord = {
			masterQrId: normalizedMasterQrId,
			batchNo: batchNo ? String(batchNo).trim() : normalizedMasterQrId,
			qrType: type ? String(type).trim() : scannedQr?.qrType || normalizedBatchDetails,
			batchDetails: normalizedBatchDetails,
			childQrRange: range.childQrRange,
			childQrStart: range.childQrStart,
			childQrEnd: range.childQrEnd,
			clipsPurchased: resolvedTotalClips,
			totalClips: resolvedTotalClips,
			purchaseDate: String(purchaseDate),
			manufacturer: String(manufacturer).trim(),
			status: String(status).trim() || 'Active',
			health: 100,
			priority: 'Low',
			zone: 'Batch',
			division: 'Procurement',
			station: 'Warehouse',
			section: batchDetails,
			installDate: String(purchaseDate),
			createdAt,
			updatedAt: createdAt,
		};

		const docRef = await componentBatchesCollection.add(batchRecord);

		return res.status(201).json({
			success: true,
			message: 'Batch registered successfully.',
			data: {
				id: docRef.id,
				...batchRecord,
			},
		});
	} catch (error) {
		return res.status(400).json({
			success: false,
			message: error?.message || 'Unable to register component batch.',
		});
	}
}

async function listBatches(req, res) {
	try {
		const snapshot = await componentBatchesCollection.orderBy('createdAt', 'desc').get();
		const data = snapshot.docs.map(mapBatchDocument);

		return res.json({
			success: true,
			data,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'Unable to load component batches.',
		});
	}
}

function mapClipDocument(doc) {
	const data = doc.data();
	const qrId = data.qrId || data.uClipID || doc.id;
	return {
		id: doc.id,
		qrId: qrId,
		masterQrId: data.batchNo || 'RC0001',
		batchNo: data.batchNo || 'RC0001',
		compId: qrId,
		batchDetails: data.section || data.trackSection || 'ERC Mk-III Fastener',
		childQrRange: data.section || 'D-1 Section',
		clipsPurchased: 1,
		totalClips: 1,
		purchaseDate: data.installationDate || '2026-08-05',
		installDate: data.installationDate || '2026-08-05',
		manufacturer: data.manufacturer || 'Selva Steels',
		zone: data.zone || 'Southern',
		division: data.division || 'Coimbatore',
		station: data.station || 'Coimbatore Jn',
		section: data.section || data.trackSection || 'D-1',
		status: data.status || (data.priority === 'High' || data.priority === 'Medium' ? 'Maintenance' : 'Active'),
		condition: data.condition || 'Healthy',
		health: data.health ?? 100,
		priority: data.priority || 'Low',
		confidence: data.confidence,
		looseCount: data.looseCount || 0,
		wearCount: data.wearCount || 0,
		replacementCount: data.replacementCount || 0,
		scanCount: data.scanCount || 1,
		lastScannedAt: data.lastScannedAt,
		lastInspection: data.lastScannedAt ? data.lastScannedAt.split('T')[0] : '2026-09-10',
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
	};
}

async function listClips(req, res) {
	try {
		const snapshot = await db.collection('railway_clips').get();
		const data = [];
		snapshot.forEach((doc) => {
			if (!doc.id.includes('\n') && !doc.id.includes('{')) {
				data.push(mapClipDocument(doc));
			}
		});

		data.sort((a, b) => a.qrId.localeCompare(b.qrId));

		return res.json({
			success: true,
			data,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'Unable to load railway clips.',
		});
	}
}

module.exports = {
	createBatch,
	listBatches,
	listClips,
};
