# Elmira Yu. Kalimulina — personal website

Personal website presenting research, teaching, publications and industry experience.

- Primary domain: [elmira.su](https://elmira.su)
- GitHub Pages fallback: [elmirayuk.github.io](https://elmirayuk.github.io)
- Language: British English

## Publishing

Every push to `main` triggers the GitHub Actions workflow in
`.github/workflows/pages.yml`. It type-checks the website, creates a static
Next.js export and publishes it to GitHub Pages.

## Local checks

```bash
npm ci
npm run build:pages
```

The original Sites-compatible build remains available through `npm run build`.
