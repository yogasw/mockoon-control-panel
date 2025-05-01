import fs from 'fs';
import path from 'path';
import { ensureDirectoryExists, formatFileSize } from '@/utils/fileUtils';
import { mockInstanceRepository } from '@/mocks/repositories/mockInstanceRepository';
import { CONFIGS_DIR, UPLOAD_DIR } from '@/lib/constants';

export type ConfigFile = {
	uuid: string;
	name: string;
	configFile: string;
	port: number;
	size: string;
	modified: Date;
	inUse: boolean;
}

class FileRepository {
	private configsDir: string;
	private uploadsDir: string;

	constructor() {
		this.configsDir = CONFIGS_DIR;
		this.uploadsDir = UPLOAD_DIR;
		ensureDirectoryExists(this.configsDir);
		ensureDirectoryExists(this.uploadsDir);
	}

	async listConfigs(): Promise<ConfigFile[]> {
		try {
			const configsDir = this.configsDir;
			if (!fs.existsSync(this.configsDir)) {
				fs.mkdirSync(configsDir, { recursive: true });
			}
			return fs
				.readdirSync(configsDir)
				.filter((file) => file.endsWith('.json'))
				.map((file) => {
					const stats = fs.statSync(path.join(configsDir, file));
					//parse file to get port
					const filePath = path.join(configsDir, file);
					const fileContent = fs.readFileSync(filePath, 'utf-8');
					const fileData = JSON.parse(fileContent);

					return {
						uuid: fileData?.uuid,
						name: fileData?.name,
						configFile: file,
						port: fileData?.port,
						size: formatFileSize(stats.size),
						modified: stats.mtime,
						inUse: Array.from(mockInstanceRepository.getAll().values()).some(
							(instance) => instance.configFile === file
						)
					};
				});
		} catch (error) {
			return [];
		}
	}

	async getConfigPath(filename: string): Promise<string> {
		return path.join(this.configsDir, filename);
	}

	async configExists(filename: string): Promise<boolean> {
		try {
			await fs.promises.access(path.join(this.configsDir, filename));
			return true;
		} catch {
			return false;
		}
	}

	async deleteConfig(filename: string): Promise<void> {
		await fs.promises.unlink(path.join(this.configsDir, filename));
	}

	async moveUploadedFile(sourcePath: string, filename: string): Promise<void> {
		const targetPath = path.join(this.configsDir, filename);
		await fs.promises.copyFile(sourcePath, targetPath);
		await fs.promises.unlink(sourcePath);
	}
}

export const fileRepository = new FileRepository();
