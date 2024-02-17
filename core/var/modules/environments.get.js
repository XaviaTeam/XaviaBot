//source: Github

const isGlitch =
    process.env.PROJECT_DOMAIN !== undefined &&
    process.env.PROJECT_INVITE_TOKEN !== undefined &&
    process.env.API_SERVER_EXTERNAL !== undefined &&
    process.env.PROJECT_REMIX_CHAIN !== undefined;

const isReplit =
    process.env.REPLIT_DB_URL !== undefined &&
    process.env.REPL_ID !== undefined &&
    process.env.REPL_IMAGE !== undefined &&
    process.env.REPL_LANGUAGE !== undefined &&
    process.env.REPL_OWNER !== undefined &&
    process.env.REPL_PUBKEYS !== undefined &&
    process.env.REPL_SLUG !== undefined;

const isGitHub =
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
    process.env.GITHUB_SERVER_URL !== undefined;

const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";

export { isGlitch, isReplit, isGitHub, isWin, isLinux };
