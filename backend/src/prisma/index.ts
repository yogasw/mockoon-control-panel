import { PrismaClient } from '@prisma/client';
import * as console from 'node:console';

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

