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
