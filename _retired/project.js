/* Renders a single case study from ?slug= using the shared data.
   Classic script (not a module) so it works on file:// too. */
const projects = window.projects || {};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const slug = new URLSearchParams(location.search).get('slug');
const p    = projects[slug];
const root = document.getElementById('project-root');

if (!p) {
  root.innerHTML = `
    <div class="proj-404">
      <h1>Project not found</h1>
      <p>This case study may have moved.</p>
      <a href="work.html" class="btn-primary">← Back to all work</a>
    </div>`;
} else {
  document.title = `${p.title} — Ivory Studios`;
  setMeta('description', p.tagline);

  // ── SEO: breadcrumb + creative-work structured data ──
  injectSchema({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ivorystudios.io/' },
          { '@type': 'ListItem', position: 2, name: 'Work', item: 'https://ivorystudios.io/work' },
          { '@type': 'ListItem', position: 3, name: p.title, item: location.href },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: p.title,
        about: p.tagline,
        image: p.cover,
        dateCreated: p.year,
        creator: { '@type': 'Organization', name: 'Ivory Studios', url: 'https://ivorystudios.io' },
        keywords: p.services.join(', '),
      },
    ],
  });

  // next project for the footer nav
  const keys = Object.keys(projects);
  const next = keys[(keys.indexOf(slug) + 1) % keys.length];

  root.innerHTML = `
    <header class="proj-hero">
      <div class="proj-hero-img">
        <img src="${esc(p.cover)}" alt="${esc(p.title)}" fetchpriority="high">
        <div class="proj-hero-shade"></div>
      </div>
      <div class="container proj-hero-inner">
        <a href="work.html" class="proj-back">← All Work</a>
        <div class="proj-services">${p.services.map(s => `<span>${esc(s)}</span>`).join('')}</div>
        <h1 class="proj-title">${esc(p.title)}</h1>
        <p class="proj-tagline">${esc(p.tagline)}</p>
      </div>
    </header>

    <section class="container proj-meta-bar">
      <div class="pm-item"><span>Client</span><strong>${esc(p.client)}</strong></div>
      <div class="pm-item"><span>Year</span><strong>${esc(p.year)}</strong></div>
      <div class="pm-item"><span>Scope</span><strong>${esc(p.services.join(', '))}</strong></div>
      <div class="pm-item">
        <span>Live</span>
        ${p.liveUrl && p.liveUrl !== '#'
          ? `<a href="${esc(p.liveUrl)}" target="_blank" rel="noopener">Visit site ↗</a>`
          : `<strong class="muted">Under NDA</strong>`}
      </div>
    </section>

    <section class="container proj-body">
      <p class="proj-intro">${esc(p.intro)}</p>

      <div class="proj-metrics">
        ${p.metrics.map(m => `
          <div class="proj-metric">
            <div class="pmet-val">${esc(m.value)}</div>
            <div class="pmet-label">${esc(m.label)}</div>
          </div>`).join('')}
      </div>

      <div class="proj-cols">
        <div class="proj-col">
          <h2 class="proj-h2">The Challenge</h2>
          <p>${esc(p.challenge)}</p>
        </div>
        <div class="proj-col">
          <h2 class="proj-h2">Our Solution</h2>
          <p>${esc(p.solution)}</p>
        </div>
      </div>

      <div class="proj-gallery">
        ${p.gallery.map(src => `
          <div class="proj-shot"><img src="${esc(src)}" alt="${esc(p.title)} detail" loading="lazy"></div>`).join('')}
      </div>

      <div class="proj-stack">
        <span class="proj-stack-label">Built with</span>
        ${p.stack.map(t => `<span class="stack-pill">${esc(t)}</span>`).join('')}
      </div>
    </section>

    <section class="proj-next dark-section">
      <div class="container proj-next-inner">
        <div>
          <span class="section-label">Next Project</span>
          <a href="project.html?slug=${esc(next)}" class="proj-next-title">${esc(projects[next].title)} →</a>
        </div>
        <a href="contact.html" class="btn-primary magnetic"
           onclick="if(window.Calendly){Calendly.initPopupWidget({url:'https://calendly.com/ammar-ivorystudios/30min'});return false;}">
          Start your project
        </a>
      </div>
    </section>`;
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function injectSchema(obj) {
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(obj);
  document.head.appendChild(s);
}
