import path from 'path';
import process from 'node:process';

// Automatically resolve absolute path to configs directory
export const CONFIGS_DIR = path.resolve(process.cwd(), '../configs');
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const LOGS_DIR = path.resolve(process.cwd(), 'logs');

// Specific path for Traefik dynamic config
export const TRAEFIK_DYNAMIC_CONFIG_PATH = path.resolve(CONFIGS_DIR, 'traefik', 'dynamic.yml');
export const TRAEFIK_STATIC_CONFIG_PATH = path.resolve(CONFIGS_DIR, 'traefik', 'traefik.yml');


// Define the path to your sqlite database
export const SQLITE_PATH = path.resolve(CONFIGS_DIR, 'db', 'db.sqlite');

// Server
export const IS_DEBUG: string = 'false';
export const SERVER_PORT = parseInt(process.env.PORT || '3500', 10);
export const SERVER_HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

//Git
export const GIT_URL = process.env.GIT_URL || '';
export const GIT_BRANCH = process.env.BRANCH || 'main';
export const SSH_KEY = process.env.SSH_KEY || '';

// AUTH
export const API_KEY = process.env.API_KEY || 'admin:root';
