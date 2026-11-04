# Request service: release 1.2.4

## Current activation state

The repository contains client fixes, a Firebase server implementation, rules, indexes
and tests. Committing to GitHub Pages publishes static assets only. It does **not**
deploy Firebase rules/functions/indexes or enable Firebase Cloud Messaging.

The frontend reads the public document `requestService/config`. With no document,
or old rules denying that read, the existing direct-write flow continues. Browser
notifications still work with the requests page open. Server enforcement and Web Push
remain disabled until the deployment below is completed. No credential is in this repository.

## Changes available from GitHub Pages

- Sending state belongs to the request rather than a particular textarea. Success and
  failure refresh the current view after card/language rerenders; failed drafts survive.
- First-administrator-reply failures and history failures have visible retry controls.
  An empty successful lookup still hides the chat. Clients still cannot start via the UI.
- Previous messages load in pages of 10 with a document cursor. Newly arriving messages
  preserve already loaded history. Messages remain text, including old long messages.
- Explicit read markers persist in localStorage under UID + request ID. The latest incoming
  message remains unread across reloads and messages arriving while away are marked on return.
  Markers are local to this browser/device; clearing site data removes them. An inaccessible
  storage area falls back to memory for the current session.
- Admin reads 20 requests plus a sentinel. Previous/next navigation uses document cursors.
  Live message subscriptions cover the current page, rather than the entire database.
  Search covers the current page. Until server activation, the status filter also covers
  the current page so existing installations do not require an unpublished composite index.
  After activation status filtering happens in Firestore and counts use aggregate queries.
  Live browser alerts cover loaded requests. Web Push covers eligible requests across pages.
- Time zone search filters city/region/IANA names and preserves the selected zone.
  Automatic detection remains. Native date input, arrow glyphs and auxiliary typography
  are unchanged.
- Hero: mobile WebP 768px, approximately 29 KB; desktop WebP approximately 106 KB;
  original PNG approximately 2 MB remains the fallback. The service worker precaches
  both optimized variants rather than the original PNG.

## Server behavior after activation

- `createFlightRequest` validates fields and resolves date/time in the supplied IANA
  zone on the server. Invalid calendar dates, DST gaps and past instants are rejected.
  In a DST fold, the earliest future occurrence is selected. Five requests per UTC
  calendar day are enforced transactionally. Canonical UTC `scheduledAt` is stored.
- `sendRequestMessage` verifies ownership/admin identity in the same transaction that
  creates the message and updates a UID quota. Minimum spacing: 10 seconds; maximum:
  120 messages per UTC day, shared across all requests and tabs. Both client and admin
  are limited. The client-first prohibition remains an interface restriction (item 9).
- After `secureApi: true`, rules reject all direct request/message creates, including
  direct SDK/REST bypasses. Reads, status updates and cancellations retain existing
  ownership rules. Config, tokens, delivery receipts and message quotas are server-only
  writes. Calendar validation is also improved in the transitional direct-create rule.
- `registerRequestPush` stores private FCM tokens per account (up to 20 devices).
  Triggers send generic notifications for requests, replies and status changes.
  No message body, account email, contact or route is included in the push payload.
  Signing out or switching accounts invalidates the browser FCM subscription.
  Invalid server tokens are removed on delivery. Browser/OS permissions and platform
  background policies still apply; delivery is not guaranteed when the browser/OS
  disables background operation.
- Delivery receipts and leases reduce duplicate trigger deliveries. A failure after
  sending but before saving the receipt can still cause a repeat; the notification
  tag and Web Push Topic collapse notifications for the same request.

## Deployment and activation

A project administrator must perform the following steps with existing Firebase/Google
credentials. Functions deployment may require the Firebase Blaze billing plan; do not
enable billing merely to run the static client changes.

1. Install the function dependencies from the repository:
   `npm ci --prefix functions`.
2. Run root checks and Firestore emulator tests:
   `npm ci`, `npm run check`, `npm run test:firestore-rules`.
3. Deploy functions, rules and indexes to the existing project:
   `firebase deploy --only functions,firestore:rules,firestore:indexes --project denis-komarov---aviation`.
   Wait for the indexes to finish building.
4. In Firebase project settings → Cloud Messaging → Web Push certificates, obtain/generate
   a VAPID key pair. Only the **public** certificate key goes into the config document.
   Ensure the FCM Registration API / FCM HTTP v1 API are enabled for this project.
5. Authenticate the local Google Application Default Credentials as the project administrator.
   From the repository root, activate:
   `node functions/configure-service.mjs --activate --vapid-key=<PUBLIC_KEY>`.
   This checks the deployed health endpoint before writing `requestService/config`
   with `secureApi: true`. The config has no private keys.
6. Reload the requests page. Enable background notifications with the page button.
   Verify a reply from a second authenticated account with the recipient page closed.
   Verify that direct creates are rejected and rapid callable sends are rate-limited.
   Use administrator-owned test records. Do not treat emulator tests as a production delivery test.

Do not activate the config before the functions, rules and indexes exist. If activation
fails, keep the config unset; do not weaken rules to work around an error. Old open
tabs using direct writes will need a reload after secure activation.

## Validation scope

Automated tests exercise rerendered composers, retry states, old-message pagination,
read markers, account isolation, bounded admin pages, time zones/DST/calendar validation,
quota boundaries and secure-mode direct-write denials. Real Web Push delivery, production
rules, Telegram, Safari, iPhone/Android and switching two real Google accounts still
require live verification. Items 11–13 and the Telegram implementation are unchanged.

## Dependency verification

The server lock records the tested dependency resolution. A scoped override updates
rimraf's glob dependency to 14.0.2; the resolved minimatch version is 11.0.4.
These address [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)
and [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The production dependency audit reported zero known vulnerabilities on 2026-11-04.
Module imports and the temporary-file cleanup API were checked with the patched resolution.
CI installs from the lock and checks the production audit on subsequent changes.
