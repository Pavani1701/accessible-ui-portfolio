# Accessible UI Portfolio

[![CI](https://github.com/YOUR-GITHUB-USERNAME/accessible-ui-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-GITHUB-USERNAME/accessible-ui-portfolio/actions/workflows/ci.yml)

**Live demo:** https://YOUR-GITHUB-USERNAME.github.io/accessible-ui-portfolio/

This front-end and UI portfolio sample has a small **design system** and a **citizen-facing multi-step application form** for a fictional state agency ("Prairie State Services"). It's built to **WCAG 2.1 AA** and **Section 508**, using semantic HTML5, **Sass** and dependency-free **JavaScript (ES modules)**. Automated **axe-core** accessibility and keyboard tests run in CI on every push.

| Page | What it shows |
| --- | --- |
| [Overview](site/index.html) | Responsive layout, skip link, landmarks, card grid, accordion |
| [Components](site/components.html) | Buttons, live status messages, alerts, tabs, accordion, modal dialog, sortable and filterable data table |
| [Application form](site/apply.html) | Multi-step form with validation, an error summary, an accessible date input, focus management, and a review-and-change step |

---

## Highlights

### UI / UX
- **Design tokens in Sass maps** (`src/scss/_tokens.scss`) generate CSS custom properties, so light and dark themes switch at runtime without recompiling.
- **Mobile-first, responsive layout** uses CSS Grid and Flexbox and reflows down to 320px with no horizontal scrolling.
- **Form UX patterns** from public-sector design systems (USWDS / GOV.UK): one topic per step, specific error messages, inputs sized to the expected answer, hints tied to fields, and a check-your-answers page.
- **Variant generation** with Sass `@each` loops (alerts), plus reusable mixins (`mq()`, `focus-ring`, `visually-hidden`, `touch-target`).

### Accessibility
- Color pairs meet **4.5:1 contrast** for text and **3:1** for UI boundaries in both themes. Ratios are documented next to each token.
- A **two-tone focus indicator** stays visible on any background and in Windows High Contrast (`forced-colors`).
- Keyboard models follow the **WAI-ARIA Authoring Practices**:
  - Tabs: roving `tabindex`, arrow keys, Home and End
  - Accordion: `aria-expanded`, arrow keys between headers
  - Modal: native `<dialog>` with a focus trap, Escape to close, and focus returned to the trigger
  - Sortable table: `aria-sort` only on the active column, with results announced through a live region
- **Form error handling:**
  - The focusable error summary links to each field.
  - `aria-invalid` is set on invalid fields, and their error messages are added to `aria-describedby`.
  - The page `<title>` is prefixed with "Error:" while there are errors.
  - On each step change, focus moves to the new step heading.
- `prefers-reduced-motion` and `prefers-color-scheme` are respected.
- Native HTML comes first; ARIA is used only where HTML has no equivalent.

See **[ACCESSIBILITY.md](ACCESSIBILITY.md)** for the WCAG success criteria mapping and the manual test plan (JAWS, NVDA, keyboard only, zoom).

### Quality and CI
- **Playwright + @axe-core/playwright** run 44 tests across desktop and 320px viewports:
  - axe scans (WCAG 2.0/2.1 A and AA rules) of every page in light and dark themes, plus the error, modal and review states
  - keyboard and focus-management tests for every interactive component
- **GitHub Actions** compiles the Sass, runs the tests, and deploys to GitHub Pages only when everything passes.

---

## Project structure

```
├── src/scss/               Sass source (tokens, mixins, base, layout, components/)
├── site/                   Deployable static site (GitHub Pages root)
│   ├── css/main.css        Compiled output
│   ├── js/components/      Reusable, framework-free component modules
│   ├── js/main.js          Component initialization
│   ├── js/apply.js         Multi-step form logic
│   └── *.html
├── tests/                  Playwright accessibility + keyboard tests
└── .github/workflows/      CI and Pages deployment
```

## Run locally

```bash
npm install
npm run build:css      # compile Sass (or: npm run watch:css)
npm start              # http://localhost:4173
```

The site uses ES modules, so serve it over HTTP as shown above. Opening the HTML files directly with `file://` won't run the scripts.

## Run the tests

```bash
npx playwright install chromium   # first time only
npm test
```

## Deploy

1. Push to `main` on GitHub.
2. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. The CI workflow runs the tests and then publishes the `site/` folder.

---

## Tech stack
HTML5 · Sass (SCSS, `@use` modules) · CSS Grid and Flexbox · JavaScript (ES2020 modules) · WAI-ARIA · Playwright · axe-core · GitHub Actions · GitHub Pages

## Author
**Pavani Madhyannapu**, Senior Full Stack .NET Developer (front-end, UI/UX and accessibility)
[LinkedIn](https://www.linkedin.com/in/YOUR-LINKEDIN)

## License
MIT
