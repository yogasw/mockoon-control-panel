import fs from 'fs';
import path from 'path';
import { CONFIGS_DIR } from '@/lib/constants';

export async function EnsureRequiredFolders() {
	const foldersToCheck = [
		CONFIGS_DIR,
		path.join(CONFIGS_DIR, '.ssh'),
		path.join(CONFIGS_DIR, 'traefik'),
		path.join(CONFIGS_DIR, 'db')
	];

	for (const folder of foldersToCheck) {
		if (!fs.existsSync(folder)) {
			fs.mkdirSync(folder, { recursive: true });
			console.log(`Created folder: ${folder}`);
		}
	}
}
