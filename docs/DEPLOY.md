# How to push your site to GitHub and auto-deploy to Vercel

## Prerequisites

- [Git](https://git-scm.com/downloads) — download and install if you don't have it
- A [GitHub](https://github.com) account (free)
- Your site is already live on Vercel at ivorystudios.io ✓

---

## First-time setup: push to GitHub

Open **Terminal** (Mac) or **Git Bash** (Windows — right-click your IVORY-STUDIOS folder → "Git Bash Here"):

```bash
# Navigate into the project folder (if not already there)
cd path/to/IVORY-STUDIOS

# Initialise Git
git init

# Stage everything
git add .

# First commit
git commit -m "Initial commit"
```

Now create the GitHub repo:

1. Go to [github.com/new](https://github.com/new)
2. Name it `ivory-studios-website`
3. Set it to **Private**
4. Leave "Initialize with README" **unchecked** (you already have one)
5. Click **Create repository**

GitHub will show you a block of commands under **"…or push an existing repository from the command line"** — copy and run those in your terminal. They look like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ivory-studios-website.git
git branch -M main
git push -u origin main
```

Your code is now on GitHub. ✓

---

## Connect GitHub to Vercel (auto-deploy on every push)

Your site is already deployed on Vercel. To link it to GitHub so pushes auto-deploy:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your **ivory-studios** project
3. Go to **Settings → Git**
4. Click **Connect Git Repository** → select GitHub → find `ivory-studios-website`
5. Click **Connect**

From now on, every push to `main` triggers an automatic deployment within ~30 seconds.

---

## Day-to-day workflow

After the first-time setup, updating your site is three commands:

```bash
git add .
git commit -m "describe what you changed"
git push
```

That's it — Vercel picks it up and deploys automatically.

---

## Adding a new portfolio project

1. Open `js/projects-data.js`
2. Copy an existing project block and paste it at the top of the `projects` object
3. Fill in your details (title, tagline, cover image, metrics, etc.)
4. Save, then run the three commands above

---

## Environment variables

This is a static site with no build step, so there are no environment variables to configure in Vercel. The Supabase anon key lives directly in `js/supabase.js`.

If you ever swap to a new Supabase project, just update the two constants at the top of that file and push.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `git: command not found` | Install Git from https://git-scm.com |
| Push asks for password | Use a [Personal Access Token](https://github.com/settings/tokens) instead of your password |
| Vercel deploy fails | Check the Vercel dashboard → Deployments → click the failed deploy → read the logs |
| Changes not showing after push | Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R) |
