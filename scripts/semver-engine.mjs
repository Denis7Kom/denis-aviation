export const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

export function classifyCommit(message) {
  const subject = message.split(/\r?\n/, 1)[0];
  if (/^(?:Merge |Revert ")/.test(subject)) return null;
  if (/^[a-z]+(?:\([^)]+\))?!:/i.test(subject) || /^BREAKING[ -]CHANGE:/m.test(message))
    return 'major';
  if (/^feat(?:\([^)]+\))?:/i.test(subject)) return 'minor';
  if (/^(?:docs|test|ci|build|chore|refactor)(?:\([^)]+\))?:/i.test(subject)) return null;
  return 'patch';
}

export function nextVersion(version, messages) {
  const match = semverPattern.exec(version);
  if (!match || match[4] || match[5]) throw new Error('A stable SemVer version is required');
  const severity = { patch: 1, minor: 2, major: 3 };
  const highest = messages.reduce(
    (n, message) => Math.max(n, severity[classifyCommit(message)] || 0),
    0,
  );
  const [major, minor, patch] = match.slice(1, 4).map(BigInt);
  if (highest === 3) return `${major + 1n}.0.0`;
  if (highest === 2) return `${major}.${minor + 1n}.0`;
  if (highest === 1) return `${major}.${minor}.${patch + 1n}`;
  return version;
}
