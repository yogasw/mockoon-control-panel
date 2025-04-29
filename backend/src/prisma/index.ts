import { PrismaClient } from '@prisma/client';
import * as console from 'node:console';
import { exec } from 'child_process';
import util from 'util';
import { IS_DEBUG } from '@/lib/constants';

const config = {};
if (IS_DEBUG == 'true') {
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

const execAsync = util.promisify(exec);

export async function checkAndHandlePrisma(): Promise<void> {
	try {
		await prisma.alias.findMany().then(() => {
			console.log('Prisma migration check: Alias table exists');
		}).catch(async (e) => {
			console.log('Prisma migration check: Alias table does not exist, running migrations');
			await execAsync('npm run db:migrate');
		});
	} catch (e) {
		console.error('Error running Prisma migrations:', e);
	}
}
