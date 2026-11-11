# Brian Buenviaje — portfolio

Single-page portfolio. React 19, Vite 7, Tailwind CSS 4. No other runtime dependencies.

The page is one pipeline: a beige hero whose name is stamped in and drips, then deep-green stages on a
rail that fills as you scroll (Hello, Specializations, Selected work, Experience, Commit log).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Where things live

| What | Where |
| --- | --- |
| All words: name, tagline, links, projects, experience | `src/data/content.js` |
| Specializations logos (stroke-drawable marks, drawn in order) | `src/data/logos.js` |
| Colours, fonts, motion rules | `src/index.css` (the `@theme` block at the top) |
| Sections | `src/components/*.jsx`, composed in `src/App.jsx` |
| Project screenshots, certificates, résumé, link-preview image | `public/` |

To change a project, an experience entry or a link, edit `content.js` only. Diagram data for the
projects is still there but unused since the card dropped the diagram.

## Behaviour worth knowing

- The hero holds a full screen and peels up to reveal Hello underneath (Hello is sticky under it).
- Specializations is pinned for `9 × 20svh` of scroll; logos draw one at a time through a queue, so
  they never appear in bursts however fast the page is scrolled.
- Scroll snapping is `proximity`, not `mandatory`, so the pinned section can rest at any point.
- Every motion respects `prefers-reduced-motion`: no stamp, no drips growing, everything visible.
- The commit-log form sends its message to Brian's inbox through EmailJS, called straight from the
  browser (the approach the first portfolio's contact form was written for). It needs three settings at
  build time: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`. The
  template receives `from_name`, `from_email`, `reply_to`, `subject` and `message`. Without the
  settings the form opens the visitor's own mail app with the message written out, so nothing is ever
  silently dropped. The log under the form is the visitor's own record of what they sent, kept in
  their browser (`localStorage`). A hidden field catches bots.

## Deploy

Static site. On Vercel: import the repo, framework "Vite", build `npm run build`, output `dist`.
For the message form to send, add the three `VITE_EMAILJS_*` variables (see `.env.example`) under the
project's Environment Variables and redeploy; for local work put them in `.env.local`. After the first deploy, set the two `og:image` / `twitter:image` tags in
`index.html` to the absolute URL (`https://<domain>/og.jpg`); most link scrapers ignore relative paths.

## Still to confirm

- Internship dates: the site uses the ones from the previous portfolio (HydraMed Feb–May 2026,
  WebDiner Nov 2025–Jan 2026); the résumé PDFs differ.
- Featured projects: currently Jebran Miki, Malagos Garden, Keystroke Auth.
- Hero additions (on hold).
