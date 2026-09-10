import api from '../services/api';

export function lookupComponentByQr(payload) {
	return api.post('/inspections/lookup', payload).then((response) => response.data);
}

export function saveInspectionRecord(payload) {
	return api.post('/inspections', payload).then((response) => response.data);
}

export function listInspectionRecords() {
	return api.get('/inspections').then((response) => response.data);
}

