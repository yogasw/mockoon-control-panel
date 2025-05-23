import { getLocalStorage, removeAuthLocalStorage } from '$lib/utils/localStorage';
import axios from 'axios';
import { goto } from '$app/navigation';

interface AuthCredentials {
	username: string;
	password: string;
}

export interface ConfigResponse {
	uuid: string;
	name: string;
	configFile: string;
	port: number;
	url: string;
	size: string;
	modified: string;
	inUse: boolean;
}

// Create axios instance with default config
const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3600/mock/api',
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

let isRedirectingToLogin = false;
// Add response interceptor for handling auth errors
api.interceptors.response.use(
	response => response,
	error => {
		console.log('route', error.response?.config.url);
		if (error.response?.status === 401) {
			console.error('Authentication failed');
			removeAuthLocalStorage();
			if (!isRedirectingToLogin) {
				isRedirectingToLogin = true;
				setTimeout(() => {
					isRedirectingToLogin = false;
				}, 2000);
				if (window.location.pathname !== '/login') {
					goto('/login');
				}
			}
		}
		return Promise.reject(error);
	}
);

export const getMockStatus = async (): Promise<ConfigResponse[]> => {
	const response = await api.get('/status');
	return response.data.data;
};

export const getConfigs = async (): Promise<ConfigResponse[]> => {
	const response = await api.get('/configs');
	return response.data.data;
};

export const uploadConfig = async (formData: FormData): Promise<any> => {
	const response = await api.post('/upload', formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
	return response.data.data;
};

export const downloadConfig = async (filename: string): Promise<any> => {
	return await api.get(`/configs/${filename}/download`);
};

export const startMockServer = async (port: number, configFile: string, uuid: string): Promise<any> => {
	const response = await api.post('/start', {
		uuid,
		port,
		configFile
	});
	return response.data;
};

export const stopMockServer = async (port: number): Promise<any> => {
	const response = await api.post('/stop', {
		port
	});
	return response.data;
};

export const deleteConfig = async (filename: string): Promise<any> => {
	const response = await api.delete(`/configs/${filename}`);
	return response.data;
};

export const syncToGit = async (): Promise<any> => {
	const response = await api.post('/sync');
	return response.data;
};

export const login = async (credentials: AuthCredentials): Promise<boolean> => {
	const response = await api.post('/auth', credentials);
	if (response.data.success) {
		localStorage.setItem('auth', JSON.stringify({
			username: credentials.username,
			password: credentials.password
		}));
	}
	return response.data.success;
};

export const getConfigDetails = async (uuid: string): Promise<ConfigResponse> => {
	const response = await api.get(`/configs/${uuid}`);
	return response.data.data;
};


export const saveGitConfig = async (config: {
	gitName: string;
	gitEmail: string;
	gitBranch: string;
	sshKey: string;
	gitUrl: string;
}): Promise<{ success: boolean; message: string }> => {
	const response = await api.post('/git/save-config', config);
	return response.data;
};

export const saveAndTestSyncGit = async (config: {
	gitName: string;
	gitEmail: string;
	gitBranch: string;
	sshKey: string;
	gitUrl: string;
}): Promise<{ success: boolean; message: string }> => {
	const response = await api.post('/git/save-and-test-sync', config);
	return response.data;
};

export const getGitConfig = async (): Promise<{
	success: boolean;
	data?: {
		gitName: string;
		gitEmail: string;
		gitUrl: string;
		gitBranch: string;
		sshKey: string;
	};
	message?: string;
}> => {
	const response = await api.get('/git/config');
	return response.data;
};
