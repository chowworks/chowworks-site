# chow.works

Static site for Chow.Works. Plain HTML, CSS, and JS with no build step, served by GitHub Pages.

| Path | Page |
| --- | --- |
| `/` | Home |
| `/build/` | Start a project (intake form). chrishoward.fyi links here. |
| `/work/` | Product showcase |
| `/about/` | The collective and Chris |
| `/404.html` | Not found |

## Before launch

1. **Pages:** Settings → Pages → deploy from `main`, root. `CNAME` is already set to `chow.works`.
2. **DNS (Spaceship):** point `chow.works` at GitHub Pages (A records `185.199.108.153`, `.109`, `.110`, `.111`, and `www` CNAME to `chowworks.github.io`).
3. **Intake form:** it posts to FormSubmit at `chris@chow.works`. The first submission sends an activation email to that inbox. Click it once, and later submissions come through.

## Brand

- Logo: `chow/works` wordmark in Manrope 800, with the slash in works blue.
- Colors: works blue `#1d5cff`, navy `#0b1f2e`, paper `#f6f7f4`, sky `#5cc8ff`. These share the navy and paper of learn/differently and audit/differently.
- Favicon: `favicon.svg` (source), `favicon.ico`, `apple-touch-icon.png`. Social card: `og-image.png`.
