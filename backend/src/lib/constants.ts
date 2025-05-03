import path from 'path';
import process from 'node:process';
import { config } from 'dotenv';

// Automatically resolve absolute path to configs directory
export const CONFIGS_DIR = path.resolve(process.cwd(), '../configs');
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const LOGS_DIR = path.resolve(process.cwd(), 'logs');

config({ path: path.resolve(process.cwd(), '../.env') });
// Specific path for Traefik dynamic config
export const TRAEFIK_DYNAMIC_CONFIG_PATH = path.resolve(CONFIGS_DIR, 'traefik', 'dynamic.yml');
export const TRAEFIK_STATIC_CONFIG_PATH = path.resolve(CONFIGS_DIR, 'traefik', 'traefik.yml');

// Server
export const IS_DEBUG: string = 'false';
export const SERVER_PORT = parseInt(process.env.SERVER_PORT || '3600', 10);
export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || '0.0.0.0';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
export const PROXY_MODE = process.env.PROXY_MODE !== 'false';
export const PROXY_BASE_URL = process.env.PROXY_BASE_URL || '';

// AUTH
export const API_KEY = process.env.API_KEY || 'admin:admin';

