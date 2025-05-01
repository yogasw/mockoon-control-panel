// File: backend/src/git-sync/services/gitConfigService.ts
import { SetSystemConfig, SystemConfigKey } from '@/utils/systemConfig';
import { SyncConfigsToGit } from '@/git-sync/services/SyncConfigs';
import { isValidEmail, isValidSshUrl, isValidSshKey } from '@/utils/validationUtils';

interface GitConfig {
    gitUrl?: string;
    gitBranch?: string;
    sshKey?: string;
    gitName?: string;
    gitEmail?: string;
}

export const SaveGitConfigService = async (config: GitConfig): Promise<{ success: boolean; message: string }> => {
    const { gitUrl, gitBranch, sshKey, gitName, gitEmail } = config;

    // Validation
    if (gitName && gitName.trim() === '') {
        return { success: false, message: 'Git name cannot be empty' };
    }
    if (gitEmail && !isValidEmail(gitEmail)) {
        return { success: false, message: 'Invalid email format' };
    }
    if (gitUrl && !isValidSshUrl(gitUrl)) {
        return { success: false, message: 'Invalid SSH URL format' };
    }
    if (gitBranch && typeof gitBranch !== 'string') {
        return { success: false, message: 'Git branch must be a string' };
    }
    if (sshKey && !isValidSshKey(sshKey)) {
        return { success: false, message: 'Invalid SSH key format' };
    }

    // Save only provided fields
    if (gitName) await SetSystemConfig(SystemConfigKey.GIT_NAME, gitName);
    if (gitEmail) await SetSystemConfig(SystemConfigKey.GIT_EMAIL, gitEmail);
    if (gitUrl) await SetSystemConfig(SystemConfigKey.GIT_URL, gitUrl);
    if (gitBranch) await SetSystemConfig(SystemConfigKey.GIT_BRANCH, gitBranch);
    if (sshKey) await SetSystemConfig(SystemConfigKey.SSH_KEY, sshKey);

    return { success: true, message: 'Git configuration saved successfully' };
};

export const SaveAndTestSyncGitService = async (config: GitConfig): Promise<{ success: boolean; message: string }> => {
    const saveResult = await SaveGitConfigService(config);
    if (!saveResult.success) {
        return saveResult;
    }

    const error = await SyncConfigsToGit();
    if (error) {
        return { success: false, message: `Git sync failed: ${error.message}` };
    }

    return { success: true, message: 'Git configuration saved and sync tested successfully' };
};
