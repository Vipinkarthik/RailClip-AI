const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccountPath =
	process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
	path.join(__dirname, '..', '..', 'railwaytrack', 'railclpi-ai-firebase.json');

if (!fs.existsSync(serviceAccountPath)) {
	throw new Error(
		`Firebase service account file not found at ${serviceAccountPath}. Set FIREBASE_SERVICE_ACCOUNT_PATH or place the JSON file there.`
	);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!getApps().length) {
	initializeApp({
		credential: cert(serviceAccount),
	});
}

module.exports = {
	auth: getAuth(),
	db: getFirestore(),
	serviceAccountPath,
};
