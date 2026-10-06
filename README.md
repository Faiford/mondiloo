# Tikito

Learning and play app for children ages 3–8 in **Kreyòl, English, Français and Español**.
It is a Progressive Web App (PWA): it runs in the browser, installs on a phone's home screen, and works offline.

## Files

| File | What it is |
|---|---|
| `index.html` | The page that loads the app |
| `css/app.css` | Colors, fonts, layout |
| `js/content.js` | **All content**: words, phrases, stories, alphabet, UI text in 4 languages |
| `js/app.js` | Game and lesson logic. `APP_VERSION` is at the top |
| `sw.js` | Offline support and updates. `VERSION` is at the top |
| `manifest.webmanifest` | App name, colors and icons for installing on a phone |
| `icons/` | App icons |
| `privacy.html` | Privacy policy (fill in your contact email) |

## Put it online with GitHub Pages (free)

1. Create a new repository on GitHub named `tikito`.
2. Upload all of these files to it, keeping the folders.
3. In the repository, go to **Settings → Pages**.
4. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
5. After a minute or two, the app is live at `https://YOUR-USERNAME.github.io/tikito/`.

To use your own domain later (for example `tikito.app`), add it under **Settings → Pages → Custom domain**.

## Install on a phone

- **Android (Chrome):** open the link, tap **⋮ → Add to Home screen** or **Install app**.
- **iPhone (Safari):** open the link, tap **Share → Add to Home Screen**.

## Publish an update

1. Change the files you need. Most content changes happen in `js/content.js`.
2. Raise the version number in **both** places:
   - `sw.js` → `const VERSION = "tikito-1.0.1";`
   - `js/app.js` → `const APP_VERSION="1.0.1";`
3. Upload the changed files to GitHub.

The next time someone opens Tikito, a **"New version! Tap to update"** button appears.
If you forget step 2, phones keep the old version they saved for offline use.

## Before launching publicly

- Fill in `[CONTACT EMAIL]` in `privacy.html`.
- Check that the name "Tikito" is free to use (there is an app called "Tikino").
- Have a native speaker review the Kreyòl numbers above 20 and the phrases.
