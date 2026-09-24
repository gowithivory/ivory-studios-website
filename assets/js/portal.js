/* ───────────────────────────────────────────────────────────
   Client portal.
   Clients: see their own requests, submit new ones, watch phases.
   Admin (Ammar): sees every request, advances phases, posts updates.
   What you can read/write is enforced by RLS — this is just the UI.
─────────────────────────────────────────────────────────────── */
import { supabase, isConfigured, friendly } from './supabase.js';

const $   = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

// The visible journey. Pre/terminal states sit outside the bar.
const PHASES = ['discovery', 'design', 'development', 'optimization', 'launched'];
const PHASE_LABEL = {
  new: 'New', reviewing: 'In Review', discovery: 'Discovery', design: 'Design',
  development: 'Development', optimization: 'Optimization', launched: 'Launched',
  on_hold: 'On Hold', completed: 'Completed', declined: 'Declined',
};
const ALL_STATUSES = Object.keys(PHASE_LABEL);

// Completion percentage shown to the client per stage.
const PHASE_PCT = {
  new: 5, reviewing: 10, discovery: 25, design: 45,
  development: 65, optimization: 85, launched: 95, completed: 100,
  on_hold: null, declined: null,
};

let me = null;        // profile row
let isAdmin = false;

init();

async function init() {
  if (!isConfigured) {
    $('#portal-root').innerHTML = notConfigured();
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace('/login'); return; }

  const { data: profile, error: profErr } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single();

  // The tables won't exist until schema.sql has been run — show a
  // clear "finish setup" screen instead of a cryptic error.
  if (profErr && isSchemaMissing(profErr)) {
    $('#portal-user').textContent = session.user.email;
    $('#logout-btn').addEventListener('click', async () => { await supabase.auth.signOut(); location.replace('/'); });
    $('#portal-root').innerHTML = schemaNeeded();
    return;
  }

  if (profErr && !profile) {
    $('#portal-root').innerHTML = `<div class="portal-empty-card"><h3>Couldn't load your account</h3><p>${esc(friendly(profErr))}</p><a href="/" class="btn-primary">← Back home</a></div>`;
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

/* ─── Client view ───────────────────────────────────────────── */
async function renderClient() {
  const root = $('#portal-root');
  root.innerHTML = `
    <div class="portal-head">
      <div>
        <h1 class="portal-h1">Welcome back${me.full_name ? ', ' + esc(me.full_name.split(' ')[0]) : ''}.</h1>
        <p class="portal-sub">Track every project you've started with us, in real time.</p>
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
  const { data: reqs, error } = await supabase
    .from('project_requests').select('*').order('created_at', { ascending: false });

  if (error) { wrap.innerHTML = `<p class="portal-empty">Couldn't load requests: ${esc(friendly(error))}</p>`; return; }
  if (!reqs?.length) {
    wrap.innerHTML = `
      <div class="portal-empty-card">
        <div class="pe-icon">✦</div>
        <h3>No projects yet</h3>
        <p>Start your first request and we'll take it from there.</p>
      </div>`;
    return;
  }

  // pull updates for all of this client's requests in one round-trip
  const ids = reqs.map(r => r.id);
  const { data: updates } = await supabase
    .from('request_updates').select('*').in('request_id', ids).order('created_at', { ascending: false });
  const byReq = groupBy(updates || [], 'request_id');

  wrap.innerHTML = reqs.map(r => clientCard(r, byReq[r.id] || [])).join('');
}

function clientCard(r, updates) {
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

      ${phaseTracker(r.status)}

      ${r.description ? `<p class="req-desc">${esc(r.description)}</p>` : ''}

      <div class="req-updates">
        <div class="req-updates-label">Activity</div>
        ${updates.length
          ? updates.map(u => `
              <div class="req-update">
                <div class="ru-dot"></div>
                <div>
                  <div class="ru-msg">${esc(u.message)}</div>
                  <div class="ru-time">${u.phase ? esc(PHASE_LABEL[u.phase] || u.phase) + ' · ' : ''}${fmtDate(u.created_at)}</div>
                </div>
              </div>`).join('')
          : `<p class="ru-empty">No updates yet — we'll post here as work progresses.</p>`}
      </div>
    </div>`;
}

/* ─── New-request form ───────────────────────────────────────── */
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

/* ─── Admin view ────────────────────────────────────────────── */
async function renderAdmin() {
  const root = $('#portal-root');
  root.innerHTML = `
    <div class="portal-head">
      <div>
        <h1 class="portal-h1">Admin Dashboard</h1>
        <p class="portal-sub">Advance phases, post updates, and reach leads — all in one place.</p>
      </div>
    </div>
    <div id="admin-stats" class="admin-stats"></div>
    <h2 class="admin-section-title">Project Requests</h2>
    <div id="admin-requests"><div class="spinner"></div></div>
    <h2 class="admin-section-title">Website Enquiries</h2>
    <div id="admin-leads"><div class="spinner"></div></div>
    <h2 class="admin-section-title">All Clients</h2>
    <div id="admin-users"><div class="spinner"></div></div>`;
  loadAdminRequests();
  loadAdminLeads();
  loadAdminUsers();
}

async function loadAdminRequests() {
  const wrap = $('#admin-requests');
  const { data: reqs, error } = await supabase
    .from('project_requests').select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) { wrap.innerHTML = `<p class="portal-empty">${esc(friendly(error))}</p>`; return; }
  if (!reqs?.length) { wrap.innerHTML = `<p class="portal-empty">No requests yet.</p>`; return; }

  // lightweight analytics
  const active = reqs.filter(r => !['new','completed','declined','on_hold'].includes(r.status)).length;
  const done   = reqs.filter(r => r.status === 'completed' || r.status === 'launched').length;
  const fresh  = reqs.filter(r => r.status === 'new').length;
  renderStat('requests', reqs.length, 'Total Requests');
  renderStat('active',   active,      'In Progress');
  renderStat('new',      fresh,       'New / Unread');
  renderStat('done',     done,        'Launched / Done');

  wrap.innerHTML = reqs.map(adminRow).join('');
  reqs.forEach(r => {
    $(`#status-${r.id}`)?.addEventListener('change', e => changeStatus(r.id, e.target.value));
    $(`#postform-${r.id}`)?.addEventListener('submit', e => postUpdate(e, r.id));
    $(`#del-${r.id}`)?.addEventListener('click', () => deleteRequest(r.id, r.project_name));
  });
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

function adminRow(r) {
  const who   = r.profiles?.full_name || 'Unknown';
  const email = r.profiles?.email || '';
  const pct   = PHASE_PCT[r.status];
  return `
    <div class="admin-row">
      <div class="admin-row-head">
        <div>
          <div class="req-name">${esc(r.project_name)}</div>
          <div class="admin-meta">${esc(who)}${r.company ? ' · ' + esc(r.company) : ''} · ${esc(r.service_type)} · ${esc(r.budget_range || '—')} · ${fmtDate(r.created_at)}</div>
          <div class="admin-contact">
            ${email ? `<a href="mailto:${esc(email)}" class="lead-pill">✉ ${esc(email)}</a>` : ''}
            ${r.phone ? `<a href="tel:${esc(String(r.phone).replace(/[^\d+]/g, ''))}" class="lead-pill">☎ ${esc(r.phone)}</a>` : ''}
          </div>
        </div>
        <div class="admin-row-status">
          ${statusPill(r.status)}
          ${pct != null ? `<span class="admin-pct">${pct}% complete</span>` : ''}
        </div>
      </div>
      ${r.description ? `<p class="req-desc">${esc(r.description)}</p>` : ''}
      <div class="admin-controls">
        <label class="admin-ctl">Phase
          <select id="status-${r.id}">
            ${ALL_STATUSES.map(s => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${PHASE_LABEL[s]}</option>`).join('')}
          </select>
        </label>
        <form id="postform-${r.id}" class="admin-post">
          <input type="text" name="msg" placeholder="Post an update for the client…" maxlength="500" required>
          <label class="admin-internal" title="Internal notes are hidden from the client">
            <input type="checkbox" name="internal"> Internal
          </label>
          <button type="submit" class="btn-primary btn-sm">Post</button>
        </form>
        <button class="btn-del" id="del-${r.id}" title="Delete this request">Delete</button>
      </div>
    </div>`;
}

async function changeStatus(id, status) {
  const { error } = await supabase.from('project_requests').update({ status }).eq('id', id);
  if (error) { alert(friendly(error)); return; }
  // auto-log the phase change so the client sees it
  await supabase.from('request_updates').insert({
    request_id: id, phase: status, created_by: me.id,
    message: `Project moved to ${PHASE_LABEL[status]}.`,
  });
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
  if (error) { alert(friendly(error)); return; }
  input.value = '';
  if (e.target.elements.internal) e.target.elements.internal.checked = false;
}

async function deleteRequest(id, name) {
  if (!confirm(`Delete the request "${name}"? This permanently removes it and its updates.`)) return;
  const { error } = await supabase.from('project_requests').delete().eq('id', id);
  if (error) { alert(friendly(error)); return; }
  loadAdminRequests();
}

/* ─── Shared bits ───────────────────────────────────────────── */
function phaseTracker(status) {
  // side states don't sit on the line
  if (['on_hold', 'declined'].includes(status)) {
    return `<div class="phase-flag ${status}">${PHASE_LABEL[status]}</div>`;
  }
  const done = status === 'completed' ? PHASES.length : PHASES.indexOf(status);
  const current = PHASES.indexOf(status);
  const pct = PHASE_PCT[status] ?? 0;
  return `
    <div class="phase-pct-row">
      <span class="phase-pct-label">Current stage — <strong>${PHASE_LABEL[status]}</strong></span>
      <span class="phase-pct-val">${pct}%</span>
    </div>
    <div class="phase-pct-bar"><span style="width:${pct}%"></span></div>
    <div class="phase-track">
      ${PHASES.map((ph, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : (status === 'completed' ? 'done' : '');
        return `
          <div class="phase-node ${state}">
            <div class="phase-dot"></div>
            <div class="phase-label">${PHASE_LABEL[ph]}</div>
          </div>
          ${i < PHASES.length - 1 ? `<div class="phase-line ${i < (done) ? 'filled' : ''}"></div>` : ''}`;
      }).join('')}
    </div>`;
}

function statusPill(status) {
  return `<span class="status-pill s-${status}">${PHASE_LABEL[status] || status}</span>`;
}

function groupBy(arr, key) {
  return arr.reduce((acc, x) => { (acc[x[key]] ||= []).push(x); return acc; }, {});
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
      <p>Add your Supabase URL and anon key in <code>js/supabase.js</code>,
         then run <code>supabase/schema.sql</code> to switch the client portal on.</p>
      <a href="/" class="btn-primary">← Back home</a>
    </div>`;
}

function schemaNeeded() {
  return `
    <div class="portal-empty-card">
      <div class="pe-icon">⚙</div>
      <h3>One step left — run the database setup</h3>
      <p>You're signed in, but the project tables don't exist yet. Open your
         Supabase project → SQL Editor → paste <code>supabase/schema.sql</code> → Run.
         Then refresh this page.</p>
      <a href="/" class="btn-primary">← Back home</a>
    </div>`;
}
