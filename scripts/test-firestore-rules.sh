#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
emulator_jar="${FIRESTORE_EMULATOR_JAR:-}"
emulator_sha256="9d43599ed6151199e8d604dc87fac51218e49e5f3a48519b1ae560bbe5e3382d"
port=8088

if [[ -z "$emulator_jar" || ! -f "$emulator_jar" ]]; then
  echo 'Set FIRESTORE_EMULATOR_JAR to the Firestore emulator v1.19.8 JAR.' >&2
  exit 1
fi
actual_sha256="$(sha256sum -- "$emulator_jar" | cut -d ' ' -f 1)"
if [[ "$actual_sha256" != "$emulator_sha256" ]]; then
  echo 'Firestore emulator JAR checksum does not match v1.19.8.' >&2
  exit 1
fi
if (echo > /dev/tcp/127.0.0.1/$port) 2>/dev/null; then
  echo "Port $port is already in use; refusing to use an existing emulator." >&2
  exit 1
fi

emulator_log="$(mktemp)"
java -jar "$emulator_jar" --host 127.0.0.1 --port "$port" \
  --project_id demo-denis-aviation-rules --rules "$project_dir/firestore.rules" \
  > "$emulator_log" 2>&1 &
emulator_pid=$!
cleanup() {
  kill "$emulator_pid" 2>/dev/null || true
  wait "$emulator_pid" 2>/dev/null || true
  rm -f -- "$emulator_log"
}
trap cleanup EXIT

ready=false
for attempt in {1..30}; do
  if ! kill -0 "$emulator_pid" 2>/dev/null; then break; fi
  if (echo > /dev/tcp/127.0.0.1/$port) 2>/dev/null; then
    ready=true
    break
  fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  echo 'Firestore emulator did not start:' >&2
  cat "$emulator_log" >&2
  exit 1
fi
FIRESTORE_EMULATOR_HOST="127.0.0.1:$port" node "$project_dir/tests/firestore-security/rules.test.mjs"
