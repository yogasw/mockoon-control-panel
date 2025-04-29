import { Alias } from '@prisma/client';
import YAML from 'yaml';
import fs from 'fs';
import { SERVER_PORT, TRAEFIK_DYNAMIC_CONFIG_PATH } from '@/lib/constants';
import { prisma } from '@/prisma';

interface TraefikConfig {
	http: {
		routers: Record<string, { rule: string; service: string }>;
		services: Record<string, { loadBalancer: { servers: Array<{ url: string }> } }>;
	};
}

/**
 * Generate dynamic Traefik config based on Alias mapping
 * Always generate even if no aliases
 */
export async function generateDynamicTraefikConfig(): Promise<void> {
	let aliases: Alias[] = [];
	try {
		aliases = await prisma.alias.findMany();
	} catch (error) {
		console.error('Error fetching aliases:', error);
	}

	const config: TraefikConfig = {
		http: {
			routers: {},
			services: {}
		}
	};

	aliases.forEach(alias => {
		config.http.routers[alias.alias] = {
			rule: `PathPrefix(\`/${alias.alias}\`)`,
			service: alias.alias
		};
		config.http.services[alias.alias] = {
			loadBalancer: {
				servers: [{ url: `http://localhost:${alias.port}` }]
			}
		};
	});

	config.http.routers['api'] = {
		rule: 'PathPrefix(`/mock`)',
		service: 'backend'
	};
	config.http.services['backend'] = {
		loadBalancer: {
			servers: [{ url: `http://localhost:${SERVER_PORT}` }]
		}
	};

	config.http.routers['frontend'] = {
		rule: 'PathPrefix(`/`)',
		service: 'frontend'
	};
	config.http.services['frontend'] = {
		loadBalancer: {
			servers: [{ url: 'http://localhost:3005' }]
		}
	};

	fs.writeFileSync(TRAEFIK_DYNAMIC_CONFIG_PATH, YAML.stringify(config));
	console.log(`✅ Dynamic traefik dynamic.yml generated at ${TRAEFIK_DYNAMIC_CONFIG_PATH} (aliases: ${aliases.length})`);
}
