import { getLocalStorage, removeAuthLocalStorage } from '$lib/utils/localStorage';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface AuthCredentials {
	username: string;
	password: string;
}

export interface Config {
	uuid: string;
	name: string;
	configFile: string;
	port: number;
	url: string;
	size: string;
	modified: string;
	inUse: boolean;
}

interface Route {
	path: string;
	method: string;
	status: 'enabled' | 'disabled';
}

interface Log {
	method: string;
	path: string;
	timestamp: string;
	request: string;
	response: string;
}

// Create axios instance with default config
const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Add request interceptor to add auth header
api.interceptors.request.use(
	(config) => {
		const username = getLocalStorage('username');
		const password = getLocalStorage('password');
		if (config.headers) {
			config.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			console.error('Authentication failed');
			removeAuthLocalStorage();
		}
		return Promise.reject(error);
	}
);

export const getMockStatus = async (): Promise<Config[]> => {
	const response = await api.get('/api/mock/status');
	return response.data.data;
};

export const getConfigs = async (): Promise<Config[]> => {
	const response = await api.get('/api/mock/configs');
	return response.data.data;
};

export const uploadConfig = async (formData: FormData): Promise<any> => {
	const response = await api.post('/api/mock/upload', formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
	return response.data.data;
};

export const downloadConfig = async (filename: string): Promise<any> => {
	return await api.get(`/api/mock/configs/${filename}/download`);
};

export const startMockServer = async (port: number, configFile: string, uuid: string): Promise<any> => {
	const response = await api.post('/api/mock/start', {
		uuid,
		port,
		configFile
	});
	return response.data;
};

export const stopMockServer = async (port: number): Promise<any> => {
	const response = await api.post('/api/mock/stop', {
		port
	});
	return response.data;
};

export const deleteConfig = async (filename: string): Promise<any> => {
	const response = await api.delete(`/api/mock/configs/${filename}`);
	return response.data;
};

export const syncToGit = async (): Promise<any> => {
	const response = await api.post('/api/mock/sync');
	return response.data;
};

export const login = async (credentials: AuthCredentials): Promise<boolean> => {
	const response = await api.post('/api/auth', credentials);
	if (response.data.success) {
		localStorage.setItem('auth', JSON.stringify({
			username: credentials.username,
			password: credentials.password
		}));
	}
	return response.data.success;
};

export const getConfigDetails = async (uuid: string): Promise<Config> => {
	const response = await api.get(`/api/mock/configs/${uuid}`);
	return response.data.data;
};
