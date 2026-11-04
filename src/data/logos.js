// Stroke-drawable marks for the Specializations stage. Every part is an SVG geometry element so it can
// be traced with the dash technique; text parts fade in instead. Order is the order they are drawn.
// JavaScript and TypeScript's real logos are a square with the letters in the bottom-right corner, so
// those are drawn faithfully. Django's common icon is the "dj" tile. Others are simplified outlines.
// A solid tile with the letters knocked out of it, bottom-right: the shape of the JS and TS logos.
const corner = (label) => [
  { tag: 'rect', attrs: { x: 8, y: 8, width: 32, height: 32, rx: 2, solid: true } },
  { tag: 'text', attrs: { x: 37.5, y: 36.5, fontSize: 15, fontWeight: 700, textAnchor: 'end', dominantBaseline: 'auto', knockout: true }, text: label },
]

export const LOGOS = [
  {
    id: 'python', name: 'Python', viewBox: '0 0 48 48',
    parts: [
      // upper snake
      { tag: 'path', attrs: { d: 'M23.5 7c-7 0-9.5 2.8-9.5 6.8V18h9.5v1.6H11.3c-4.3 0-7.3 3.2-7.3 8.2s3 8.2 7.3 8.2h2.7v-5.4c0-3.2 2.6-5.8 5.8-5.8h8.6c2.7 0 4.9-2.2 4.9-4.9v-5.3C33.3 10 30.5 7 23.5 7z' } },
      { tag: 'circle', attrs: { cx: 19, cy: 12.5, r: 1.6 } },
      // lower snake
      { tag: 'path', attrs: { d: 'M24.5 41c7 0 9.5-2.8 9.5-6.8V30h-9.5v-1.6h12.2c4.3 0 7.3-3.2 7.3-8.2s-3-8.2-7.3-8.2H34v5.4c0 3.2-2.6 5.8-5.8 5.8h-8.6c-2.7 0-4.9 2.2-4.9 4.9v5.3C14.7 38 17.5 41 24.5 41z' } },
      { tag: 'circle', attrs: { cx: 29, cy: 35.5, r: 1.6 } },
    ],
  },
  {
    id: 'django', name: 'Django', viewBox: '0 0 48 48',
    parts: [
      { tag: 'rect', attrs: { x: 8, y: 8, width: 32, height: 32, rx: 4, solid: true } },
      { tag: 'text', attrs: { x: 24, y: 25, fontSize: 16, fontWeight: 700, knockout: true }, text: 'dj' },
    ],
  },
  { id: 'javascript', name: 'JavaScript', viewBox: '0 0 48 48', parts: corner('JS') },
  { id: 'typescript', name: 'TypeScript', viewBox: '0 0 48 48', parts: corner('TS') },
  {
    id: 'react', name: 'React', viewBox: '0 0 48 48',
    parts: [
      { tag: 'ellipse', attrs: { cx: 24, cy: 24, rx: 17, ry: 6.8 } },
      { tag: 'ellipse', attrs: { cx: 24, cy: 24, rx: 17, ry: 6.8, transform: 'rotate(60 24 24)' } },
      { tag: 'ellipse', attrs: { cx: 24, cy: 24, rx: 17, ry: 6.8, transform: 'rotate(120 24 24)' } },
      { tag: 'circle', attrs: { cx: 24, cy: 24, r: 3 } },
    ],
  },
  {
    id: 'node', name: 'Node.js', viewBox: '0 0 48 48',
    parts: [
      { tag: 'path', attrs: { d: 'M24 6 L40 15 V33 L24 42 L8 33 V15 Z' } },
      { tag: 'text', attrs: { x: 24, y: 25, fontSize: 11 }, text: 'node' },
    ],
  },
  {
    id: 'postgres', name: 'PostgreSQL', viewBox: '0 0 48 48',
    parts: [
      { tag: 'ellipse', attrs: { cx: 24, cy: 13, rx: 13, ry: 5 } },
      { tag: 'line', attrs: { x1: 11, y1: 13, x2: 11, y2: 35 } },
      { tag: 'line', attrs: { x1: 37, y1: 13, x2: 37, y2: 35 } },
      { tag: 'path', attrs: { d: 'M11 24 A13 5 0 0 0 37 24' } },
      { tag: 'path', attrs: { d: 'M11 35 A13 5 0 0 0 37 35' } },
    ],
  },
  {
    id: 'tailwind', name: 'Tailwind', viewBox: '0 0 24 24', strokeWidth: 1.1,
    parts: [
      { tag: 'path', attrs: { d: 'M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.09 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.61 7.15 14.5 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.09 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.61 13.15 9.5 12 7 12z' } },
    ],
  },
  {
    id: 'laravel', name: 'Laravel', viewBox: '0 0 48 48',
    parts: [
      // stacked cubes, simplified: a tall block at the back, a lower block in front
      { tag: 'path', attrs: { d: 'M10 10 L19 5 L28 10 V22 L37 27 V37 L28 42 L19 37 V25 L10 20 Z' } },
      { tag: 'path', attrs: { d: 'M10 10 L19 15 L28 10' } },
      { tag: 'path', attrs: { d: 'M19 15 V37' } },
      { tag: 'path', attrs: { d: 'M19 25 L28 30 L37 27' } },
      { tag: 'path', attrs: { d: 'M28 30 V42' } },
      { tag: 'path', attrs: { d: 'M28 22 L37 17 L46 22 V27 L37 32' } },
      { tag: 'path', attrs: { d: 'M37 17 V27' } },
    ],
  },
]
