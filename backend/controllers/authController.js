const { auth } = require('../config/firebase');

async function login(req, res) {
  try {
    const { idToken, rememberMe = false } = req.body || {};

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required.',
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decodedToken.uid);

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token: idToken,
      rememberMe: Boolean(rememberMe),
      user: {
        uid: decodedToken.uid,
        email: userRecord.email || decodedToken.email || null,
        name: userRecord.displayName || null,
        photoURL: userRecord.photoURL || null,
        emailVerified: Boolean(userRecord.emailVerified),
        claims: decodedToken,
        district: decodedToken.district || decodedToken.districtName || null,
        districtName: decodedToken.districtName || null,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error?.message || 'Unable to verify Firebase session.',
    });
  }
}

module.exports = {
  login,
};