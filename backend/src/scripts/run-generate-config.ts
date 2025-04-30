import { generateDynamicTraefikConfig } from '@/traefik/generate-traefik-config';
import { EnsureRequiredFoldersAndEnv } from '@/utils/setupFolderConfig';
import { generateStaticTraefikConfig } from '@/traefik/generateStaticTraefikConfig';

EnsureRequiredFoldersAndEnv();
generateStaticTraefikConfig()
generateDynamicTraefikConfig(true);
