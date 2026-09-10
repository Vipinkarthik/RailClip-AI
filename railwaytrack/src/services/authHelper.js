import { auth } from './firebase';

export function getLoggedInDistrictOfficer() {
  let email = '';

  try {
    const rawAuth =
      window.localStorage.getItem('railclip-auth') ||
      window.sessionStorage.getItem('railclip-auth');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      email = parsed?.user?.email || parsed?.email || '';
    }
  } catch {}

  if (!email && auth?.currentUser?.email) {
    email = auth.currentUser.email;
  }

  let prefix = '';
  if (email && email.includes('@')) {
    prefix = email.split('@')[0].trim();
  } else if (email) {
    prefix = email.trim();
  }

  if (!prefix) {
    prefix = 'coimbatore';
  }

  const formattedDistrict = prefix
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return {
    rawPrefix: prefix,
    district: formattedDistrict,
    title: `${formattedDistrict} Officer`,
    subtitle: `${formattedDistrict} Division`,
  };
}
