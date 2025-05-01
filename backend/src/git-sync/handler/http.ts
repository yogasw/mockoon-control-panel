import { Request, Response } from 'express';
import { SyncConfigsToGit } from '@/git-sync/services/SyncConfigs';
import {
	GetGitConfigService,
	SaveAndTestSyncGitService,
	SaveGitConfigService
} from '@/git-sync/services/gitConfigService';


export const SyncToGitHttpHandler = async (req: Request, res: Response) => {
	let error = await SyncConfigsToGit();
	if (error) {
		return res.status(500).json({
			success: false,
			message: error.message
		});
	}
	return res.json({
		success: true,
		message: 'Successfully synced configs to Git repository'
	});
};

export const SaveGitConfigHandler = async (req: Request, res: Response) => {
	const { gitUrl, gitBranch, sshKey, gitName, gitEmail } = req.body;

	const result = await SaveGitConfigService({ gitUrl, gitBranch, sshKey, gitName, gitEmail });
	if (!result.success) {
		return res.status(400).json(result);
	}

	return res.status(200).json(result);
};

export const SaveAndTestSyncGitHandler = async (req: Request, res: Response) => {
	const { gitUrl, gitBranch, sshKey, gitName, gitEmail } = req.body;

	const result = await SaveAndTestSyncGitService({ gitUrl, gitBranch, sshKey, gitName, gitEmail });
	if (!result.success) {
		return res.status(500).json(result);
	}

	return res.status(200).json(result);
};

export const GetGitConfigHandler = async (req: Request, res: Response) => {
	const result = await GetGitConfigService();

	if (!result.success) {
		return res.status(500).json({
			success: false,
			message: result.message
		});
	}

	return res.status(200).json({
		success: true,
		data: result.data
	});
};
