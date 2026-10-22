// Client portal. Clients see and submit their own requests; admins see
// everything and move projects through phases. Access is enforced by RLS in
// supabase/schema.sql, this file is only the UI.
import { supabase, isConfigured, friendly } from './supabase.js';

const $   = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

// The visible journey. Pre/terminal states sit outside the bar.
const PHASES = ['discovery', 'design', 'development', 'optimization', 'launched'];
const PHASE_LABEL = {
  new: 'New', reviewing: 'In review', discovery: 'Discovery', design: 'Design',
  development: 'Development', feedback: 'Awaiting your feedback', optimization: 'Optimisation',
  launched: 'Launched', on_hold: 'On hold', completed: 'Completed', declined: 'Declined',
};
const ALL_STATUSES = Object.keys(PHASE_LABEL);
// Progress is only shown when an admin has set it: the share of the agreed
// scope delivered. There is no made-up percentage per phase.

let me = null;        // profile row
let isAdmin = false;

init();

async function init() {
  if (!isConfigured) {
    $('#portal-root').innerHTML = notConfigured();
    return;
  }

  // getUser() asks the auth server, so a stale or tampered local session is
  // rejected here instead of half-loading the portal.
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    location.replace('/login');
    return;
  }
  const session = { user };

  const { data: profile, error: profErr } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single();

  // Tables missing means schema.sql hasn't been run yet.
  if (profErr && isSchemaMissing(profErr)) {
    $('#portal-user').textContent = session.user.email;
    $('#logout-btn').addEventListener('click', async () => { await supabase.auth.signOut(); location.replace('/'); });
    $('#portal-root').innerHTML = schemaNeeded();
    return;
  }

  if (profErr && !profile) {
    $('#portal-root').innerHTML = `<div class="portal-empty-card"><h3>Couldn't load your account</h3><p>${esc(friendly(profErr))}</p><div class="portal-empty-actions"><button type="button" class="btn-primary" id="portal-retry">Try again</button><a href="/" class="btn-ghost">← Back home</a></div></div>`;
    $('#portal-retry').addEventListener('click', () => location.reload());
    return;
  }

  me = profile || { id: session.user.id, full_name: '', email: session.user.email, role: 'client' };
  isAdmin = me.role === 'admin';

  $('#portal-user').textContent = me.full_name || me.email;
  $('#portal-role').textContent = isAdmin ? 'Admin' : 'Client';
  $('#portal-role').classList.toggle('admin', isAdmin);

  $('#logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.replace('/');
  });

  isAdmin ? renderAdmin() : renderClient();
}

// Client view
async function renderClient() {
  const root = $('#portal-root');
  root.innerHTML = `
    <div class="portal-head">
      <div>
        <h1 class="portal-h1">Welcome back${me.full_name ? ', ' + esc(me.full_name.split(' ')[0]) : ''}.</h1>
        <p class="portal-sub">Follow the progress of every project you have with us.</p>
      </div>
      <button class="btn-primary" id="new-req-btn">+ New Request</button>
    </div>
    <div id="new-req-panel" class="req-form-panel" hidden></div>
    <div id="client-requests"><div class="spinner"></div></div>`;

  $('#new-req-btn').addEventListener('click', toggleRequestForm);
  loadClientRequests();
}

async function loadClientRequests() {
  const wrap = $('#client-requests');
  const { data: all, error } = await supabase
    .from('project_requests').select('*').order('created_at', { ascending: false });

  if (error) { wrap.innerHTML = `<p class="portal-empty">Couldn't load requests: ${esc(friendly(error))}</p>`; return; }
  const reqs = (all || []).filter(r => !r.archived);
  if (!reqs?.length) {
    wrap.innerHTML = `
      <div class="portal-empty-card">
        <div class="pe-icon">✦</div>
        <h3>No projects yet</h3>
        <p>Start your first request and we'll take it from there.</p>
      </div>`;
    return;
  }

  // One query for every request's updates.
  const ids = reqs.map(r => r.id);
  const [{ data: updates }, { data: milestones }] = await Promise.all([
    supabase.from('request_updates').select('*').in('request_id', ids).order('created_at', { ascending: false }),
    supabase.from('project_milestones').select('*').in('request_id', ids).order('position').order('created_at'),
  ]);
  const byReq = groupBy(updates || [], 'request_id');
  const msByReq = groupBy(milestones || [], 'request_id');

  wrap.innerHTML = reqs.map(r => clientCard(r, byReq[r.id] || [], msByReq[r.id] || [])).join('');
}

function clientCard(r, updates, milestones = []) {
  return `
    <div class="req-card">
      <div class="req-card-top">
        <div>
          <div class="req-name">${esc(r.project_name)}</div>
          <div class="req-tags">
            <span>${esc(r.service_type)}</span>
            ${r.budget_range ? `<span>${esc(r.budget_range)}</span>` : ''}
            ${r.timeline ? `<span>${esc(r.timeline)}</span>` : ''}
          </div>
        </div>
        ${statusPill(r.status)}
      </div>

      ${phaseTracker(r)}
      ${projectFacts(r, milestones)}

      ${r.description ? `<p class="req-desc">${esc(r.description)}</p>` : ''}
      ${milestoneList(milestones)}

      <div class="req-updates">
        <div class="req-updates-label">Activity</div>
        ${updates.length
          ? updates.map(u => `
              <div class="req-update">
                <div class="ru-dot"></div>
                <div>
                  <div class="ru-msg">${esc(u.message)}</div>
                  <div class="ru-time">${u.phase && !u.message.includes(PHASE_LABEL[u.phase]) ? esc(PHASE_LABEL[u.phase] || u.phase) + ' · ' : ''}${fmtDate(u.created_at)}</div>
                </div>
              </div>`).join('')
          : `<p class="ru-empty">No updates yet. We'll post here as work progresses.</p>`}
      </div>
    </div>`;
}

// New request form
function toggleRequestForm() {
  const panel = $('#new-req-panel');
  if (!panel.hidden) { panel.hidden = true; panel.innerHTML = ''; return; }

  panel.hidden = false;
  panel.innerHTML = `
    <form id="req-form" class="req-form">
      <h3 class="req-form-title">Start a new project</h3>
      <div class="rf-grid">
        <label>Project name
          <input id="rf-name" type="text" required placeholder="e.g. Brand site redesign" maxlength="120">
        </label>
        <label>Service
          <select id="rf-service" required>
            <option value="">Choose…</option>
            <option>Web Design</option>
            <option>Web Development</option>
            <option>Brand Identity</option>
            <option>CRM &amp; Business Systems</option>
            <option>SEO &amp; Growth</option>
            <option>E-commerce</option>
            <option>Other</option>
          </select>
        </label>
        <label>Budget
          <select id="rf-budget">
            <option value="">Prefer not to say</option>
            <option>&lt; $1k</option>
            <option>$1k – $3k</option>
            <option>$3k – $7k</option>
            <option>$7k – $15k</option>
            <option>$15k+</option>
          </select>
        </label>
        <label>Timeline
          <select id="rf-timeline">
            <option value="">Flexible</option>
            <option>ASAP</option>
            <option>2–4 weeks</option>
            <option>1–2 months</option>
            <option>Just exploring</option>
          </select>
        </label>
        <label>Company (optional)
          <input id="rf-company" type="text" placeholder="Your company or brand" maxlength="120">
        </label>
        <label>Phone (optional)
          <input id="rf-phone" type="tel" placeholder="So we can reach you quickly" maxlength="40">
        </label>
      </div>
      <label>Tell us about it
        <textarea id="rf-desc" rows="4" placeholder="Goals, references, anything that helps us understand the project." maxlength="2000"></textarea>
      </label>
      <div class="rf-actions">
        <button type="button" class="btn-ghost" id="rf-cancel">Cancel</button>
        <button type="submit" class="btn-primary">Submit Request</button>
      </div>
      <div id="rf-note" class="auth-note" style="display:none"></div>
    </form>`;

  $('#rf-cancel').addEventListener('click', toggleRequestForm);
  $('#req-form').addEventListener('submit', submitRequest);
}

async function submitRequest(e) {
  e.preventDefault();
  const note = $('#rf-note');
  const btn  = $('#req-form button[type=submit]');
  const payload = {
    user_id:      me.id,
    project_name: $('#rf-name').value.trim(),
    service_type: $('#rf-service').value,
    company:      $('#rf-company').value.trim() || null,
    phone:        $('#rf-phone').value.trim() || null,
    budget_range: $('#rf-budget').value || null,
    timeline:     $('#rf-timeline').value || null,
    description:  $('#rf-desc').value.trim() || null,
    status:       'new',
  };
  if (!payload.project_name || !payload.service_type) {
    note.style.display = 'block'; note.className = 'auth-note err';
    note.textContent = 'Project name and service are required.'; return;
  }

  btn.disabled = true; btn.textContent = 'Submitting…';
  const { error } = await supabase.from('project_requests').insert(payload);
  btn.disabled = false; btn.textContent = 'Submit Request';

  if (error) {
    note.style.display = 'block'; note.className = 'auth-note err'; note.textContent = friendly(error); return;
  }
  toggleRequestForm();
  loadClientRequests();
}

// Admin view
async function renderAdmin() {
  const root = $('#portal-root');
  root.innerHTML = `
    <div class="portal-head">
      <div>
        <h1 class="portal-h1">Admin dashboard</h1>
        <p class="portal-sub">Set up projects for clients, update progress and follow up with leads.</p>
      </div>
      <button class="btn-primary" id="admin-new-btn">+ New project</button>
    </div>
    <div id="admin-new-panel" class="req-form-panel" hidden></div>
    <div id="admin-stats" class="admin-stats"></div>
    <h2 class="admin-section-title">Project Requests</h2>
    <div class="admin-filter" id="admin-filter" hidden>
      <label class="sr-only" for="admin-search">Search projects</label>
      <input type="search" id="admin-search" placeholder="Search by project, client or email" autocomplete="off">
      <label class="sr-only" for="admin-status-filter">Filter by status</label>
      <select id="admin-status-filter"><option value="">All statuses</option>${ALL_STATUSES.map(st => `<option value="${st}">${PHASE_LABEL[st]}</option>`).join('')}</select>
      <span class="admin-filter-count" id="admin-filter-count" aria-live="polite"></span>
    </div>
    <div id="admin-requests"><div class="spinner"></div></div>
    <h2 class="admin-section-title">Website Enquiries</h2>
    <div id="admin-leads"><div class="spinner"></div></div>
    <h2 class="admin-section-title">All Clients</h2>
    <div id="admin-users"><div class="spinner"></div></div>
    <details class="health" id="health">
      <summary class="health-summary"><span class="admin-section-title" id="health-title">System health</span><span class="health-summary-hint">Live checks of the database, session and analytics. Opens and runs on click.</span></summary>
      <div class="health-head">
        <p class="health-sub">Checks run from this browser with your admin session. Untested items are marked as such, never as passing.</p>
        <button type="button" class="btn-ghost btn-sm" id="health-run">Run checks</button>
      </div>
      <div id="health-list" class="health-list" aria-live="polite"></div>
      <p class="health-meta" id="health-meta"></p>
    </details>`;
  loadAdminRequests();
  loadAdminLeads();
  loadAdminUsers();
  $('#health-run').addEventListener('click', runHealthChecks);
  // Checks include a no-op write, so they run when the panel is opened, not on every visit.
  $('#health').addEventListener('toggle', e => { if (e.target.open && !$('#health-list').childElementCount) runHealthChecks(); });
  $('#admin-new-btn').addEventListener('click', toggleAdminProjectForm);
  $('#admin-search').addEventListener('input', filterAdminRows);
  $('#admin-status-filter').addEventListener('change', filterAdminRows);
}

// Narrow the project list by text (project, client, email) and status.
function filterAdminRows() {
  const q = $('#admin-search').value.trim().toLowerCase();
  const st = $('#admin-status-filter').value;
  const rows = [...document.querySelectorAll('#admin-requests .admin-row')];
  let shown = 0;
  rows.forEach(row => {
    const hit = (!q || row.dataset.search.includes(q)) && (!st || row.dataset.status === st);
    row.hidden = !hit;
    if (hit && !row.classList.contains('is-archived')) shown++;
  });
  const archived = $('#admin-requests .admin-archived');
  if (archived) archived.hidden = (q || st) && !archived.querySelector('.admin-row:not([hidden])');
  const live = rows.filter(r => !r.classList.contains('is-archived')).length;
  $('#admin-filter-count').textContent = q || st ? `${shown} of ${live} shown` : '';
}

// System health. Each check does the real thing (a request, a query, a
// no-op write) and reports what it observed. Things a browser cannot prove
// are listed as NOT TESTED with the reason.
const SB_URL = supabase?.supabaseUrl || '';
const SB_KEY = supabase?.supabaseKey || '';

async function runHealthChecks() {
  const list = $('#health-list');
  const btn = $('#health-run');
  btn.disabled = true; btn.textContent = 'Running…';
  const checks = [
    ['Supabase API', 'Auth service health endpoint responds', async () => {
      const t = performance.now();
      const r = await fetch(`${SB_URL}/auth/v1/health`, { headers: { apikey: SB_KEY } });
      const ms = Math.round(performance.now() - t);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return ['pass', `Responded in ${ms.toLocaleString('en-GB')} ms`];
    }],
    ['Session', 'Your session is verified by the auth server, not just local storage', async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error || new Error('No user');
      return ['pass', `Signed in as ${user.email}`];
    }],
    ['Admin authorisation', 'The database itself confirms admin rights (is_admin())', async () => {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      return data ? ['pass', 'is_admin() returned true'] : ['fail', 'is_admin() returned false for this account'];
    }],
    ['Database reads', 'Admin-only tables can be counted', async () => {
      const count = t => supabase.from(t).select('id', { count: 'exact', head: true });
      const [p, r, c] = await Promise.all([count('profiles'), count('project_requests'), count('contact_submissions')]);
      const err = p.error || r.error || c.error;
      if (err) throw err;
      const n = v => (v ?? 0).toLocaleString('en-GB');
      return ['pass', `${n(p.count)} profiles · ${n(r.count)} requests · ${n(c.count)} enquiries`];
    }],
    ['Database writes', 'No-op update of your own profile goes through RLS and triggers', async () => {
      const { data, error } = await supabase.from('profiles').update({ full_name: me.full_name }).eq('id', me.id).select('id');
      if (error) throw error;
      return data?.length === 1 ? ['pass', '1 row updated (value unchanged)'] : ['fail', `Expected 1 row, got ${data?.length ?? 0}`];
    }],
    ['Public access is blocked', 'A signed-out client cannot read enquiries', async () => {
      const anon = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await anon.from('contact_submissions').select('id').limit(1);
      if (error) return ['pass', `Denied as expected (${error.code || 'permission denied'})`];
      return data?.length ? ['fail', 'Anonymous read returned data'] : ['warn', 'No error, but no rows either; check the table grants'];
    }],
    ['Contact form', 'Anonymous enquiries can be stored', async () =>
      ['untested', 'Not run here: it would create a real enquiry. Verified with a QA submission on 21 Oct 2026, then deleted.']],
    ['Password reset', 'Reset emails link back to this site', async () =>
      ['untested', `Requests use ${location.origin}/reset-password. The allow-list and email delivery live in Supabase and can only be confirmed by completing a reset.`]],
    ['Analytics', 'Visitor analytics', async () => {
      const r = await fetch('/_vercel/insights/script.js', { method: 'HEAD' });
      return r.ok
        ? ['warn', 'Page views: Vercel Web Analytics is recording. Conversion events (enquiries, bookings) are sent but Vercel only stores them on Pro plans. GA4, Google Ads and Meta Pixel are not configured.']
        : ['fail', `Vercel Analytics script returned HTTP ${r.status}`];
    }],
  ];

  list.innerHTML = checks.map(([name, what], i) => healthRow(i, name, what, 'running', 'Checking…')).join('');
  await Promise.all(checks.map(async ([name, what, fn], i) => {
    let state, detail;
    try { [state, detail] = await fn(); }
    catch (err) { state = 'fail'; detail = String(err?.message || err); } // admins need the real error here
    $(`#health-${i}`).outerHTML = healthRow(i, name, what, state, detail);
  }));
  $('#health-meta').textContent = `Last run ${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`;
  btn.disabled = false; btn.textContent = 'Run again';
}

function healthRow(i, name, what, state, detail) {
  const LABEL = { pass: 'Pass', warn: 'Warning', fail: 'Fail', untested: 'Not tested', running: 'Running' };
  return `
    <div class="health-row" id="health-${i}">
      <span class="health-badge h-${state}">${LABEL[state]}</span>
      <div class="health-text">
        <div class="health-name">${esc(name)}</div>
        <div class="health-what">${esc(what)}</div>
      </div>
      <div class="health-detail">${esc(detail)}</div>
    </div>`;
}

async function loadAdminRequests() {
  const wrap = $('#admin-requests');
  const { data: reqs, error } = await supabase
    .from('project_requests').select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) { wrap.innerHTML = `<p class="portal-empty">${esc(friendly(error))}</p>`; return; }

  const live = (reqs || []).filter(r => !r.archived);
  const count = f => live.filter(f).length;
  renderStat('active',   count(r => ['reviewing','discovery','design','development','optimization'].includes(r.status)), 'Active projects');
  renderStat('feedback', count(r => r.status === 'feedback'), 'Awaiting feedback');
  renderStat('new',      count(r => r.status === 'new'), 'New requests');
  renderStat('done',     count(r => ['launched','completed'].includes(r.status)), 'Launched or completed');
  if (!reqs?.length) { wrap.innerHTML = `<p class="portal-empty">No projects yet. Use “New project” to set one up for a client.</p>`; return; }

  const ids = reqs.map(r => r.id);
  const { data: milestones } = await supabase.from('project_milestones').select('*').in('request_id', ids).order('position').order('created_at');
  const msByReq = groupBy(milestones || [], 'request_id');

  const archived = reqs.filter(r => r.archived);
  wrap.innerHTML = live.map(r => adminRow(r, msByReq[r.id] || [])).join('') +
    (archived.length ? `<details class="admin-archived"><summary>Archived projects (${archived.length})</summary>${archived.map(r => adminRow(r, msByReq[r.id] || [])).join('')}</details>` : '');
  reqs.forEach(r => wireAdminRow(r));
  $('#admin-filter').hidden = reqs.length < 2;
  filterAdminRows();
}

function wireAdminRow(r) {
  $(`#edit-${r.id}`)?.addEventListener('submit', e => saveProject(e, r));
  $(`#postform-${r.id}`)?.addEventListener('submit', e => postUpdate(e, r.id));
  $(`#msform-${r.id}`)?.addEventListener('submit', e => addMilestone(e, r.id));
  document.querySelectorAll(`[data-ms-of="${r.id}"]`).forEach(cb => cb.addEventListener('change', () => toggleMilestone(cb, r.id)));
  $(`#arch-${r.id}`)?.addEventListener('click', () => setArchived(r, !r.archived));
  $(`#del-${r.id}`)?.addEventListener('click', () => deleteRequest(r.id, r.project_name));
}

function rowNote(id, msg, ok) {
  const el = $(`#note-${id}`);
  if (!el) return;
  el.textContent = msg;
  el.className = 'row-note ' + (ok ? 'ok' : 'err');
}

async function loadAdminLeads() {
  const wrap = $('#admin-leads');
  const { data: leads, error } = await supabase
    .from('contact_submissions').select('id, name, email, company, service, message, source, created_at')
    .order('created_at', { ascending: false }).limit(100);

  if (error) { wrap.innerHTML = `<p class="portal-empty">${esc(friendly(error))}</p>`; return; }
  renderStat('leads', leads.length, 'Website Enquiries');
  if (!leads.length) { wrap.innerHTML = `<p class="portal-empty">No enquiries yet.</p>`; return; }

  wrap.innerHTML = leads.map(l => `
    <div class="admin-row">
      <div class="admin-row-head">
        <div>
          <div class="req-name">${esc(l.name)}${l.company ? ' · ' + esc(l.company) : ''}</div>
          <div class="admin-meta">${esc(l.service || 'No service selected')} · ${fmtDate(l.created_at)}</div>
          <div class="admin-contact"><a href="mailto:${esc(l.email)}" class="lead-pill">✉ ${esc(l.email)}</a></div>
        </div>
      </div>
      <p class="req-desc" style="white-space:pre-wrap">${esc(l.message)}</p>
    </div>`).join('');
}

async function loadAdminUsers() {
  const wrap = $('#admin-users');
  const { data: users, error } = await supabase
    .from('profiles').select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) { wrap.innerHTML = `<p class="portal-empty">${esc(friendly(error))}</p>`; return; }
  if (!users?.length) { wrap.innerHTML = `<p class="portal-empty">No clients yet.</p>`; return; }

  renderStat('clients', users.filter(u => u.role !== 'admin').length, 'Clients');

  wrap.innerHTML = `
    <div class="admin-users-table">
      <div class="aut-head"><span>Name</span><span>Email</span><span>Role</span><span>Joined</span></div>
      ${users.map(u => `
        <div class="aut-row">
          <span data-l="Name">${esc(u.full_name || '—')}</span>
          <span data-l="Email"><a href="mailto:${esc(u.email)}">${esc(u.email)}</a></span>
          <span data-l="Role"><span class="role-chip ${u.role === 'admin' ? 'admin' : ''}">${esc(u.role)}</span></span>
          <span data-l="Joined">${fmtDate(u.created_at)}</span>
        </div>`).join('')}
    </div>`;
}

function renderStat(key, value, label) {
  const host = $('#admin-stats');
  if (!host) return;
  let tile = $(`#stat-${key}`);
  if (!tile) {
    tile = document.createElement('div');
    tile.id = `stat-${key}`;
    tile.className = 'admin-stat-tile';
    host.appendChild(tile);
  }
  tile.innerHTML = `<div class="ast-num">${value}</div><div class="ast-label">${label}</div>`;
}

function adminRow(r, milestones) {
  const who   = r.profiles?.full_name || r.profiles?.email || 'Unknown client';
  const email = r.profiles?.email || '';
  return `
    <div class="admin-row${r.archived ? ' is-archived' : ''}" data-status="${esc(r.status)}" data-search="${esc([r.project_name, who, email, r.company].filter(Boolean).join(' ').toLowerCase())}">
      <div class="admin-row-head">
        <div>
          <div class="req-name">${esc(r.project_name)}</div>
          <div class="admin-meta">${esc(who)}${r.company ? ' · ' + esc(r.company) : ''} · ${esc(r.service_type)}${r.budget_range ? ' · ' + esc(r.budget_range) : ''} · created ${fmtDate(r.created_at)}</div>
          <div class="admin-contact">
            ${email ? `<a href="mailto:${esc(email)}" class="lead-pill">✉ ${esc(email)}</a>` : ''}
            ${r.phone ? `<a href="tel:${esc(String(r.phone).replace(/[^\d+]/g, ''))}" class="lead-pill">☎ ${esc(r.phone)}</a>` : ''}
          </div>
        </div>
        <div class="admin-row-status">
          ${statusPill(r.status)}
          ${r.progress != null ? `<span class="admin-pct">${r.progress}% delivered</span>` : ''}
        </div>
      </div>
      ${r.description ? `<p class="req-desc">${esc(r.description)}</p>` : ''}

      <form id="edit-${r.id}" class="admin-edit">
        <label>Status
          <select name="status">${ALL_STATUSES.map(st => `<option value="${st}" ${st === r.status ? 'selected' : ''}>${PHASE_LABEL[st]}</option>`).join('')}</select>
        </label>
        <label>Progress %
          <input name="progress" type="number" min="0" max="100" step="5" inputmode="numeric" value="${r.progress ?? ''}" placeholder="Not set">
        </label>
        <label>Start date
          <input name="start_date" type="date" value="${r.start_date ?? ''}">
        </label>
        <label>Target date
          <input name="target_date" type="date" value="${r.target_date ?? ''}">
        </label>
        <button type="submit" class="btn-primary btn-sm">Save changes</button>
      </form>

      <div class="admin-ms">
        <div class="req-updates-label">Milestones</div>
        ${milestones.length ? `<ul class="ms-list">${milestones.map(m => `
          <li><label class="ms-item"><input type="checkbox" data-ms-of="${r.id}" data-ms="${m.id}" ${m.done ? 'checked' : ''}>
            <span>${esc(m.title)}</span>${m.due_date ? `<span class="ms-due">due ${fmtDate(m.due_date)}</span>` : ''}</label></li>`).join('')}</ul>`
          : '<p class="ru-empty">No milestones yet.</p>'}
        <form id="msform-${r.id}" class="admin-post">
          <input type="text" name="title" placeholder="Add a milestone, e.g. Homepage design" maxlength="120" required>
          <input type="date" name="due" aria-label="Milestone due date">
          <button type="submit" class="btn-ghost btn-sm">Add</button>
        </form>
      </div>

      <div class="admin-controls">
        <form id="postform-${r.id}" class="admin-post">
          <input type="text" name="msg" placeholder="Post an update for the client…" maxlength="500" required>
          <label class="admin-internal" title="Internal notes are hidden from the client">
            <input type="checkbox" name="internal"> Internal
          </label>
          <button type="submit" class="btn-primary btn-sm">Post</button>
        </form>
        <button class="btn-ghost btn-sm" id="arch-${r.id}" type="button">${r.archived ? 'Restore' : 'Archive'}</button>
        <button class="btn-del" id="del-${r.id}" type="button" title="Delete this project">Delete</button>
      </div>
      <p class="row-note" id="note-${r.id}" role="status" aria-live="polite"></p>
    </div>`;
}

async function saveProject(e, r) {
  e.preventDefault();
  const f = e.target.elements;
  const progress = f.progress.value === '' ? null : Math.max(0, Math.min(100, Math.round(+f.progress.value)));
  const patch = {
    status: f.status.value,
    progress,
    start_date: f.start_date.value || null,
    target_date: f.target_date.value || null,
  };
  if (patch.start_date && patch.target_date && patch.target_date < patch.start_date) return rowNote(r.id, 'The target date can’t be before the start date.', false);
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  const { error } = await supabase.from('project_requests').update(patch).eq('id', r.id);
  btn.disabled = false;
  if (error) return rowNote(r.id, friendly(error), false);
  rowNote(r.id, 'Saved. The client’s history has been updated.', true);
  setTimeout(loadAdminRequests, 900);
}

async function addMilestone(e, id) {
  e.preventDefault();
  const f = e.target.elements;
  const title = f.title.value.trim();
  if (!title) return;
  const { error } = await supabase.from('project_milestones').insert({ request_id: id, title, due_date: f.due.value || null, position: Date.now() % 30000 });
  if (error) return rowNote(id, friendly(error), false);
  loadAdminRequests();
}

async function toggleMilestone(cb, id) {
  cb.disabled = true;
  const { error } = await supabase.from('project_milestones').update({ done: cb.checked }).eq('id', cb.dataset.ms);
  cb.disabled = false;
  if (error) { cb.checked = !cb.checked; return rowNote(id, friendly(error), false); }
  rowNote(id, cb.checked ? 'Milestone completed and logged for the client.' : 'Milestone reopened.', true);
}

async function setArchived(r, archived) {
  const { error } = await supabase.from('project_requests').update({ archived }).eq('id', r.id);
  if (error) return rowNote(r.id, friendly(error), false);
  loadAdminRequests();
}

async function postUpdate(e, id) {
  e.preventDefault();
  const input = e.target.elements.msg;
  const internal = e.target.elements.internal?.checked || false;
  const msg = input.value.trim();
  if (!msg) return;
  const { error } = await supabase.from('request_updates').insert({
    request_id: id, message: msg, created_by: me.id, is_internal: internal,
  });
  if (error) return rowNote(id, friendly(error), false);
  input.value = '';
  if (e.target.elements.internal) e.target.elements.internal.checked = false;
  rowNote(id, internal ? 'Internal note saved (hidden from the client).' : 'Update published to the client.', true);
}

async function deleteRequest(id, name) {
  if (!confirm(`Delete "${name}"? This permanently removes it, its milestones and its history. Archive it instead if you may need it later.`)) return;
  const { error } = await supabase.from('project_requests').delete().eq('id', id);
  if (error) return rowNote(id, friendly(error), false);
  loadAdminRequests();
}

// New project, set up by an admin for a client
async function toggleAdminProjectForm() {
  const panel = $('#admin-new-panel');
  if (!panel.hidden) { panel.hidden = true; panel.innerHTML = ''; return; }
  panel.hidden = false;
  panel.innerHTML = '<div class="spinner"></div>';
  const { data: clients, error } = await supabase.from('profiles').select('id, full_name, email, role').order('full_name');
  if (error) { panel.innerHTML = `<p class="portal-empty">${esc(friendly(error))}</p>`; return; }
  const options = (clients || []).filter(c => c.role !== 'admin');
  if (!options.length) {
    panel.innerHTML = `<div class="portal-empty-card"><h3>No client accounts yet</h3><p>Clients appear here once they have signed up at <code>/signup</code> and confirmed their email.</p></div>`;
    return;
  }
  panel.innerHTML = `
    <form id="admin-new-form" class="req-form">
      <h3 class="req-form-title">Set up a project for a client</h3>
      <div class="rf-grid">
        <label>Client
          <select id="an-client" required><option value="">Choose a client…</option>
            ${options.map(c => `<option value="${c.id}">${esc(c.full_name || c.email)}${c.full_name ? ' · ' + esc(c.email) : ''}</option>`).join('')}
          </select>
        </label>
        <label>Project name
          <input id="an-name" type="text" required maxlength="120" placeholder="e.g. Website redesign">
        </label>
        <label>Service
          <select id="an-service" required>
            <option>Web Design</option><option>Web Development</option><option>Brand Identity</option>
            <option>CRM &amp; Business Systems</option><option>SEO &amp; Growth</option><option>Other</option>
          </select>
        </label>
        <label>Status
          <select id="an-status">${ALL_STATUSES.map(st => `<option value="${st}" ${st === 'discovery' ? 'selected' : ''}>${PHASE_LABEL[st]}</option>`).join('')}</select>
        </label>
        <label>Start date <input id="an-start" type="date"></label>
        <label>Target date <input id="an-target" type="date"></label>
      </div>
      <label>Description (visible to the client)
        <textarea id="an-desc" rows="3" maxlength="2000" placeholder="Scope and goals in a sentence or two."></textarea>
      </label>
      <div class="rf-actions">
        <button type="button" class="btn-ghost" id="an-cancel">Cancel</button>
        <button type="submit" class="btn-primary">Create project</button>
      </div>
      <div id="an-note" class="auth-note" style="display:none" role="status" aria-live="polite"></div>
    </form>`;
  $('#an-cancel').addEventListener('click', toggleAdminProjectForm);
  $('#admin-new-form').addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#an-note');
    const say = (m, ok) => { note.style.display = 'block'; note.className = 'auth-note ' + (ok ? 'ok' : 'err'); note.textContent = m; };
    const row = {
      user_id: $('#an-client').value,
      project_name: $('#an-name').value.trim(),
      service_type: $('#an-service').value,
      status: $('#an-status').value,
      start_date: $('#an-start').value || null,
      target_date: $('#an-target').value || null,
      description: $('#an-desc').value.trim() || null,
    };
    if (!row.user_id || !row.project_name) return say('Choose a client and give the project a name.');
    if (row.start_date && row.target_date && row.target_date < row.start_date) return say('The target date can’t be before the start date.');
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    const { error } = await supabase.from('project_requests').insert(row);
    btn.disabled = false;
    if (error) return say(friendly(error));
    toggleAdminProjectForm();
    loadAdminRequests();
  });
}

// Helpers
function phaseTracker(r) {
  const status = r.status;
  // Off the main path: shown as a clear flag with what happens next, not a
  // position on the bar.
  if (OFF_PATH.includes(status)) {
    return `<p class="phase-flag-note ${status}">${FLAG_NOTE[status]}</p>`;
  }
  const done = status === 'completed' ? PHASES.length : PHASES.indexOf(status);
  const current = PHASES.indexOf(status);
  return `
    <div class="phase-pct-row">
      <span class="phase-pct-label">${status === 'completed' ? 'All stages complete' : `Current stage: <strong>${PHASE_LABEL[status]}</strong>`}</span>
      ${r.progress != null ? `<span class="phase-pct-val" title="Share of the agreed scope delivered">${r.progress}%</span>` : ''}
    </div>
    ${r.progress != null ? `<div class="phase-pct-bar" role="progressbar" aria-valuenow="${r.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="Scope delivered"><span style="width:${r.progress}%"></span></div>` : ''}
    <div class="phase-track">
      ${PHASES.map((ph, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : (status === 'completed' ? 'done' : '');
        return `
          <div class="phase-node ${state}">
            <div class="phase-dot"></div>
            <div class="phase-label">${PHASE_LABEL[ph]}</div>
          </div>
          ${i < PHASES.length - 1 ? `<div class="phase-line ${i < done ? 'filled' : ''}"></div>` : ''}`;
      }).join('')}
    </div>`;
}

const OFF_PATH = ['on_hold', 'declined', 'feedback', 'new', 'reviewing'];
const FLAG_NOTE = {
  new: "We've received your request and will reply within one working day.",
  reviewing: "We're reviewing your brief and will be in touch about next steps.",
  feedback: 'Something is ready for your review. Reply to our latest email, or write to <a href="mailto:teams@ivorystudios.io">teams@ivorystudios.io</a>, so we can move to the next step.',
  on_hold: 'This project is paused. Write to <a href="mailto:teams@ivorystudios.io">teams@ivorystudios.io</a> whenever you’re ready to pick it up again.',
  declined: 'We weren’t able to take this project on. Write to <a href="mailto:teams@ivorystudios.io">teams@ivorystudios.io</a> if you’d like to talk it through.',
};

function projectFacts(r, milestones) {
  const facts = [];
  if (r.start_date) facts.push(['Started', fmtDate(r.start_date)]);
  if (r.target_date) facts.push(['Target delivery', fmtDate(r.target_date)]);
  if (milestones.length) facts.push(['Milestones', `${milestones.filter(m => m.done).length} of ${milestones.length} complete`]);
  // On the main path the progress bar above already shows the percentage.
  if (r.progress != null && OFF_PATH.includes(r.status)) facts.push(['Scope delivered', `${r.progress}%`]);
  return facts.length ? `<dl class="proj-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '';
}

function milestoneList(milestones) {
  if (!milestones.length) return '';
  return `<div class="client-ms"><div class="req-updates-label">Milestones</div><ul class="ms-list">${milestones.map(m => `
    <li class="ms-item ${m.done ? 'is-done' : ''}"><span class="ms-check" aria-hidden="true">${m.done ? '✓' : ''}</span>
      <span>${esc(m.title)}<span class="sr-only">${m.done ? ' (complete)' : ' (to do)'}</span></span>
      ${m.done && m.done_at ? `<span class="ms-due">done ${fmtDate(m.done_at)}</span>` : m.due_date ? `<span class="ms-due">due ${fmtDate(m.due_date)}</span>` : ''}</li>`).join('')}</ul></div>`;
}

function statusPill(status) {
  return `<span class="status-pill s-${status}">${PHASE_LABEL[status] || status}</span>`;
}

function groupBy(arr, key) {
  return arr.reduce((acc, x) => { (acc[x[key]] ||= []).push(x); return acc; }, {});
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    // Plain dates (YYYY-MM-DD) are calendar days: format them in UTC so they
    // never shift a day in the viewer's timezone.
    const plain = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    return new Date(plain ? iso + 'T00:00:00Z' : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(plain ? { timeZone: 'UTC' } : {}) });
  } catch { return ''; }
}

function isSchemaMissing(err) {
  // PGRST205 = table not in schema cache; 42P01 = undefined_table
  return err && (err.code === 'PGRST205' || err.code === '42P01' ||
    /does not exist|schema cache/i.test(err.message || ''));
}

function notConfigured() {
  return `
    <div class="portal-empty-card">
      <div class="pe-icon">⚙</div>
      <h3>Portal not connected yet</h3>
      <p>Add your Supabase URL and publishable key in <code>assets/js/supabase.js</code>,
         then run <code>supabase/schema.sql</code> to switch the client portal on.</p>
      <a href="/" class="btn-primary">← Back home</a>
    </div>`;
}

function schemaNeeded() {
  return `
    <div class="portal-empty-card">
      <div class="pe-icon">⚙</div>
      <h3>One step left: run the database setup</h3>
      <p>You're signed in, but the project tables don't exist yet. Open your
         Supabase project → SQL Editor → paste <code>supabase/schema.sql</code> → Run.
         Then refresh this page.</p>
      <a href="/" class="btn-primary">← Back home</a>
    </div>`;
}
