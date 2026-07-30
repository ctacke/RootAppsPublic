# RootAppsPublic

Public site hosting privacy policies and support info for my [Root](https://www.root.io/)
platform apps. Built with GitHub Pages (Jekyll + the Cayman theme).

**Live site:** https://ctacke.github.io/RootAppsPublic/

## Structure

```
_config.yml                     Site + theme config
index.md                        Landing page (lists apps)          -> /
apps/<app>/privacy.md           Per-app privacy policy             -> /<app>/privacy/
```

Each page sets its own clean URL via the `permalink:` front matter, so the
source layout and the public URLs are independent.

## Adding another app

1. Create `apps/<app>/privacy.md` with front matter:

   ```yaml
   ---
   title: <App> Privacy Policy
   permalink: /<app>/privacy/
   ---
   ```

2. Add a link to it from `index.md`.

## Enabling GitHub Pages (one time)

Repo **Settings → Pages → Build and deployment → Deploy from a branch**, then
select **`main`** / **`/ (root)`** and save. The site publishes at the Live URL
above within a minute or two.
