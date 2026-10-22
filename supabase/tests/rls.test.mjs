import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
const schema = fs.readFileSync(new URL('../schema.sql', import.meta.url), 'utf8');
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (name, cond, extra='') => { cond ? pass++ : fail++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : '  ' + extra)); };

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
`);
await db.exec(schema);
try { await db.exec(schema); ok('schema is idempotent (2nd run)', true); } catch (e) { ok('schema is idempotent (2nd run)', false, e.message); }

const as = async (role, uid, sql, params) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid || ''}', false); set role ${role};`);
  try { return { rows: (await db.query(sql, params)).rows }; }
  catch (e) { return { err: e.message }; }
  finally { await db.exec('reset role'); }
};

const A = '11111111-1111-1111-1111-111111111111', B = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users(id,email,raw_user_meta_data) values ('${A}','a@x.com','{"full_name":"Alice"}'),('${B}','b@x.com','{}')`);
const prof = (await db.query('select id, role, full_name from public.profiles order by email')).rows;
ok('signup trigger creates client profiles', prof.length === 2 && prof.every(p => p.role === 'client') && prof[0].full_name === 'Alice');

let r = await as('authenticated', A, `update public.profiles set role='admin', email='evil@x.com' where id='${A}' returning role, email`);
ok('client cannot self-promote / change email', r.rows?.[0]?.role === 'client' && r.rows?.[0]?.email === 'a@x.com', JSON.stringify(r));

r = await as('authenticated', A, `insert into public.project_requests(user_id,project_name,service_type,status,priority) values ('${A}','Site','Web Design','launched','urgent') returning id,status,priority`);
ok('client insert forced to new/normal', r.rows?.[0]?.status === 'new' && r.rows?.[0]?.priority === 'normal', JSON.stringify(r));
const reqId = r.rows?.[0]?.id;

r = await as('authenticated', A, `update public.project_requests set status='completed', priority='urgent', description='hi' where id='${reqId}' returning status, priority, description`);
ok('client cannot change own status/priority (can edit description)', r.rows?.[0]?.status === 'new' && r.rows?.[0]?.priority === 'normal' && r.rows?.[0]?.description === 'hi', JSON.stringify(r));

r = await as('authenticated', A, `insert into public.project_requests(user_id,project_name,service_type) values ('${B}','x','y')`);
ok('client cannot create request for another user', !!r.err, JSON.stringify(r));

r = await as('authenticated', B, `select id from public.project_requests`);
ok('client B cannot see client A requests', r.rows?.length === 0, JSON.stringify(r));
r = await as('authenticated', A, `select id from public.project_requests`);
ok('client A sees own request', r.rows?.length === 1);

r = await as('anon', null, `select * from public.admin_requests_view`);
ok('anon cannot read admin_requests_view', !!r.err, JSON.stringify(r));
r = await as('authenticated', B, `select * from public.admin_requests_view`);
ok('non-admin sees 0 rows in admin_requests_view (security_invoker)', r.rows?.length === 0, JSON.stringify(r));
r = await as('anon', null, `select * from public.profiles`);
ok('anon cannot read profiles', !!r.err);
r = await as('anon', null, `select * from public.project_requests`);
ok('anon cannot read project_requests', !!r.err);

r = await as('anon', null, `insert into public.contact_submissions(name,email,message) values ('Ann','ann@x.com','Hello there, I need a site')`);
ok('anon can submit contact form', !r.err, JSON.stringify(r));
r = await as('anon', null, `insert into public.contact_submissions(name,email,message) values ('Ann','not-an-email','Hello there, I need a site')`);
ok('invalid email rejected', !!r.err);
r = await as('anon', null, `insert into public.contact_submissions(name,email,message) values ('A','a@x.com','short')`);
ok('too-short name/message rejected', !!r.err);
r = await as('anon', null, `insert into public.contact_submissions(name,email,message) values ('Ann','ann@x.com',repeat('x',5000))`);
ok('oversized message rejected', !!r.err);
let blocked = false;
for (let i = 0; i < 4; i++) { r = await as('anon', null, `insert into public.contact_submissions(name,email,message) values ('Ann','ann@x.com','Hello there, I need a site')`); if (r.err) blocked = true; }
ok('per-email flood guard trips (max 3/hour)', blocked);
r = await as('anon', null, `select * from public.contact_submissions`);
ok('anon cannot read contact_submissions', !!r.err);

await db.exec(`reset role; insert into public.newsletter(email) values ('n@x.com')`);
r = await as('anon', null, `update public.newsletter set status='unsubscribed'`);
ok('anon cannot mass-unsubscribe newsletter', !!r.err, JSON.stringify(r));
r = await as('anon', null, `insert into public.newsletter(email) values ('new@x.com')`);
ok('anon can subscribe', !r.err, JSON.stringify(r));

r = await as('authenticated', B, `select * from public.contact_submissions`);
ok('non-admin cannot read contact_submissions', r.rows?.length === 0, JSON.stringify(r));
r = await as('authenticated', B, `insert into public.request_updates(request_id,message) values ('${reqId}','hi')`);
ok('client cannot post updates', !!r.err);

await db.exec(`update public.profiles set role='admin' where id='${B}'`);   // as postgres = SQL editor
ok('SQL-editor role can promote admin', (await db.query(`select role from public.profiles where id='${B}'`)).rows[0].role === 'admin');
r = await as('authenticated', B, `select id from public.project_requests`);
ok('admin sees all requests', r.rows?.length === 1);
r = await as('authenticated', B, `select * from public.admin_requests_view`);
ok('admin reads admin_requests_view', r.rows?.length === 1, JSON.stringify(r));
r = await as('authenticated', B, `select * from public.contact_submissions`);
ok('admin reads contact submissions', (r.rows?.length ?? 0) >= 3, JSON.stringify(r));
r = await as('authenticated', B, `update public.project_requests set status='design' where id='${reqId}' returning status`);
ok('admin can advance status', r.rows?.[0]?.status === 'design', JSON.stringify(r));
r = await as('authenticated', B, `insert into public.request_updates(request_id,message,is_internal) values ('${reqId}','secret',true),('${reqId}','public',false)`);
ok('admin can post updates', !r.err, JSON.stringify(r));
r = await as('authenticated', A, `select message from public.request_updates order by created_at`);
ok('client sees public updates only (not internal)', r.rows?.length === 2 && !r.rows.some(x => x.message === 'secret') && r.rows.some(x => x.message === 'public'), JSON.stringify(r));
ok('status change is logged automatically for the client', r.rows?.some(x => x.message === 'Status changed to Design.'), JSON.stringify(r));
r = await as('authenticated', A, `delete from public.project_requests where id='${reqId}' returning id`);
ok('client cannot delete requests', (r.rows?.length ?? 0) === 0);

// Backdating created_at must not get around the per-email rate limit.
for (let i = 0; i < 3; i++) {
  await as('anon', null, `insert into public.contact_submissions(name,email,message,created_at) values ('Bo','bo@x.com','Backdated message ${i}','2000-01-01')`);
}
r = await as('anon', null, `insert into public.contact_submissions(name,email,message,created_at) values ('Bo','bo@x.com','Backdated message 4','2000-01-01')`);
ok('backdated created_at cannot bypass flood guard', !!r.err, JSON.stringify(r));
r = await as('authenticated', A, `insert into public.project_requests(user_id,project_name,service_type,created_at) values ('${A}','Old','Web Design','2000-01-01') returning created_at`);
ok('client cannot backdate a request', r.rows && new Date(r.rows[0].created_at).getFullYear() > 2000, JSON.stringify(r));

// Project tracking (admin = B, clients = A and C)
const C = '33333333-3333-3333-3333-333333333333';
await db.exec(`reset role; insert into auth.users(id,email) values ('${C}','c@x.com')`);

r = await as('authenticated', B, `insert into public.project_requests(user_id,project_name,service_type,status,progress,start_date,target_date) values ('${A}','Rebrand','Brand Identity','design',40,'2026-11-01','2026-12-15') returning id,status,progress,target_date`);
ok('admin can create a project for a client', r.rows?.[0]?.status === 'design' && r.rows?.[0]?.progress === 40, JSON.stringify(r));
const projId = r.rows?.[0]?.id;
r = await as('authenticated', A, `select message from public.request_updates where request_id='${projId}'`);
ok('client sees "Project set up" entry', r.rows?.some(x => /set up/.test(x.message)), JSON.stringify(r));

r = await as('authenticated', C, `select id from public.project_requests where id='${projId}'`);
ok('other client cannot read the project by id', r.rows?.length === 0, JSON.stringify(r));
r = await as('authenticated', C, `update public.project_requests set description='hacked' where id='${projId}' returning id`);
ok('other client cannot modify the project by id', (r.rows?.length ?? 0) === 0, JSON.stringify(r));
r = await as('authenticated', C, `insert into public.project_requests(user_id,project_name,service_type) values ('${A}','Fake','x')`);
ok('client cannot create a project for someone else', !!r.err, JSON.stringify(r));

r = await as('authenticated', A, `insert into public.project_requests(user_id,project_name,service_type,progress,target_date,archived) values ('${A}','Mine','Web Design',99,'2026-01-01',true) returning progress,target_date,archived`);
ok('client cannot set progress/target/archived on insert', r.rows?.[0]?.progress === null && r.rows?.[0]?.target_date === null && r.rows?.[0]?.archived === false, JSON.stringify(r));
r = await as('authenticated', A, `update public.project_requests set progress=100, target_date='2026-01-01' where id='${projId}' returning progress`);
ok('client cannot change progress/target on admin project', (r.rows?.length ?? 0) === 0 || r.rows[0].progress === 40, JSON.stringify(r));

r = await as('authenticated', B, `update public.project_requests set status='feedback', progress=60, target_date='2026-12-20' where id='${projId}' returning status`);
ok('admin can set "awaiting feedback", progress and target date', r.rows?.[0]?.status === 'feedback', JSON.stringify(r));
r = await as('authenticated', A, `select message from public.request_updates where request_id='${projId}'`);
const msgs = (r.rows || []).map(x => x.message);
ok('status, progress and target-date changes are logged', msgs.some(m => /Awaiting your feedback/.test(m)) && msgs.some(m => /60%/.test(m)) && msgs.some(m => /20 Dec 2026/.test(m)), JSON.stringify(msgs));
r = await as('authenticated', B, `update public.project_requests set target_date='2026-10-01' where id='${projId}'`);
ok('target before start date is rejected', !!r.err, JSON.stringify(r));

r = await as('authenticated', B, `insert into public.project_milestones(request_id,title,due_date,position) values ('${projId}','Logo concepts','2026-11-10',1),('${projId}','Guidelines','2026-12-01',2) returning id`);
ok('admin can add milestones', r.rows?.length === 2, JSON.stringify(r));
const msId = r.rows?.[0]?.id;
r = await as('authenticated', A, `select title from public.project_milestones where request_id='${projId}'`);
ok('owner client sees milestones', r.rows?.length === 2, JSON.stringify(r));
r = await as('authenticated', C, `select title from public.project_milestones`);
ok('other client sees no milestones', r.rows?.length === 0, JSON.stringify(r));
r = await as('authenticated', A, `insert into public.project_milestones(request_id,title) values ('${projId}','Sneaky')`);
ok('client cannot add milestones', !!r.err, JSON.stringify(r));
r = await as('authenticated', A, `update public.project_milestones set done=true where id='${msId}' returning id`);
ok('client cannot tick milestones', (r.rows?.length ?? 0) === 0, JSON.stringify(r));
r = await as('authenticated', B, `update public.project_milestones set done=true where id='${msId}' returning done_at`);
ok('admin completes milestone, done_at set', !!r.rows?.[0]?.done_at, JSON.stringify(r));
r = await as('authenticated', A, `select message from public.request_updates where message like 'Milestone completed%'`);
ok('milestone completion appears in client history', r.rows?.length === 1, JSON.stringify(r));

r = await as('authenticated', B, `update public.project_requests set user_id='${C}' where id='${projId}' returning id`);
ok('admin can reassign a project', r.rows?.length === 1, JSON.stringify(r));
r = await as('authenticated', A, `select id from public.project_requests where id='${projId}'`);
ok('previous client loses access after reassignment', r.rows?.length === 0, JSON.stringify(r));
r = await as('authenticated', C, `select message, is_internal from public.request_updates where request_id='${projId}'`);
ok('new client sees history but not the internal reassignment note', r.rows?.length > 0 && !r.rows.some(x => x.is_internal), JSON.stringify(r));
r = await as('authenticated', B, `select count(*)::int n from public.request_updates where request_id='${projId}' and is_internal and message like 'Project reassigned%'`);
ok('reassignment is recorded for admins', r.rows?.[0]?.n === 1, JSON.stringify(r));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
