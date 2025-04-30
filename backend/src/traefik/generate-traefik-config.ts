import { Alias } from '@prisma/client';
import YAML from 'yaml';
import fs from 'fs';
import { SERVER_PORT, TRAEFIK_DYNAMIC_CONFIG_PATH } from '@/lib/constants';
import { prisma } from '@/prisma';

interface TraefikConfig {
	http: {
		routers: Record<
			string,
			{ rule: string; service: string; middlewares?: string[] }
		>;
		services: Record<string, { loadBalancer: { servers: Array<{ url: string }> } }>;
		middlewares?: Record<string, { stripPrefix: { prefixes: string[] } }>;
	};
}

/**
 * Generate dynamic Traefik config based on Alias mapping
 * Always generate even if no aliases
 *
 * Middleware (stripPrefix) is added for each alias to remove the alias path prefix
 * from the forwarded request, preventing 404 errors in backend services.
 */
export async function generateDynamicTraefikConfig(isFirstInit = false): Promise<void> {
	let aliases: Alias[] = [];

	if (!isFirstInit) {
		try {
			aliases = await prisma.alias.findMany({
				where: {
					isActive: true
				}
			});
		} catch (error) {
			console.error('Error fetching aliases:', error);
		}
	}

	const config: TraefikConfig = {
		http: {
			routers: {},
			services: {}
			// middlewares will be added conditionally if needed
		}
	};

	aliases.forEach(alias => {
		const middlewareName = `strip-${alias.alias}`;

		// Define router for alias, with middleware to strip prefix
		config.http.routers[alias.alias] = {
			rule: `PathPrefix(\`/${alias.alias}\`)`,
			service: alias.alias,
			middlewares: [middlewareName]
		};

		// Define service endpoint
		config.http.services[alias.alias] = {
			loadBalancer: {
				servers: [{ url: `http://localhost:${alias.port}` }]
			}
		};

		// Ensure middlewares object exists before adding
		if (!config.http.middlewares) {
			config.http.middlewares = {};
		}

		// Define middleware to strip alias prefix (e.g., /32818 -> /)
		config.http.middlewares[middlewareName] = {
			stripPrefix: {
				prefixes: [`/${alias.alias}`]
			}
		};
	});

	// Define static mock API route
	config.http.routers['api'] = {
		rule: 'PathPrefix(`/mock`)',
		service: 'backend'
	};
	config.http.services['backend'] = {
		loadBalancer: {
			servers: [{ url: `http://localhost:${SERVER_PORT}` }]
		}
	};

	// Define frontend route
	config.http.routers['frontend'] = {
		rule: 'PathPrefix(`/`)',
		service: 'frontend'
	};
	config.http.services['frontend'] = {
		loadBalancer: {
			servers: [{ url: 'http://localhost:3005' }]
		}
	};

	// Clean up middlewares if none were added, to avoid Traefik YAML parsing errors
	if (config.http.middlewares && Object.keys(config.http.middlewares).length === 0) {
		delete config.http.middlewares;
	}

	// Write final config to file in YAML format
	fs.writeFileSync(TRAEFIK_DYNAMIC_CONFIG_PATH, YAML.stringify(config));
	console.log(`✅ Dynamic traefik dynamic.yml generated at ${TRAEFIK_DYNAMIC_CONFIG_PATH} (aliases: ${aliases.length})`);
}
