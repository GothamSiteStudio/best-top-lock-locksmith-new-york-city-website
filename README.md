# Best Top Lock Locksmith NYC Website

Static marketing website for Best Top Lock Locksmith New York City, focused on emergency locksmith services, top lock installation, lock changes, and coverage across all 5 NYC boroughs.

## Overview

- Single-page static website built with HTML, CSS, and JavaScript
- SEO-ready metadata and local business schema markup
- Mobile-friendly marketing layout with clear call-to-action sections
- Contact-focused experience for locksmith leads and emergency calls

## Business Details

- Brand: Best Top Lock Locksmith New York City
- Phone: (914) 717-0708
- Email: Levy@bestlocknyc.com
- Website URL: https://bestlocknyc.com
- Service area: Manhattan, Brooklyn, Queens, Bronx, and Staten Island

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts
- Font Awesome
- Sharp for manual image optimization

## Project Structure

```text
.
|-- scripts/
|   `-- optimize-images.mjs
|-- index.html
|-- css/
|   `-- style.css
|-- js/
|   `-- main.js
|-- package.json
|-- images/
|   |-- source/
|   |   `-- logo.png
|   |-- logo.png
|   `-- logo.webp
`-- 08-WEBSITE-COMPLETION-CHECKLIST.md
```

## Local Development

You can preview the site by opening `index.html` directly in a browser, or by running a local static server.

### Python

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Image Workflow

Install dependencies once:

```bash
npm install
```

Put editable source assets inside `images/source/`, then optimize them into production assets:

```bash
npm run optimize-images
```

What the script does:

- Resizes oversized raster assets down to a maximum width of 800px
- Writes optimized production files into `images/` without mutating the source files
- Creates a WebP copy next to each optimized raster file for site usage
- Prints a size report so you can verify savings before deployment

This keeps image compression in the repo workflow instead of relying on a CMS plugin.

## Deployment

This project can be deployed to any static hosting provider, including:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## Notes

- Main SEO metadata and structured data live in `index.html`
- Styling is centralized in `css/style.css`
- Interactive behavior is handled in `js/main.js`
