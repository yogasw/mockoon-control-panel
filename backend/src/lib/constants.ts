import path from 'path';

// Automatically resolve absolute path to configs directory
export const CONFIGS_DIR = path.resolve(process.cwd(), '../configs');
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const LOGS_DIR = path.resolve(process.cwd(), 'logs');
