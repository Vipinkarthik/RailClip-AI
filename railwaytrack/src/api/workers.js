import api from '../services/api';

export function createWorkerAccount(payload) {
	return api.post('/workers/create', payload).then((response) => response.data);
}

export function getWorkerProfile() {
	return api.get('/workers/me').then((response) => response.data);
}