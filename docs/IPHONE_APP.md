# Installing Love Timer on your iPhone (sideloading)

Love Timer ships as a real native iOS app: the web app is wrapped with
[Capacitor](https://capacitorjs.com) and the complete Xcode project lives in
`ios/`. Because this is a private app for two people, it never needs to go
through the App Store — you install it directly on your iPhones ("sideloading").

There are two ways to do it. **Option A is the simplest if you have access to
any Mac.** Option B works without a Mac by letting GitHub build the app for you.

---

## Option A — Build and install with Xcode (needs a Mac)

You do **not** need a paid Apple Developer account; a free Apple ID works.

1. **One-time Mac setup**
   - Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the
     Mac App Store (Xcode 15 or newer).
   - Clone this repository and install dependencies:

     ```bash
     git clone https://github.com/whoamaiii/lovetimer.git
     cd lovetimer
     npm install
     ```

2. **Build the web app and open the iOS project**

   ```bash
   npm run ios:sync   # builds the web app and copies it into ios/
   npm run ios:open   # opens ios/App/App.xcodeproj in Xcode
   ```

   The project uses Swift Package Manager, so there is no CocoaPods step —
   Xcode resolves the Capacitor package automatically on first open.

3. **Sign with your Apple ID**
   - In Xcode, select the **App** project in the sidebar, then the **App**
     target, then the **Signing & Capabilities** tab.
   - Tick **Automatically manage signing**.
   - Under **Team**, click *Add an Account…* and sign in with your (free)
     Apple ID, then pick your *Personal Team*.
   - If Xcode complains the bundle identifier is taken, change
     `com.lovetimer.app` to something personal like `com.yourname.lovetimer`.

4. **Prepare the iPhone**
   - Plug the iPhone into the Mac with a cable and tap **Trust** on the phone.
   - On the phone, enable Developer Mode:
     **Settings → Privacy & Security → Developer Mode → on**, then restart the
     phone when asked. (The toggle only appears after Xcode has seen the
     device once.)

5. **Install**
   - In Xcode's toolbar, select your iPhone as the run destination.
   - Press **Run** (⌘R). Xcode builds, signs, and installs the app.
   - First launch only: the phone will block the app until you trust your
     developer certificate under
     **Settings → General → VPN & Device Management**.

6. **Install on your girlfriend's phone**
   - Plug her iPhone into the same Mac and repeat steps 4–5. The same free
     Apple ID can install the app on multiple devices.

### Free Apple ID limitations

- Apps signed with a free Apple ID **expire after 7 days**. The app stays on
  the phone but won't open; re-running it from Xcode (or re-installing via
  AltStore, below) refreshes it for another 7 days.
- A paid Apple Developer account ($99/year) extends this to a full year, and
  lets you share the app via TestFlight instead of a cable.
- A free Apple ID can have at most 3 sideloaded apps installed at once.

---

## Option B — No Mac: let GitHub build the IPA, install with AltStore

The repository includes a GitHub Actions workflow
(`.github/workflows/ios-ipa.yml`) that builds an **unsigned IPA** on GitHub's
macOS runners.

1. **Build the IPA**
   - On GitHub, open **Actions → Build iOS IPA → Run workflow**.
   - When the run finishes, download the `love-timer-ipa` artifact and unzip
     it to get `LoveTimer.ipa`.

2. **Install with AltStore** (Windows PC or Mac required once for setup)
   - Install [AltServer](https://altstore.io) on a computer and use it to put
     AltStore on your iPhone (it signs apps with your free Apple ID).
   - On the iPhone, open the IPA with AltStore (share the file to the phone
     via AirDrop, iCloud, etc., then open it in AltStore → *My Apps* → **+**).
   - AltStore re-signs the IPA with your Apple ID and installs it. As long as
     AltStore can reach AltServer on your Wi-Fi periodically, it
     **auto-refreshes the 7-day signature for you** — this is the most
     hands-off way to keep a private app alive on two phones.
   - [Sideloadly](https://sideloadly.io) is an equivalent alternative if you
     prefer it.

---

## Day-to-day development

| Command              | What it does                                                    |
| -------------------- | --------------------------------------------------------------- |
| `npm run ios:sync`   | Rebuilds the web app and copies it into the iOS project         |
| `npm run ios:open`   | Opens the Xcode project (macOS only)                            |
| `npm run ios:assets` | Re-renders the app icon & splash screens from `assets/*.svg`    |

After changing any web code, run `npm run ios:sync` and then run the app again
from Xcode — the native shell rarely needs to change.

## Native features

- **Haptics** — a soft tap when you burst hearts on the hero card, a heavy
  thump on million-second milestones, and a success buzz on the anniversary.
- **Notifications** — on first launch the app asks for notification
  permission. If you allow it, you get a good-morning notification at 9:00 on
  your anniversary, on each monthly "-versary", and when the next
  million-second milestone ticks over.
- **Launch handoff** — the launch screen fades out only after the timer has
  rendered, so there's no white flash in between.
- **Status bar** — follows the app theme so the clock stays legible in both
  light and dark mode.

All of this lives in `src/native/nativeFeatures.js` and is a no-op when the
app runs in a regular browser.

## How the native shell is configured

- `capacitor.config.json` — app id (`com.lovetimer.app`), app name, the
  dark background color used behind the WebView, and the splash screen
  behavior (auto-hide off; the app hides it itself after first render).
- `ios/App/App/Info.plist` — portrait-only on iPhone, no non-exempt
  encryption (avoids export-compliance questions when signing).
- `assets/icon.svg`, `assets/splash.svg`, `assets/splash-dark.svg` — the
  vector sources for the icon and the light/dark launch screens. Edit these
  and run `npm run ios:assets` to regenerate everything.
