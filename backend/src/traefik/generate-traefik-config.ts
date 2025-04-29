import { Alias, PrismaClient } from '@prisma/client';
import YAML from 'yaml';
import fs from 'fs';
import { TRAEFIK_DYNAMIC_CONFIG_PATH } from '@/lib/constants';

const prisma = new PrismaClient();

// Define TypeScript interface for Traefik dynamic configuration
interface TraefikConfig {
	http: {
		routers: Record<string, {
			rule: string;
			service: string;
		}>;
		services: Record<string, {
			loadBalancer: {
				servers: Array<{ url: string }>;
			};
		}>;
	};
}

/**
 * Generate dynamic Traefik configuration based on Alias database records
 */
export async function generateTraefikConfig(): Promise<void> {
	// Fetch all alias mappings from the database
	const aliases: Alias[] = await prisma.alias.findMany();

	// Initialize Traefik config structure
	const config: TraefikConfig = {
		http: {
			routers: {},
			services: {}
		}
	};

	// Loop through aliases and create corresponding routers and services
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

	// Add a router and service for backend API (/mock endpoint)
	config.http.routers['api'] = {
		rule: 'PathPrefix(`/mock`)',
		service: 'backend'
	};
	config.http.services['backend'] = {
		loadBalancer: {
			servers: [{ url: 'http://localhost:3000' }]
		}
	};

	// Add a router and service for frontend static content
	config.http.routers['frontend'] = {
		rule: 'PathPrefix(`/`)',
		service: 'frontend'
	};
	config.http.services['frontend'] = {
		loadBalancer: {
			servers: [{ url: 'http://localhost:3005' }]
		}
	};

	// Write the generated config into YAML file for Traefik
	fs.writeFileSync(TRAEFIK_DYNAMIC_CONFIG_PATH, YAML.stringify(config));
	console.log(`✅ Traefik dynamic config generated at ${TRAEFIK_DYNAMIC_CONFIG_PATH}`);
}
