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
  for (const file of ['index.html', 'requests.html'])
    writeFileSync(join(cwd, file), `<small class="project-version">ver. ${page}</small>`);
  return spawnSync(process.execPath, [checker], { cwd, encoding: 'utf8' });
}
(async () => {
  try {
    const { nextVersion } = await import('../scripts/semver-engine.mjs');
    for (const version of [
      '1.1.10',
      '0.0.0',
      '12.34.56-alpha.1+build.05',
      '1.2.3-01a',
      '1.2.3+001',
    ])
      assert.equal(check(version).status, 0, version);
    for (const version of [
      '01.2.3',
      '1.2',
      '1.2.3-01',
      '1.2.3+',
      '1.2.3-a..b',
      '1.2.3-α',
      '1.2.3.4',
    ])
      assert.notEqual(check(version).status, 0, version);
    assert.notEqual(check('1.2.0', '1.1.9').status, 0);
    assert.notEqual(check('1.2.0', '1.2.0', '1.1.9').status, 0);
    assert.equal(nextVersion('3.5.9', ['fix: correct time']), '3.5.10');
    assert.equal(nextVersion('3.5.9', ['fix: correct time', 'feat: add gallery']), '3.6.0');
    assert.equal(nextVersion('3.5.9', ['feat!: remove API']), '4.0.0');
    assert.equal(nextVersion('3.5.9', ['fix: update\n\nBREAKING CHANGE: remove API']), '4.0.0');
    assert.equal(nextVersion('3.5.9', ['docs: correct guide', 'Merge pull request #1']), '3.5.9');
    assert.equal(nextVersion('3.5.9', ['Update gallery pictures']), '3.5.10');
    assert.throws(() => nextVersion('3.5.9-beta.1', ['fix: update']));
    console.log('PASS: SemVer validation, release classification and version consistency');
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
