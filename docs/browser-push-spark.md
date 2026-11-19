# Browser push on Firebase Spark

The Cloudflare Worker can check requests on its existing five-minute schedule and
send generic notifications through FCM HTTP v1. Keep the Worker on Workers Free
and Firebase on Spark. The Telegram polling cursor and the browser push cursor
are independent.

1. Apply `telegram-notifier/browser-push.sql` to the bound D1 database. This
   additive migration establishes the starting time for new notifications.
2. Check that FCM HTTP v1 and the FCM Registration API are enabled. The Worker
   service account needs Firestore read permission and
   `cloudmessaging.messages.create` on the Firebase project. Use the public
   Web Push certificate key as the Worker variable `FCM_VAPID_PUBLIC_KEY`.
3. Deploy the Worker on its HTTPS `workers.dev` address or an existing HTTPS
   route. Add a `request-push-endpoint` meta tag to `requests.html` with that
   origin and publish the page and updated scripts. The page enables an opt-in
   button after reading the public key from the Worker.
4. Opt in from two signed-in browser profiles. Using a dedicated test request,
   check creation and status notifications for both profiles, then send one
   reply in each direction with the receiver's tab closed. Confirm that a third
   account receives no notifications and that opening a notification navigates
   to its request.

The Worker compares the latest request status with the prior scan, so status
changes that occur and revert between scans may be skipped. It scans up to ten
requests per run, with a saved position, so a full cycle can take several
scheduled runs. Existing request status is recorded on the first scan. On
startup only new requests and messages since the migration timestamp qualify.
Payloads contain the event type, request ID, and the recipient's language.

The local integration test uses SQLite and simulated Firestore, Identity
Toolkit and FCM responses. It does not verify real cloud permissions,
subscription registration, or device delivery.
