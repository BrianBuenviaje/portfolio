// All copy in one place. Words come from the previous portfolio (portfolio_2), tightened.
// Dates follow portfolio_2/src/data/experience.js; the two PDFs disagree, so confirm before launch.

export const SITE = {
  first: 'Brian',
  last: 'Buenviaje',
  role: 'Software engineer · Backend · Davao, PH',
  tagline: 'I turn complex logic into clean, intuitive, high-performing digital experiences.',
  pitch: 'Ready to make your vision come to life with high-performance web engineering, sleek architectures and interactive design.',
  status: 'BS Computer Science at Ateneo de Davao, class of 2027. Open to developer roles and internships.',
  github: 'https://github.com/BrianBuenviaje',            // personal account; project repos still live on the academic one
  source: 'https://github.com/BrianBuenviaje/portfolio',
  linkedin: 'https://www.linkedin.com/in/brianbuenviaje/',  // from Resume.pdf
  email: 'bvadbuenviaje@addu.edu.ph',                         // from Resume.pdf (old site used a Gmail address)
  resume: '/Resume.pdf',
  built: 'React + Vite + Tailwind',
}

// Stages on the rail. id doubles as the anchor and the nav key.
export const STAGES = [
  { id: 'boot', num: '00', name: 'boot', title: 'Hello' },
  { id: 'spec', num: '01', name: 'load', title: 'Specializations', nav: 'Skills' },
  { id: 'build', num: '02', name: 'build', title: 'Selected work', nav: 'Work' },
  { id: 'ship', num: '03', name: 'ship', title: 'Experience', nav: 'Experience' },
  { id: 'contact', num: '04', name: 'contact', title: 'Commit log', nav: 'Contact' },
]

// Diagrams are laid out in a 520×150 box. Edges run from a node's right edge to the next node's left edge.
export const PROJECTS = [
  {
    id: 'jebran-miki',
    title: 'Jebran Miki',
    year: '2025',
    meta: 'Team of 5 · Django · DRF · React · Postgres · PayMongo',
    headline: 'Ordering and operations for a food business',
    summary:
      'Customers order and track. Admins run inventory, ingredient batches with expiry, production, resupply and sales reports. I owned the Django backend: JWT roles, PayMongo checkout and its payment webhooks.',
    backendHeadline: 'Django REST API, JWT roles and payment webhooks',
    backend:
      'A React app talks to a Django REST Framework API. JWT tokens carry one of three roles: customer, admin, supplier. PayMongo handles checkout and calls back a webhook that marks orders paid or refunded. Postgres holds products, orders, ingredient batches with expiry dates and restock levels.',
    tech: ['React', 'Django', 'DRF', 'PostgreSQL', 'PayMongo', 'Tailwind'],
    facts: [
      ['23', '', 'frontend pages'],
      ['5.3', 'k', 'lines of backend Python'],
      ['2', '', 'payment webhook events'],
    ],
    links: { repo: 'https://github.com/BVADBuenviaje/Jebran-Website-Final' },
    image: { src: '/projects/jebran-miki-1200.webp', srcSet: '/projects/jebran-miki-640.webp 640w, /projects/jebran-miki-1200.webp 1200w', alt: 'Jebran Miki storefront and admin dashboard' },
    diagram: {
      nodes: [
        { id: 'cust', label: 'customer', x: 18, y: 22 },
        { id: 'admin', label: 'admin', x: 18, y: 92 },
        { id: 'spa', label: 'react spa', x: 150, y: 57 },
        { id: 'api', label: 'django api', x: 290, y: 57 },
        { id: 'db', label: 'postgres', x: 420, y: 57 },
        { id: 'pay', label: 'paymongo', x: 290, y: 112 },
      ],
      edges: [['cust', 'spa'], ['admin', 'spa'], ['spa', 'api'], ['api', 'db'], ['pay', 'api']],
    },
  },
  {
    id: 'malagos-garden',
    title: 'Malagos Garden',
    year: '2025',
    meta: 'Solo · Live client site · HTML · CSS · JavaScript',
    headline: 'The resort’s website, rebuilt from the ground up',
    summary:
      'A frontend reimagining of the official Malagos Garden Resort site in Davao City. Hand-built with HTML, CSS and vanilla JavaScript into a responsive, feature-rich experience that works on every device.',
    backendHeadline: 'No server at all: static files on the edge',
    backend:
      'Deliberately serverless. Every page is static HTML, CSS and JavaScript served from Vercel’s edge network, so there is nothing to patch, scale or pay for. Booking and enquiries hand off to the resort’s existing channels by link.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    facts: [
      ['1', '', 'live client'],
      ['0', '', 'frameworks'],
      ['100', '%', 'hand-written'],
    ],
    links: { live: 'https://malagos-garden-project.vercel.app/', repo: 'https://github.com/BVADBuenviaje/MalagosGardenProject' },
    image: { src: '/projects/malagos-garden-1200.webp', srcSet: '/projects/malagos-garden-640.webp 640w, /projects/malagos-garden-1200.webp 1200w', alt: 'Malagos Garden Resort website' },
    diagram: {
      nodes: [
        { id: 'visitor', label: 'visitor', x: 18, y: 57 },
        { id: 'edge', label: 'vercel edge', x: 150, y: 57 },
        { id: 'site', label: 'static site', x: 290, y: 57 },
        { id: 'pages', label: 'resort pages', x: 420, y: 22 },
        { id: 'book', label: 'booking links', x: 420, y: 92 },
      ],
      edges: [['visitor', 'edge'], ['edge', 'site'], ['site', 'pages'], ['site', 'book']],
    },
  },
  {
    id: 'soil-states',
    title: 'Soil States',
    year: '2026',
    meta: 'Solo · Thesis · Python · scikit-learn · IoT sensors',
    headline: 'Soil condition states from cheap sensors, no lab labels',
    summary:
      'Undergraduate thesis. Five low-cost IoT nodes logged moisture, pH and temperature for a month. The pipeline finds four recurring soil states without laboratory labels, checks them by leaving one node out, trains a Random Forest to assign new readings, and ships a phone app that turns each state into advice from a rule base.',
    backendHeadline: 'Unsupervised states, a Random Forest and a rule engine',
    backend:
      'Readings are cleaned and turned into per-node features. Clustering on the training month finds the states; a leave-one-node-out check confirms they are not just the sensor locations. A tuned Random Forest assigns states to the test week at 93% accuracy. A threshold-based expert system maps states to eight irrigation and nutrient rules the monitor app shows.',
    tech: ['Python', 'scikit-learn', 'pandas', 'Random Forest', 'Expert system', 'PWA'],
    facts: [
      ['3029', '', 'sensor readings, 5 nodes'],
      ['4', '', 'soil states found'],
      ['93.1', '%', 'test-week accuracy'],
    ],
    links: { repo: 'https://github.com/BVADBuenviaje/soil_condition_states' },
    image: { src: '/projects/soil-states-1200.webp', srcSet: '/projects/soil-states-640.webp 640w, /projects/soil-states-1200.webp 1200w', alt: 'Soil Condition Monitor app: nodes, advice and past-week views' },
    diagram: {
      nodes: [
        { id: 'nodes', label: '5 iot nodes', x: 18, y: 57 },
        { id: 'feat', label: 'features', x: 150, y: 57 },
        { id: 'cluster', label: 'clustering', x: 290, y: 22 },
        { id: 'rf', label: 'random forest', x: 290, y: 92 },
        { id: 'app', label: 'rules + app', x: 420, y: 57 },
      ],
      edges: [['nodes', 'feat'], ['feat', 'cluster'], ['feat', 'rf'], ['cluster', 'app'], ['rf', 'app']],
    },
  },
  {
    id: 'medpal',
    title: 'MedPal',
    year: '2026',
    meta: 'Team of 5 · Next.js · Supabase · AWS Textract · Comprehend Medical · Bedrock',
    headline: 'Reads a prescription from a photo and explains it in Bisaya',
    summary:
      'A mobile-first PWA for patients. Photograph a prescription or lab result; the app reads it, pulls out the medicines, checks interactions and explains them in Bisaya, Filipino or English, with reminders and a chat for follow-up questions. I built the core API endpoints and fixed the mobile layouts.',
    backendHeadline: 'Three AWS services chained behind Next.js API routes',
    backend:
      'Next.js route handlers take the photo and hand it to AWS Textract for text, then Comprehend Medical to pull out medicines at a confidence floor, then Bedrock to explain interactions in the chosen language. Supabase handles sign-in, records and reminders. Without AWS keys the chain falls back to mock responses so the app still runs locally.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'AWS Textract', 'Comprehend Medical', 'Bedrock', 'Tailwind'],
    facts: [
      ['3', '', 'AWS services chained'],
      ['3', '', 'languages'],
      ['7', '', 'API routes'],
    ],
    links: { repo: 'https://github.com/KeyBIND-AWS/medpal' },
    image: { src: '/projects/medpal-1200.webp', srcSet: '/projects/medpal-640.webp 640w, /projects/medpal-1200.webp 1200w', alt: 'MedPal app screens' },
    diagram: {
      nodes: [
        { id: 'cam', label: 'camera', x: 18, y: 57 },
        { id: 'api', label: 'next.js api', x: 150, y: 57 },
        { id: 'ocr', label: 'textract', x: 290, y: 22 },
        { id: 'med', label: 'comprehend', x: 290, y: 92 },
        { id: 'llm', label: 'bedrock', x: 420, y: 22 },
        { id: 'db', label: 'supabase', x: 420, y: 92 },
      ],
      edges: [['cam', 'api'], ['api', 'ocr'], ['ocr', 'med'], ['med', 'llm'], ['api', 'db']],
    },
  },
  {
    id: 'keystroke-auth',
    title: 'Keystroke Auth',
    year: '2024',
    meta: 'Solo · Python · Behavioral biometrics · Statistics',
    headline: 'Passwords that also check how you type',
    summary:
      'A Python desktop app that hardens login with behavioral biometrics. It captures microsecond variations in typing rhythm, key dwell and flight times, and scores them against a baseline profile, blocking impostors even when they know the password.',
    backendHeadline: 'A scoring pipeline from keystrokes to a verdict',
    backend:
      'Key events are timestamped as they arrive. Dwell (how long a key is held) and flight (the gap between keys) become per-user feature statistics. A login attempt is scored against the stored baseline profile and accepted or blocked on the distance, so the password alone is never enough.',
    tech: ['Python', 'Biometrics', 'Statistics'],
    facts: [
      ['2', '', 'timing signals: dwell, flight'],
      ['1', '', 'baseline profile per user'],
      ['µs', '', 'resolution'],
    ],
    links: { repo: 'https://github.com/BVADBuenviaje/keystroke-auth' },
    image: { src: '/projects/keystroke-auth-640.webp', srcSet: '/projects/keystroke-auth-640.webp 640w', alt: 'Keystroke Auth desktop app' },
    diagram: {
      nodes: [
        { id: 'keys', label: 'keystrokes', x: 18, y: 57 },
        { id: 'timing', label: 'dwell + flight', x: 150, y: 57 },
        { id: 'stats', label: 'feature stats', x: 290, y: 57 },
        { id: 'profile', label: 'baseline', x: 420, y: 22 },
        { id: 'verdict', label: 'accept / block', x: 420, y: 92 },
      ],
      edges: [['keys', 'timing'], ['timing', 'stats'], ['stats', 'profile'], ['stats', 'verdict']],
    },
  },
]

export const EXPERIENCE = [
  {
    id: 'infinityhub',
    when: 'May 2026 — Jun 2026',
    org: 'GAC Infinity Hub',
    role: 'Web developer · On-the-job trainee · 240 hours · Davao City',
    bullets: [
      'Built ManPro Academy, an EdTech learning platform: Laravel 12 and React 18 joined by Inertia, with Material UI.',
      'Course creation, learner enrollment with payments, and an affiliate referral system with HMAC-signed callbacks to a partner platform.',
      'Role-based access for admins, instructors, affiliates and learners; forms and surveys for assessments.',
    ],
    certificate: { thumb: '/experiences/infinityhub-certificate-thumb.webp', full: '/experiences/infinityhub-certificate-full.webp', alt: 'GAC Infinity Hub certificate of completion, Web Developer on-the-job trainee, May 18 to June 22 2026, 240 hours' },
  },
  {
    id: 'hydramed',
    when: 'Feb 2026 — May 2026',
    org: 'HydraMed',
    role: 'Technical intern · APEX telehealth ERP · Davao City',
    bullets: [
      'Supported architecture and implementation of core APEX modules.',
      'Built across healthcare, operations and business functions end to end.',
      'Touched EHR, CRM, financial systems, hiring and marketing tools.',
    ],
    certificate: { thumb: '/experiences/hydramed-certificate-thumb.webp', full: '/experiences/hydramed-certificate-full.webp', alt: 'HydraMed certificate of training completion, 180 hours' },
  },
  {
    id: 'ccna',
    when: 'Dec 2025 — Apr 2026',
    org: 'Cisco Networking Academy · Ateneo de Davao',
    role: 'CCNA: Introduction to Networks',
    bullets: [
      'Network architecture, IP addressing and device communication.',
      'Basic device configuration and core connectivity concepts.',
    ],
    certificate: { thumb: '/experiences/ccna-certificate-thumb.webp', full: '/experiences/ccna-certificate-full.webp', alt: 'Cisco Networking Academy certificate, CCNA: Introduction to Networks' },
  },
  {
    id: 'webdiner',
    when: 'Nov 2025 — Jan 2026',
    org: 'WebDiner LLC',
    role: 'Website design intern · Remote',
    bullets: [
      'Built responsive interfaces and turned client requirements into features.',
      'Optimized performance and SEO structure for live deployments.',
      'Helped ship production-ready websites to real clients.',
    ],
    certificate: { thumb: '/experiences/webdiner-certificate-thumb.webp', full: '/experiences/webdiner-certificate-full.webp', alt: 'WebDiner LLC certificate of completion, Website Design Intern' },
  },
]
