# E68 Ingredients

A simple mobile-friendly website for **End 68 Hours of Hunger (Nashua)**. When food
arrives in individual packets with no ingredient labels, a volunteer photographs the
ingredient list from the original box. Anyone can then scan a QR code and look up the
ingredients on their phone.

Everything is built with plain HTML, CSS, and JavaScript — no build step. It uses
two free services: **Supabase** (database + photo storage + logins) and
**GitHub Pages** (free website hosting connected to GitHub).

---

## Who does what

The **home page is public** — anyone can view ingredients with no login. Staff sign in
(top-right **Sign in** link) and get one of two roles:

| Role | Can do |
|------|--------|
| **Photo Taker** | Take photos, view/print QR codes |
| **Admin** | Everything a Photo Taker can, **plus** delete products and add/manage users |

---

## Pages

| File | Who | What it does |
|------|-----|--------------|
| `index.html` | Everyone (public) | Home page: browse packets, tap to see ingredients, pinch-zoom, multi-select & print. Language via `?lang=en` / `?lang=es` |
| `signin.html` | Staff | Email + password sign in |
| `menu.html` | Staff | Menu of actions based on your role |
| `worker.html` | Staff | Take photos: ingredients list, then a packet, save |
| `qr.html` | Staff | View & print the English + Spanish QR codes |
| `admin.html` | Admin | Delete foods no longer needed |
| `users.html` | Admin | Add users, set roles, remove access |
| `supabase/setup.sql` | — | One script that sets up the database, storage, and security rules |
| `js/config.js` | — | The only file you edit — paste your 2 Supabase keys here |

---

## Setup — about 15 minutes, no coding

### Step 1 — Put this code in GitHub
This code lives at `https://github.com/fgrossman/E68-ingredients`. From the project
folder:

```bash
git add .
git commit -m "Update E68 ingredients app"
git push
```

### Step 2 — Create the free Supabase project
1. Go to https://supabase.com and sign up (free, no credit card).
2. Click **New project**, pick a name and a nearby region, and wait ~2 minutes.
3. Left menu → **SQL Editor → New query**. Open `supabase/setup.sql`, copy all of it,
   paste it in, and click **Run**. You should see "Success".
4. Left menu → **Project Settings → API**. Copy two values:
   - **Project URL**
   - **Project API keys → `anon` `public`**
5. Open `js/config.js` and paste them in:
   ```js
   SUPABASE_URL: "https://YOURPROJECT.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGc....(long string)....",
   ```
   Commit and push (`git add . && git commit -m "Add Supabase keys" && git push`).

> The `anon public` key is meant to live in the website. Security is enforced by the
> rules in `setup.sql` (public can view; only signed-in staff can add; only admins can
> delete or manage users).

### Step 3 — Turn OFF email confirmation (needed for adding users)
So admins can create users right from the app without an email round-trip:
1. Left menu → **Authentication → Providers → Email**.
2. Turn **Confirm email** OFF and save.

### Step 4 — Create your first admin
1. Left menu → **Authentication → Users → Add user**. Enter an email + password and
   check **Auto Confirm User**.
2. Left menu → **SQL Editor**, and run this with that same email (it's also at the
   bottom of `setup.sql`):
   ```sql
   insert into public.profiles (id, email, role)
   select id, email, 'admin' from auth.users where email = 'you@example.com'
   on conflict (id) do update set role = 'admin';
   ```
That account can now sign in and add everyone else from the **Manage users** page.

### Step 5 — Put the site online with GitHub Pages (free)
The site is plain static files, so GitHub Pages hosts it directly.

1. The repo must be **public** for free GitHub Pages. (Safe here — `js/config.js`
   only holds the Supabase URL and the `anon public` key, which are meant to be public;
   all real security is in the database rules.) Set it under
   **Settings → General → Danger Zone → Change visibility** if needed.
2. In the repo: **Settings → Pages → Build and deployment → Source**, choose
   **GitHub Actions**.
3. That's it — the workflow in `.github/workflows/deploy.yml` publishes the site on
   every `git push`. Watch it in the **Actions** tab.
4. Your site will be at `https://fgrossman.github.io/E68-ingredients/`.

All links and the QR codes are relative, so the `/E68-ingredients/` sub-path works
automatically. The `.nojekyll` file tells GitHub to serve the files as-is (no Jekyll).

> Chrome flagging the site as deceptive? The most reliable fix is a custom domain
> (about $12/year) pointed at GitHub Pages. You can also report a false positive at
> https://safebrowsing.google.com/safebrowsing/report_error/.

### Step 6 — Print the QR codes
Sign in → **Menu → QR codes**, then **Print**. You get an English and a Spanish QR
code pointing at your live site. Tape them to the food shelves.

---

## How people use it

- **Someone looking up ingredients:** scans the English or Spanish QR code (or just
  opens the site) → scrolls the packet photos → taps the one that matches → sees the
  ingredients photo → pinches to zoom. They can also tap **Select**, choose several
  items, and **Print** all their ingredients at once (one image per page).
- **Photo Taker / Admin adding food:** Sign in → **Take photos** → tap **+** → camera
  opens → photograph the **ingredients list on the box** → Retake or Next → photograph
  **one packet** → (optionally type a name) → **Save**. Repeat for the next food.
- **Admin managing users:** Sign in → **Manage users** → add an email, a temporary
  password, and pick **Admin** or **Photo Taker**. Change a role from the dropdown, or
  **Remove** to revoke access.
- **Admin cleaning up products:** Sign in → **Manage products** → **Delete** anything
  no longer needed.

---

## Notes & tweaks
- **Photos are shrunk** on the phone before upload (max 1600px) to stay within the
  Supabase free tier. Adjust in `js/config.js`.
- **Free tier limits:** 1 GB photo storage (~1,000–2,000 foods) and 5 GB/month of
  download bandwidth. Fine for a single pantry.
- **Languages:** English & Spanish live in `js/i18n.js`.
- **Colors / wording:** brand colors are at the top of `css/style.css`.
- **Removing a user** deletes their access profile so they can no longer do anything.
  If you also want to delete the underlying login record entirely, do it in Supabase →
  Authentication → Users.

## Costs
$0. Supabase free tier and GitHub Pages cover this use comfortably.
