import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyC7L8cKPMhtHx8cvkhuSYs0jis5E5OohBE',
	authDomain: 'railclpi-ai.firebaseapp.com',
	projectId: 'railclpi-ai',
	storageBucket: 'railclpi-ai.firebasestorage.app',
	messagingSenderId: '591167209175',
	appId: '1:591167209175:web:693f28cd985736f4ceba92',
	measurementId: 'G-KTKL63G6Q4',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
