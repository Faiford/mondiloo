# Mondiloo

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

1. Create a new repository on GitHub named `mondiloo`.
2. Upload all of these files to it, keeping the folders.
3. In the repository, go to **Settings → Pages**.
4. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
5. After a minute or two, the app is live at `https://YOUR-USERNAME.github.io/mondiloo/`.

To use your own domain later (for example `mondiloo.app`), add it under **Settings → Pages → Custom domain**.

## Install on a phone

- **Android (Chrome):** open the link, tap **⋮ → Add to Home screen** or **Install app**.
- **iPhone (Safari):** open the link, tap **Share → Add to Home Screen**.

## Publish an update

1. Change the files you need. Most content changes happen in `js/content.js`.
2. Raise the version number in **both** places:
   - `sw.js` → `const VERSION = "mondiloo-1.0.1";`
   - `js/app.js` → `const APP_VERSION="1.0.1";`
3. Upload the changed files to GitHub.

The next time someone opens Mondiloo, a **"New version! Tap to update"** button appears.
If you forget step 2, phones keep the old version they saved for offline use.

## Before launching publicly

- Fill in `[CONTACT EMAIL]` in `privacy.html`.
- Check the name "Mondiloo" at tmsearch.uspto.gov and on Google Play before buying a domain.
- Have a native speaker review the Kreyòl numbers above 20 and the phrases.

## Free + Premium (in `js/content.js`)

- `SHOP.enabled:false` makes everything free (use it during a test period with families).
- `SHOP.priceMonth` / `SHOP.priceYear` set the prices shown on the Premium page.
- `SHOP.payUrl`: paste your Stripe Payment Link here when it is ready.
- `FREE`: the list of activities anyone can use without Premium.
- Families can start a 7-day free trial once per device (behind the parent question).
- After a family pays, give them one activation code (format `MDL-XXXX-XXXX`) from your private code list.
  Codes are checked on the device, so this is a simple first step; real accounts with Stripe come later.

## Songs

Put MP3 files in `songs/` and list them in `SONGS` in `js/content.js`, for example:
`{e:"🎵", t:["Count with me","Ann konte","Comptons","Contemos"], file:"songs/ann-konte.mp3"}`

## Worksheets

Printable PDF packs are in `worksheets/` (one per language). Parents open them from the Parent area.

## New games in 1.5.0
Play: Coloring (8 pages), Maze, Connect the dots, Shadows, Spot the difference.
World: Kitchen (8 recipes incl. diri ak pwa, pikliz, soup joumou), Good habits (6 routines), In order (7 sequences).
All have levels, stars and the 4 languages. Text lives in `js/content.js` (FOOD, RECIPES, HABITS, ORDERS);
coloring pages and dot shapes live in `js/app.js` (PAINT, DOTS). Coloring and Maze are free; the rest are Premium.

## New games in 1.6.0
Play: Follow me (color memory), Crab tap, Hide and seek. Math: Patterns. World: Odd one out. Language: Spell it (ages 5–8).
Songs: each song in `SONGS` can have `lang:"ht"` (or en/fr/es). Every child sees every song; songs in the child's
language come first and the others get a small language badge.

## 1.6.1: first songs
`songs/ki-koule.mp3` (Ki Koulè?) and `songs/ann-konte-1-10.mp3` (Ti Mimi: Ann Konte 1–10), re-encoded to 128 kbps.
A song is saved on the phone the first time it is played, so it then plays offline. Only one song plays at a time.

## New games in 1.7.0
Play: Tic-tac-toe against Tiki. World: Feed the animals (FEED), Feelings (EMOS). Language: Opposites (OPPS).
Math: Missing number, Big and small. Data for the new games is in `js/content.js`.

## 1.8.0: Mondiloo for every child
- "Discover the world" (COUNTRIES in `js/content.js`): Haiti first (opens Discover Haiti), then 10 more countries,
  each with "hello" in its language and 3 facts. Add a country by copying a block.
- Kitchen: sushi, pizza, tacos, pancakes added between the Haitian recipes. Coloring: rocket and whale added.
- For English/French/Spanish users, Haitian-only items (proverbs, Bouki ak Malis) come after the general ones.
  Kreyòl users see them first.

## 1.9.0: Say it with me 🎤
The child sees a word (later short phrases), hears it (English/French/Spanish voice; in Kreyòl a grown-up reads it),
taps 🎤, says it, and hears their own voice back. The recording stays in memory only, is never saved or sent,
and the microphone is released as soon as the child leaves the activity. privacy.html was updated to say this.
The microphone needs https (Hostinger SSL) and works in Chrome/Safari; in-app browsers may not allow it.

## 2.1.0: landing page
- `index.html` is now the parents' landing page (4 languages, prices, FAQ). The app itself is `app.html`.
  Returning players (who already chose a language) are sent straight to the app; add `?home` to see the landing page.
- Link previews (WhatsApp, Facebook): `img/og.png`. Screenshots for the page and the stores: `img/shot-*.jpg`.
- Trial reminder on the home screen in the last 2 days of the free trial and after it ends.

## 2.2.0: automatic Premium codes + Android prep
- `merci.html`: Stripe redirects here after payment (`?session_id={CHECKOUT_SESSION_ID}`). It asks the
  Cloudflare Worker in `worker/mondiloo-codes.js` for the code, shows it, and "Open Mondiloo" activates it
  (`app.html?code=…`). Until `CODE_API` is set in merci.html, the page says the code comes by email.
- `.well-known/assetlinks.json`: links the Android app `com.mondiloo.app` to the site. See `store/ANDROID.md`.
