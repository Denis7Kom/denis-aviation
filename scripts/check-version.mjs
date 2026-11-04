import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(file, 'utf8');
const { version } = JSON.parse(read('package.json'));
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.[0-9]$/.test(version)) {
  throw new Error('Expected X.Y.Z with Z from 0 to 9; after 1.1.9 use 1.2.0.');
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
console.log(`PASS: version ${version}, patch range and all release labels`);
