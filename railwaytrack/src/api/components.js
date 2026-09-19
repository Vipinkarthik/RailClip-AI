import api from '../services/api';

export function listComponentBatches() {
	return api.get('/components/batches').then((response) => response.data);
}

export function listClips() {
	return api.get('/components/clips').then((response) => response.data);
}

export function createComponentBatch(payload) {
	return api.post('/components/batches', payload).then((response) => response.data);
}
