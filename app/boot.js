import { execSync, spawn } from 'child_process';
import { writeFileSync, existsSync, statSync } from 'fs';
import { logger } from './utils.js';
import { } from 'dotenv/config';
import semver from 'semver';
import axios from 'axios';

import '../cleanup.js';

//handling environments - source: some where on github
//begin

import { isGlitch, isReplit, isGitHub } from './src/modules/environments.get.js';

// i know replit has replit.nix, but on some old repl, that thing doesn't work..
function upNodeReplit() {
	return new Promise(resolve => {
		execSync('npm i --save-dev node@16 && npm config set prefix=$(pwd)/node_modules/node && export PATH=$(pwd)/node_modules/node/bin:$PATH');
		resolve();
	})
}

(async () => {
	if (process.version.slice(1).split('.')[0] < 16) {
		if (isReplit) {
			try {
				logger.warn("Installing Node.js v14 for Repl.it...");
				await upNodeReplit();
				if (process.version.slice(1).split('.')[0] < 16) throw new Error("Failed to install Node.js v16.");
			} catch (err) {
				logger.error(err);
				process.exit(0);
			}
		}
		logger.error("Xavia requires Node 16 or higher. Please update your version of Node.");
		process.exit(0);
	}

	//suggested by MintDaL
	if (isGlitch) {
		const WATCH_FILE = {
			"restart": {
				"include": [
					"\\.json"
				]
			},
			"throttle": 3000
		}

		if (!existsSync(process.cwd() + '/watch.json') || !statSync(process.cwd() + '/watch.json').isFile()) {
			logger.warn("Glitch environment detected. Creating watch.json...");
			writeFileSync(process.cwd() + '/watch.json', JSON.stringify(WATCH_FILE, null, 2));
		}
	}

	if (isGitHub) {
		logger.warn("Running on GitHub is not recommended.");
	}
})();

//end


// CHECK UPDATE
logger.custom("Checking for updates...", "UPDATE");
axios.get('https://raw.githubusercontent.com/XaviaTeam/XaviaBot/main/package.json')
	.then(res => {
		const { version } = res.data;
		const currentVersion = JSON.parse(readFileSync('./package.json')).version;
		if (semver.lt(currentVersion, version)) {
			logger.warn(`New version available: ${version}`);
			logger.warn(`Current version: ${currentVersion}`);
		} else {
			logger.custom("No updates available.", "UPDATE");
		}
	})
	.catch(err => {
		logger.error('Failed to check for updates.');
	});


// Child handler
const _1_MINUTE = 60000;
let restartCount = 0;

function main() {
	const child = spawn('node', ['--trace-warnings', 'app/system.js'], {
		cwd: process.cwd(),
		stdio: 'inherit'
	});

	child.on("close", async (code) => {
		handleRestartCount();
		if (code !== 0 && restartCount < 5) {
			logger.error(`An error occurred with exit code ${code}`);
			logger.warn("Restarting Xavia...");
			await new Promise(resolve => setTimeout(resolve, 2000));
			main();
		} else {
			console.log();
			logger.error("Xavia has been closed.");
			process.exit(0);
		}
	});
};

function handleRestartCount() {
	restartCount++;
	setTimeout(() => {
		restartCount--;
	}, _1_MINUTE);
}

main();
