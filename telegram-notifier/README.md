# Telegram notifications for flight requests

This is a separate scheduled Cloudflare Worker; the GitHub Pages site and Firestore security rules are not changed. Every five minutes it queries Firestore for applications after a persisted `(createdAt, document name)` cursor and sends one generic message per application. It does not filter on request status. Telegram receives only a generic notification and the link to the requests page, never the application contents.

## Last observed deployment status

The Worker and D1 binding were deployed, but delivery to Telegram was **not confirmed**.
The last reported test on 29 October 2026 returned `Missing Worker configuration` in a
scheduled invocation. This is a historical observation, not a claim about the current
deployment. Inspect the latest active version and logs before diagnosing it. The separate
[browser alert](../docs/requests-and-notifications.md#оповещение-на-сайте) works only while
the administrator's request page is open.

## Security and setup prerequisites

- Use a Workers **Free** account and a D1 database; do not upgrade to a paid plan if you want to avoid charges.
- Create a Telegram bot with BotFather and start a private chat with it. Keep the token private. Obtain your numeric chat ID securely and configure the ID and token as Worker **secrets**.
- Create a dedicated Google Cloud service account in `denis-komarov---aviation` and give it `Cloud Datastore Viewer` (`roles/datastore.viewer`), not Owner, Editor or a write role. This predefined role is project-wide and permits reading Firestore data in the project; it is not restricted to the `flightRequests` collection. Server credentials use IAM and bypass Firestore Security Rules. Treat the JSON key as highly sensitive. Do not share it in chat or commit it to GitHub. If organization policy prevents service-account key creation, stop and select a different authentication approach; do not weaken the policy just to proceed.
- Store the complete service-account JSON as a secret named `GOOGLE_SERVICE_ACCOUNT`, the bot token as `TELEGRAM_BOT_TOKEN`, and the destination ID as `TELEGRAM_CHAT_ID`. Create or paste secrets directly in Cloudflare's dashboard or using Wrangler secrets; never put values in `wrangler.jsonc`, Worker source code, GitHub, screenshots or logs.

## Deploy using Wrangler

Run the following from the `telegram-notifier` directory after authenticating Wrangler
in the correct Cloudflare account. The tracked `wrangler.jsonc` already names the existing
Worker and database. Do not create a second database or reset existing state just to
redeploy the Worker.

1. For a **new** installation only, create a D1 database with `npx wrangler d1 create denis-aviation-notifier` and configure its returned ID and the `DB` binding in `wrangler.jsonc`. For the existing installation, use its configured database.
2. For a **new** database only, run `npx wrangler d1 execute denis-aviation-notifier --remote --file schema.sql`. This establishes the initial cursor at that moment. Existing applications from before initialization are not notified. Preserve the existing database and state when debugging or redeploying.
3. Deploy the Worker with `npx wrangler deploy`, then add the three secrets via **Workers & Pages → your Worker → Settings → Variables and Secrets → Add → Secret**. Deploy the changes. Until secrets are configured, scheduled runs fail safely. The cron is already configured at five-minute intervals.
4. Watch the scheduled invocation logs for errors. Test using a dedicated, authorized test application and confirm that the private Telegram chat receives a message. This project must not claim successful delivery until this end-to-end test passes.

The Worker processes up to ten applications per run; a backlog drains over subsequent runs. Firestore and Cloudflare D1 free limits are shared across project/account usage. If a free quota is exhausted, runs fail until quota resets; later invocations retry from the saved cursor. A Google service-account JSON key and Telegram bot token are long-lived secrets: restrict account access, rotate or revoke compromised credentials and remove downloaded copies after storing them safely.

## Reliability

The cursor advances only after Telegram accepts each message. The D1 lease prevents simultaneous normal scheduled runs. If Telegram accepts a message but the following database write fails, the retry may send a duplicate; exactly-once delivery cannot be guaranteed. A delayed or failed run may postpone a notification. The Worker exposes no HTTP handler and never changes request statuses.

## Troubleshooting

- `Missing Worker configuration`: at least one of `DB`, `GOOGLE_SERVICE_ACCOUNT`,
  `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` was absent or empty in that invocation.
  In the updated Worker, the error lists the missing binding names, never their values.
  Older deployed versions may omit the names. Check the D1 binding, the names and the
  active deployed version. Do not print or share secret values.
- `Invalid service account configuration`: the received value is not valid JSON or lacks
  the expected service-account type, email or private key. Store the entire JSON key as
  the `GOOGLE_SERVICE_ACCOUNT` secret; do not expose it in logs or screenshots.
- `Invalid service account private key`: the private key in that JSON could not be
  decoded or imported. Check the stored JSON privately; never include it in a support
  request or a log.
- `Notification state is not initialized`: the Worker could not find its state row in D1.
  Verify the binding points to the intended existing database before taking any action
  on the state.
- A Google, Firestore or Telegram request error is a later-stage failure. Use the latest
  status code and configuration to diagnose it; a successful build alone does not
  establish that an authenticated read or a Telegram send worked.
