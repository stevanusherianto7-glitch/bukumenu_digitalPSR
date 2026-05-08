const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const frontendDir = path.join(rootDir, 'frontend');
const vercelConfigPath = path.join(rootDir, 'vercel.json');
const backendIndexPath = path.join(rootDir, 'backend', 'src', 'index.ts');
const apiSmokeUrl = process.env.GUARDRAIL_API_URL || '';

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function verifyApiRoutingContract() {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  const rewrites = Array.isArray(vercelConfig.rewrites) ? vercelConfig.rewrites : [];

  const hasApiRootRewrite = rewrites.some((rule) => rule.source === '/api');
  const hasApiWildcardRewrite = rewrites.some((rule) => rule.source === '/api/(.*)');

  if (!hasApiRootRewrite || !hasApiWildcardRewrite) {
    throw new Error('Missing required /api rewrites in vercel.json.');
  }

  const backendSource = fs.readFileSync(backendIndexPath, 'utf8');
  const hasApiHealthRoute = backendSource.includes("app.get('/api'");
  const hasApiRouterMount = backendSource.includes("app.use('/api'");

  if (!hasApiHealthRoute || !hasApiRouterMount) {
    throw new Error("Backend API contract missing: expected app.use('/api', ...) and app.get('/api', ...).");
  }
}

async function smokeTestApiLive() {
  if (!apiSmokeUrl) {
    console.log('[guardrail] Skipping live API smoke test (set GUARDRAIL_API_URL to enable).');
    return;
  }

  const response = await fetch(apiSmokeUrl, {
    method: 'GET',
    headers: { Accept: 'text/plain' },
  });

  if (!response.ok) {
    throw new Error(`Smoke test failed: GET ${apiSmokeUrl} returned ${response.status}.`);
  }

  const body = await response.text();
  if (!body.toLowerCase().includes('api')) {
    throw new Error(`Smoke test failed: GET ${apiSmokeUrl} response body is unexpected.`);
  }
}

async function main() {
  console.log('\n[guardrail] 1/3 Checking frontend dependency resolution...');
  runCommand('npm', ['install', '--package-lock-only', '--ignore-scripts', '--dry-run'], frontendDir);

  console.log('\n[guardrail] 2/3 Verifying API routing contract (/api)...');
  verifyApiRoutingContract();

  console.log('\n[guardrail] 3/3 Running optional live smoke test for GET /api...');
  await smokeTestApiLive();

  console.log('\n[guardrail] PASS: dependency resolution and API guardrails are healthy.');
}

main().catch((error) => {
  console.error(`\n[guardrail] FAIL: ${error.message}`);
  process.exit(1);
});
