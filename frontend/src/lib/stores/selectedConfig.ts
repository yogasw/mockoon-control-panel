import { writable } from 'svelte/store';
import type { Config } from '$lib/api/mockoonApi';

export const selectedConfig = writable<Config | null>(null); 