# Updating your portfolio

Everything on the site reads from three files in `content/`:

- `graphics.json`: Graphics page and the homepage hero background
- `videos.json`: Videos page
- `logos.json`: the "Trusted by" strip

## The easy way (after launch): yoursite.com/admin
1. Log in with GitHub.
2. Pick **Portfolio → Graphics / Videos / Client logos**.
3. Click **Add**, upload the image (or paste the Vimeo/YouTube link), choose a category, and **Publish**.
4. The site updates by itself in about a minute.

Options for each item:
- **Graphics:** untick "Show in homepage hero" to keep a piece off the hero background.
- **Logos:** untick "Show on site" to hide a logo without deleting it. Upload transparent PNG or SVG files only.
- **Videos:** paste the Vimeo/YouTube link. Add a thumbnail image so the card isn't blank.

## One-time setup (we do this together)
1. Put the site on GitHub and connect it to Netlify.
2. In `admin/config.yml`, replace `YOUR-GITHUB-USERNAME/the-design-lab` with the real repo.
3. In Netlify: **Site settings → Access & security → OAuth → Install provider → GitHub**.
4. Replace the Wix image links in `graphics.json` with your own files in `media/`. Do this before Wix is cancelled.
