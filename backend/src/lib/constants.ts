import path from 'path';

// Automatically resolve absolute path to configs directory
export const CONFIGS_DIR = path.resolve(process.cwd(), '../configs');
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const LOGS_DIR = path.resolve(process.cwd(), 'logs');

// Specific path for Traefik dynamic config
export const TRAEFIK_DYNAMIC_CONFIG_PATH = path.resolve(CONFIGS_DIR, 'traefik', 'dynamic.yml');
export const TRAEFIK_STATIC_CONFIG_PATH = path.resolve(CONFIGS_DIR, 'traefik', 'traefik.yml');
