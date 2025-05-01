import { Request, Response } from 'express';
import { ApiResponse } from '@/types';
import { fileRepository } from '@/mocks/repositories/fileRepository';
import { PROXY_BASE_URL, PROXY_MODE, SERVER_HOSTNAME } from '@/lib/constants';

export async function listConfigsHandler(req: Request, res: Response<ApiResponse<any[]>>) {
	try {
		const configs = await fileRepository.listConfigs();
		if (!configs || configs.length === 0) {
			return res.status(404).json({ error: 'No configuration files found' });
		} else {
			const configsWithUrl = [];
			for (const config of configs) {

				let url = '';
				if (PROXY_MODE) {
					if (PROXY_BASE_URL != '') {
						url = `${PROXY_BASE_URL}/${config.port}`;
					} else {
						url = `${req.protocol}://${req.get('host')}/${config.port}`;
					}
				} else {
					url = `http://${SERVER_HOSTNAME}:${config.port}`;
				}

				configsWithUrl.push({ ...config, url });
			}
			res.json({ data: configsWithUrl });
		}
	} catch (error: any) {
		console.error('Error listing configs:', error);
		res.status(500).json({ error: error.message });
	}
}
