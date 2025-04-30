import { generateDynamicTraefikConfig } from '@/traefik/generate-traefik-config';
import { EnsureRequiredFoldersAndEnv } from '@/utils/setupFolderConfig';

EnsureRequiredFoldersAndEnv();
generateDynamicTraefikConfig(true);
