import { readFile } from 'node:fs/promises';
import { nextVersion } from './semver-engine.mjs';

const type = process.argv[2] || 'patch';
const message = {
  major: 'feat!: incompatible change',
  minor: 'feat: compatible feature',
  patch: 'fix: compatible fix',
}[type];
if (!message) throw new Error('Expected bump type: major, minor or patch');
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
process.argv[2] = nextVersion(version, [message]);
await import('./set-version.mjs');
console.log(`Version: ${process.argv[2]}`);
