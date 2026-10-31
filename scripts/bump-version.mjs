import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const packageData = JSON.parse(await readFile('package.json', 'utf8'));
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(packageData.version);
if (!match || Number(match[3]) > 9) throw new Error('Expected a version with a patch from 0 to 9.');
const [, major, minor, patch] = match.map(Number);
const next = patch === 9 ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
if (lock.version !== packageData.version || lock.packages[''].version !== packageData.version)
  throw new Error('Package versions differ.');
const pages = await Promise.all(
  ['index.html', 'requests.html'].map((path) => readFile(path, 'utf8')),
);
const current = `ver. ${packageData.version}`;
if (pages.some((page) => !page.includes(current))) throw new Error('Page versions differ.');
const updatedPages = pages.map((page) => page.replaceAll(current, `ver. ${next}`));
const fixturePath = 'tests/fixtures/refactor-contract.json';
const fixture = await readFile(fixturePath, 'utf8');
const newIndexHash = createHash('sha256').update(updatedPages[0]).digest('hex');
const updatedFixture = fixture.replace(
  /(\"index.html\"\s*:\s*\")[a-f0-9]{64}(\")/,
  `$1${newIndexHash}$2`,
);
if (updatedFixture === fixture) throw new Error('Could not update index baseline.');
packageData.version = next;
lock.version = next;
lock.packages[''].version = next;
await Promise.all([
  writeFile('package.json', JSON.stringify(packageData, null, 2) + '\n'),
  writeFile('package-lock.json', JSON.stringify(lock, null, 2) + '\n'),
  writeFile(fixturePath, updatedFixture),
  ...updatedPages.map((page, index) => writeFile(['index.html', 'requests.html'][index], page)),
]);
console.log(`Version: ${packageData.version}`);
