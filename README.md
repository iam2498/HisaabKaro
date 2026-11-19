# 📓 Hisaab Karo (Aapki Apni Khata Diary)

Ek behad aasan aur saaf-suthra mobile-first digital khata ledger web app. Isme koi framework, npm, build step, ya backend nahi hai. Ye sidhe `index.html` ko kisi bhi browser me khol kar chalta hai aur Netlify par 1 minute me deploy ho jata hai.

> ⚠️ **Zaroori Note (Data Safety):** Ye app aapka hisaab aapke phone/browser ki local storage me surakshit rakhta hai.
> - **iPhone/iPad Alag Storage:** iPhone par Safari browser aur "Add to Home Screen" (standalone app) ka storage bilkul alag-alag hota hai. Jo hisaab Safari me likha hai wo Home Screen app me nahi aayega, aur ulta bhi.
> - **Domain / URL badalna:** Agar aap website ka domain ya link badalte hain (jaise ek URL se doosre URL par), toh naye link par hisaab shuru me khali milega. Hamesha domain badalne se pehle **"Backup lein"** karein aur naye domain par **"Backup restore"** karein!
> - Agar browser ka "Clear browsing data / Cache & cookies" clear kiya jaye, toh hisaab delete ho sakta hai. Isliye har hafte ya mahine **"Backup lein"** zaroor karein!

---

## 🌟 Khas Suvidhayein (Features)

1. **Clean Mobile-First Home Screen:**
   - Single column clean notebook layout (max 480px, centered on desktop).
   - Har hisaab card par:
     - Hisaab ka naam (2 line wrap with ellipsis)
     - Tarikh aur entries ki sankhya (jaise: `19 Nov 2026 · 7 entries`)
     - Monospace font me saaf Kul Total (positive green, negative red with `-`, zero black).
     - 44x44 tap target three-dot button (`...`) jisse inline menu khulta hai: **"Naam badlo"** aur **"Delete"**.
     - Ek samay par sirf ek card ka menu khula rehta hai; bahar tap karne ya Escape dabane par band ho jata hai.
   - Pinned sticky bottom bar: **"Naya hisaab"** button (48px height, easy tap).
   - Bottom me discreet **"Backup lein"** aur **"Backup restore"** actions.
   - **Undo Protection:** Hisaab delete hone par 6 second tak **"Wapas lao"** ka toast milta hai.

2. **Ledger List + Sticky Entry Box:**
   - Notebook copy jaisa clean list view: ek line me amount aur bracket me detail (jaise: `1,200 (Doodh ka hisaab)`).
   - Negative amounts ke liye `±` toggle button (ek tap me plus ya minus).
   - Screen ke bottom me sticky entry box: keyboard khulne par bhi easily accessible.
   - Kisi bhi line par tap karke use edit ya delete kar sakte hain.

3. **Automatic Total & Indian Formats:**
   - Real-time automatic calculation.
   - Indian numbering system (`en-IN`: `1,25,000`).
   - Gujarati (૦-૯) aur Devanagari (०-९) anko ka auto-conversion.

4. **Auto-save & Multi-Tab Sync:**
   - Har ek change turant `localStorage` me auto-save hota hai.
   - Multi-tab synchronization: do tabs me kholne par data sync rehta hai bina cursor disturb kiye.
   - Corrupted data protection: kharab data ko timestamped backup key me preserve karta hai.

5. **📄 PDF Download (Gujarati & Hindi Supported):**
   - Single clean calculation sheet without borders or grids.
   - Saffron header block (#FFF1D0) aur minimal neutral Total box.
   - Gujarati aur Hindi titles PDF ke filename me surakshit rehte hain.

6. **💾 Backup & Restore (Sanitized & Validated):**
   - **Backup lein:** Sara hisaab `.json` file me download karein.
   - **Backup restore:** Kisi bhi naye phone me backup file select karke data restore karein.

---

## 🚀 1. Apne Phone Ya Computer Par Kaise Chalayein (Run Locally)

Is app ko chalane ke liye kisi software ya installation ki zaroorat nahi hai:

### Tarika A (Sabse Aasan):
1. Is folder me jayein: `HisaabKaro`
2. **`index.html`** file par double-click karein.
3. App aapke Google Chrome, Edge, Safari ya Firefox browser me turant khul jayega!

### Tarika B (Local Web Server):
Agar aap local server chalana chahte hain:
```bash
# Python dwara:
python -m http.server 8080

# Ya Node.js dwara:
npx serve .
```
Phir browser me `http://localhost:8080` (ya serve dwara diya gaya URL) kholein.

---

## 📱 2. Phone Ki Home Screen Par App Jaisa Kaise Lagayein (Add to Home Screen)

Aap is app ko apne phone par bilkul ek native app ki tarah chala sakte hain:

### Android (Google Chrome):
1. Chrome browser me apna deployed link (jaise `https://my-hisaab.netlify.app`) kholein.
2. Upar daayein kone me **3 dots (Menu)** par tap karein.
3. **"Install app"** ya **"Add to Home screen"** chunein.
4. **"Add"** tap karein. Ab ye aapki phone screen par app icon ban kar aa jayega!

### iPhone / iPad (Safari):
1. Safari browser me apna link kholein.
2. Niche center me **Share** icon (dabbe ke upar arrow wala icon) par tap karein.
3. Thoda niche scroll karein aur **"Add to Home Screen"** chunein.
4. Upar daayein kone me **"Add"** dabayein.
> *Dhyan dein:* iOS par Safari aur Home Screen app ka storage alag hota hai. Safari se app me aane par pehle 'Backup lein' karein phir app me 'Backup restore' karein.

---

## 🌐 3. Netlify Par Kaise Deploy Karein (Netlify Drag & Drop)

Bina kisi coding ke 1 minute me online live karein:

1. [Netlify](https://www.netlify.com/) par jayein aur apna free account banayein ya login karein.
2. Login karne ke baad dashboard me **"Sites"** par click karein.
3. Niche scroll karein jahan likha hoga: **"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"**.
4. Apne computer se **`HisaabKaro`** folder ko sidhe kheenchkar (drag and drop) us dabbe me chhod dein.
5. Kuch hi second me Netlify aapko ek free live website link (jaise: `https://my-hisaab-karo.netlify.app`) de dega!

---

## 📁 File Structure

```text
HisaabKaro/
├── index.html    # Mobile-first semantic HTML markup (<meta viewport-fit=cover>, <script defer>)
├── style.css     # Clean mobile layout, CSS tokens, bottom sheets, print stylesheet
├── script.js     # Vanilla JS, calculation engine, inline card menu, auto-save, multi-tab sync & backup logic
└── README.md     # Setup, phone installation, deployment & backup guide
```
