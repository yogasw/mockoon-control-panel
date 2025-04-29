import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from 'dotenv';
import { checkMockoonCli } from '@/utils/cliChecker';
import { apiKeyAuth } from '@/middlewares/apiKeyAuth';
import { ensureDirectoryExists } from '@/utils/fileUtils';
import { startMockHandler } from '@/mocks/handler/startMockHandler';
import { stopMockHandler } from '@/mocks/handler/stopMockHandler';
import { statusMockHandler } from '@/mocks/handler/statusMockHandler';
import { listConfigsHandler } from '@/mocks/handler/listConfigsHandler';
import { deleteConfigHandler } from '@/mocks/handler/deleteConfigHandler';
import { uploadMockHandler } from '@/mocks/handler/uploadMockHandler';
import { downloadConfigHandler } from '@/mocks/handler/downloadConfigHandler';
import { healthCheckHandler } from '@/health/healthCheckHandler';
import { SyncToGitHttpHandler } from '@/git-sync/handler/http';
import { CONFIGS_DIR, CORS_ORIGIN, LOGS_DIR, SERVER_HOSTNAME, SERVER_PORT, UPLOAD_DIR } from '@/lib/constants';
import process from 'node:process';
import { generateStaticTraefikConfig } from '@/traefik/generateStaticTraefikConfig';
import { generateDynamicTraefikConfig } from '@/traefik/generate-traefik-config';
import { SyncConfigsToGit } from '@/git-sync/services/SyncConfigs';
import { checkAndHandlePrisma } from '@/prisma';
import { EnsureRequiredFoldersAndEnv } from '@/utils/setupFolderConfig';

// Load environment variables
config({ path: '../.env' });

// Create Express app
const app = express();

// Middleware for logging inbound requests with method, URL, timestamp, IP, and body
app.use((req, res, next) => {
	const log = {
		timestamp: new Date().toISOString(),
		method: req.method,
		url: req.url,
		ip: req.ip,
		body: req.body // Logs the request body
	};
	console.log(JSON.stringify(log));
	next();
});

// CORS configuration
const corsOptions: cors.CorsOptions = {
	origin: CORS_ORIGIN,
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	credentials: true,
	optionsSuccessStatus: 204,
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin'
	],
	exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
		const uploadDir = UPLOAD_DIR;
		ensureDirectoryExists(uploadDir);
		cb(null, uploadDir);
	},
	filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
		const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
		cb(null, safeName);
	}
});

const upload = multer({
	storage,
	fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
		if (file.mimetype !== 'application/json' && !file.originalname.endsWith('.json')) {
			return cb(new Error('Only JSON files are allowed'));
		}
		cb(null, true);
	},
	limits: {
		fileSize: 50 * 1024 * 1024 // 5MB limit
	}
});

// Ensure required directories exist
ensureDirectoryExists(CONFIGS_DIR);
ensureDirectoryExists(UPLOAD_DIR);
ensureDirectoryExists(LOGS_DIR);
app.get('/', (req, res) => {
	res.send('Server is running!');
});
// Routes
app.get('/mock/api/health', healthCheckHandler);


app.post('/mock/api/auth', (req, res) => {
	const { username, password } = req.body;
	if (username && password) {
		res.json({
			success: true,
			message: 'Login successful'
		});
	} else {
		res.status(401).json({
			success: false,
			message: 'Invalid credentials'
		});
	}
});

// Protected routes
app.use('/mock/api', apiKeyAuth);
app.post('/mock/api/start', startMockHandler);
app.post('/mock/api/stop', stopMockHandler);
app.get('/mock/api/status', statusMockHandler);
app.post('/mock/api/upload', upload.single('config'), uploadMockHandler);
app.get('/mock/api/configs', listConfigsHandler);
app.delete('/mock/api/configs/:filename', deleteConfigHandler);
app.get('/mock/api/configs/:filename/download', downloadConfigHandler);
app.post('/mock/api/sync', SyncToGitHttpHandler);

// Start server

async function startServer() {
	await EnsureRequiredFoldersAndEnv();
	await SyncConfigsToGit().then(() => {
		console.log('Sync to Git completed successfully');
	}).catch(e => {
		console.error('Error syncing to Git:', e);
	});

	await checkAndHandlePrisma();
	await generateDynamicTraefikConfig().catch((e: any) => {
		console.error('Error generating Traefik config:', e);
		process.exit(1);
	});

	await generateStaticTraefikConfig().catch((e: any) => {
		console.error('Error generating static Traefik config:', e);
		process.exit(1);
	});

	try {
		// Check if mockoon-cli is available
		const mockoonCliAvailable = await checkMockoonCli();
		if (!mockoonCliAvailable) {
			console.error('Error: mockoon-cli is not available. Please install it first.');
			process.exit(1);
		}

		app.listen(SERVER_PORT, SERVER_HOSTNAME, () => {
			console.log(`Server is running on http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
		});
	} catch (error) {
		console.error('Error starting server:', error);
		process.exit(1);
	}
}

startServer();
