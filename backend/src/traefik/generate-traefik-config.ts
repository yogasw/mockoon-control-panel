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
		middlewares: Record<string, { stripPrefix: { prefixes: string[] } }>;
	};
}

/**
 * Generate dynamic Traefik config based on Alias mapping
 * Always generate even if no aliases
 *
 * Middlewares (stripPrefix) are added per alias to strip the route prefix
 * before forwarding to the backend service.
 * This prevents 404 errors if the service does not expect the alias path prefix.
 * Example: /32818/xxx -> becomes /xxx at backend
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
			services: {},
			middlewares: {} // middlewares needed for stripping alias prefixes
		}
	};

	aliases.forEach(alias => {
		const middlewareName = `strip-${alias.alias}`;

		// Define router for each alias and attach stripPrefix middleware
		config.http.routers[alias.alias] = {
			rule: `PathPrefix(\`/${alias.alias}\`)`,
			service: alias.alias,
			middlewares: [middlewareName] // ensure path like /32818/xxx becomes /xxx
		};

		// Define service target (e.g., localhost:32818)
		config.http.services[alias.alias] = {
			loadBalancer: {
				servers: [{ url: `http://localhost:${alias.port}` }]
			}
		};

		// Define middleware to strip the alias prefix before passing to backend
		config.http.middlewares[middlewareName] = {
			stripPrefix: {
				prefixes: [`/${alias.alias}`]
			}
		};
	});

	// Static route for mock API
	config.http.routers['api'] = {
		rule: 'PathPrefix(`/mock`)',
		service: 'backend'
	};
	config.http.services['backend'] = {
		loadBalancer: {
			servers: [{ url: `http://localhost:${SERVER_PORT}` }]
		}
	};

	// Static route for frontend
	config.http.routers['frontend'] = {
		rule: 'PathPrefix(`/`)',
		service: 'frontend'
	};
	config.http.services['frontend'] = {
		loadBalancer: {
			servers: [{ url: 'http://localhost:3005' }]
		}
	};

	// Write config to disk
	fs.writeFileSync(TRAEFIK_DYNAMIC_CONFIG_PATH, YAML.stringify(config));
	console.log(`✅ Dynamic traefik dynamic.yml generated at ${TRAEFIK_DYNAMIC_CONFIG_PATH} (aliases: ${aliases.length})`);
}
