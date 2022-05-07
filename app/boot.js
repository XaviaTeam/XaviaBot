import { execSync, spawn } from 'child_process';
import { writeFileSync, existsSync, statSync } from 'fs';
import { logger } from './utils.js';
import { } from 'dotenv/config';



//handling environments - source: some where on github
//begin
const isGlitch = (
    process.env.PROJECT_DOMAIN !== undefined &&
    process.env.PROJECT_INVITE_TOKEN !== undefined &&
    process.env.API_SERVER_EXTERNAL !== undefined &&
    process.env.PROJECT_REMIX_CHAIN !== undefined
);

const isReplit = (
    process.env.REPLIT_DB_URL !== undefined &&
    process.env.REPL_ID !== undefined &&
    process.env.REPL_IMAGE !== undefined &&
    process.env.REPL_LANGUAGE !== undefined &&
    process.env.REPL_OWNER !== undefined &&
    process.env.REPL_PUBKEYS !== undefined &&
    process.env.REPL_SLUG !== undefined
)

const isGitHub = (
    process.env.GITHUB_ENV !== undefined &&
    process.env.GITHUB_EVENT_PATH !== undefined &&
    process.env.GITHUB_REPOSITORY_OWNER !== undefined &&
    process.env.GITHUB_RETENTION_DAYS !== undefined &&
    process.env.GITHUB_HEAD_REF !== undefined &&
    process.env.GITHUB_GRAPHQL_URL !== undefined &&
    process.env.GITHUB_API_URL !== undefined &&
    process.env.GITHUB_WORKFLOW !== undefined &&
    process.env.GITHUB_RUN_ID !== undefined &&
    process.env.GITHUB_BASE_REF !== undefined &&
    process.env.GITHUB_ACTION_REPOSITORY !== undefined &&
    process.env.GITHUB_ACTION !== undefined &&
    process.env.GITHUB_RUN_NUMBER !== undefined &&
    process.env.GITHUB_REPOSITORY !== undefined &&
    process.env.GITHUB_ACTION_REF !== undefined &&
    process.env.GITHUB_ACTIONS !== undefined &&
    process.env.GITHUB_WORKSPACE !== undefined &&
    process.env.GITHUB_JOB !== undefined &&
    process.env.GITHUB_SHA !== undefined &&
    process.env.GITHUB_RUN_ATTEMPT !== undefined &&
    process.env.GITHUB_REF !== undefined &&
    process.env.GITHUB_ACTOR !== undefined &&
    process.env.GITHUB_PATH !== undefined &&
    process.env.GITHUB_EVENT_NAME !== undefined &&
    process.env.GITHUB_SERVER_URL !== undefined
)


function upNodeReplit() {
	return new Promise(resolve => {
		execSync('npm i --save-dev node@14 && npm config set prefix=$(pwd)/node_modules/node && export PATH=$(pwd)/node_modules/node/bin:$PATH');
		resolve();
	})
}

(async() => {
	//CHECK NODE VERSION IF IS EQUAL OR GREATER THAN 14.0.0
	if (process.version.slice(1).split('.')[0] < 14) {
		if (isReplit) {
			try {
				logger.warn("Installing Node.js v14 for Repl.it...");
				await upNodeReplit();
				if (process.version.slice(1).split('.')[0] < 14) throw new Error("Failed to install Node.js v14.");
			} catch (err) {
				logger.error(err);
				process.exit(0);
			}
		}
		logger.error("Xavia requires Node 14 or higher. Please update your version of Node.");
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


//Restart Loop
const _1_MINUTE = 60000;
let restartCount = 0;


function Xavia() {
	var child = spawn('node', ['--trace-warnings', 'system.js'], {
		cwd: process.cwd() + '/app/',
		stdio: 'inherit'
	});

	child.on("close", async (code) => {
		handleRestartCount();
		if (code !== 0 && restartCount < 5) {
			logger.error(`An error occurred with exit code ${code}`);
			logger.warn("Restarting Xavia...");
			await new Promise(resolve => setTimeout(resolve, 2000));
			Xavia();
		} else {
			logger.error("Xavia has been closed.");
			process.exit(0);
		}
	});
};
Xavia();

function handleRestartCount() {
	restartCount++;
	setTimeout(() => {
		restartCount--;
	}, _1_MINUTE);
}
