const crypto = require('crypto');
const { auth, db } = require('../config/firebase');

const WORKER_DISTRICT_LABEL = 'Coimbatore';

const DISTRICT_CODE_MAP = {
	coimbatore: 'CBE',
	chennai: 'CHN',
	madurai: 'MDU',
	trichy: 'TRY',
	tiruchirappalli: 'TRY',
	salem: 'SLM',
	erode: 'ERD',
	tirunelveli: 'TNV',
	thoothukudi: 'TUT',
	vellore: 'VLR',
	thanjavur: 'TNJ',
	dindigul: 'DGL',
	kanchipuram: 'KPM',
	cuddalore: 'CDL',
	nagapattinam: 'NGP',
	karur: 'KRR',
	namakkal: 'NMK',
	krishnagiri: 'KGI',
	dharmapuri: 'DPI',
	tiruvannamalai: 'TVM',
	villupuram: 'VPM',
};

function getLocationCode(adminEmail) {
	const normalized = String(adminEmail || '').trim().toLowerCase();
	for (const [district, code] of Object.entries(DISTRICT_CODE_MAP)) {
		if (normalized.includes(district)) {
			return code;
		}
	}
	return 'GEN';
}

async function generateEmployeeId(locationCode) {
	const counterRef = db.collection('counters').doc(`employeeId_${locationCode}`);

	const newCount = await db.runTransaction(async (transaction) => {
		const counterDoc = await transaction.get(counterRef);
		let currentCount = 0;
		if (counterDoc.exists) {
			currentCount = counterDoc.data().count || 0;
		}
		const nextCount = currentCount + 1;
		transaction.set(counterRef, { count: nextCount, updatedAt: new Date().toISOString() }, { merge: true });
		return nextCount;
	});

	const paddedNum = String(newCount).padStart(3, '0');
	return `RT${locationCode}${paddedNum}`;
}

function deriveDistrictFromEmail(email) {
	const normalizedEmail = String(email || '').trim().toLowerCase();

	if (!normalizedEmail) {
		return { districtKey: '', districtLabel: '' };
	}

	if (normalizedEmail.endsWith('@gmail.com')) {
		const districtKey = normalizedEmail.slice(0, normalizedEmail.lastIndexOf('@gmail.com'));
		return { districtKey, districtLabel: districtKey };
	}

	if (normalizedEmail.includes('@')) {
		return { districtKey: normalizedEmail, districtLabel: normalizedEmail };
	}

	return { districtKey: normalizedEmail, districtLabel: normalizedEmail };
}

function normalizeEmail(email) {
	return String(email || '').trim().toLowerCase();
}

function hashAadhaar(aadhaarNumber) {
	return crypto.createHash('sha256').update(String(aadhaarNumber || '').trim()).digest('hex');
}

function isValidMobile(value) {
	return /^[0-9]{10}$/.test(String(value || '').trim());
}

function isValidAadhaar(value) {
	return /^[0-9]{12}$/.test(String(value || '').trim());
}

function isValidPassword(value) {
	return String(value || '').trim().length >= 8;
}

async function createWorkerAccount(req, res) {
	try {
		const {
			fullName = '',
			mobileNumber,
			aadhaarNumber,
			email,
			password,
			dSection = '',
			accessRole = '',
		} = req.body || {};
		const adminUid = req.user?.uid || '';
		const adminEmail = req.user?.email || '';
		const derivedDistrict = deriveDistrictFromEmail(adminEmail);
		const districtKey = derivedDistrict.districtKey;
		const districtLabel = derivedDistrict.districtLabel || WORKER_DISTRICT_LABEL;

		if (!districtKey) {
			return res.status(403).json({
				success: false,
				message: 'Admin email is required to create a worker account.',
			});
		}

		const normalizedEmail = normalizeEmail(email);

		if (!normalizedEmail || !mobileNumber || !aadhaarNumber || !password) {
			return res.status(400).json({
				success: false,
				message: 'Full name, mobile number, Aadhaar number, email, and password are required.',
			});
		}

		if (!isValidMobile(mobileNumber)) {
			return res.status(400).json({
				success: false,
				message: 'Enter a valid 10-digit mobile number.',
			});
		}

		if (!isValidAadhaar(aadhaarNumber)) {
			return res.status(400).json({
				success: false,
				message: 'Enter a valid 12-digit Aadhaar number.',
			});
		}

		if (!isValidPassword(password)) {
			return res.status(400).json({
				success: false,
				message: 'Password must contain at least 8 characters.',
			});
		}

		try {
			await auth.getUserByEmail(normalizedEmail);
			return res.status(409).json({
				success: false,
				message: 'A worker account already exists for this email address.',
			});
		} catch (error) {
			if (error?.code !== 'auth/user-not-found') {
				throw error;
			}
		}

		const locationCode = getLocationCode(adminEmail);
		const employeeId = await generateEmployeeId(locationCode);

		const displayName = String(fullName || normalizedEmail.split('@')[0]).trim();
		const userRecord = await auth.createUser({
			email: normalizedEmail,
			password,
			displayName,
			emailVerified: false,
			disabled: false,
		});

		await auth.setCustomUserClaims(userRecord.uid, {
			role: 'worker',
			district: districtKey,
			districtName: districtLabel,
			emailIsolationKey: normalizedEmail,
		});

		const createdAt = new Date().toISOString();
		const workerProfile = {
			uid: userRecord.uid,
			employeeId,
			email: normalizedEmail,
			emailIsolationKey: normalizedEmail,
			displayName,
			mobileNumber: String(mobileNumber).trim(),
			aadhaarHash: hashAadhaar(aadhaarNumber),
			aadhaarLast4: String(aadhaarNumber).slice(-4),
			district: districtLabel,
			districtKey,
			dSection: String(dSection).trim(),
			accessRole: String(accessRole).trim(),
			createdByUid: adminUid,
			createdByEmail: adminEmail || null,
			role: 'worker',
			status: 'Active',
			createdAt,
			updatedAt: createdAt,
			createdBy: adminUid || 'system',
		};

		await db.collection('workers')
			.doc(userRecord.uid)
			.set(workerProfile);

		await db.collection('admins')
			.doc(adminUid)
			.collection('workers')
			.doc(userRecord.uid)
			.set(workerProfile);

		return res.status(201).json({
			success: true,
			message: 'Worker account created successfully.',
			data: {
				uid: userRecord.uid,
				employeeId: workerProfile.employeeId,
				email: workerProfile.email,
				displayName: workerProfile.displayName,
				mobileNumber: workerProfile.mobileNumber,
				aadhaarLast4: workerProfile.aadhaarLast4,
				district: workerProfile.district,
				districtKey: workerProfile.districtKey,
				dSection: workerProfile.dSection,
				accessRole: workerProfile.accessRole,
				role: workerProfile.role,
				status: workerProfile.status,
				customClaims: {
					role: 'worker',
					district: districtKey,
					districtName: districtLabel,
					adminEmail: adminEmail || null,
					createdByUid: adminUid || null,
				},
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'Unable to create worker account.',
		});
	}
}

async function getMyWorkerProfile(req, res) {
	try {
		const email = normalizeEmail(req.user?.email);

		if (!req.user?.uid || !email) {
			return res.status(401).json({
				success: false,
				message: 'Not authorized.',
			});
		}

		const snapshot = await db.collection('workers')
			.doc(req.user.uid)
			.get();

		if (!snapshot.exists) {
			return res.status(403).json({
				success: false,
				message: 'Worker profile is not available for this account.',
			});
		}

		const data = snapshot.data();

		if (normalizeEmail(data.email) !== email) {
			return res.status(403).json({
				success: false,
				message: 'Email isolation check failed.',
			});
		}

		return res.json({
			success: true,
			data: {
				uid: data.uid,
				employeeId: data.employeeId || '',
				email: data.email,
				displayName: data.displayName,
				mobileNumber: data.mobileNumber,
				district: data.district || WORKER_DISTRICT_LABEL,
				districtKey: data.districtKey,
				dSection: data.dSection || '',
				accessRole: data.accessRole || '',
				role: data.role,
				status: data.status,
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'Unable to load worker profile.',
		});
	}
}

module.exports = {
	createWorkerAccount,
	getMyWorkerProfile,
};
