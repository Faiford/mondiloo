# Mondiloo · Android (Google Play) build with PWABuilder

1. Open https://www.pwabuilder.com, enter `https://mondiloo.com/app.html`, then **Package for stores → Android → Generate package / Options**.
2. Options:
   - Package ID: `com.mondiloo.app`
   - App name: `Mondiloo` · Short name: `Mondiloo`
   - Start URL: `/app.html?src=play`  (hides outside payment links in the Play version)
   - Theme / background color: `#FFF6E5` · Display: standalone · Orientation: portrait
   - Signing key: **Use mine** → upload `mondiloo-upload.keystore` (private), alias `mondiloo`, passwords from `ANDROID-KEY.txt`
3. Download the zip. Upload the `.aab` file in Play Console (Testing → Internal testing first).
4. After the first upload, Play Console → **Test and release → App integrity → App signing** shows Google's
   "App signing key certificate" SHA-256. Add it next to ours in `.well-known/assetlinks.json`
   (the upload key fingerprint is already there). Without it the app shows a browser bar at the top.

## Version 1.0.1 — Google Play Billing (subscriptions)
- Same PWABuilder options as above, plus: **Version code `2`**, **Version name `1.0.1`**, and turn on **Google Play billing** (Play Billing / Digital Goods API).
- Same signing key (Use mine → `mondiloo-upload.keystore`, alias `mondiloo`).
- Play Console → Monetize with Play → Products → Subscriptions: two subscriptions, each with ONE auto-renewing base plan marked *backwards compatible*:
  - `premium_monthly` — base plan `monthly`, 1 month, US $3.99
  - `premium_yearly` — base plan `yearly`, 1 year, US $29.99
  (no Play free-trial offer: the app already gives a 7-day trial behind the parent gate)
- The Worker acknowledges each purchase (`POST /play`) using the secret `GOOGLE_SA` (service-account JSON key with access to the app in Play Console → Users and permissions). Without it Google refunds purchases after 3 days.
