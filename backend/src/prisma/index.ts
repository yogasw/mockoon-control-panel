import { PrismaClient } from '@prisma/client';
import * as console from 'node:console';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { SQLITE_PATH } from '@/lib/constants';

const config = {};
if (process.env.IS_DEBUG == 'true') {
	// @ts-ignore
	config['log'] = ['query', 'info', 'warn'];
}

export const prisma = new PrismaClient(config);

prisma.$connect().then(() => {
	console.log('Connected to database');
}).catch((e: any) => {
	if (process.env.JEST_WORKER_ID === undefined) {
		console.log('Error connect to database: ', e);
		process.exit(1);
	}
});

/**
 * Check if SQLite file exists, then run appropriate Prisma commands
 */
export async function checkAndHandlePrisma(): Promise<void> {
	try {
		// Check if sqlite file exists
		await fs.access(SQLITE_PATH);

		// File exists
		console.log('✅ Database exists. Running prisma:generate and prisma:push...');
		execSync('npm run prisma:generate', { stdio: 'inherit', cwd: path.resolve(process.cwd(), 'backend') });
		execSync('npm run prisma:push', { stdio: 'inherit', cwd: path.resolve(process.cwd(), 'backend') });

	} catch (err) {
		// File does not exist
		console.log('⚡ Database not found. Running full prisma generate + migrate + push...');
		execSync('npm run prisma:generate', { stdio: 'inherit', cwd: path.resolve(process.cwd(), 'backend') });
		execSync('npm run prisma:migrate', { stdio: 'inherit', cwd: path.resolve(process.cwd(), 'backend') });
		execSync('npm run prisma:push', { stdio: 'inherit', cwd: path.resolve(process.cwd(), 'backend') });
	}
}

