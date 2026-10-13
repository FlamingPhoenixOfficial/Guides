# Guide site for all

A static, no-build library of plain-language game guides. The site uses HTML, CSS, and JavaScript; there are no packages or build steps.

## Preview locally

Open `index.html` in a browser, or serve this directory with any static web server.

## Publish with GitHub Pages

1. Open the repository's **Settings** on GitHub.
2. Open **Pages** under **Code and automation**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and the `/(root)` folder, then save.

The site is built from `index.html` in the repository root. No custom domain or GitHub Actions workflow is required.

## Update the library and guides

Edit `index.html` to add game categories, library cards, or guide content. Each library item uses a `data-category` value that matches an option in the category selector. Update `app.js` when adding a guide so its route, reading progress, and chapter navigation work. Edit `style.css` to change presentation.

Keep version notes and upstream documentation links current. World of Warcraft addon APIs and interface numbers change with game updates. Guide checkboxes and reading settings are stored in each reader's browser.

Guides are community notes, not official documentation. Game systems, recipes, and addon APIs can change. Please verify claims against the current game and link the relevant source when you submit a correction.