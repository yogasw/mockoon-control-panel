import path from 'path';
import simpleGit from 'simple-git';
import fs from 'fs';
import { CONFIGS_DIR } from '@/lib/constants';
import { execSync } from 'child_process';
import { GetSystemConfig, SystemConfigKey } from '@/utils/systemConfig';

export async function SyncConfigsToGit(): Promise<Error | null> {
	let errorResult: Error | null = null;
	const GIT_NAME = await GetSystemConfig(SystemConfigKey.GIT_NAME) as string;
	const GIT_EMAIL = await GetSystemConfig(SystemConfigKey.GIT_EMAIL) as string;
	const GIT_URL = await GetSystemConfig(SystemConfigKey.GIT_URL) as string;
	const GIT_BRANCH = await GetSystemConfig(SystemConfigKey.GIT_BRANCH) as string;
	const SSH_KEY = await GetSystemConfig(SystemConfigKey.SSH_KEY) as string;

	const configDir = CONFIGS_DIR;
	const git = simpleGit(configDir);
	const gitBranch = GIT_BRANCH;


	// Check and set Git user.name and user.email
	try {
		let userName = undefined;
		let userEmail = undefined;
		try {
			userName = execSync('git config --global user.name', { encoding: 'utf-8' }).trim();
		} catch (e) {
			console.log('failed to get git name...');
		}

		try {
			userEmail = execSync('git config --global user.email', { encoding: 'utf-8' }).trim();
		} catch (e) {
			console.log('failed to get git email...');
		}

		if (!userName) {
			console.log('Git user.name is not set. Setting it now...');
			execSync(`git config --global user.name "${GIT_NAME}"`);
		}

		if (!userEmail) {
			console.log('Git user.email is not set. Setting it now...');
			execSync(`git config --global user.email "${GIT_EMAIL}"`);
		}
	} catch (error) {
		console.error('Error checking or setting Git configuration:', error);
		errorResult = new Error('Error checking or setting Git configuration');
		return errorResult;
	}

	if (!GIT_URL || !SSH_KEY) {
		const missingVars = [];
		if (!GIT_URL) missingVars.push('GIT_URL');
		if (!SSH_KEY) missingVars.push('SSH_KEY');
		return new Error(
			`Missing required environment variables: ${missingVars.join(', ')}. ` +
			`GIT_URL should be the SSH URL of the Git repository (e.g., git@github.com:username/repo.git). ` +
			`SSH_KEY should be the private key used for Git authentication.`
		);
	}

	// Create .ssh directory if it doesn't exist
	const sshDir = path.join(configDir, '.ssh');
	if (!fs.existsSync(sshDir)) {
		fs.mkdirSync(sshDir, { recursive: true });
	}

	// Check if SSH_KEY ends with a newline
	let sshKeyContent = SSH_KEY;
	if (!SSH_KEY.endsWith('\n')) {
		sshKeyContent += '\n'; // Add a newline if missing
	}

	// // Write SSH key to file
	const sshKeyPath = path.join(sshDir, 'id_rsa');
	fs.writeFileSync(sshKeyPath, sshKeyContent);
	fs.chmodSync(sshKeyPath, '600');

	const gitDir = path.join(configDir, '.git');

	// Initialize Git if not already initialized
	if (!fs.existsSync(gitDir)) {

		console.log('Initializing Git repository...');
		await git.init().catch(e => {
			console.error('Error initializing Git repository:', e);
			errorResult = new Error(e.message);
		});
		if (errorResult) return errorResult;

		// Configure Git
		await git.addConfig('core.sshCommand', `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no`)
			.catch(e => {
				console.error('Error configuring Git:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;

		// Add remote
		console.log('Adding remote repository...');
		await git.addRemote('origin', GIT_URL)
			.catch(e => {
				console.error('Error adding remote repository:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;

		// Pull changes from the remote repository
		console.log('Pulling changes from remote repository...');
		try {
			// Step 1: Fetch the latest updates from the remote repository
			await git.fetch('origin', gitBranch)
				.catch(e => {
					console.error('Error fetching from remote repository:', e);
					errorResult = new Error(e.message);
				});
			if (errorResult) return errorResult;
			// Step 2: Forcefully reset the local branch to match the remote branch
			await git.reset(['--hard', `origin/${gitBranch}`])
				.catch(e => {
					console.error('Error resetting local branch:', e);
					errorResult = new Error(e.message);
				});
			if (errorResult) return errorResult;
		} catch (pullError: any) {
			if (pullError.message.includes('There is no tracking information for the current branch')) {
				console.log('No tracking information found. Setting upstream branch...');
			} else {
				console.error('Error pulling changes:', pullError.message);
				return Error(pullError.message);
			}
		}

		// Check if .gitignore exists
		const gitignorePath = path.join(configDir, '.gitignore');
		const gitignoreContent = `
            .git/*
            .ssh/*`;

		if (fs.existsSync(gitignorePath)) {
			const existingContent = fs.readFileSync(gitignorePath, 'utf-8');
			if (!existingContent.includes('.git/*') || !existingContent.includes('.ssh/*')) {
				console.log('Updating .gitignore file...');
				fs.appendFileSync(gitignorePath, gitignoreContent);
			} else {
				console.log('.gitignore already contains required entries. Skipping modification.');
			}
		} else {
			console.log('Creating .gitignore file...');
			fs.writeFileSync(gitignorePath, gitignoreContent);
		}


		// Add configs folder
		console.log('Adding configs folder...');
		await git.add(configDir).catch(e => {
			console.error('Error adding configs folder:', e);
			errorResult = new Error(e.message);
		});
		if (errorResult) return errorResult;

		// Initial commit
		console.log('Creating initial commit...');
		await git.commit('Initial commit: Add mock configurations')
			.catch(e => {
				console.error('Error creating initial commit:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;

		// Push to remote
		console.log('Pushing to remote repository...');
		await git.push('origin', gitBranch)
			.catch(e => {
				console.error('Error pushing to remote repository:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;
	} else {

		// Repository already initialized, check if remote is set
		const remotes = await git.getRemotes(true)
			.catch(e => {
				console.error('Error getting remote repositories:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;
		// check origin is set not same as GIT_URL change it
		if (remotes) {
			const originRemote = remotes.find(remote => remote.name === 'origin');
			if (originRemote && originRemote.refs.fetch !== GIT_URL) {
				console.log('Changing remote URL...');
				await git.remote(['set-url', 'origin', GIT_URL])
					.catch(e => {
						console.error('Error changing remote URL:', e);
						errorResult = new Error(e.message);
					});
				if (errorResult) return errorResult;
			}
		}

		//check current branch
		const currentBranch = await git.branch()
			.then(branches => branches.current)
			.catch(e => {
				console.error('Error getting current branch:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;

		if (currentBranch !== gitBranch) {
			console.log(`Switching to branch ${gitBranch}...`);
			await git.checkout(gitBranch)
				.catch(e => {
					console.error('Error switching branches:', e);
					errorResult = new Error(e.message);
				});
			if (errorResult) return errorResult;
		}

		// Pull changes first
		console.log('Pulling latest changes...');
		let pullError: any;
		await git.pull('origin', gitBranch)
			.catch(e => {
				console.error('Error pulling changes:', e);
				pullError = e;
			});
		// If pull fails, try to handle merge conflicts
		if (pullError?.message?.includes('conflict')) {
			// Stash current changes
			await git.stash()
				.catch(e => {
					console.error('Error stashing changes:', e);
					errorResult = new Error(e.message);
				});
			if (errorResult) return errorResult;

			// Pull again
			await git.pull('origin', gitBranch)
				.catch(e => {
					console.error('Error pulling changes after stash:', e);
					errorResult = new Error(e.message);
				});
			if (errorResult) return errorResult;

			// Apply stashed changes
			await git.stash(['pop'])
				.catch(e => {
					console.error('Error applying stashed changes:', e);
					errorResult = new Error(e.message);
				});
			if (errorResult) return errorResult;

// If there are conflicts, abort the merge
			await git.status()
				.then(status => {
					if (status.conflicted.length > 0) {
						return git.merge(['--abort'])
							.then(() => {
								return Error(`Merge conflict detected. Please resolve conflicts manually. \n${pullError.message}`);
							})
							.catch(e => {
								console.error('Error aborting merge:', e);
								return Error(e.message);
							});
					}
				})
				.catch(e => {
					console.error('Error checking merge conflicts:', e);
					errorResult = new Error(e.message);
				});
			if (errorResult) return errorResult;
		}

		// Add only the configs folder
		console.log('Adding configs folder...');
		await git.add(configDir)
			.catch(e => {
				console.error('Error adding configs folder:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;

		// Commit changes
		console.log('Committing changes...');
		await git.commit('Sync mock configs')
			.catch(e => {
				console.error('Error committing changes:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;

		// Push to remote
		console.log('Pushing to remote repository...');
		await git.push('origin', gitBranch)
			.catch(e => {
				console.error('Error pushing to remote repository:', e);
				errorResult = new Error(e.message);
			});
		if (errorResult) return errorResult;

		// Clean up SSH key
		try {
			if (fs.existsSync(sshKeyPath)) {
				fs.unlinkSync(sshKeyPath);
				console.log('SSH key cleaned up successfully.');
			}
		} catch (cleanupError: any) {
			console.error('Error cleaning up SSH key:', cleanupError?.message);
		}

		return errorResult;

	}

	return errorResult;
}
