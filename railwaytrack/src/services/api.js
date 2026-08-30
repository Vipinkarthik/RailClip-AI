import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

export function setAuthToken(token) {
	if (token) {
		api.defaults.headers.common.Authorization = `Bearer ${token}`;
		return;
	}

	delete api.defaults.headers.common.Authorization;
}

export function loginUser(payload) {
	return api.post('/auth/login', payload).then((response) => response.data);
}

export default api;
