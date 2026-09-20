# Bobby's Brigade Website — Setup Notes

This build includes full technical SEO out of the box: `sitemap.xml`, `robots.txt`,
per-page canonical links, Open Graph + Twitter card tags, a generated social share
image (`assets/img/og-image.png`), NGO + WebPage JSON-LD schema, a favicon, and
a `vercel.json` with `cleanUrls: true` so pages serve at `/about`, `/donate`, etc.
instead of `/about.html`. A custom `404.html` is included too.

If the final domain ends up different from `www.bobbysbrigade.com`, search
`generate.py` for `SITE_URL` and update it, then re-run `python3 generate.py`
to regenerate canonical/OG URLs and the sitemap.

A few real photos on the site (About, PTH, Press, Blog pages) are currently
**hotlinked directly from the old WordPress site** (`bobbysbrigade.com/wp-content/uploads/...`).
This works fine while that site stays up, but once it's decommissioned those
images will break. Before that happens, download those images and re-host
them in `assets/img/` instead, then update the `src=` in `generate.py` to point
locally. (The photos you sent me directly are already saved locally in
`assets/img/` and don't have this issue.)

---

# Volunteer Portal + Photo Gallery — One Google Sheet, One Script

Both the **Volunteer events/signups** and the new **Photo Gallery** are powered
by the same Google Apps Script (free, built into any Google Sheet — no API key,
no separate service). One Sheet, three tabs:

- **Events** — charity adds rows here → shows up on the Volunteer page
- **(auto-created per event)** — signups land here automatically
- **Photos** — charity adds rows here → shows up on the Gallery page

---

## Events tab (already set up)

Columns: `Event Name | Date | Time | Location | Description | Image URL`

## Photos tab (new — add this to the same spreadsheet)

1. In the same Google Sheet used for Events, add a new tab (bottom-left "+") named exactly: **Photos**
2. In row 1, add these exact headers:
   ```
   Image URL | Caption | Year
   ```
3. Add one row per photo, e.g.:
   ```
   https://yourimagehost.com/cinco-de-mayo-2024.jpg | Packing day at the community center | 2024
   ```
   - **Caption** and **Year** are both optional, but Year powers the "filter by year" buttons on the Gallery page — worth filling in.

### How to get an "Image URL" for a photo

The charity needs each photo hosted somewhere public with a **direct** image
link (not a page that just shows the photo — the actual file URL).

**Easiest option — Google Drive:**
1. Upload the photo to Google Drive.
2. Right-click it → **Share → General access → Anyone with the link**.
3. Copy the share link — it looks like:
   `https://drive.google.com/file/d/FILE_ID_HERE/view?usp=sharing`
4. Turn it into a direct image link by reformatting it to:
   `https://drive.google.com/uc?export=view&id=FILE_ID_HERE`
   (just swap in the same `FILE_ID_HERE` from the share link)
5. Paste that reformatted link into the **Image URL** column.

Other options that work the same way: Imgur, a public Dropbox link (with
`?raw=1` at the end), or any image hosting service that gives a direct file URL.

Once a row is added with a valid Image URL, it shows up on the live Gallery
page automatically within a minute or two — same as Events.

---

## The Apps Script itself

This is already deployed and connected (both `volunteer.js` and `gallery.js`
point to the same Web App URL). If it ever needs to be redeployed — for
example, after editing `AppsScript-Code.gs` — the steps are:

1. In the Sheet: **Extensions → Apps Script**
2. Paste in the full contents of `AppsScript-Code.gs`, save.
3. **Deploy → Manage deployments** → click the pencil/edit icon on the existing deployment → under "Version" choose **New version** → **Deploy**.
   (This keeps the same URL — no need to update the site's JS files again.)

---

## Ongoing use (for the charity)

- **New event:** add a row to the Events tab.
- **New photos:** add a row (or several) to the Photos tab.
- **See who signed up for an event:** open the tab at the bottom of the spreadsheet matching that event's name.
- Signup details (name, email, phone) are never public — only what's in the Events and Photos tabs shows on the site.

---

# Updating the Live Site on Vercel

There are two ways to push changes after the site is live — pick whichever fits:

### Option A — Manual redeploy (simplest, no extra setup)
Whenever a file changes (new page, edited copy, new image in `assets/img/`):
1. Go to **vercel.com** → open the existing project.
2. Look for the **"Redeploy"** option in the project's overview or Deployments tab, or drag the whole updated project folder onto the same upload area used the first time.
3. Vercel builds a new deployment from the updated files; once it finishes, it automatically becomes the live version at your domain — no DNS or domain changes needed.

This works fine, but means re-uploading the whole folder each time something changes.

### Option B — Connect to GitHub (recommended if updates will be frequent)
This is the smoother long-term setup, especially now that the site will keep
growing (new events, new photos, blog posts):
1. Create a free GitHub account (if the charity/you don't have one) and a new repository.
2. Upload this whole folder to that repository (GitHub's web uploader works fine — drag and drop the files in the browser, no command line needed).
3. In Vercel: **Add New → Project → Import Git Repository** → select that repo.
4. Vercel auto-detects it's a static site (no build settings needed) and deploys it.
5. From then on: any time the repository's files are updated (edit directly on github.com, or re-upload changed files), Vercel **automatically redeploys** within a minute or two — no manual redeploy step needed.

For a charity site that will keep adding blog posts/photos/events over time,
**Option B is worth the 10 minutes of one-time setup** — after that, updates
are just "save the file on GitHub" and the live site updates itself.
