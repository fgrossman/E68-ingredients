# E68 Ingredients

A simple mobile-friendly website for **End 68 Hours of Hunger (Nashua)**. When food
arrives in individual packets with no ingredient labels, a volunteer photographs the
ingredient list from the original box. Anyone can then scan a QR code and look up the
ingredients on their phone.

Everything is built with plain HTML, CSS, and JavaScript — no build step. It uses
two free services: **Supabase** (database + photo storage + admin login) and
**Netlify** (free website hosting connected to GitHub).

---

## What's in here

| File | What it does |
|------|--------------|
| `index.html` | Simple home page linking to everything |
| `worker.html` | **Volunteers**: tap +, photograph the ingredients list, then a packet, save |
| `view.html` | **End users**: browse packets, tap to see ingredients, pinch-zoom, multi-select & print. Language via `?lang=en` or `?lang=es` |
| `admin.html` | **Admin**: log in (email + password) to delete photos |
| `qr.html` | Generates printable English & Spanish QR codes pointing at your live site |
| `supabase/setup.sql` | One script that sets up the database, storage, and security rules |
| `js/config.js` | The only file you edit — paste your 2 Supabase keys here |

---

## Setup — about 15 minutes, no coding

### Step 1 — Put this code in GitHub
This code should live at `https://github.com/fgrossman/E68-ingredients`.
If you cloned that empty repo, copy these files in, then:

```bash
git add .
git commit -m "Initial E68 ingredients app"
git push
```

### Step 2 — Create the free Supabase project (database + photos + login)
1. Go to https://supabase.com and sign up (free, no credit card).
2. Click **New project**. Pick any name and a region near you. Save the database
   password somewhere (you won't need it for this app).
3. Wait ~2 minutes for it to finish setting up.
4. In the left menu open **SQL Editor → New query**. Open the file
   `supabase/setup.sql` from this project, copy all of it, paste it in, and click
   **Run**. You should see "Success". (This creates the table, the photo storage
   bucket, and the security rules.)
5. In the left menu open **Project Settings → API**. Copy two values:
   - **Project URL**
   - **Project API keys → `anon` `public`**
6. Open `js/config.js` in this project and paste those two values in:
   ```js
   SUPABASE_URL: "https://YOURPROJECT.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGc....(long string)....",
   ```
   Commit and push that change (`git add . && git commit -m "Add Supabase keys" && git push`).

> The `anon public` key is safe to put in the website — that's what it's designed for.
> Security is enforced by the rules in `setup.sql` (anyone can add/view; only logged-in
> admins can delete).

### Step 3 — Create your admin login
1. In Supabase, left menu → **Authentication → Users → Add user**.
2. Enter the admin's email and a password, and (recommended) check
   **Auto Confirm User** so they can log in immediately.
3. That email + password is what you'll use on `admin.html`. Add more admins the same way.

### Step 4 — Put the site online with Netlify (free)
1. Go to https://netlify.com and sign up (free). Choose **Sign up with GitHub**.
2. Click **Add new site → Import an existing project → GitHub**, and pick the
   `E68-ingredients` repository.
3. Leave the build settings empty (this is a static site) and click **Deploy**.
4. Netlify gives you a web address like `https://your-name.netlify.app`. That's your
   live site. (You can rename it under **Site settings → Change site name**, or add a
   custom domain later.)

Every time you `git push`, Netlify automatically updates the live site.

### Step 5 — Print the QR codes
Open `https://your-site.netlify.app/qr.html`, then tap **Print these QR codes**.
You'll get an English and a Spanish QR code that point at your live site. Tape them
to the food shelves.

---

## How people use it

- **Volunteer adding food:** open `.../worker.html` → tap **+** → camera opens →
  photograph the **ingredients list on the box** → Retake or Next → photograph **one
  packet** → (optionally type a name) → **Save**. Repeat for the next food.
- **Person looking up ingredients:** scans the English or Spanish QR code → reads the
  short instructions → scrolls the packet photos → taps the one that matches → sees the
  ingredients photo → pinches to zoom. They can also tap **Select**, choose several
  items, and **Print** all their ingredients at once.
- **Admin cleaning up:** open `.../admin.html` → log in → tap **Delete** on anything no
  longer needed.

---

## Notes & tweaks
- **Photos are shrunk** on the phone before upload (max 1600px) to stay well within the
  Supabase free tier (1 GB storage, ~5,000+ photos at this size). Adjust in `js/config.js`.
- **Languages:** English and Spanish live in `js/i18n.js`. Edit the wording there, or
  add another language by copying the `en` block.
- **Colors / wording:** brand colors are at the top of `css/style.css`.
- **Free tiers:** Supabase free projects pause after ~1 week of zero activity; opening
  the site wakes them. For a regularly-used site this won't be an issue.

## Costs
$0. Supabase free tier and Netlify free tier cover this use comfortably.
