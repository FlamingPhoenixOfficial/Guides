# Workshop Notes

A static, no-build guide site for Applied Energistics 2, GregTech, and GT New Horizons. The pages use plain HTML, CSS, and JavaScript; there are no packages or build steps.

## Preview locally

Open `index.html` in a browser, or serve this directory with any static web server.

## Publish with GitHub Pages

1. Open the repository's **Settings** on GitHub.
2. Open **Pages** under **Code and automation**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and the `/(root)` folder, then save.

The site is built from `index.html` in the repository root. No custom domain or GitHub Actions workflow is required.

## Update the guides

Edit `index.html` to change guide content and `styles.css` to change presentation. The self-hosted PNG diagrams are in `assets/`; update their matching image and alt text together. The site does not need an image service or a build step. Keep version warnings and upstream documentation links current. Guide checkboxes and the text-size setting are stored in each reader's browser.

Guides are community notes, not official documentation. Recipes, tiers, and progression can change between Minecraft versions and modpacks. Please verify claims against the installed pack and link the relevant source when you submit a correction.