// Production assets remain private; only the current website output is served.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const PIN = 'df2d7a0de1d86945cd74d8c5bdf435039bd16887';
let bundle = process.env.LOCAL_RELEASE_ASSETS;
if (!bundle) {
  if (!process.env.RELEASE_ASSET_SSH_KEY) throw new Error('Production assets unavailable: RELEASE_ASSET_SSH_KEY is required');
  const work = mkdtempSync(join(tmpdir(), 'open-silicon-assets-'));
  const key = join(work, 'key');
  const hosts = join(work, 'known_hosts');
  writeFileSync(key, process.env.RELEASE_ASSET_SSH_KEY.replace(/\r/g, '').trim() + '\n', { mode: 0o600 });
  // GitHub's published Ed25519 host key, verified against GitHub's documentation.
  writeFileSync(hosts, '[ssh.github.com]:443 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n');
  bundle = join(work, 'bundle');
  const ssh = `ssh -i ${key} -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=${hosts}`;
  const gitEnv = { ...process.env, GIT_SSH_COMMAND: ssh, GIT_TERMINAL_PROMPT: '0' };
  execFileSync('git', ['clone', '--quiet', '--no-checkout', 'ssh://git@ssh.github.com:443/Fishbiscuit/open-silicon-sg-release-assets.git', bundle], { env: gitEnv, stdio: 'inherit' });
  execFileSync('git', ['-C', bundle, 'checkout', '--quiet', '--detach', PIN], { env: gitEnv, stdio: 'inherit' });
}
bundle = resolve(bundle);
const actual = execFileSync('git', ['-C', bundle, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (actual !== PIN) throw new Error('Production asset bundle does not match the pinned revision');
if (execFileSync('git', ['-C', bundle, 'status', '--porcelain'], { encoding: 'utf8' }).trim()) throw new Error('Production asset bundle has uncommitted changes');
for (const path of ['assets/ABC-Areal.woff2', 'assets/exhibits/binary.webp', 'assets/exhibits/critter.webp', 'ite3/index.html', 'ite3/aerolamp/index.html']) {
  if (!existsSync(join(bundle, path))) throw new Error(`Production asset is missing: ${path}`);
}
const contentFiles = ['content/home.md', ...readdirSync('content/exhibits').filter(x => x.endsWith('.md')).map(x => `content/exhibits/${x}`)];
for (const file of contentFiles) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/^\s*image:\s*(\S+)\s*$/gm)) {
    if (!existsSync(join(bundle, 'assets', match[1]))) throw new Error(`Production image is missing: ${match[1]}`);
  }
}
const env = { ...process.env, RELEASE_ASSET_ROOT: bundle };
execFileSync(process.execPath, ['src/build.mjs'], { env, stdio: 'inherit' });
execFileSync(process.execPath, ['src/vercel-release.mjs'], { env, stdio: 'inherit' });
