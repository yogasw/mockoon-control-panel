import fs from 'fs';
import path from 'path';
import { CONFIGS_DIR } from '@/lib/constants';
import { execSync } from 'child_process';
import * as console from 'node:console';

export async function EnsureRequiredFoldersAndEnv() {
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

	//check DATABASE_URL exists or not in process
	if (!process.env.DATABASE_URL) {
		process.env.DATABASE_URL = `file:${path.join(CONFIGS_DIR, 'db')}/db.sqlite`;
		console.log(process.env.DATABASE_URL)
		console.log(`DATABASE_URL not found. Using default: CONFIG_DIR/db/db.sqlite`);

		//run migration
		try {
			console.log('Running database migration...');
			execSync('npm run db:migrate', { stdio: 'inherit' });
			console.log('Database migration completed.');
		} catch (error) {
			console.error('Error running database migration:', error);
		}

	}

}
