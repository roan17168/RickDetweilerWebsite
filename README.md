# RickDetweilerWebsite
# What College Is Really For

A static, multi-page site built with HTML, CSS and vanilla JavaScript. There is no build step or package installation.

## Run locally

From the repository root, start a static server:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/>. Use a local server rather than opening an HTML file directly so relative assets, navigation and browser storage behave as they do when hosted.

## Site files

- Pages are in the repository root.
- Shared styles: `css/styles.css`
- Shared quiz, navigation and form logic: `js/main.js`
- Images and favicon: `assets/images/`
- `current-students.html` redirects to the current `in-college.html` page.
- `understanding-college.htm` redirects to the canonical `understanding-college.html` page.

## Quick checks

Run `node --check js/main.js` after changing the JavaScript. Then check the navigation, all six audience quizzes, mobile menu and scorecard on a narrow screen, and test form save/reset/copy/print from the relevant pages.