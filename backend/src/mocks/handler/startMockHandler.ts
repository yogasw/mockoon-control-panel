import { Request, Response } from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as console from 'node:console';
import { isPortInUse, isPortSafe } from '@/utils/portUtils';
import { ApiResponse, StartMockResponse } from '@/types';
import { fileRepository } from '@/mocks/repositories/fileRepository';
import { mockInstanceRepository } from '@/mocks/repositories/mockInstanceRepository';
import { LOGS_DIR } from '@/lib/constants';
import { prisma } from '@/prisma';
import { generateDynamicTraefikConfig } from '@/traefik/generate-traefik-config';

const useUnsafePort = true;

export async function startMockHandler(req: Request, res: Response<ApiResponse<StartMockResponse>>) {
	const { port, configFile, uuid } = req.body;
	console.log('Starting mock server with config:', configFile, 'on port:', port);
	try {
		if (port && !isPortSafe(port) && !useUnsafePort) {
			return res.status(400).json({
				error: 'Invalid port. Port must be between 9001 and 9999.'
			});
		}

		const portInUse = await isPortInUse(port);
		if (portInUse) {
			return res.status(400).json({
				error: `Port ${port} is already in use.`
			});
		}

		const configPath = await fileRepository.getConfigPath(configFile);
		if (!await fileRepository.configExists(configFile)) {
			return res.status(404).json({ error: 'Configuration file not found' });
		}

		const mockProcess = spawn('mockoon-cli', [
			'start',
			'--data',
			configPath,
			'--port',
			port.toString()
		]);

		const logFile = fs.createWriteStream(
			path.join(LOGS_DIR, `mock-${port}.log`),
			{ flags: 'a' }
		);

		mockProcess.stdout.pipe(logFile);
		mockProcess.stderr.pipe(logFile);

		mockInstanceRepository.add(port, {
			process: mockProcess,
			configFile,
			startTime: new Date(),
			logFile,
			uuid
		});

		let alias = await prisma.alias.findFirst({
			where: {
				fileName: configFile
			}
		})

		if (!alias) {
			alias = await prisma.alias.create({
				data: {
					fileName: configFile,
					alias: port.toString(),
					port: port,
					isActive: true
				}
			}).catch(e=>{
				console.error('Error creating alias:', e);
				return null;
			})
		}else{
			alias = await prisma.alias.update({
				where: {
					id: alias.id
				},
				data: {
					port: port,
					isActive: true
				}
			}).catch(e=>{
				console.error('Error updating alias:', e);
				return null;
			})
		}

		if (!alias) {
			return res.status(500).json({ error: 'Failed to create alias' });
		}

		await generateDynamicTraefikConfig()
			.catch(e => {
				console.error('Error generating dynamic Traefik config:', e);
			});

		const response: StartMockResponse = {
			success: true,
			uuid,
			port,
			configFile,
			message: `Mock server started on port ${port}`
		};

		res.json(response);
	} catch (error: any) {
		console.error('Error starting mock server:', error);
		res.status(500).json({ error: error.message });
	}
}
