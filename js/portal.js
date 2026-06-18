/* ───────────────────────────────────────────────────────────
   Client portal.
   Clients: see their own requests, submit new ones, watch phases.
   Admin (Ammar): sees every request, advances phases, posts updates.
   What you can read/write is enforced by RLS — this is just the UI.
─────────────────────────────────────────────────────────────── */
import { supabase, isConfigured } from './supabase.js';

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

let me = null;        // profile row
let isAdmin = false;

init();

async function init() {
  if (!isConfigured) {
    $('#portal-root').innerHTML = notConfigured();
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace('login.html'); return; }

  const { data: profile, error: profErr } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single();

  // The tables won't exist until schema.sql has been run — show a
  // clear "finish setup" screen instead of a cryptic error.
  if (profErr && isSchemaMissing(profErr)) {
    $('#portal-user').textContent = session.user.email;
    $('#logout-btn').addEventListener('click', async () => { await supabase.auth.signOut(); location.replace('index.html'); });
    $('#portal-root').innerHTML = schemaNeeded();
    return;
  }

  me = profile || { id: session.user.id, full_name: '', email: session.user.email, role: 'client' };
  isAdmin = me.role === 'admin';

  $('#portal-user').textContent = me.full_name || me.email;
  $('#portal-role').textContent = isAdmin ? 'Admin' : 'Client';
  $('#portal-role').classList.toggle('admin', isAdmin);

  $('#logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.replace('index.html');
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

  if (error) { wrap.innerHTML = `<p class="portal-empty">Couldn't load requests: ${esc(error.message)}</p>`; return; }
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
    note.style.display = 'block'; note.className = 'auth-note err'; note.textContent = error.message; return;
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
        <h1 class="portal-h1">Admin · All Requests</h1>
        <p class="portal-sub">Advance phases and post updates clients see instantly.</p>
      </div>
    </div>
    <div id="admin-requests"><div class="spinner"></div></div>`;
  loadAdminRequests();
}

async function loadAdminRequests() {
  const wrap = $('#admin-requests');
  const { data: reqs, error } = await supabase
    .from('project_requests').select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) { wrap.innerHTML = `<p class="portal-empty">${esc(error.message)}</p>`; return; }
  if (!reqs?.length) { wrap.innerHTML = `<p class="portal-empty">No requests yet.</p>`; return; }

  wrap.innerHTML = reqs.map(adminRow).join('');

  // wire up controls
  reqs.forEach(r => {
    $(`#status-${r.id}`)?.addEventListener('change', e => changeStatus(r.id, e.target.value));
    $(`#postform-${r.id}`)?.addEventListener('submit', e => postUpdate(e, r.id));
  });
}

function adminRow(r) {
  const who = r.profiles?.full_name || r.profiles?.email || 'Unknown';
  return `
    <div class="admin-row">
      <div class="admin-row-head">
        <div>
          <div class="req-name">${esc(r.project_name)}</div>
          <div class="admin-meta">${esc(who)} · ${esc(r.service_type)} · ${esc(r.budget_range || '—')} · ${fmtDate(r.created_at)}</div>
        </div>
        ${statusPill(r.status)}
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
          <button type="submit" class="btn-primary btn-sm">Post</button>
        </form>
      </div>
    </div>`;
}

async function changeStatus(id, status) {
  const { error } = await supabase.from('project_requests').update({ status }).eq('id', id);
  if (error) { alert(error.message); return; }
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
  const msg = input.value.trim();
  if (!msg) return;
  const { error } = await supabase.from('request_updates').insert({
    request_id: id, message: msg, created_by: me.id,
  });
  if (error) { alert(error.message); return; }
  input.value = '';
}

/* ─── Shared bits ───────────────────────────────────────────── */
function phaseTracker(status) {
  // side states don't sit on the line
  if (['on_hold', 'declined'].includes(status)) {
    return `<div class="phase-flag ${status}">${PHASE_LABEL[status]}</div>`;
  }
  const done = status === 'completed' ? PHASES.length : PHASES.indexOf(status);
  const current = PHASES.indexOf(status);
  return `
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
      <a href="index.html" class="btn-primary">← Back home</a>
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
      <a href="index.html" class="btn-primary">← Back home</a>
    </div>`;
}
