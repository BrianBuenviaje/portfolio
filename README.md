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
  browser (the approach the first portfolio's contact form was written for). Its three identifiers
  (service, template, public key) are public by design and live in `SITE.mail` in
  `src/data/content.js`; a build can swap them with `VITE_EMAILJS_SERVICE_ID`,
  `VITE_EMAILJS_TEMPLATE_ID` and `VITE_EMAILJS_PUBLIC_KEY`. The form sends `from_name`, `from_email`,
  `name`, `email`, `reply_to`, `subject` and `message`; the account's "Contact Us" template builds
  its body from `from_email`, `subject` and `message`, takes Reply-To from `email`, and delivers to
  the address set as its "To Email". With no identifiers at all the form opens the visitor's own mail
  app with the message written out, so nothing is ever silently dropped. The log under the form is
  the visitor's own record of what they sent, kept in their browser (`localStorage`). A hidden field
  catches bots.
- If a send fails with `412 Gmail_API: Invalid grant`, the EmailJS account's connection to Gmail has
  expired: reconnect it under Email Services in the EmailJS dashboard (Disconnect, Connect Account,
  Update Service). `412 Gmail_API: Request had insufficient authentication scopes` means the
  reconnect went through without Google's "Send email on your behalf" permission: reconnect again
  and allow it. Until then the form tells the visitor it did not go through, keeps their text and
  shows the address to write to.

## Deploy

Static site. On Vercel: import the repo, framework "Vite", build `npm run build`, output `dist`.
The message form sends with the identifiers in `src/data/content.js`; to point a deployment at a
different EmailJS account, set the three `VITE_EMAILJS_*` variables (see `.env.example`) under the
project's Environment Variables, or in `.env.local` for local work. After the first deploy, set the two `og:image` / `twitter:image` tags in
`index.html` to the absolute URL (`https://<domain>/og.jpg`); most link scrapers ignore relative paths.

## Still to confirm

- Internship dates: the site uses the ones from the previous portfolio (HydraMed Feb–May 2026,
  WebDiner Nov 2025–Jan 2026); the résumé PDFs differ.
- Featured projects: currently Jebran Miki, Malagos Garden, Keystroke Auth.
- Hero additions (on hold).
