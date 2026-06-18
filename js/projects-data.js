/* ───────────────────────────────────────────────────────────
   Portfolio source of truth.
   Both the home grid and project.html read from here, so a case
   study only ever gets written once. Add a project = add an entry.
─────────────────────────────────────────────────────────────── */

export const projects = {

  apadel: {
    title: 'APadel Sports Platform',
    tagline: "Egypt's #1 competitive padel circuit, built from zero.",
    cover: 'https://images.pexels.com/photos/35248470/pexels-photo-35248470.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'APadel',
    services: ['Web App', 'UI/UX Design', 'Development', 'Branding'],
    liveUrl: 'https://apadel.io',
    intro: "APadel came to us with a spreadsheet and a vision: turn Egypt's scattered club tournaments into one ranked, trackable circuit. We designed and built the whole platform — public site, player rankings, tournament registration, and an organiser back-office.",
    challenge: "Padel was booming locally but had no central home. Players competed with no unified rankings, no match history, and no way to prove their level. Organisers ran everything by hand.",
    solution: "A single platform with live rankings, automated point calculation, doubles registration with shareable team codes, and a role-based admin panel. Built mobile-first because 80% of the audience books from their phone.",
    metrics: [
      { value: '4 wks', label: 'Concept to launch' },
      { value: '+240%', label: 'Registrations vs. manual' },
      { value: '<1.5s', label: 'Load time' },
    ],
    stack: ['HTML5', 'JavaScript', 'Supabase', 'PostgreSQL', 'RLS Auth'],
    gallery: [
      'https://images.pexels.com/photos/34079998/pexels-photo-34079998.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/35248254/pexels-photo-35248254.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  novatech: {
    title: 'NovaTech Dashboard',
    tagline: 'A SaaS analytics product that finally feels effortless.',
    cover: 'https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2025',
    client: 'NovaTech Solutions',
    services: ['UI/UX Design', 'SaaS', 'Design System'],
    liveUrl: '#',
    intro: "NovaTech's analytics tool was powerful but punishing — new users churned before they ever reached the 'aha' moment. We rebuilt the onboarding and the core dashboard around clarity.",
    challenge: "A dense, feature-first interface meant a steep learning curve. Support tickets were dominated by 'how do I…' questions and trial-to-paid conversion was stuck in single digits.",
    solution: "We mapped the first-run journey, cut the dashboard down to the three metrics that matter on day one, and shipped a clean design system the team could extend themselves. Progressive disclosure replaced the wall of options.",
    metrics: [
      { value: '3×', label: 'Faster onboarding' },
      { value: '−42%', label: 'Support tickets' },
      { value: '+18%', label: 'Trial conversion' },
    ],
    stack: ['Figma', 'React', 'Design Tokens', 'Storybook'],
    gallery: [
      'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  lumiere: {
    title: 'Lumière Boutique',
    tagline: 'Luxury fashion, translated to the web without losing the gloss.',
    cover: 'https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2025',
    client: 'Lumière',
    services: ['E-commerce', 'Branding', 'Web Design'],
    liveUrl: '#',
    intro: "A high-end boutique with a devoted in-store following and an online shop that didn't do them justice. We rebuilt the storefront to match the quality of the clothes.",
    challenge: "The old store felt cheap next to the product. Slow images, a clumsy checkout, and no sense of the brand meant most visitors never made it to the bag.",
    solution: "Editorial layouts, art-directed product photography, and a checkout trimmed to the essentials. Every page was tuned for speed so the imagery could be rich without being slow.",
    metrics: [
      { value: '+180%', label: 'Online revenue' },
      { value: '−55%', label: 'Cart abandonment' },
      { value: '2.4×', label: 'Avg. order value' },
    ],
    stack: ['Shopify', 'Liquid', 'Custom Theme', 'CDN Imagery'],
    gallery: [
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  harvest: {
    title: 'Harvest Kitchen',
    tagline: 'A neighbourhood restaurant that now owns its local search.',
    cover: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2024',
    client: 'Harvest Kitchen',
    services: ['Web Design', 'SEO', 'Booking System'],
    liveUrl: '#',
    intro: "Harvest had the food and the regulars, but online they were invisible. We built a fast site, wired up bookings, and went to work on local SEO.",
    challenge: "Buried on page three of search, no online booking, and a menu locked inside a PDF nobody could read on a phone.",
    solution: "A hand-built site with structured data for every dish, a frictionless booking flow, and a local-SEO campaign targeting the searches that actually fill tables.",
    metrics: [
      { value: '#1', label: 'Local ranking in 60d' },
      { value: '+90%', label: 'Online bookings' },
      { value: '5h/wk', label: 'Saved on the phone' },
    ],
    stack: ['HTML5', 'Schema.org', 'OpenTable API', 'Local SEO'],
    gallery: [
      'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  vertex: {
    title: 'Vertex Properties',
    tagline: 'A real-estate portal built to turn browsers into leads.',
    cover: 'https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2024',
    client: 'Vertex Properties',
    services: ['Web Design', 'Development', 'Lead Gen'],
    liveUrl: '#',
    intro: "Vertex needed more than a brochure site — they needed a working portal with 200+ listings, real search, and a pipeline that captured leads while they were hot.",
    challenge: "Listings lived in a clunky third-party iframe with no search, no filters, and no way to know which properties drove enquiries.",
    solution: "A custom listings portal with map and filter search, saved-property accounts, and lead capture on every detail page — plus analytics so the team can see what's converting.",
    metrics: [
      { value: '200+', label: 'Live listings' },
      { value: '+130%', label: 'Qualified leads' },
      { value: '−60%', label: 'Time on admin' },
    ],
    stack: ['Next.js', 'Mapbox', 'Supabase', 'Analytics'],
    gallery: [
      'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

};
