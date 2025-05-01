import { Request, Response } from 'express';
import * as console from 'node:console';
import { prisma } from '@/prisma';

export enum SystemConfigKey {
	BASE_URL = 'BASE_URL:string',

	//Git sync
	GIT_URL = 'GIT_URL:string',
	GIT_BRANCH = 'GIT_BRANCH:string',
	SSH_KEY = 'SSH_KEY:string',
	GIT_NAME = 'GIT_NAME:string',
	GIT_EMAIL = 'GIT_EMAIL:string',

}

// Default values for variables
export const defaultVariables = {
	[SystemConfigKey.BASE_URL]: '',

	//Git sync
	[SystemConfigKey.GIT_URL]: '',
	[SystemConfigKey.GIT_BRANCH]: 'main',
	[SystemConfigKey.SSH_KEY]: '',
	[SystemConfigKey.GIT_NAME]: 'Mockoon Control Panel',
	[SystemConfigKey.GIT_EMAIL]: 'noreply@example.com'

};

/**
 * Get a system configuration value from the database with type conversion
 * @param key - Configuration key to retrieve
 * @returns The configuration value with proper type conversion
 */
export const GetSystemConfig = async (key: SystemConfigKey): Promise<string | number | boolean | string[] | undefined> => {
	try {
		const [keyName, keyType] = key.split(':');
		// Try to get from database first
		const variable = await prisma.systemConfig.findUnique({
			where: {
				key: keyName
			}
		});

		if (variable) {
			return convertValue(variable.value, variable.type);
		}

		// If not found in database, check defaults
		const defaultVar = defaultVariables[key as keyof typeof defaultVariables];
		if (defaultVar) {
			return convertValue(defaultVar, keyType);
		}

		return undefined;
	} catch (error) {
		console.error(`Error fetching system config from database: ${error}`);
		return undefined;
	}
};

/**
 * Set a system configuration value in the database with type validation
 * @param key - Configuration key to set
 * @param value - Value to store
 * @returns True if successful, false otherwise
 */
export const SetSystemConfig = async (
	key: SystemConfigKey,
	value: string | number | boolean | string[]
): Promise<boolean> => {
	try {
		const [keyName, keyType] = key.split(':');
		let stringValue = String(value);
		if (keyType === 'array') {
			stringValue = JSON.stringify(value);
		}

		await prisma.systemConfig.upsert({
			where: { key: keyName },
			update: {
				value: stringValue,
				type: keyType
			},
			create: {
				key: keyName,
				value: stringValue,
				type: keyType
			}
		});

		return true;
	} catch (error) {
		console.error(`Error setting system config in database: ${error}`);
		return false;
	}
};

/**
 * Convert string value to appropriate type
 */
const convertValue = (value: string, type: string): string | number | boolean | string[] => {
	switch (type) {
		case 'number':
			return Number(value);
		case 'boolean':
			return value.toLowerCase() === 'true';
		case 'array':
			try {
				return JSON.parse(value);
			} catch (error) {
				console.log('Error parsing array value from database: ', error);
				return [];
			}
		default:
			return value;
	}
};

type ConfigType = {
	key: string;
	value: string;
	description: string;
	type: string;
}

export const GetAllSystemConfigs = async (req: Request, res: Response) => {
	try {
		const configs = await prisma.systemConfig.findMany();
		res.status(200).json(configs);
	} catch (e) {
		console.log('Error fetching configs', e);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const SetConfigById = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { key, value, description } = req.body as ConfigType;

	try {
		const updatedConfig = await prisma.systemConfig.update({
			where: { id: parseInt(id) },
			data: {
				key,
				value,
				description,
				updatedAt: new Date()
			}
		});
		res.status(200).json(updatedConfig);
	} catch (e) {
		console.log('Error updating config', e);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const AddConfig = async (req: Request, res: Response) => {
	const { key, value, description, type } = req.body as ConfigType;
	try {
		const newConfig = await prisma.systemConfig.create({
			data: {
				key,
				value,
				description,
				type
			}
		});
		res.status(201).json(newConfig);
	} catch (e) {
		console.log('Error creating config', e);
		res.status(500).json({ error: 'Internal server error' });
	}
};
