const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const checker = resolve('scripts/check-version.mjs');
const cwd = mkdtempSync(join(tmpdir(), 'aviation-version-'));
function check(version, page = version, lockVersion = version) {
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ version }));
  writeFileSync(
    join(cwd, 'package-lock.json'),
    JSON.stringify({ version: lockVersion, packages: { '': { version: lockVersion } } }),
  );
  for (const file of ['index.html', 'requests.html']) {
    writeFileSync(join(cwd, file), `<small class="project-version">ver. ${page}</small>`);
  }
  return spawnSync(process.execPath, [checker], { cwd, encoding: 'utf8' });
}
try {
  for (const version of ['1.1.9', '1.2.0', '1.10.0']) {
    assert.equal(check(version).status, 0, version);
  }
  assert.notEqual(check('1.1.10').status, 0, 'Reject the invalid released version');
  assert.notEqual(check('1.2.0', '1.1.9').status, 0, 'Reject stale page labels');
  assert.notEqual(check('1.2.0', '1.2.0', '1.1.9').status, 0, 'Reject stale lock version');
  console.log('PASS: release version guard rejects invalid and inconsistent versions');
} finally {
  rmSync(cwd, { recursive: true, force: true });
}
