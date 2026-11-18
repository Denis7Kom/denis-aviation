import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { nextVersion } from './semver-engine.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trimEnd();
const baseline = git(
  'log',
  '--first-parent',
  '-1',
  '--format=%H',
  '--grep=^chore: initialize semantic version 3.5.0$',
  '--grep=^chore: release version [0-9]',
);
if (!baseline) throw new Error('Version baseline not found in first-parent history');
const raw = git('log', '--no-merges', '--format=%B%x00', `${baseline}..HEAD`);
const messages = raw
  .split('\0')
  .map((message) => message.trim())
  .filter(Boolean);
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const next = nextVersion(version, messages);
console.log(next);
