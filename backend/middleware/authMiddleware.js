const { auth } = require('../config/firebase');

async function protect(req, res, next) {
	const header = req.headers.authorization || '';

	if (!header.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Not authorized, missing token.' });
	}

	try {
		const token = header.split(' ')[1];
		req.user = await auth.verifyIdToken(token);
		return next();
	} catch (error) {
		return res.status(401).json({ message: 'Not authorized, invalid token.' });
	}
}

module.exports = {
	protect,
};
