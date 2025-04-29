import fs from 'fs';
import { TRAEFIK_STATIC_CONFIG_PATH } from '@/lib/constants';

/**
 * Generate default static traefik.yml if not exists
 */
export function generateStaticTraefikConfig(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(TRAEFIK_STATIC_CONFIG_PATH)) {
			const staticConfig = {
				entryPoints: {
					web: {
						address: ':80'
					}
				},
				providers: {
					file: {
						filename: '/app/configs/traefik/dynamic.yml',
						watch: true
					}
				},
				log: {
					level: 'DEBUG'
				}
			};

			const yaml = require('yaml');
			fs.writeFileSync(TRAEFIK_STATIC_CONFIG_PATH, yaml.stringify(staticConfig));
			console.log(`✅ Default static traefik.yml generated at ${TRAEFIK_STATIC_CONFIG_PATH}`);
			resolve();
		} else {
			console.log(`ℹ️ Static traefik.yml already exists at ${TRAEFIK_STATIC_CONFIG_PATH}`);
			resolve();
		}
	});
}
