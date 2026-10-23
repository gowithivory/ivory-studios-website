// Service pages. scripts/build.mjs renders each entry to /<slug>.html and uses
// the same data for the services overview, the home page and the footer.
// Keep claims to what we actually deliver: no invented results.

export default {

  'web-design': {
    name: 'Web Design',
    num: '01',
    short: 'Turn visitors into enquiries with a site that explains you in seconds.',
    title: 'Web Design Agency for Growing Businesses | Ivory Studios',
    description: 'Is your website underselling your business? We design sites that explain your offer in seconds and lead visitors to get in touch. Fixed price, free call.',
    h1: 'Websites designed around <span class="accent">your customer.</span>',
    lead: 'Your website has seconds to convince a stranger. We design every page to win them over: a clear offer, instant trust and one obvious next step.',
    problemTitle: 'Great business. Forgettable website?',
    problem: 'Most businesses are better than their website suggests. Visitors arrive, can’t tell what you do or why you’re the right choice, and leave for a competitor without a word. You never even know they were there. We start from your customer’s questions and design every page to answer them in the order people actually ask, so more of those visitors get in touch.',
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
      ['Understood in seconds', 'Visitors know what you offer and who it’s for before they even scroll.'],
      ['Trusted on sight', 'Proof, process and pricing placed exactly where doubts start.'],
      ['An obvious next step', 'Every page leads to one clear action, not a dozen competing ones.'],
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
    short: 'Fast, search-ready sites your team can update without calling a developer.',
    title: 'Web Development | Fast, Search-Ready Sites | Ivory Studios',
    description: 'Slow site that needs a developer for every change? We build fast, accessible websites and web apps your team can edit. Fixed-price proposals, worldwide.',
    h1: 'Engineered to load fast and <span class="accent">scale with you.</span>',
    lead: 'Slow sites lose customers before they read a word. We build fast, accessible, search-ready websites and web apps on clean code you own and can grow for years.',
    problemTitle: 'Beautiful design, let down by a slow build',
    problem: 'A slow, fragile website quietly costs you money: visitors leave before the page loads, search engines rank you lower and every small change needs a developer. We build lean, well-structured sites designed to pass Core Web Vitals, feel instant on any phone and put your team in control.',
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
      ['Instant on every screen', 'Lean pages and optimised images, tuned for real phones on real networks.'],
      ['Yours to run', 'Edit content yourself. The code is documented, so you are never tied to one developer.'],
      ['Built to be found', 'Clean structure, structured data and fast pages from the very first release.'],
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
    short: 'A brand people remember, with rules that keep it sharp everywhere.',
    title: 'Brand Identity | Logo & Visual Systems | Ivory Studios',
    description: 'Does your brand look smaller than your business? Get a distinctive logo and visual system your team can use everywhere, from positioning to guidelines.',
    h1: 'An identity people <span class="accent">recognise and remember.</span>',
    lead: 'People judge your business at a glance. We give you a distinctive identity and a complete visual system that makes you look established from day one, wherever customers meet you.',
    problemTitle: 'Does your brand look smaller than your business?',
    problem: 'If your logo, colours and tone change from one place to the next, customers notice, even if they can’t say why, and they quietly trust you less. A clear identity system makes you look established, makes you memorable and saves your team from reinventing the look every time they post, pitch or print.',
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
      ['Unmistakably you', 'A look that stands out in your market instead of blending in.'],
      ['Consistent everywhere', 'Clear rules and templates, so every post, deck and invoice looks like the same company.'],
      ['Ready on day one', 'Files and guidance your team and partners can use immediately.'],
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
    nav: 'CRM & Business Systems',
    num: '04',
    short: 'Ditch the spreadsheets: one system for your leads, clients and operations.',
    title: 'Custom CRM & Business Systems Development | Ivory Studios',
    description: 'Running your business on spreadsheets and group chats? We build custom CRMs, client portals and booking tools around how your team works. You own it all.',
    h1: 'Software built around <span class="accent">how you work.</span>',
    lead: 'Stop running your business on spreadsheets and group chats. We build custom CRMs, client portals and internal tools around the way your team already works, so nothing slips through the cracks.',
    problemTitle: 'Leads slipping through the cracks?',
    problem: 'As a business grows, the work spreads across spreadsheets, inboxes and group chats. Leads go cold, clients chase updates and nobody has the full picture. Off-the-shelf tools rarely fit, so teams bend their process around the software. We flip that: we design and build the system around your process, and you own it outright.',
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
      ['Everything in one place', 'Leads, clients and jobs in one system, with the full history at your fingertips.'],
      ['Less admin, more real work', 'Automations handle the repetitive steps so your team can focus on the work that pays.'],
      ['Secure by design', 'Each person sees only what their role allows, enforced by the database itself rather than just hidden on screen.'],
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
    short: 'Get found by the customers who are already searching for you.',
    title: 'SEO & Growth | Technical & Local SEO | Ivory Studios',
    description: 'A great site nobody finds? We fix technical SEO, shape content around real searches and track which visits turn into enquiries, with plain monthly reports.',
    h1: 'Get found by the people <span class="accent">looking for you.</span>',
    lead: 'Your customers are searching right now. We make sure they find you, with technical SEO, content built around real searches and tracking that shows exactly what turns into enquiries.',
    problemTitle: 'A great site nobody can find',
    problem: 'A website only works if the right people reach it. Most searchers never look past the first page of results; if you’re not there, they find a competitor instead. We fix the technical foundations, shape content around what your customers actually search for and track what works, so every month you know what is bringing in business.',
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
      ['Rock-solid foundations', 'Fast, crawlable pages with the structure search engines expect.'],
      ['Content that pulls people in', 'Pages built around the questions your customers really ask.'],
      ['Results you can see', 'Tracking that connects traffic to enquiries, explained in plain language every month.'],
    ],
    faq: [
      ['How long does SEO take to show results?', 'Technical fixes can help within weeks; content and authority usually take several months. We will not promise rankings, but we will show you exactly what changed and why.'],
      ['Do you guarantee first-page rankings?', 'No. Nobody can honestly guarantee rankings. We focus on the work that reliably improves visibility and report on it transparently.'],
      ['Can you help with local search?', 'Yes. Local SEO, Google Business Profile optimisation and location pages are part of our SEO work.'],
    ],
    related: ['web-development', 'web-design', 'business-systems'],
  },

};
