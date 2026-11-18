import { semverPattern } from './semver-engine.mjs';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(file, 'utf8');
const { version } = JSON.parse(read('package.json'));
if (!semverPattern.test(version)) {
  throw new Error('Expected a valid SemVer 2.0.0 version.');
}
const lock = JSON.parse(read('package-lock.json'));
if (lock.version !== version || lock.packages?.['']?.version !== version) {
  throw new Error('Package versions differ.');
}
for (const file of ['index.html', 'requests.html']) {
  const labels = [...read(file).matchAll(/class="project-version">ver\. ([^<]+)</g)];
  if (labels.length !== 1 || labels[0][1] !== version) {
    throw new Error(`Version label differs in ${file}.`);
  }
}
console.log(`PASS: version ${version}, SemVer format and all release labels`);
