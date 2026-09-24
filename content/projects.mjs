/*
   Portfolio source of truth.
   Both the home grid and project.html read from here, so a case
   study only ever gets written once. Add a project = add an entry.
*/

export default {

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

  /* Concept Lab
     Self-initiated demonstration concepts — NOT client work. They show
     the industries we're ready to build for and the standard we'd ship
     at. Every metric on these pages is an illustrative target and is
     labelled as such on the case-study page (concept: true drives the
     badge + disclaimer in project.js). */

  velluto: {
    concept: true,
    title: 'Velluto Ristorante',
    tagline: 'A fine-dining website where booking a table feels like the first course.',
    cover: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Web Design', 'Reservations', 'Branding'],
    liveUrl: '#',
    intro: "A demonstration build for luxury restaurants: dark, editorial, unapologetically appetising. The menu reads like a story, and the reservation flow takes four taps from craving to confirmation.",
    challenge: "Fine-dining sites usually bury the two things guests came for — the menu and a table. PDFs, third-party widgets, and stock templates undercut a kitchen that charges fine-dining prices.",
    solution: "Full-bleed dish photography with a menu marked up as structured data, a native-feeling reservation flow with table preferences and deposit handling, and a private-events enquiry path for the high-margin bookings.",
    metrics: [
      { value: '4 taps', label: 'To a confirmed table' },
      { value: '<1.5s', label: 'Target load time' },
      { value: '+35%', label: 'Illustrative booking lift' },
    ],
    stack: ['HTML5', 'Reservation API', 'Schema.org', 'Stripe Deposits'],
    gallery: [
      'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  brightsmile: {
    concept: true,
    title: 'BrightSmile Dental',
    tagline: 'A clinic website that books patients while the front desk sleeps.',
    cover: 'https://images.pexels.com/photos/3845653/pexels-photo-3845653.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Web Design', 'Online Booking', 'Local SEO'],
    liveUrl: '#',
    intro: "A demonstration build for modern clinics: calm, trustworthy design, treatments explained in plain language, and appointment booking that works at 11pm — when people actually decide to fix their teeth.",
    challenge: "Most clinic sites are brochures with a phone number. Every after-hours visitor is a lost patient, and 'root canal' anxiety is never eased by a wall of clinical jargon.",
    solution: "Treatment pages written for patients (not dentists) with transparent pricing ranges, a slot-based booking flow with SMS reminders, and local-SEO structure so the clinic owns 'dentist near me' in its area.",
    metrics: [
      { value: '24/7', label: 'Booking availability' },
      { value: '60s', label: 'To book a visit' },
      { value: '−40%', label: 'Illustrative no-show target' },
    ],
    stack: ['HTML5', 'Booking Engine', 'SMS API', 'LocalBusiness Schema'],
    gallery: [
      'https://images.pexels.com/photos/4269942/pexels-photo-4269942.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  forgefit: {
    concept: true,
    title: 'ForgeFit Club',
    tagline: 'A gym portal that sells memberships, not just treadmill photos.',
    cover: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Web Design', 'Membership Portal', 'Development'],
    liveUrl: '#',
    intro: "A demonstration build for fitness brands: bold type, honest energy, and a member portal that handles sign-ups, class schedules, and renewals without a single phone call.",
    challenge: "Gyms lose sign-ups at the front desk — paper forms, unclear pricing, class schedules trapped in Instagram stories. The website looks tough; the buying experience is flabby.",
    solution: "Tiered membership checkout with clear pricing, a live class timetable with one-tap reservations, trainer profiles that sell the coaching upsell, and a member area for freezes, renewals, and progress.",
    metrics: [
      { value: '3 min', label: 'Join flow, end to end' },
      { value: '0 calls', label: 'Needed to manage a plan' },
      { value: '+50%', label: 'Illustrative sign-up target' },
    ],
    stack: ['React', 'Stripe Billing', 'Supabase', 'PWA'],
    gallery: [
      'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  kavana: {
    concept: true,
    title: 'Kavana Coffee',
    tagline: 'A specialty coffee brand with a website you can almost smell.',
    cover: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Branding', 'Web Design', 'E-commerce'],
    liveUrl: '#',
    intro: "A demonstration brand-and-site build: identity, packaging direction, and an online store for beans and subscriptions — the full journey from logo to checkout for a specialty roaster.",
    challenge: "Small roasters compete with global brands on shelf and on screen. Without a distinct identity and a store that sells the craft, great coffee reads as just another bag.",
    solution: "A warm, editorial identity system; origin-story pages for each roast with tasting notes; and a subscription-first store where recurring delivery is the default, not the upsell.",
    metrics: [
      { value: '1 brand', label: 'Logo to checkout' },
      { value: '30%', label: 'Illustrative subscriber mix' },
      { value: '2 wks', label: 'Concept build time' },
    ],
    stack: ['Brand System', 'Shopify', 'Subscriptions', 'Art Direction'],
    gallery: [
      'https://images.pexels.com/photos/1002740/pexels-photo-1002740.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  pulseboard: {
    concept: true,
    title: 'Pulseboard AI',
    tagline: 'An AI analytics dashboard that explains itself in plain English.',
    cover: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['UI/UX Design', 'SaaS', 'Design System'],
    liveUrl: '#',
    intro: "A demonstration SaaS interface: an AI-powered analytics product where insights arrive as sentences, not just charts — designed to show how we approach dense, data-heavy products.",
    challenge: "AI dashboards drown users in widgets. The value is in the answer, but most products make you assemble it yourself from a dozen panels.",
    solution: "An insight feed that leads with plain-language findings, drill-down charts one click behind them, and a component system with dark-mode-first design tokens the product team can scale.",
    metrics: [
      { value: '1 screen', label: 'To the key insight' },
      { value: '40+', label: 'Documented components' },
      { value: 'AA', label: 'WCAG contrast target' },
    ],
    stack: ['Figma', 'React', 'Recharts', 'Design Tokens'],
    gallery: [
      'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  lexford: {
    concept: true,
    title: 'Lexford & Gray',
    tagline: 'A law firm website that wins trust before the first consultation.',
    cover: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Web Design', 'Content Strategy', 'SEO'],
    liveUrl: '#',
    intro: "A demonstration build for professional services: quiet authority in the design, practice areas explained without legalese, and a consultation funnel that respects how carefully people choose a lawyer.",
    challenge: "Legal clients research for weeks before they call. Firms with dated sites and 'contact us' as the only next step lose that research phase to competitors with better answers online.",
    solution: "Practice-area pages that answer the questions clients actually search, attorney profiles that lead with outcomes, case-result highlights within bar-compliance rules, and a low-commitment 'case review' form as the first step.",
    metrics: [
      { value: '15+', label: 'Practice-area pages' },
      { value: '2 fields', label: 'To start a case review' },
      { value: 'Top 3', label: 'Illustrative local ranking target' },
    ],
    stack: ['HTML5', 'Attorney Schema', 'Content SEO', 'CRM Intake'],
    gallery: [
      'https://images.pexels.com/photos/48148/document-agreement-documents-sign-48148.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3771097/pexels-photo-3771097.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  azurepalms: {
    concept: true,
    title: 'Azure Palms Hotel',
    tagline: 'A boutique hotel site where direct booking beats the OTAs.',
    cover: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Web Design', 'Booking Engine', 'Development'],
    liveUrl: '#',
    intro: "A demonstration build for hospitality: immersive room storytelling, transparent rates, and a direct-booking flow good enough that guests skip the commission sites.",
    challenge: "Hotels hand 15–25% of every booking to OTAs largely because their own site is worse at the one thing that matters: making the room feel real and the booking feel safe.",
    solution: "Room pages built like mini case studies (light, views, quiet hours, honest photos), a rate calendar with best-price messaging, and a three-step booking flow with instant confirmation.",
    metrics: [
      { value: '3 steps', label: 'Search to confirmation' },
      { value: '0%', label: 'Commission on direct bookings' },
      { value: '+25%', label: 'Illustrative direct-booking target' },
    ],
    stack: ['Next.js', 'Booking API', 'Rate Calendar', 'Hotel Schema'],
    gallery: [
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  wanderly: {
    concept: true,
    title: 'Wanderly Travel',
    tagline: 'A travel agency platform that turns wanderlust into itineraries.',
    cover: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Web Design', 'Development', 'Booking Platform'],
    liveUrl: '#',
    intro: "A demonstration build for travel brands: destination pages that sell the feeling, package builders that sell the plan, and enquiry flows tuned for the way people dream first and budget second.",
    challenge: "Travel sites either overwhelm with filters or underwhelm with brochureware. Neither matches how trips are actually chosen — by mood, season, and budget, in that order.",
    solution: "Mood-first destination discovery ('beach, culture, adventure'), transparent package pricing with what's-included clarity, and a trip-enquiry flow that captures dates and budget without feeling like a form.",
    metrics: [
      { value: '60+', label: 'Destination page template' },
      { value: '4 steps', label: 'Dream to enquiry' },
      { value: '+45%', label: 'Illustrative enquiry target' },
    ],
    stack: ['Next.js', 'CMS', 'Currency API', 'Trip Schema'],
    gallery: [
      'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2033343/pexels-photo-2033343.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  atlas: {
    concept: true,
    title: 'Atlas Academy',
    tagline: 'An education platform where the course sells itself by teaching.',
    cover: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['UI/UX Design', 'Development', 'Learning Platform'],
    liveUrl: '#',
    intro: "A demonstration build for online education: a course platform with free first lessons, honest progress tracking, and checkout that appears exactly when a learner is convinced — not before.",
    challenge: "Course platforms oversell and underdeliver — hype pages, locked content, and dashboards that make learning feel like admin. Trust is the whole product, and most designs spend it.",
    solution: "Lesson-one-free structure so the teaching does the selling, a distraction-free player with real progress states, cohort pages with genuine start dates, and instructor profiles that lead with credentials, not follower counts.",
    metrics: [
      { value: 'Lesson 1', label: 'Free on every course' },
      { value: '<2s', label: 'Player load target' },
      { value: '+30%', label: 'Illustrative completion target' },
    ],
    stack: ['React', 'Video CDN', 'Stripe', 'Course Schema'],
    gallery: [
      'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

  granite: {
    concept: true,
    title: 'Granite & Co. Construction',
    tagline: 'A construction site (the web kind) that wins commercial bids.',
    cover: 'https://images.pexels.com/photos/176342/pexels-photo-176342.jpeg?auto=compress&cs=tinysrgb&w=1600',
    year: '2026',
    client: 'Concept — Ivory Studios',
    services: ['Web Design', 'Development', 'Content Strategy'],
    liveUrl: '#',
    intro: "A demonstration build for contractors and developers: project portfolios with real scope data, safety and certification front and centre, and an RFP path that makes procurement teams' lives easy.",
    challenge: "Construction firms win work on trust and track record, but most sites show three photos and a phone number. Procurement teams can't shortlist what they can't verify.",
    solution: "Project pages with scope, timeline, and delivery data; a certifications and safety-record section built for due-diligence; team pages that show who actually runs the site; and a structured RFP/tender enquiry flow.",
    metrics: [
      { value: '25+', label: 'Project template capacity' },
      { value: '1 page', label: 'Full due-diligence pack' },
      { value: '2×', label: 'Illustrative shortlist target' },
    ],
    stack: ['HTML5', 'Project CMS', 'PDF Generation', 'Org Schema'],
    gallery: [
      'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/159306/pexels-photo-159306.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },

};
