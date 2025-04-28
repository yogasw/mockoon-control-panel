import { browser } from '$app/environment';

/**
 * Get item from localStorage safely
 */
export function getLocalStorage(key: string): string | null {
	if (browser) {
		return localStorage.getItem(key);
	}
	return null;
}

/**
 * Set item to localStorage safely
 */
export function setLocalStorage(key: string, value: string) {
	if (browser) {
		localStorage.setItem(key, value);
	}
}

/**
 * Remove item from localStorage safely
 */
export function removeLocalStorage(key: string) {
	if (browser) {
		localStorage.removeItem(key);
	}
}


/**
 * remove username and password and isAuthenticated from localStorage
 */
export function removeAuthLocalStorage() {
	removeLocalStorage('username');
	removeLocalStorage('password');
	removeLocalStorage('isAuthenticated');
}
