import api from '../services/api';

export function getAiPredictions() {
	return api.get('/ai/predictions').then((response) => response.data);
}

export function predictClipPriority(payload) {
	return api.post('/ai/predict', payload).then((response) => response.data);
}

export function getAiHealth() {
	return api.get('/ai/health').then((response) => response.data);
}
