import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

for (const file of readdirSync('tests')
  .filter((name) => name.endsWith('.cjs'))
  .sort()) {
  const result = spawnSync(process.execPath, [`tests/${file}`], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
