import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { semverPattern } from './semver-engine.mjs';

const version = process.argv[2];
if (!semverPattern.test(version || '')) throw new Error('Provide a valid SemVer 2.0.0 version');
const hash = (text) => createHash('sha256').update(text).digest('hex');
const replaceOne = (text, pattern, replacement, file) => {
  const matches = [...text.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`Expected exactly one version in ${file}`);
  return text.replace(pattern, replacement);
};
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const fixture = JSON.parse(await readFile('tests/fixtures/refactor-contract.json', 'utf8'));
let index = await readFile('index.html', 'utf8');
let requests = await readFile('requests.html', 'utf8');
let sw = await readFile('sw.js', 'utf8');
const label = /class="project-version">ver\. [^<]+/g;
index = replaceOne(index, label, `class="project-version">ver. ${version}`, 'index.html');
requests = replaceOne(requests, label, `class="project-version">ver. ${version}`, 'requests.html');
sw = replaceOne(
  sw,
  /const CACHE_NAME = `\$\{CACHE_PREFIX\}[^\x60]+`;/g,
  `const CACHE_NAME = \`\${CACHE_PREFIX}release-${version}\`;`,
  'sw.js',
);
pkg.version = version;
lock.version = version;
lock.packages[''].version = version;
fixture.static['index.html'] = hash(index);
const { format } = await import('prettier');
const options = JSON.parse(await readFile('.prettierrc.json', 'utf8'));
const json = (data) => format(JSON.stringify(data), { ...options, parser: 'json' });
for (const [file, content] of [
  ['package.json', await format(JSON.stringify(pkg), { ...options, filepath: 'package.json' })],
  ['package-lock.json', await json(lock)],
  ['index.html', index],
  ['requests.html', requests],
  ['sw.js', sw],
  ['tests/fixtures/refactor-contract.json', await json(fixture)],
])
  await writeFile(file, content);
