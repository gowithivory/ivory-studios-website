// Service pages. scripts/build.mjs renders each entry to /<slug>.html and uses
// the same data for the services overview, the home page and the footer.
// Keep claims to what we actually deliver: no invented results.

export default {

  'web-design': {
    name: 'Web Design',
    num: '01',
    short: 'Websites that explain what you do in seconds and make the next step obvious.',
    title: 'Web Design Agency for Growing Businesses | Ivory Studios',
    description: 'Custom website design that makes your offer clear, builds trust and turns visitors into enquiries. Strategy, UX and visual design by Ivory Studios.',
    h1: 'Websites designed around <span class="accent">your customer.</span>',
    lead: 'Custom web design that makes your offer clear, earns trust quickly and guides the right visitors towards getting in touch.',
    problemTitle: 'When the website undersells the business',
    problem: "Most businesses are better than their website suggests. Visitors arrive, can't tell quickly what you do or why you're the right choice, and leave without a word. We start from your customer's questions, then design every page to answer them in the order people actually ask.",
    forWho: [
      'Businesses whose site no longer reflects the quality of their work',
      'Founders launching a new company, product or offer',
      'Teams replacing a template site with something built for them',
    ],
    deliverables: [
      'Discovery workshop, sitemap and page goals',
      'Wireframes for the key journeys',
      'High-fidelity designs for desktop and mobile',
      'Copy direction and content structure',
      'Clickable prototype for review',
      'A reusable design system for future pages',
    ],
    outcomes: [
      ['Clear in seconds', 'Visitors understand what you offer and who it is for before they scroll.'],
      ['Built for trust', 'Proof, process and pricing signals placed where doubts appear.'],
      ['One next step', 'Every page leads to a single, obvious action instead of a dozen competing ones.'],
    ],
    faq: [
      ['How long does a website design take?', 'A focused marketing site usually takes two to three weeks of design after discovery. Larger sites with many templates take longer. Your proposal includes a week-by-week timeline.'],
      ['Do you write the copy?', 'We provide copy direction and structure for every page, and can write the full copy as part of the project. Either way, you approve every word before launch.'],
      ['Can you redesign our existing site?', 'Yes. We start with what is working, keep the URLs and content that already rank, and redesign around what visitors need now.'],
    ],
    related: ['web-development', 'brand-identity', 'business-systems'],
  },

  'web-development': {
    name: 'Web Development',
    num: '02',
    short: 'Fast, accessible, search-ready builds you can edit and grow without starting over.',
    title: 'Web Development Agency | Fast, Search-Ready Websites | Ivory Studios',
    description: 'Fast, accessible websites and web apps built with clean code, a CMS your team can use and solid technical SEO. Fixed-price proposals from Ivory Studios.',
    h1: 'Engineered to load fast and <span class="accent">scale with you.</span>',
    lead: 'We turn approved designs into fast, accessible, search-ready websites and web apps, with clean code your business can build on.',
    problemTitle: 'Good design, let down by the build',
    problem: "A slow, fragile website quietly costs you: visitors leave before the page loads, search engines rank you lower and every small change needs a developer. We build lean, well-structured sites that score well on Core Web Vitals, work on every screen and give your team the controls they need.",
    forWho: [
      'Businesses with a design ready to be built properly',
      'Teams whose current site is slow, fragile or hard to update',
      'Products that need a web app, portal or dashboard alongside the website',
    ],
    deliverables: [
      'Static, Next.js or custom builds chosen for your needs',
      'CMS set-up so your team can edit content',
      'Forms, booking, payments and third-party integrations',
      'Performance, accessibility and technical SEO',
      'Analytics and conversion tracking',
      'Deployment, documentation and handover',
    ],
    outcomes: [
      ['Fast everywhere', 'Lean pages, optimised images and modern hosting, tuned for real phones and networks.'],
      ['Easy to run', 'Edit content yourself; the code is documented so any developer can pick it up.'],
      ['Ready for search', 'Semantic markup, structured data and clean URLs from the first release.'],
    ],
    faq: [
      ['What technology do you build with?', 'Whatever fits the job. Marketing sites are often lean static builds; products and portals typically use Next.js or a custom stack with Supabase or PostgreSQL. We explain the choice in the proposal.'],
      ['Will I be able to edit the site myself?', 'Yes. We set up a CMS or editing workflow suited to your team and walk you through it at handover.'],
      ['Do you build web apps as well as websites?', 'Yes. Dashboards, member areas, client portals and booking tools are a regular part of our work. See CRM & Business Systems for more.'],
    ],
    related: ['web-design', 'business-systems', 'seo-growth'],
  },

  'brand-identity': {
    name: 'Brand Identity',
    num: '03',
    short: 'A distinctive identity and a practical system that keeps every touchpoint consistent.',
    title: 'Brand Identity Design | Logo & Visual Systems | Ivory Studios',
    description: 'Brand identity design: positioning, logo, typography, colour and guidelines your team can actually use. A visual system built to grow with your business.',
    h1: 'An identity people <span class="accent">recognise and remember.</span>',
    lead: 'Positioning, logo and a complete visual system, designed to make your business distinctive and consistent wherever customers meet it.',
    problemTitle: 'When the brand looks smaller than the business',
    problem: "If your logo, colours and tone change from one place to the next, customers notice, even if they can't say why. A clear identity system makes you look established, helps people remember you and saves your team from reinventing the look every time they make something.",
    forWho: [
      'New businesses that want to launch looking established',
      'Growing companies whose brand has drifted across channels',
      'Teams preparing a rebrand alongside a new website',
    ],
    deliverables: [
      'Brand discovery and positioning',
      'Logo suite and usage rules',
      'Colour, typography and imagery direction',
      'Brand guidelines document',
      'Social, presentation and document templates',
      'Design tokens ready for your website',
    ],
    outcomes: [
      ['Distinctive', 'A look that sets you apart in your market instead of blending in.'],
      ['Consistent', 'Clear rules and templates so every touchpoint feels like the same company.'],
      ['Ready to use', 'Files and guidance your team and partners can work with from day one.'],
    ],
    faq: [
      ['What do I receive at the end?', 'Logo files in every format you need, a brand guidelines document, colour and type specifications and ready-made templates for the channels you use most.'],
      ['Can you refresh an existing brand?', 'Yes. Often the best route is to keep what people already recognise and tighten everything around it.'],
      ['Do you design the website too?', 'We can. Brand and website designed together share one system, which saves time and keeps everything consistent.'],
    ],
    related: ['web-design', 'web-development', 'seo-growth'],
  },

  'business-systems': {
    name: 'CRM & Business Systems',
    nav: 'Business Systems',
    num: '04',
    short: 'Custom CRMs, portals and internal tools that replace spreadsheets and scattered chats.',
    title: 'Custom CRM & Business Systems Development | Ivory Studios',
    description: 'Custom CRMs, client portals, booking tools and internal dashboards built around how your team works. Replace spreadsheets with software that fits.',
    h1: 'Software built around <span class="accent">how you work.</span>',
    lead: 'Custom CRMs, client portals and internal tools that bring your leads, clients and operations into one place, designed for the way your team already works.',
    problemTitle: 'When the business runs on spreadsheets and chats',
    problem: "As a business grows, the work spreads across spreadsheets, inboxes and group chats. Leads slip, clients chase updates and nobody has the full picture. Off-the-shelf tools rarely fit, so teams bend their process around the software. We design and build systems that fit your process instead.",
    forWho: [
      'Teams tracking leads and clients in spreadsheets',
      'Service businesses that want clients to see progress without chasing',
      'Operators running bookings, events or memberships by hand',
    ],
    deliverables: [
      'Process mapping and system design',
      'Custom CRM and sales pipelines',
      'Client portals and member areas',
      'Booking, scheduling and operations dashboards',
      'Integrations and automations with the tools you already use',
      'Roles, permissions, data migration and training',
    ],
    outcomes: [
      ['One source of truth', 'Leads, clients and jobs in one place, with the history your team needs.'],
      ['Less admin', 'Automations handle the repetitive steps so people can focus on the work.'],
      ['Secure by design', 'Role-based access and row-level security, so each person sees only what they should.'],
    ],
    proof: 'APadel’s organiser back-office and our own client portal are built this way: role-based dashboards on Supabase and PostgreSQL with row-level security.',
    faq: [
      ['Why custom instead of an off-the-shelf CRM?', 'Off-the-shelf tools are a good fit for many teams, and we will say so if that is the case for you. Custom makes sense when your process is a competitive advantage, when you pay for features you never use, or when you need several tools to talk to each other.'],
      ['Can it connect to the tools we already use?', 'Usually, yes. We integrate with email, calendars, payment providers, spreadsheets and most services that offer an API.'],
      ['Who owns the system and the data?', 'You do. The code, the database and the data are yours, and we document everything so it is never locked to us.'],
    ],
    related: ['web-development', 'web-design', 'seo-growth'],
  },

  'seo-growth': {
    name: 'SEO & Growth',
    num: '05',
    short: 'Technical SEO, content structure and tracking that help the right people find you.',
    title: 'SEO & Growth Services | Technical & Local SEO | Ivory Studios',
    description: 'Technical SEO, content structure, local search and conversion tracking that help the right customers find you and act, with clear monthly reporting.',
    h1: 'Get found by the people <span class="accent">looking for you.</span>',
    lead: 'Technical SEO, content structure and analytics that help the right customers find you, then measure what turns them into enquiries.',
    problemTitle: 'A great site nobody can find',
    problem: "A website only works if the right people reach it. Search engines need clear structure, fast pages and content that answers real questions. We fix the technical foundations, shape content around what your customers search for and set up tracking so you can see what is actually working.",
    forWho: [
      'Businesses with a good site but little search traffic',
      'Local businesses competing for nearby customers',
      'Teams that want clear reporting instead of guesswork',
    ],
    deliverables: [
      'Technical SEO audit and fixes',
      'Keyword and content structure plan',
      'On-page optimisation and internal linking',
      'Local SEO and Google Business Profile set-up',
      'Structured data',
      'Analytics, conversion tracking and monthly reporting',
    ],
    outcomes: [
      ['Strong foundations', 'Fast, crawlable pages with the structure search engines expect.'],
      ['Content with purpose', 'Pages built around the questions your customers really ask.'],
      ['Clear reporting', 'Tracking that connects traffic to enquiries, explained in plain language.'],
    ],
    faq: [
      ['How long does SEO take to show results?', 'Technical fixes can help within weeks; content and authority usually take several months. We will not promise rankings, but we will show you exactly what changed and why.'],
      ['Do you guarantee first-page rankings?', 'No. Nobody can honestly guarantee rankings. We focus on the work that reliably improves visibility and report on it transparently.'],
      ['Can you help with local search?', 'Yes. Local SEO, Google Business Profile optimisation and location pages are part of our SEO work.'],
    ],
    related: ['web-development', 'web-design', 'business-systems'],
  },

};
