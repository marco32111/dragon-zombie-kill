(function () {
'use strict';
const EP = window.EP;

/* ================= utilities ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseKey = k => { const [y, m, d] = String(k).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const todayKey = () => keyOf(new Date());
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const fmtDate = k => parseKey(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayIndex = () => Math.floor(parseKey(todayKey()).getTime() / 864e5);
const pick = arr => arr[((dayIndex() % arr.length) + arr.length) % arr.length];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const AREA_COLOR = { comm: 'var(--accent)', safety: 'var(--safety)', eeo: 'var(--eeo)', strategy: 'var(--amber)', ops: 'var(--good)', vocab: 'var(--muted)' };
const AREA_NAME = { comm: 'Communication', safety: 'Safety', eeo: 'EEO', strategy: 'Strategy & case', ops: 'Operations & KPIs', vocab: 'Executive vocabulary' };
const AREA_TARGET = { comm: 600, safety: 400, eeo: 300, strategy: 400, ops: 300, vocab: 200 };
const CAT_AREA = { Safety: 'safety', EEO: 'eeo', Case: 'strategy', Strategy: 'strategy', Operations: 'ops', 'First 90 days': 'strategy' };

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }
function copyText(text) {
  try { navigator.clipboard.writeText(text).then(() => toast('Copied'), () => toast('Select the text and copy it')); }
  catch (e) { toast('Select the text and copy it'); }
}

/* ================= state & persistence ================= */
const DEFAULT = () => ({
  v: 1, start: todayKey(), goal: addDays(todayKey(), 182), interview: '',
  xp: 0, xpByDay: {}, area: { comm: 0, safety: 0, eeo: 0, strategy: 0, ops: 0, vocab: 0 },
  days: {}, items: {}, best: {}, milestones: {}, actions: {}, custom: [], closing: ''
});
let S = DEFAULT();
let answers = [];
let COL = null;
const LS = 'executive-path.v1';

function normalize(o) { const d = DEFAULT(); const s = Object.assign(d, o || {}); s.area = Object.assign(DEFAULT().area, s.area || {}); return s; }
function loadLocal() {
  try { const raw = localStorage.getItem(LS); if (raw) { const o = JSON.parse(raw); S = normalize(o.S); answers = Array.isArray(o.answers) ? o.answers : []; } } catch (e) { /* storage unavailable */ }
}
function saveLocal() { try { localStorage.setItem(LS, JSON.stringify({ S, answers })); } catch (e) { /* ignore */ } }
let saveT = null, writing = false, again = false;
function save() { saveLocal(); clearTimeout(saveT); saveT = setTimeout(saveRemote, 1500); }
async function saveRemote() {
  if (!COL) return;
  if (writing) { again = true; return; }
  writing = true;
  try { await COL.doc('progress').set(JSON.parse(JSON.stringify(S))); setSync(true, 'Synced to your account'); }
  catch (e) { setSync(false, 'Saved on this device only'); }
  writing = false;
  if (again) { again = false; saveRemote(); }
}
async function putAnswer(a) { if (!COL) return; try { await COL.doc(a.id).set(a); } catch (e) { /* kept locally */ } }
async function dropAnswer(id) { if (!COL) return; try { await COL.doc(id).delete(); } catch (e) { /* ignore */ } }
function setSync(on, text) { const el = $('#sync'); if (!el) return; el.classList.toggle('on', on); el.lastElementChild.textContent = text; }

async function initRemote() {
  if (!window.claude || !window.claude.use) return;
  try {
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    COL = db.collection('data/users/' + uid);
    const snap = await COL.get();
    let prog = null; const remote = [];
    snap.docs.forEach(d => { const v = d.data(); if (!v) return; if (d.id === 'progress') prog = v; else if (d.id.indexOf('qa_') === 0) remote.push(v); });
    if (prog && (prog.xp || 0) >= (S.xp || 0)) S = normalize(prog);
    else await COL.doc('progress').set(JSON.parse(JSON.stringify(S)));
    const ids = new Set(remote.map(a => a.id));
    for (const a of answers) if (!ids.has(a.id)) { remote.push(a); await putAnswer(a); }
    answers = remote.sort((a, b) => b.at - a.at);
    saveLocal(); setSync(true, 'Synced to your account'); render();
  } catch (e) { setSync(false, 'Saved on this device only'); }
}

function day(k = todayKey()) { if (!S.days[k]) S.days[k] = { am: false, pm: false, steps: {} }; return S.days[k]; }
function award(n, area, quiet) {
  const k = todayKey();
  S.xp += n; S.xpByDay[k] = (S.xpByDay[k] || 0) + n;
  if (area && S.area[area] != null) S.area[area] += n;
  autoMilestones(); save();
  if (!quiet) toast('+' + n + ' XP');
}
function rankOf(xp) {
  let i = 0; EP.ranks.forEach((r, j) => { if (xp >= r[0]) i = j; });
  return { name: EP.ranks[i][1], floor: EP.ranks[i][0], next: EP.ranks[i + 1] || null };
}
function streak() {
  let k = todayKey(), n = 0;
  if (!(S.xpByDay[k] > 0)) k = addDays(k, -1);
  while (S.xpByDay[k] > 0) { n++; k = addDays(k, -1); }
  return n;
}
function accuracy() { let r = 0, w = 0; Object.values(S.items).forEach(s => { r += s.r || 0; w += s.w || 0; }); return { r, w, pct: r + w ? Math.round(100 * r / (r + w)) : null }; }
function avgScore(n = 10) { const a = answers.slice(0, n).map(x => x.critique && x.critique.overall).filter(v => typeof v === 'number'); return a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : null; }
function autoMilestones() {
  const b = S.best.acronyms_rapid; if (b && b.pct >= 90 && b.n >= 15) S.milestones.m2 = S.milestones.m2 || todayKey();
  const av = avgScore(10); if (answers.length >= 10 && av >= 80) S.milestones.m14 = S.milestones.m14 || todayKey();
}

/* ================= navigation ================= */
const ICONS = {
  today: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  playbook: '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-4a3 3 0 0 0-2 1"/><path d="M20 4v14h-6"/>',
  drills: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  interview: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  roadmap: '<path d="M3 6h10M3 12h16M3 18h7"/><circle cx="16" cy="6" r="2"/><circle cx="13" cy="18" r="2"/>',
  kpis: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gallery: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
  actions: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
};
const VIEWS = [['today', 'Today'], ['playbook', 'Playbook'], ['drills', 'Drill arena'], ['interview', 'Interview lab'], ['roadmap', 'Roadmap & progress'], ['kpis', 'KPI library'], ['gallery', 'Dashboard gallery'], ['actions', 'Actions & reminders']];
let cur = 'today';
function renderNav() {
  $('#nav').innerHTML = VIEWS.map(([id, name]) => `<a href="#${id}" ${id === cur ? 'aria-current="page"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id]}</svg>${name}</a>`).join('');
}
function route() {
  const h = location.hash.slice(1);
  const next = VIEWS.some(v => v[0] === h) ? h : 'today';
  if (next !== cur) { stopTimers(); }
  cur = next; renderNav(); render(); window.scrollTo(0, 0);
}
function go(v) { if (v !== cur) stopTimers(); cur = v; if (location.hash.slice(1) === v) { renderNav(); render(); } else location.hash = v; }
function render() { const fn = VIEW[cur]; $('#view').innerHTML = fn(); if (AFTER[cur]) AFTER[cur](); }
const VIEW = {}, AFTER = {};

/* ================= TODAY ================= */
VIEW.today = function () {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const slot = h < 13 ? 'am' : 'pm';
  const d = day();
  const rk = rankOf(S.xp);
  const toNext = rk.next ? Math.round(100 * (S.xp - rk.floor) / (rk.next[0] - rk.floor)) : 100;
  const acc = accuracy(); const av = avgScore();
  const word = pick(EP.vocab), acr = pick(EP.acronyms), q = pick(EP.questions);
  const steps = slot === 'am' ? [
    ['checkin', 'Check in for the morning session', 'Starts your streak for today', 'Check in'],
    ['rapid', '60-second acronym rapid fire', 'Speed builds recall under pressure', 'Start'],
    ['qod', 'Answer today’s interview question', 'Out loud first, then type or dictate it', 'Open'],
    ['playbook', 'Read your four safety and EEO pillars', 'LAPP and LEAP', 'Review']
  ] : [
    ['checkin', 'Check in for the afternoon session', 'Two sessions a day doubles retention', 'Check in'],
    ['weak', 'Flashcards on your weakest items', 'Spaced repetition on what you miss', 'Start'],
    ['kpi', 'Learn one KPI and say it out loud', 'Definition, formula, benchmark', 'Open'],
    ['closing', 'Polish your closing statement', 'Deliver it in under 90 seconds', 'Edit']
  ];
  const done = k => k === 'checkin' ? d[slot] : !!d.steps[slot + ':' + k];
  const doneCount = steps.filter(s => done(s[0])).length;
  const nextMs = []; EP.phases.forEach(p => p.ms.forEach(m => { if (!S.milestones[m[0]] && nextMs.length < 3) nextMs.push([p, m]); }));
  const openActions = EP.actions.filter(a => !S.actions[a.id]).length + S.custom.filter(c => !c.done).length;
  const target = S.interview || S.goal; const dleft = daysBetween(todayKey(), target);
  return `
  <div class="head"><div>
    <span class="eyebrow">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · ${slot === 'am' ? 'Morning session' : 'Afternoon session'}</span>
    <h1>${greet}. Lead with safety, fairness and results.</h1>
    <p class="lede">Ten focused minutes, twice a day. Today’s session is below, then your numbers.</p>
  </div>
  <div class="row"><span class="pill p-strategy">${dleft >= 0 ? dleft + ' days to ' + (S.interview ? 'interview' : 'goal') : 'Goal date passed'}</span></div></div>

  <div class="grid g2">
    <section class="card">
      <div class="card-h"><h2>${slot === 'am' ? 'Morning' : 'Afternoon'} session</h2><span class="mono small muted">${doneCount}/${steps.length} done</span></div>
      <div>${steps.map((s, i) => `<div class="sess ${done(s[0]) ? 'done' : ''}"><span class="n">${done(s[0]) ? '✓' : i + 1}</span><div><b>${s[1]}</b><div class="small muted">${s[2]}</div></div><button class="btn sm ${i === 0 && !done(s[0]) ? 'primary' : ''}" data-act="step" data-step="${s[0]}" data-slot="${slot}">${done(s[0]) && s[0] === 'checkin' ? 'Done' : s[3]}</button></div>`).join('')}</div>
    </section>
    <section class="card">
      <div class="card-h"><h2>Where you stand</h2><span class="pill p-comm">${esc(rk.name)}</span></div>
      <div class="grid g2">
        <div class="tile"><span class="eyebrow">Experience</span><span class="v">${S.xp}</span><span class="s">${rk.next ? (rk.next[0] - S.xp) + ' XP to ' + rk.next[1] : 'Top rank reached'}</span><div class="bar"><i style="width:${toNext}%"></i></div></div>
        <div class="tile"><span class="eyebrow">Streak</span><span class="v">${streak()}<small class="muted" style="font-size:15px"> days</small></span><span class="s">Any practice keeps it alive</span></div>
        <div class="tile"><span class="eyebrow">Drill accuracy</span><span class="v">${acc.pct == null ? '–' : acc.pct + '%'}</span><span class="s">${acc.r + acc.w} answers in drills</span></div>
        <div class="tile"><span class="eyebrow">Interview answers</span><span class="v">${answers.length}</span><span class="s">${av == null ? 'No scores yet' : 'Average score ' + av + ' (last 10)'}</span></div>
      </div>
    </section>
  </div>

  <div class="grid g3">
    <section class="card"><span class="eyebrow">Word of the day</span><h3>${esc(word[0])}</h3><p>${esc(word[1])}</p><p class="quote small">${esc(word[2])}</p><div class="row"><button class="btn sm" data-act="useword">I used it today (+5)</button></div></section>
    <section class="card"><span class="eyebrow">Acronym of the day</span><h3 class="mono" style="font-size:24px">${esc(acr[0])}</h3><p>${esc(acr[1])}</p><div class="row"><span class="pill p-${acr[2]}">${AREA_NAME[acr[2]]}</span></div></section>
    <section class="card"><span class="eyebrow">Question of the day</span><h3>${esc(q.q)}</h3><p class="small muted">${esc(q.hint)}</p><div class="row"><button class="btn sm primary" data-act="openq" data-q="${q.id}">Answer it</button></div></section>
  </div>

  <div class="grid g2">
    <section class="card"><div class="card-h"><h2>Next milestones</h2><a class="btn sm ghost" href="#roadmap">Roadmap →</a></div>
      <ul class="clean">${nextMs.map(([p, m]) => `<li class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:12px"><span style="min-width:0">${esc(m[1])}</span><span class="pill p-${p.area}">${AREA_NAME[p.area]}</span></li>`).join('') || '<li class="muted">Every milestone is complete.</li>'}</ul></section>
    <section class="card"><div class="card-h"><h2>Action items</h2><a class="btn sm ghost" href="#actions">All actions →</a></div>
      <p><b class="mono" style="font-size:22px">${openActions}</b> <span class="muted">open. Top of the list:</span></p>
      <ul class="dots">${EP.actions.filter(a => !S.actions[a.id]).slice(0, 3).map(a => `<li>${esc(a.text)}</li>`).join('') || '<li>All seeded actions are done.</li>'}</ul></section>
  </div>`;
};

/* ================= PLAYBOOK ================= */
VIEW.playbook = function () {
  const sec = [['formats', 'Answer formats'], ['safety', 'Safety (LAPP + IIPP)'], ['eeo', 'EEO (LEAP)'], ['comms', 'Communication toolkit'], ['closing', 'Closing statements'], ['frameworks', 'Executive frameworks'], ['ladwp', 'LADWP context']];
  const pillarCards = (P, color) => `<div class="grid g4">${P.pillars.map(p => `<div class="pillar" style="--c:${color}"><span class="big">${p.l}</span><h3>${esc(p.name)}</h3><ul class="dots small">${p.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  const copyList = arr => `<div class="grid" style="gap:8px">${arr.map(t => `<div class="copyable"><p>${esc(t)}</p><button class="btn sm ghost" data-act="copy" data-text="${esc(t)}">Copy</button></div>`).join('')}</div>`;
  const wc = (S.closing.trim().match(/\S+/g) || []).length;
  return `
  <div class="head"><div><span class="eyebrow">Playbook</span><h1>Formats, pillars and phrases to make automatic</h1>
  <p class="lede">Everything you drill comes from this page. Read it in the morning, test it in the Drill arena, use it in the Interview lab.</p></div></div>
  <div class="row">${sec.map(s => `<button class="chip" data-act="jump" data-to="pb-${s[0]}">${s[1]}</button>`).join('')}</div>

  <section class="card" id="pb-formats"><h2>Answer formats</h2>
    <div class="grid g2">${EP.formats.map(f => `<div class="card flat"><div class="card-h"><h3>${esc(f.name)}</h3><span class="pill p-${f.tag}">${f.key}</span></div>
      ${f.letters.map(l => `<div class="letter"><b>${l[0]}</b><div><b>${esc(l[1])}</b><div class="small muted">${esc(l[2])}</div></div></div>`).join('')}
      <p class="note">${esc(f.tip)}</p></div>`).join('')}</div></section>

  <section class="card" id="pb-safety"><div class="card-h"><h2>Safety: the four pillars (${EP.safetyPillars.mnemonic})</h2><span class="pill p-safety">Manager level</span></div>
    <p class="quote">${esc(EP.safetyPillars.hook)}</p>
    ${pillarCards(EP.safetyPillars, 'var(--safety)')}
    <div class="grid g2">
      <div class="card flat"><h3>IIPP: 8 required elements (Cal/OSHA Title 8 §3203)</h3><p class="small muted">${esc(EP.iipp.hook)}</p>
        <ol class="dots small">${EP.iipp.elements.map(e => `<li><b>${esc(e[0])}.</b> ${esc(e[1])}</li>`).join('')}</ol></div>
      <div class="card flat"><h3>Your role and responsibilities as manager</h3>
        <ul class="clean small">${EP.safetyRoles.map(r => `<li><b>${esc(r[0])}.</b> ${esc(r[1])}</li>`).join('')}</ul></div>
    </div>
    <p class="note">These follow Cal/OSHA requirements and common utility practice. Once you send the Power New Business IIPP, the wording will be matched to your program.</p></section>

  <section class="card" id="pb-eeo"><div class="card-h"><h2>EEO: the four pillars (${EP.eeoPillars.mnemonic})</h2><span class="pill p-eeo">Manager level</span></div>
    <p class="quote">${esc(EP.eeoPillars.hook)}</p>
    ${pillarCards(EP.eeoPillars, 'var(--eeo)')}
    <div class="card flat"><h3>Your role and responsibilities as manager</h3>
      <ul class="clean small">${EP.eeoRoles.map(r => `<li><b>${esc(r[0])}.</b> ${esc(r[1])}</li>`).join('')}</ul></div>
    <p class="note">Based on California FEHA duties and typical City of Los Angeles EEO policy language. Send the City/LADWP EEO policy to replace this with the exact text.</p></section>

  <section class="card" id="pb-comms"><h2>Communication toolkit</h2>
    <div class="grid g2">
      <div class="card flat"><h3>Openers</h3>${copyList(EP.comms.openers)}</div>
      <div class="card flat"><h3>Icebreakers</h3>${copyList(EP.comms.icebreakers)}</div>
      <div class="card flat"><h3>Bridges and signposts</h3>${copyList(EP.comms.bridges)}</div>
      <div class="card flat"><h3>When you don’t know</h3>${copyList(EP.comms.unknowns)}</div>
      <div class="card flat"><h3>Exit lines for any answer</h3>${copyList(EP.comms.closers)}</div>
      <div class="card flat"><h3>Rules for every answer</h3><ul class="dots small">
        <li>Answer first, in one sentence. Then support it.</li><li>Signpost: “I’ll cover three points.”</li>
        <li>Use “I” for decisions, “we” for execution.</li><li>End on a number or a process you made permanent.</li>
        <li>Tie to safety, EEO or the customer when it fits.</li><li>Target 90 seconds to 2 minutes. Stop when done.</li></ul></div>
    </div></section>

  <section class="card" id="pb-closing"><h2>Closing statements</h2>
    <div class="grid g2">${EP.closings.map((c, i) => `<div class="card flat"><div class="card-h"><h3>${esc(c.name)}</h3><span class="mono small muted">${c.text.split(/\s+/).length} words · ~${Math.round(c.text.split(/\s+/).length / 2.3)}s</span></div><p class="small">${esc(c.text)}</p><div class="row"><button class="btn sm" data-act="useclosing" data-i="${i}">Use as my draft</button><button class="btn sm ghost" data-act="copy" data-text="${esc(c.text)}">Copy</button></div></div>`).join('')}</div>
    <div class="card flat"><div class="card-h"><h3>My closing statement</h3><span class="mono small muted" id="closing-wc">${wc} words · ~${Math.round(wc / 2.3)}s spoken</span></div>
      <textarea id="closing" data-in="closing" placeholder="Start from a template above, then make it yours: thank them, three points, your first-90-days vision, enthusiasm.">${esc(S.closing)}</textarea>
      <div class="row"><button class="btn sm primary" data-act="closingdone">Save and log practice (+10)</button><span class="small muted">Aim for 120–200 words, under 90 seconds.</span></div></div>
  </section>

  <section class="card" id="pb-frameworks"><h2>Executive frameworks</h2>
    <div class="grid g2">${EP.frameworks.map(f => `<div class="letter" style="grid-template-columns:120px 1fr"><b style="width:auto;font-size:15px;height:auto;padding:8px">${esc(f[0])}</b><p class="small">${esc(f[1])}</p></div>`).join('')}</div></section>

  <section class="card" id="pb-ladwp"><h2>LADWP context to speak to</h2>
    <ul class="clean">${EP.ladwp.map(x => `<li><b>${esc(x[0])}.</b> ${esc(x[1])}</li>`).join('')}</ul>
    <p class="note">General public context. Verify current figures against the latest SLTRP and Board materials before quoting numbers in an interview.</p></section>`;
};

/* ================= DRILLS ================= */
let Q = null, qTimer = null;
function stopTimers() { if (qTimer) { clearInterval(qTimer); qTimer = null; } if (IV.tick) { clearInterval(IV.tick); IV.tick = null; } stopDictation(); }
const DECKS = [
  ['acronyms', 'Acronyms', 'All key acronyms: safety, EEO, finance, reliability, customer.', 'comm'],
  ['safety', 'Safety & IIPP', 'LAPP pillars, IIPP elements, manager duties, scenarios.', 'safety'],
  ['eeo', 'EEO management', 'LEAP pillars, manager duties, judgment scenarios.', 'eeo'],
  ['formats', 'Answer formats', 'STAR, SMART, PREP, SCR letter by letter.', 'comm'],
  ['vocab', 'Executive vocabulary', 'Match the definition to the executive term.', 'vocab'],
  ['kpis', 'KPIs & metrics', 'Burn rate, CPI, SAIDI, FCR, TRIR and more.', 'ops'],
  ['frameworks', 'Frameworks', 'MECE, issue tree, RACI, PDCA, 30-60-90.', 'strategy'],
  ['scenarios', 'Manager scenarios', 'What would you do? Safety, EEO, resources.', 'strategy'],
  ['weak', 'Weak spots', 'Your most-missed items from every deck.', 'comm']
];
function deckItems(name) {
  const out = [];
  const add = (id, area, prompt, ask, answer, detail, w) => out.push({ id, area, prompt, ask, answer, detail: detail || '', w });
  if (name === 'acronyms' || name === 'weak') EP.acronyms.forEach(a => add('ac:' + a[0], a[2], a[0], 'What does it stand for?', a[1]));
  if (name === 'safety' || name === 'weak') {
    EP.safetyPillars.pillars.forEach((p, i) => add('sp:' + i, 'safety', 'LAPP pillar #' + (i + 1) + ' (“' + p.l + '”)', 'Which safety pillar?', p.name, p.points[0]));
    EP.iipp.elements.forEach((e, i) => add('ii:' + i, 'safety', e[1], 'Which IIPP element is this?', e[0], 'IIPP element ' + (i + 1) + ' of 8'));
    EP.safetyRoles.forEach((r, i) => add('sr:' + i, 'safety', r[1], 'Which manager responsibility?', r[0]));
  }
  if (name === 'eeo' || name === 'weak') {
    EP.eeoPillars.pillars.forEach((p, i) => add('ep:' + i, 'eeo', 'LEAP pillar #' + (i + 1) + ' (“' + p.l + '”)', 'Which EEO pillar?', p.name, p.points[0]));
    EP.eeoRoles.forEach((r, i) => add('er:' + i, 'eeo', r[1].length > 220 ? r[1].slice(0, 200) + '…' : r[1], 'Which manager responsibility?', r[0]));
  }
  if (name === 'formats' || name === 'weak') EP.formats.forEach(f => f.letters.forEach((l, i) => add('fm:' + f.key + i, f.tag, f.key + ': letter ' + (i + 1) + ' “' + l[0] + '”', 'What does it stand for?', l[1], l[2])));
  if (name === 'vocab' || name === 'weak') EP.vocab.forEach(v => add('vo:' + v[0], 'vocab', v[1], 'Which executive term?', v[0], v[2]));
  if (name === 'kpis' || name === 'weak') EP.kpis.forEach(k => add('kp:' + k.name, 'ops', k.def, 'Which KPI?', k.name, k.formula));
  if (name === 'frameworks' || name === 'weak') EP.frameworks.forEach(f => add('fw:' + f[0], 'strategy', f[1].replace(new RegExp(f[0], 'gi'), '____'), 'Which framework?', f[0]));
  const sc = name === 'scenarios' || name === 'weak' ? EP.scenarios : name === 'safety' ? EP.scenarios.filter(s => s.area === 'safety') : name === 'eeo' ? EP.scenarios.filter(s => s.area === 'eeo') : [];
  sc.forEach((s, i) => add('sc:' + EP.scenarios.indexOf(s), s.area, s.q, 'Best manager response?', s.a, '', s.w));
  if (name === 'weak') {
    const score = it => { const s = S.items[it.id] || { r: 0, w: 0 }; return (s.w || 0) * 2 - (s.r || 0) + (s.r + s.w ? 0 : 0.5) + Math.random() * 0.3; };
    return out.sort((a, b) => score(b) - score(a)).slice(0, 15);
  }
  return out;
}
function optionsFor(it, items) {
  if (it.w) return shuffle([it.answer].concat(it.w));
  const pool = shuffle([...new Set(items.filter(x => x.answer !== it.answer && !x.w).map(x => x.answer))]).slice(0, 3);
  return shuffle([it.answer].concat(pool));
}
function startQuiz(deck, mode) {
  stopTimers();
  const items = shuffle(deckItems(deck));
  if (!items.length) return;
  Q = { deck, mode, items, i: 0, right: 0, wrong: 0, missed: [], answered: null, flipped: false, end: mode === 'rapid' ? Date.now() + 60000 : 0, max: mode === 'quiz' ? Math.min(10, items.length) : items.length, done: false };
  Q.opts = optionsFor(items[0], items);
  if (mode === 'rapid') qTimer = setInterval(() => { const left = Math.max(0, Q.end - Date.now()); const el = $('#qtimer'); if (el) el.textContent = (left / 1000).toFixed(1) + 's'; if (left <= 0) finishQuiz(); }, 100);
  render();
}
function nextQ() {
  Q.i++; Q.answered = null; Q.flipped = false;
  if (Q.mode === 'rapid' && Q.i >= Q.items.length) { Q.items = Q.items.concat(shuffle(Q.items)); }
  if (Q.mode !== 'rapid' && Q.i >= Q.max) return finishQuiz();
  Q.opts = optionsFor(Q.items[Q.i], Q.items); render();
}
function record(it, ok) {
  const s = S.items[it.id] || (S.items[it.id] = { r: 0, w: 0 });
  if (ok) { s.r++; Q.right++; award(2, it.area, true); } else { s.w++; Q.wrong++; if (!Q.missed.some(m => m.id === it.id)) Q.missed.push(it); save(); }
}
function finishQuiz() {
  if (!Q || Q.done) return; Q.done = true;
  if (qTimer) { clearInterval(qTimer); qTimer = null; }
  const n = Q.right + Q.wrong; const pct = n ? Math.round(100 * Q.right / n) : 0;
  const key = Q.deck + '_' + Q.mode; const b = S.best[key];
  Q.newBest = !b || Q.right > b.right;
  if (Q.newBest) S.best[key] = { right: Q.right, n, pct, at: todayKey() };
  if (n) award(5, (DECKS.find(d => d[0] === Q.deck) || [])[3] || 'comm', true);
  const d = day(); const slot = new Date().getHours() < 13 ? 'am' : 'pm';
  if (Q.mode === 'rapid') d.steps[slot + ':rapid'] = true; if (Q.deck === 'weak') d.steps[slot + ':weak'] = true;
  autoMilestones(); save(); render();
}
VIEW.drills = function () {
  if (Q && Q.done) {
    const n = Q.right + Q.wrong, pct = n ? Math.round(100 * Q.right / n) : 0;
    return `<div class="head"><div><span class="eyebrow">Drill arena · results</span><h1>${pct >= 90 ? 'Sharp. That’s executive recall.' : pct >= 70 ? 'Solid. Tighten the misses.' : 'Good reps. Run it again.'}</h1></div></div>
    <div class="grid g3"><div class="card tile"><span class="eyebrow">Correct</span><span class="v">${Q.right}/${n}</span><span class="s">${pct}% accuracy</span></div>
    <div class="card tile"><span class="eyebrow">Best on this drill</span><span class="v">${(S.best[Q.deck + '_' + Q.mode] || {}).right ?? 0}</span><span class="s">${Q.newBest ? 'New personal best' : 'Keep pushing'}</span></div>
    <div class="card tile"><span class="eyebrow">XP earned</span><span class="v">+${Q.right * 2 + (n ? 5 : 0)}</span><span class="s">2 per correct, 5 for finishing</span></div></div>
    ${Q.missed.length ? `<section class="card"><h2>Review what you missed</h2><ul class="clean">${Q.missed.map(m => `<li><div class="small muted">${esc(m.prompt)}</div><b>${esc(m.answer)}</b></li>`).join('')}</ul></section>` : ''}
    <div class="row"><button class="btn primary" data-act="quiz" data-deck="${Q.deck}" data-mode="${Q.mode}">Run it again</button><button class="btn" data-act="quiz" data-deck="weak" data-mode="flash">Flashcards on weak spots</button><button class="btn ghost" data-act="quizexit">All drills</button></div>`;
  }
  if (Q) {
    const it = Q.items[Q.i];
    const head = `<div class="card-h"><span class="eyebrow">${esc((DECKS.find(d => d[0] === Q.deck) || [])[1])} · ${Q.mode === 'rapid' ? 'Rapid fire' : Q.mode === 'quiz' ? 'Quiz ' + (Q.i + 1) + ' of ' + Q.max : 'Flashcards ' + (Q.i + 1) + ' of ' + Q.max}</span>
      <div class="row">${Q.mode === 'rapid' ? `<span class="timer" id="qtimer">${(Math.max(0, Q.end - Date.now()) / 1000).toFixed(1)}s</span>` : ''}<span class="mono small"><span style="color:var(--good)">${Q.right}✓</span> <span style="color:var(--bad)">${Q.wrong}✗</span></span><button class="btn sm ghost" data-act="quizend">End</button></div></div>`;
    if (Q.mode === 'flash') {
      return `<section class="card" style="max-width:720px;width:100%;margin:0 auto">${head}
        <button class="flash" data-act="flip">${Q.flipped ? `<div style="display:flex;flex-direction:column;gap:10px"><span class="eyebrow">${esc(it.ask)}</span><span class="qprompt">${esc(it.answer)}</span>${it.detail ? `<span class="small muted">${esc(it.detail)}</span>` : ''}</div>` : `<div style="display:flex;flex-direction:column;gap:10px"><span class="${it.prompt.length < 14 ? 'front' : 'qprompt'}">${esc(it.prompt)}</span><span class="small muted">${esc(it.ask)} Say it out loud, then tap to flip.</span></div>`}</button>
        ${Q.flipped ? `<div class="row" style="justify-content:center"><button class="btn" data-act="flash" data-ok="0">Review again</button><button class="btn primary" data-act="flash" data-ok="1">I knew it</button></div>` : ''}</section>`;
    }
    const a = Q.answered;
    return `<section class="card" style="max-width:760px;width:100%;margin:0 auto">${head}
      <span class="pill p-${it.area}" style="align-self:flex-start">${AREA_NAME[it.area]}</span>
      <p class="${it.prompt.length < 14 ? 'front qprompt' : 'qprompt'}" style="${it.prompt.length < 14 ? 'font-size:40px' : ''}">${esc(it.prompt)}</p>
      <p class="muted">${esc(it.ask)}</p>
      <div class="grid" style="gap:8px">${Q.opts.map((o, i) => `<button class="opt ${a ? (o === it.answer ? 'right' : (o === a ? 'wrong' : '')) : ''}" data-act="answer" data-i="${i}" ${a ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
      ${a && Q.mode === 'quiz' ? `${it.detail ? `<p class="note">${esc(it.detail)}</p>` : ''}<div class="row"><button class="btn primary" data-act="nextq">${Q.i + 1 >= Q.max ? 'See results' : 'Next'}</button></div>` : ''}
    </section>`;
  }
  return `<div class="head"><div><span class="eyebrow">Drill arena</span><h1>Make the acronyms and pillars automatic</h1>
    <p class="lede">Rapid fire builds speed (60 seconds, as many as you can). Quiz builds accuracy with explanations. Flashcards build recall: say the answer out loud before you flip.</p></div></div>
    <div class="grid g3">${DECKS.map(d => { const b = S.best[d[0] + '_rapid']; return `<section class="card"><div class="card-h"><h3>${d[1]}</h3><span class="pill p-${d[3]}">${d[0] === 'weak' ? 'Adaptive' : deckItems(d[0]).length + ' items'}</span></div><p class="small muted">${d[2]}</p>${b ? `<p class="small mono">Rapid-fire best: ${b.right} correct (${b.pct}%)</p>` : ''}
      <div class="row" style="margin-top:auto"><button class="btn sm primary" data-act="quiz" data-deck="${d[0]}" data-mode="rapid">Rapid fire</button><button class="btn sm" data-act="quiz" data-deck="${d[0]}" data-mode="quiz">Quiz</button><button class="btn sm" data-act="quiz" data-deck="${d[0]}" data-mode="flash">Flashcards</button></div></section>`; }).join('')}</div>`;
};

/* ================= INTERVIEW LAB ================= */
const IV = { qid: null, text: '', secs: 0, startAt: 0, tick: null, crit: null, busy: false, cat: 'All', sel: new Set(), confirmDel: null, rec: null, recBase: '' };
try { IV.text = localStorage.getItem(LS + ':draft') || ''; IV.qid = localStorage.getItem(LS + ':qid') || null; } catch (e) { /* ignore */ }
const qById = id => EP.questions.find(q => q.id === id) || EP.questions[0];
function setQ(id) { if (IV.qid !== id) { IV.qid = id; IV.text = ''; IV.crit = null; IV.secs = 0; IV.startAt = 0; } try { localStorage.setItem(LS + ':qid', id); localStorage.setItem(LS + ':draft', IV.text); } catch (e) { /* ignore */ } }
function startClock() { if (IV.tick) return; IV.startAt = Date.now() - IV.secs * 1000; IV.tick = setInterval(() => { IV.secs = Math.round((Date.now() - IV.startAt) / 1000); const el = $('#ivclock'); if (el) { el.textContent = Math.floor(IV.secs / 60) + ':' + pad(IV.secs % 60); el.style.color = IV.secs > 150 ? 'var(--bad)' : IV.secs > 120 ? 'var(--amber)' : ''; } }, 500); }
function stopClock() { if (IV.tick) { clearInterval(IV.tick); IV.tick = null; } }

VIEW.interview = function () {
  if (!IV.qid) IV.qid = pick(EP.questions).id;
  const q = qById(IV.qid);
  const cats = ['All'].concat([...new Set(EP.questions.map(x => x.cat))]);
  const list = EP.questions.filter(x => IV.cat === 'All' || x.cat === IV.cat);
  const answeredIds = new Set(answers.map(a => a.qid));
  const wc = (IV.text.trim().match(/\S+/g) || []).length;
  return `<div class="head"><div><span class="eyebrow">Interview lab</span><h1>Answer out loud. Get critiqued. Keep the record.</h1>
    <p class="lede">Pick a question, start the clock, and speak or type your answer. The AI coach scores structure, results, concision, presence and safety/EEO tie-in, then rewrites it tighter.</p></div></div>
  <div class="grid ivgrid">
    <section class="card" style="max-height:640px;overflow:auto"><h3>Question bank</h3>
      <div class="row">${cats.map(c => `<button class="chip" aria-pressed="${IV.cat === c}" data-act="ivcat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <button class="btn sm" data-act="ivrandom">Random question</button>
      <ul class="clean">${list.map(x => `<li><button class="opt" style="padding:9px 11px;${x.id === q.id ? 'border-color:var(--accent);background:var(--accent-soft)' : ''}" data-act="openq" data-q="${x.id}"><span class="small muted">${esc(x.cat)}${answeredIds.has(x.id) ? ' · answered' : ''}</span><br>${esc(x.q)}</button></li>`).join('')}</ul>
    </section>
    <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
      <section class="card">
        <div class="card-h"><span class="pill p-${CAT_AREA[q.cat] || 'comm'}">${esc(q.cat)}</span><div class="row"><span class="timer" id="ivclock">${Math.floor(IV.secs / 60)}:${pad(IV.secs % 60)}</span><button class="btn sm" data-act="ivclock">${IV.tick ? 'Pause' : 'Start clock'}</button></div></div>
        <h2>${esc(q.q)}</h2>
        <details><summary class="small" style="cursor:pointer;color:var(--accent)">Show structure hint</summary><p class="note" style="margin-top:8px">${esc(q.hint)}</p></details>
        <textarea id="ivtext" data-in="ivtext" style="min-height:200px" placeholder="Speak it out loud first. Then type or dictate. Start with the answer in one sentence; use STAR for “tell us about a time”; end on a result.">${esc(IV.text)}</textarea>
        <div class="row" style="justify-content:space-between"><span class="small muted mono" id="ivwc">${wc} words · target 180–300 (90–120s)</span>
          <div class="row"><button class="btn sm" data-act="dictate" id="dictbtn">${IV.rec ? 'Stop dictation' : 'Dictate'}</button><button class="btn sm" data-act="quick">Quick check</button><button class="btn sm primary" data-act="coach" ${IV.busy ? 'disabled' : ''}>Critique with AI coach</button></div></div>
        <p class="small muted" id="dictnote" hidden></p>
      </section>
      <section class="card" id="crit">${critHTML()}</section>
    </div>
  </div>
  <section class="card" id="repo">${repoHTML()}</section>`;
};

function critHTML() {
  const c = IV.crit;
  if (IV.busy) return `<h3>AI coach</h3><p class="muted" id="coachlive">Thinking… a strong critique takes 15–60 seconds.</p>`;
  if (!c) return `<h3>Critique</h3><p class="muted">Your score, strengths, specific fixes and a tighter rewrite will appear here. <b>Quick check</b> runs instantly on this device; <b>AI coach</b> gives a full panel-style critique.</p>`;
  const dims = [['structure', 'Structure'], ['results', 'Results & metrics'], ['concise', 'Clear & concise'], ['presence', 'Executive presence'], ['values', 'Safety / EEO / customer']];
  const o = clamp(Math.round(c.overall || 0), 0, 100); const col = o >= 80 ? 'var(--good)' : o >= 60 ? 'var(--amber)' : 'var(--bad)';
  const C = 2 * Math.PI * 34;
  const star = c.star || {};
  return `<div class="card-h"><h3>${c.source === 'ai' ? 'AI coach critique' : 'Quick check'}</h3><button class="btn sm primary" data-act="ivsave">Save to repository (+15)</button></div>
  <div class="row" style="gap:18px;flex-wrap:nowrap;align-items:center">
    <svg class="ring" viewBox="0 0 84 84" role="img" aria-label="Score ${o} of 100"><circle cx="42" cy="42" r="34" style="fill:none;stroke:var(--line)" stroke-width="8"/><circle cx="42" cy="42" r="34" style="fill:none;stroke:${col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C * o / 100} ${C}" transform="rotate(-90 42 42)"/><text x="42" y="48" text-anchor="middle" style="fill:var(--ink);font-size:20px;font-family:var(--f-display);font-weight:600">${o}</text></svg>
    <div style="min-width:0;display:flex;flex-direction:column;gap:6px"><b>${esc(c.verdict || '')}</b>
      <div class="row">${['situation', 'task', 'action', 'result'].map(k => `<span class="pill ${star[k] ? 'p-good' : 'p-bad'}">${star[k] ? '✓' : '✗'} ${k[0].toUpperCase() + k.slice(1)}</span>`).join('')}</div></div></div>
  <div class="grid" style="gap:8px">${dims.map(([k, n]) => { const v = clamp(Number((c.scores || {})[k]) || 0, 0, 10); return `<div style="display:grid;grid-template-columns:150px 1fr 34px;gap:10px;align-items:center" class="small"><span>${n}</span><div class="bar"><i style="width:${v * 10}%;background:${v >= 8 ? 'var(--good)' : v >= 6 ? 'var(--amber)' : 'var(--bad)'}"></i></div><span class="mono">${v}/10</span></div>`; }).join('')}</div>
  <div class="grid g2">
    <div><h4>Strengths</h4><ul class="dots small">${(c.strengths || []).map(s => `<li>${esc(s)}</li>`).join('') || '<li>None detected yet.</li>'}</ul></div>
    <div><h4>Fix next time</h4><ul class="dots small">${(c.fixes || []).map(s => `<li>${esc(s)}</li>`).join('')}</ul></div></div>
  ${(c.power_words || []).length || (c.add_words || []).length ? `<div class="row small">${(c.power_words || []).map(w => `<span class="pill p-good">${esc(w)}</span>`).join('')}${(c.add_words || []).map(w => `<span class="pill p-comm">+ ${esc(w)}</span>`).join('')}</div>` : ''}
  ${c.rewrite ? `<div class="card flat"><div class="card-h"><h4>Tighter version</h4><button class="btn sm ghost" data-act="copy" data-text="${esc(c.rewrite)}">Copy</button></div><p class="small pre">${esc(c.rewrite)}</p>${c.closing_line ? `<p class="quote small"><b>Closing line:</b> ${esc(c.closing_line)}</p>` : ''}</div>` : ''}
  ${c.source !== 'ai' ? `<p class="note">For a full rewrite and panel-style feedback, use <b>Critique with AI coach</b>.</p>` : ''}`;
}

function quickCheck(text, secs) {
  const t = text.toLowerCase(); const words = t.match(/\S+/g) || []; const n = words.length;
  const count = re => (t.match(re) || []).length;
  const fillers = count(/\b(um+|uh+|basically|actually|you know|kind of|sort of|i guess|stuff|things like that)\b/g);
  const hedges = count(/\b(i think|maybe|probably|hopefully|i feel like|i believe)\b/g);
  const nums = count(/\d|percent|%|\$/g);
  const star = {
    situation: /\b(when|at the time|in 20\d\d|last year|our (team|division|section|group)|situation|we were facing|there was)\b/.test(t),
    task: /\b(i was (responsible|accountable|tasked|asked|assigned)|my (goal|role|task|responsibility|job) was|needed to|had to)\b/.test(t),
    action: /\b(i (led|created|implemented|developed|met|organized|analyzed|set|established|built|coached|assigned|prioritized|escalated|reviewed|introduced|designed|started|reached out|brought|mapped|standardized))\b/.test(t),
    result: /\b(result|as a result|reduced|increased|improved|saved|achieved|delivered|decreased|cut|grew|zero|on time|outcome)\b/.test(t)
  };
  const vals = count(/\b(safety|safe|hazard|jha|iipp|eeo|fair|respect|retaliat|accommodat|customer|ratepayer|reliab|inclusive)/g);
  const used = EP.vocab.map(v => v[0]).filter(w => t.includes(w.toLowerCase()));
  const starHits = Object.values(star).filter(Boolean).length;
  const sc = {
    structure: clamp(Math.round(starHits * 2.2 + (/\b(first|second|third|three)\b/.test(t) ? 1.5 : 0)), 0, 10),
    results: clamp(Math.round(nums * 2 + (star.result ? 3 : 0)), 0, 10),
    concise: clamp(Math.round((n < 60 ? 4 : n < 120 ? 7 : n <= 320 ? 10 : n <= 420 ? 7 : 4) - fillers - (secs > 150 ? 2 : 0)), 0, 10),
    presence: clamp(Math.round(4 + used.length * 1.5 - hedges * 1.5 + (/^(\s)*(yes|absolutely|my approach|the short answer|i would|i will|i led|first)/.test(t) ? 2 : 0)), 0, 10),
    values: clamp(Math.round(vals * 2.5), 0, 10)
  };
  const overall = Math.round((sc.structure + sc.results + sc.concise + sc.presence + sc.values) * 2);
  const fixes = [];
  if (!star.situation) fixes.push('Open with one sentence of context: where, when, what was at stake.');
  if (!star.task) fixes.push('State your responsibility: “I was accountable for…”');
  if (!star.action) fixes.push('Name 2–3 actions you personally took, starting with “I…”');
  if (!star.result || nums === 0) fixes.push('Quantify the result: a %, $, days, or incident count.');
  if (n > 400) fixes.push('Cut to under 300 words. Drop background detail; keep action and result.');
  if (n < 100) fixes.push('Too short to show depth. Add one concrete example and its outcome.');
  if (fillers) fixes.push('Remove filler words (' + fillers + ' found).');
  if (hedges) fixes.push('Replace hedges like “I think” or “maybe” with “My approach is…”.');
  if (!vals) fixes.push('Tie it to safety, EEO or the customer where it fits.');
  const strengths = [];
  if (starHits >= 3) strengths.push('Clear STAR structure.');
  if (nums >= 2) strengths.push('Uses numbers to prove results.');
  if (n >= 150 && n <= 320) strengths.push('Good length for a 90–120 second answer.');
  if (vals >= 2) strengths.push('Connects to core values.');
  if (used.length) strengths.push('Executive vocabulary in use.');
  const unused = shuffle(EP.vocab.map(v => v[0]).filter(w => !used.includes(w))).slice(0, 3);
  return { source: 'local', overall, scores: sc, star, verdict: overall >= 80 ? 'Strong, panel-ready answer.' : overall >= 60 ? 'Good base. Sharpen the result and trim.' : 'Needs structure and a measurable result.', strengths, fixes: fixes.slice(0, 5), power_words: used, add_words: unused };
}

let coachCtl = null;
async function coach() {
  const q = qById(IV.qid);
  if ((IV.text.trim().match(/\S+/g) || []).length < 20) { toast('Write or dictate at least a few sentences first'); return; }
  const sample = window.claude && window.claude.use ? await window.claude.use('sample') : null;
  if (!sample) { IV.crit = quickCheck(IV.text, IV.secs); $('#crit').innerHTML = critHTML(); toast('AI coach isn’t available here; showing Quick check'); return; }
  stopClock(); IV.busy = true; $('#crit').innerHTML = critHTML(); render();
  const prompt = `You are an executive interview coach. The candidate is preparing for a senior-level manager / assistant director role (Power New Business, Los Angeles Department of Water and Power). Critique the answer the way a promotional interview panel would, and coach toward a clear, concise, results-driven executive style.

Frameworks the candidate is drilling: STAR (Situation, Task, Action, Result); SMART goals; PREP; SCR / answer-first; Safety pillars LAPP (Leadership, Accountability, Prevention, Process improvement & recordkeeping); EEO pillars LEAP (Leadership, Equity in practice, Awareness & prevention, Prompt response & accountability); Cal/OSHA IIPP (8 elements); MECE issue trees for case questions; 30-60-90 plans.

Question category: ${q.cat}
Question: ${q.q}
Expected structure hint: ${q.hint}
Answer (${IV.secs ? IV.secs + ' seconds, ' : ''}${(IV.text.match(/\S+/g) || []).length} words; may be dictated, so ignore transcription errors):
"""
${IV.text.slice(0, 6000)}
"""

Reply with only JSON in exactly this shape:
{"overall": 0-100, "scores": {"structure": 0-10, "results": 0-10, "concise": 0-10, "presence": 0-10, "values": 0-10}, "star": {"situation": true, "task": true, "action": true, "result": true}, "verdict": "one sentence", "strengths": ["2-3 items"], "fixes": ["3-5 specific, actionable fixes"], "power_words": ["executive terms they used well"], "add_words": ["3 executive terms to add"], "rewrite": "a tighter version in the candidate's own voice, under 170 words, answer-first, results-driven, ending on a measurable result or a process made permanent; do not invent specific numbers, use [X%] placeholders where a number is needed", "closing_line": "one memorable final sentence"}

Scoring guide: structure = right format for the question (STAR for behavioral, MECE/issue tree for case, PREP for opinion); results = quantified outcomes; concise = clear, about 90-120 seconds, no filler or rambling; presence = confident, answer-first, executive vocabulary, no hedging; values = ties to safety, EEO, customers or LADWP strategy where relevant. Be candid and specific.`;
  coachCtl = new AbortController();
  try {
    const r = await sample.json(prompt, { signal: coachCtl.signal, onText: () => { const el = $('#coachlive'); if (el) el.textContent = 'Writing the critique…'; } });
    IV.crit = Object.assign({ source: 'ai' }, r || {});
  } catch (e) {
    IV.crit = quickCheck(IV.text, IV.secs);
    toast(e && e.code === 'not_granted' ? 'AI coach was not allowed; showing Quick check' : e && e.code === 'rate_limited' ? 'AI coach is busy; try again in a minute' : 'AI coach could not finish; showing Quick check');
  }
  IV.busy = false;
  if (cur === 'interview') { $('#crit').innerHTML = critHTML(); const b = document.querySelector('[data-act="coach"]'); if (b) b.disabled = false; }
}

function saveAnswer() {
  if (!IV.text.trim()) { toast('Nothing to save yet'); return; }
  const q = qById(IV.qid);
  const crit = IV.crit || quickCheck(IV.text, IV.secs);
  const a = { id: 'qa_' + Date.now(), qid: q.id, q: q.q, cat: q.cat, text: IV.text, secs: IV.secs, at: Date.now(), critique: crit };
  answers.unshift(a); putAnswer(a);
  const d = day(); const slot = new Date().getHours() < 13 ? 'am' : 'pm'; d.steps[slot + ':qod'] = true;
  award(15, CAT_AREA[q.cat] || 'comm');
  IV.text = ''; IV.crit = null; IV.secs = 0; stopClock();
  try { localStorage.setItem(LS + ':draft', ''); } catch (e) { /* ignore */ }
  render();
}

function repoHTML() {
  const sel = IV.sel;
  return `<div class="card-h"><div><h2>Q&amp;A repository</h2><p class="small muted">${answers.length} saved answers. Select some to export, or export all.</p></div>
    <div class="row"><button class="btn sm" data-act="export" data-fmt="docx">Word (.docx)</button><button class="btn sm" data-act="export" data-fmt="pdf">PDF</button><button class="btn sm" data-act="export" data-fmt="md">Markdown</button><button class="btn sm ghost" data-act="copyall">Copy as text</button></div></div>
    ${answers.length ? `<div class="grid" style="gap:8px">${answers.map(a => { const c = a.critique || {}; return `<details class="qa"><summary><span class="row" style="flex-wrap:nowrap;min-width:0;gap:10px"><input type="checkbox" data-act="sel" data-id="${a.id}" ${sel.has(a.id) ? 'checked' : ''} aria-label="Select for export"><span style="min-width:0"><span class="small muted">${new Date(a.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${esc(a.cat)}</span><br><b>${esc(a.q)}</b></span></span><span class="pill ${c.overall >= 80 ? 'p-good' : c.overall >= 60 ? 'p-strategy' : 'p-bad'}">${c.overall ?? '–'}</span></summary>
      <p class="small pre">${esc(a.text)}</p>
      ${(c.fixes || []).length ? `<div><h4>Fixes</h4><ul class="dots small">${c.fixes.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}
      ${c.rewrite ? `<div><h4>Tighter version</h4><p class="small pre">${esc(c.rewrite)}</p></div>` : ''}
      <div class="row"><button class="btn sm" data-act="retry" data-q="${a.qid}">Answer again</button><button class="btn sm ghost" data-act="del" data-id="${a.id}" style="color:var(--bad)">${IV.confirmDel === a.id ? 'Confirm delete' : 'Delete'}</button></div></details>`; }).join('')}</div>` : `<p class="muted">Saved answers appear here with their scores and rewrites. Answer today’s question to add the first one.</p>`}`;
}

/* ---- exports ---- */
function exportSet() { const s = answers.filter(a => IV.sel.has(a.id)); return s.length ? s : answers; }
function plainExport(list) {
  return 'Executive Path: Interview Q&A Repository\nExported ' + new Date().toLocaleString('en-US') + '\n\n' + list.map((a, i) => {
    const c = a.critique || {};
    return `${i + 1}. [${a.cat}] ${a.q}\nDate: ${new Date(a.at).toLocaleDateString('en-US')}   Score: ${c.overall ?? '-'}/100\n\nMy answer:\n${a.text}\n` +
      ((c.strengths || []).length ? '\nStrengths:\n' + c.strengths.map(s => '- ' + s).join('\n') + '\n' : '') +
      ((c.fixes || []).length ? '\nFixes:\n' + c.fixes.map(s => '- ' + s).join('\n') + '\n' : '') +
      (c.rewrite ? '\nTighter version:\n' + c.rewrite + '\n' : '') + (c.closing_line ? '\nClosing line: ' + c.closing_line + '\n' : '');
  }).join('\n----------------------------------------\n\n');
}
function mdExport(list) {
  return '# Interview Q&A Repository\n\n_Exported ' + new Date().toLocaleDateString('en-US') + '_\n\n' + list.map(a => {
    const c = a.critique || {};
    return `## ${a.q}\n\n**${a.cat}** · ${new Date(a.at).toLocaleDateString('en-US')} · Score **${c.overall ?? '-'}**/100\n\n### My answer\n\n${a.text}\n\n` +
      ((c.strengths || []).length ? '### Strengths\n\n' + c.strengths.map(s => '- ' + s).join('\n') + '\n\n' : '') +
      ((c.fixes || []).length ? '### Fixes\n\n' + c.fixes.map(s => '- ' + s).join('\n') + '\n\n' : '') +
      (c.rewrite ? '### Tighter version\n\n' + c.rewrite + '\n\n' : '');
  }).join('---\n\n');
}
const xmlEsc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
async function docxExport(list) {
  if (!window.JSZip) throw new Error('nozip');
  const P = [];
  const para = (text, style, bold) => String(text).split('\n').forEach(line => P.push(`<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}<w:r>${bold ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${xmlEsc(line)}</w:t></w:r></w:p>`));
  para('Interview Q&A Repository', 'Title'); para('Executive Path · exported ' + new Date().toLocaleDateString('en-US'));
  list.forEach(a => {
    const c = a.critique || {};
    para(a.q, 'Heading1'); para(a.cat + ' · ' + new Date(a.at).toLocaleDateString('en-US') + ' · Score ' + (c.overall ?? '-') + '/100');
    para('My answer', 'Heading2'); para(a.text);
    if ((c.strengths || []).length) { para('Strengths', 'Heading2'); c.strengths.forEach(s => para('• ' + s)); }
    if ((c.fixes || []).length) { para('Fixes', 'Heading2'); c.fixes.forEach(s => para('• ' + s)); }
    if (c.rewrite) { para('Tighter version', 'Heading2'); para(c.rewrite); }
    if (c.closing_line) { para('Closing line: ' + c.closing_line, null, true); }
  });
  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  const zip = new window.JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  const st = (id, name, sz, color, extra) => `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="80"/>${extra || ''}</w:pPr><w:rPr><w:b/><w:color w:val="${color}"/><w:sz w:val="${sz}"/></w:rPr></w:style>`;
  zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>${st('Title', 'Title', 40, '13202D')}${st('Heading1', 'heading 1', 28, '1D5FA6', '<w:outlineLvl w:val="0"/>')}${st('Heading2', 'heading 2', 23, '13202D', '<w:outlineLvl w:val="1"/>')}</w:styles>`);
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${W}><w:body>${P.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1200" w:right="1200" w:bottom="1200" w:left="1200" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
const ascii = s => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/→/g, '->').replace(/•/g, '-').replace(/[÷]/g, '/').replace(/[×]/g, 'x').replace(/±/g, '+/-').replace(/Σ/g, 'sum ').replace(/§/g, 'Sec. ').replace(/[^\x20-\x7E\n]/g, '');
function pdfExport(list) {
  if (!window.jspdf) throw new Error('nopdf');
  const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' });
  const M = 54, W = 612 - 2 * M, H = 792; let y = M;
  const write = (text, size, style, color, gap) => {
    doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size); doc.setTextColor(color || '#13202D');
    const lines = doc.splitTextToSize(ascii(text), W);
    lines.forEach(l => { if (y + size > H - M) { doc.addPage(); y = M; } doc.text(l, M, y + size); y += size * 1.4; });
    y += gap || 4;
  };
  write('Interview Q&A Repository', 22, 'bold', '#13202D', 2);
  write('Executive Path - exported ' + new Date().toLocaleDateString('en-US'), 10, 'normal', '#566576', 14);
  list.forEach(a => {
    const c = a.critique || {};
    write(a.q, 14, 'bold', '#1D5FA6', 2);
    write(a.cat + ' - ' + new Date(a.at).toLocaleDateString('en-US') + ' - Score ' + (c.overall ?? '-') + '/100', 9.5, 'normal', '#566576', 8);
    write('My answer', 11, 'bold'); write(a.text, 10.5, 'normal', null, 8);
    if ((c.strengths || []).length) { write('Strengths', 11, 'bold'); c.strengths.forEach(s => write('- ' + s, 10.5, 'normal', null, 0)); y += 6; }
    if ((c.fixes || []).length) { write('Fixes', 11, 'bold'); c.fixes.forEach(s => write('- ' + s, 10.5, 'normal', null, 0)); y += 6; }
    if (c.rewrite) { write('Tighter version', 11, 'bold'); write(c.rewrite, 10.5, 'normal', null, 6); }
    y += 14;
  });
  return doc.output('blob');
}
async function doExport(fmt) {
  const list = exportSet();
  if (!list.length) { toast('Save an answer first'); return; }
  const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
  if (!dl) { copyText(plainExport(list)); toast('File saving isn’t available here; copied as text instead'); return; }
  const stamp = todayKey();
  try {
    let data, filename;
    if (fmt === 'docx') { data = await docxExport(list); filename = 'interview-qa-' + stamp + '.docx'; }
    else if (fmt === 'pdf') { data = pdfExport(list); filename = 'interview-qa-' + stamp + '.pdf'; }
    else { data = mdExport(list); filename = 'interview-qa-' + stamp + '.md'; }
    await dl.save({ filename, data });
    toast('Saved ' + filename);
  } catch (e) {
    if (e && e.code === 'declined') return;
    toast(e && e.message === 'nozip' || e && e.message === 'nopdf' ? 'Export library didn’t load; try Markdown' : 'Couldn’t save the file; try Copy as text');
  }
}

/* ---- dictation ---- */
function dictNote(msg) { const n = $('#dictnote'); if (n) { n.hidden = false; n.textContent = msg; } }
function startDictation() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { dictNote('Voice input isn’t supported in this view. Tap the microphone key on your phone or tablet keyboard to dictate into the box.'); return; }
  try {
    const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    IV.recBase = IV.text ? IV.text.replace(/\s*$/, ' ') : '';
    rec.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; IV.text = IV.recBase + t.trim(); const ta = $('#ivtext'); if (ta) ta.value = IV.text; updateWC(); };
    rec.onerror = () => { stopDictation(); dictNote('The microphone isn’t available in this view. Tap the microphone key on your device keyboard to dictate instead.'); };
    rec.onend = () => { IV.rec = null; const b = $('#dictbtn'); if (b) b.textContent = 'Dictate'; };
    rec.start(); IV.rec = rec; startClock();
    const b = $('#dictbtn'); if (b) b.textContent = 'Stop dictation';
  } catch (e) { dictNote('The microphone isn’t available in this view. Use your keyboard’s dictation key instead.'); }
}
function stopDictation() { if (IV.rec) { try { IV.rec.stop(); } catch (e) { /* ignore */ } IV.rec = null; } }
function updateWC() { const el = $('#ivwc'); if (el) el.textContent = (IV.text.trim().match(/\S+/g) || []).length + ' words · target 180–300 (90–120s)'; }

/* ================= ROADMAP ================= */
VIEW.roadmap = function () {
  const total = Math.max(14, daysBetween(S.start, S.goal));
  const msDone = EP.phases.reduce((n, p) => n + p.ms.filter(m => S.milestones[m[0]]).length, 0);
  const msAll = EP.phases.reduce((n, p) => n + p.ms.length, 0);
  const rk = rankOf(S.xp);
  return `<div class="head"><div><span class="eyebrow">Roadmap & progress</span><h1>From manager to executive mindset</h1>
    <p class="lede">Six phases from today to your goal date. Bars fill as you complete milestones; the chart below shows what you have built over time.</p></div>
    <div class="row"><span class="pill p-comm">${msDone}/${msAll} milestones</span><span class="pill p-strategy">${esc(rk.name)}</span></div></div>
  <section class="card"><div class="row" style="align-items:flex-end">
    <label class="f" style="width:170px">Start date<input type="date" id="d-start" data-in="date" data-k="start" value="${S.start}"></label>
    <label class="f" style="width:170px">Goal date<input type="date" id="d-goal" data-in="date" data-k="goal" value="${S.goal}"></label>
    <label class="f" style="width:170px">Interview date (if known)<input type="date" id="d-int" data-in="date" data-k="interview" value="${S.interview}"></label>
    <span class="small muted">${total} days · ${Math.round(total / 7)} weeks</span></div>
    <div class="svgwrap">${gantt(total)}</div></section>
  <div class="grid g2">
    <section class="card"><div class="card-h"><h2>Experience over time</h2><span class="mono small muted">${S.xp} XP total</span></div>${xpChart()}</section>
    <section class="card"><h2>What you are building</h2><div class="grid" style="gap:10px">${Object.keys(AREA_NAME).map(a => { const v = S.area[a] || 0, t = AREA_TARGET[a], pct = Math.min(100, Math.round(100 * v / t)); const lvl = pct >= 100 ? 'Executive' : pct >= 70 ? 'Advanced' : pct >= 40 ? 'Proficient' : pct >= 15 ? 'Developing' : 'Starting'; return `<div style="display:grid;grid-template-columns:150px 1fr 90px;gap:10px;align-items:center" class="small"><span>${AREA_NAME[a]}</span><div class="bar"><i style="width:${pct}%;background:${AREA_COLOR[a]}"></i></div><span class="mono">${lvl}</span></div>`; }).join('')}</div>
      <h3>Rank ladder</h3><div class="row">${EP.ranks.map(r => `<span class="pill ${S.xp >= r[0] ? 'p-comm' : 'p-vocab'}">${S.xp >= r[0] ? '✓ ' : ''}${esc(r[1])} · ${r[0]}</span>`).join('')}</div></section>
  </div>
  <section class="card"><h2>Milestones</h2><div class="grid g3">${EP.phases.map(p => `<div class="card flat"><div class="card-h"><h3>${esc(p.name)}</h3></div><span class="small muted mono">${fmtDate(addDays(S.start, Math.round(p.from * total)))} → ${fmtDate(addDays(S.start, Math.round(p.to * total)))}</span>
    ${p.ms.map(m => `<label class="check ${S.milestones[m[0]] ? 'done' : ''}"><input type="checkbox" data-act="ms" data-id="${m[0]}" data-area="${p.area}" ${S.milestones[m[0]] ? 'checked' : ''}><span class="small"><span class="t">${esc(m[1])}</span>${S.milestones[m[0]] ? `<br><span class="muted mono">done ${fmtDate(S.milestones[m[0]])}</span>` : ''}</span></label>`).join('')}</div>`).join('')}</div>
    <p class="note">Two milestones check themselves: 90%+ on acronym rapid fire (15+ answered), and an 80+ average over your last 10 interview answers.</p></section>`;
};
function gantt(total) {
  const W = 1000, L = 250, R = 980, top = 34, rowH = 44, H = top + EP.phases.length * rowH + 14;
  const x = k => L + (R - L) * clamp(daysBetween(S.start, k) / total, 0, 1);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:680px" role="img" aria-label="Roadmap timeline">`;
  const d0 = parseKey(S.start); const m = new Date(d0.getFullYear(), d0.getMonth() + 1, 1);
  for (; keyOf(m) <= S.goal; m.setMonth(m.getMonth() + 1)) { const xx = x(keyOf(m)); s += `<line x1="${xx}" x2="${xx}" y1="${top - 8}" y2="${H - 10}" style="stroke:var(--line)"/><text x="${xx + 4}" y="${top - 14}">${m.toLocaleDateString('en-US', { month: 'short' })}${m.getMonth() === 0 ? ' ' + m.getFullYear() : ''}</text>`; }
  EP.phases.forEach((p, i) => {
    const y = top + i * rowH, x1 = L + (R - L) * p.from, x2 = L + (R - L) * p.to, done = p.ms.filter(q => S.milestones[q[0]]).length, frac = done / p.ms.length;
    s += `<text x="10" y="${y + 24}" style="fill:var(--ink);font-family:var(--f-body);font-size:13px">${esc(p.name)}</text>`;
    s += `<rect x="${x1}" y="${y + 8}" width="${x2 - x1}" height="24" rx="5" style="fill:${AREA_COLOR[p.area]};opacity:.18"/>`;
    s += `<rect x="${x1}" y="${y + 8}" width="${(x2 - x1) * frac}" height="24" rx="5" style="fill:${AREA_COLOR[p.area]};opacity:.85"/>`;
    p.ms.forEach((q, j) => { const mx = x1 + (x2 - x1) * (j + 1) / (p.ms.length + 1); const ok = S.milestones[q[0]]; s += `<path d="M${mx} ${y + 13} l7 7 l-7 7 l-7 -7z" style="fill:${ok ? 'var(--surface)' : 'var(--surface-2)'};stroke:${AREA_COLOR[p.area]}" stroke-width="1.5"><title>${esc(q[1])}</title></path>`; });
  });
  const tk = todayKey();
  if (tk >= S.start && tk <= S.goal) { const tx = x(tk); s += `<line x1="${tx}" x2="${tx}" y1="${top - 6}" y2="${H - 6}" style="stroke:var(--ink)" stroke-width="1.5"/><text x="${tx + 4}" y="${H - 2}" style="fill:var(--ink)">Today</text>`; }
  if (S.interview && S.interview >= S.start && S.interview <= S.goal) { const ix = x(S.interview); s += `<line x1="${ix}" x2="${ix}" y1="${top - 6}" y2="${H - 6}" style="stroke:var(--amber)" stroke-width="2" stroke-dasharray="5 4"/><text x="${ix - 4}" y="${top - 0}" text-anchor="end" style="fill:var(--amber)">Interview</text>`; }
  return s + '</svg>';
}
function xpChart() {
  const start = S.start < todayKey() ? S.start : addDays(todayKey(), -13);
  let span = Math.max(13, daysBetween(start, todayKey()));
  const pts = []; let cum = 0;
  Object.keys(S.xpByDay).filter(k => k < start).forEach(k => { cum += S.xpByDay[k]; });
  for (let i = 0; i <= span; i++) { const k = addDays(start, i); cum += S.xpByDay[k] || 0; pts.push(cum); }
  const W = 560, H = 220, L = 44, R = 16, T = 14, B = 26;
  const max = Math.max(50, Math.ceil(Math.max(...pts) / 50) * 50);
  const X = i => L + (W - L - R) * i / span, Y = v => T + (H - T - B) * (1 - v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Cumulative experience chart">`;
  for (let g = 0; g <= 4; g++) { const v = max * g / 4; s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)" stroke-dasharray="${g ? '2 4' : ''}"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`; }
  [0, Math.round(span / 2), span].forEach(i => { s += `<text x="${X(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === span ? 'end' : 'middle'}">${parseKey(addDays(start, i)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</text>`; });
  const line = pts.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  s += `<path d="${line} L${X(span)} ${Y(0)} L${X(0)} ${Y(0)}Z" style="fill:var(--accent);opacity:.12"/><path d="${line}" style="fill:none;stroke:var(--accent)" stroke-width="2.2"/>`;
  s += `<circle cx="${X(span)}" cy="${Y(pts[span])}" r="4.5" style="fill:var(--accent);stroke:var(--surface)" stroke-width="2"/>`;
  return s + '</svg>' + (S.xp === 0 ? '<p class="note">Your line starts climbing with your first check-in or drill.</p>' : '');
}

/* ================= KPI LIBRARY ================= */
let kpiQ = '', kpiCat = 'All';
VIEW.kpis = function () {
  const cats = ['All'].concat([...new Set(EP.kpis.map(k => k.cat))]);
  return `<div class="head"><div><span class="eyebrow">KPI library</span><h1>Metrics an executive speaks fluently</h1>
    <p class="lede">For each KPI: what it means, how it is calculated, a common benchmark, and one sentence you could say in a meeting. Benchmarks are general industry ranges, not LADWP targets.</p></div></div>
  <div class="row"><input type="search" id="kpi-search" data-in="kpi" placeholder="Search KPIs (burn rate, SAIDI, FCR…)" value="${esc(kpiQ)}" style="max-width:340px">
    ${cats.map(c => `<button class="chip" aria-pressed="${kpiCat === c}" data-act="kpicat" data-cat="${c}">${c}</button>`).join('')}</div>
  <div class="grid g3" id="kpi-list">${kpiList()}</div>`;
};
function kpiList() {
  const q = kpiQ.toLowerCase();
  const list = EP.kpis.filter(k => (kpiCat === 'All' || k.cat === kpiCat) && (!q || (k.name + ' ' + k.def + ' ' + k.cat).toLowerCase().includes(q)));
  return list.map(k => `<section class="card kpi"><div class="card-h"><h4>${esc(k.name)}</h4><span class="pill p-ops">${esc(k.cat)}</span></div><p class="small">${esc(k.def)}</p>
    <dl><dt>Formula</dt><dd class="mono" style="font-size:12.5px">${esc(k.formula)}</dd><dt>Benchmark</dt><dd>${esc(k.bench)}</dd><dt>Say it</dt><dd><i>${esc(k.say)}</i></dd></dl>
    <div class="row" style="margin-top:auto"><button class="btn sm" data-act="kpilearn" data-k="${esc(k.name)}">${S.items['kl:' + k.name] ? 'Learned ✓' : 'I can explain this (+3)'}</button></div></section>`).join('') || '<p class="muted">No KPIs match that search.</p>';
}

/* ================= GALLERY ================= */
function spark(vals, color, o = {}) {
  const W = o.w || 300, H = o.h || 110, L = 30, R = 10, T = 10, B = 20;
  const min = o.min ?? Math.min(...vals), max = o.max ?? Math.max(...vals);
  const X = i => L + (W - L - R) * i / (vals.length - 1), Y = v => T + (H - T - B) * (1 - (v - min) / (max - min || 1));
  const d = vals.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.label || 'trend')}">`;
  [min, (min + max) / 2, max].forEach(v => { s += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)" stroke-dasharray="2 4"/><text x="${L - 4}" y="${Y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`; });
  if (o.target != null) s += `<line x1="${L}" x2="${W - R}" y1="${Y(o.target)}" y2="${Y(o.target)}" style="stroke:var(--amber)" stroke-dasharray="5 3"/><text x="${W - R}" y="${Y(o.target) - 4}" text-anchor="end" style="fill:var(--amber)">target ${o.target}</text>`;
  if (o.labels) o.labels.forEach((l, i) => { if (l) s += `<text x="${X(i)}" y="${H - 5}" text-anchor="middle">${l}</text>`; });
  s += `<path d="${d} L${X(vals.length - 1)} ${H - B} L${X(0)} ${H - B}Z" style="fill:${color};opacity:.12"/><path d="${d}" style="fill:none;stroke:${color}" stroke-width="2"/><circle cx="${X(vals.length - 1)}" cy="${Y(vals[vals.length - 1])}" r="4" style="fill:${color}"/>`;
  if (o.series2) { const d2 = o.series2.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' '); s += `<path d="${d2}" style="fill:none;stroke:var(--muted)" stroke-width="1.6" stroke-dasharray="4 3"/>`; }
  return s + '</svg>';
}
function hbars(items, color, unit = '') {
  const max = Math.max(...items.map(i => i[1]));
  return `<div class="grid" style="gap:6px">${items.map(([l, v]) => `<div style="display:grid;grid-template-columns:110px 1fr 54px;gap:8px;align-items:center" class="small"><span>${l}</span><div class="bar" style="height:12px"><i style="width:${100 * v / max}%;background:${color}"></i></div><span class="mono">${v}${unit}</span></div>`).join('')}</div>`;
}
function gauge(pct, color, label) {
  const r = 52, c = Math.PI * r;
  return `<svg viewBox="0 0 140 84" width="160" role="img" aria-label="${label} ${pct}%"><path d="M18 74 A52 52 0 0 1 122 74" style="fill:none;stroke:var(--line)" stroke-width="12" stroke-linecap="round"/><path d="M18 74 A52 52 0 0 1 122 74" style="fill:none;stroke:${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c * pct / 100} ${c}"/><text x="70" y="70" text-anchor="middle" style="fill:var(--ink);font-size:22px;font-family:var(--f-display);font-weight:600">${pct}%</text></svg>`;
}
function quadrant(pts) {
  const W = 300, H = 200, L = 34, B = 26, T = 10, R = 10, lo = 0.75, hi = 1.15;
  const X = v => L + (W - L - R) * (v - lo) / (hi - lo), Y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Projects by CPI and SPI">`;
  s += `<rect x="${L}" y="${Y(1)}" width="${X(1) - L}" height="${H - B - Y(1)}" style="fill:var(--bad);opacity:.08"/><rect x="${X(1)}" y="${T}" width="${W - R - X(1)}" height="${Y(1) - T}" style="fill:var(--good);opacity:.08"/>`;
  s += `<line x1="${X(1)}" x2="${X(1)}" y1="${T}" y2="${H - B}" style="stroke:var(--muted)"/><line x1="${L}" x2="${W - R}" y1="${Y(1)}" y2="${Y(1)}" style="stroke:var(--muted)"/>`;
  s += `<text x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle">SPI (schedule) →</text><text x="12" y="${(T + H - B) / 2}" transform="rotate(-90 12 ${(T + H - B) / 2})" text-anchor="middle">CPI (cost) →</text>`;
  s += `<text x="${W - R - 4}" y="${T + 12}" text-anchor="end" style="fill:var(--good)">ahead &amp; under</text><text x="${L + 4}" y="${H - B - 6}" style="fill:var(--bad)">behind &amp; over</text>`;
  pts.forEach(p => { s += `<circle cx="${X(p[1])}" cy="${Y(p[2])}" r="6" style="fill:${p[1] < 1 && p[2] < 1 ? 'var(--bad)' : p[1] >= 1 && p[2] >= 1 ? 'var(--good)' : 'var(--amber)'};stroke:var(--surface)" stroke-width="1.5"><title>${p[0]}: SPI ${p[1]}, CPI ${p[2]}</title></circle><text x="${X(p[1]) + 8}" y="${Y(p[2]) + 4}">${p[0]}</text>`; });
  return s + '</svg>';
}
function vbars(vals, labels, color, o = {}) {
  const W = 300, H = 120, L = 28, B = 20, T = 10, R = 6, max = o.max || Math.max(...vals) * 1.15, bw = (W - L - R) / vals.length;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.label || 'bars')}">`;
  [0, max / 2, max].forEach(v => { const y = T + (H - T - B) * (1 - v / max); s += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" style="stroke:var(--line)" stroke-dasharray="2 4"/><text x="${L - 4}" y="${y + 4}" text-anchor="end">${(Math.round(v * 10) / 10)}</text>`; });
  vals.forEach((v, i) => { const h = (H - T - B) * v / max; s += `<rect x="${L + i * bw + bw * 0.2}" y="${H - B - h}" width="${bw * 0.6}" height="${h}" rx="3" style="fill:${color};opacity:${i === vals.length - 1 ? 1 : 0.55}"/><text x="${L + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${labels[i]}</text>`; });
  return s + '</svg>';
}
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
VIEW.gallery = function () {
  const dash = (title, tag, body, asks) => `<section class="card"><div class="card-h"><h3>${title}</h3><span class="pill ${tag}">Example</span></div>${body}<div class="card flat" style="padding:12px"><span class="eyebrow">What an executive asks</span><ul class="dots small">${asks.map(a => `<li>${a}</li>`).join('')}</ul></div></section>`;
  const tiles = arr => `<div class="grid g2" style="gap:10px">${arr.map(t => `<div class="tile"><span class="eyebrow">${t[0]}</span><span class="v" style="font-size:24px">${t[1]}</span><span class="s">${t[2]}</span></div>`).join('')}</div>`;
  return `<div class="head"><div><span class="eyebrow">Dashboard gallery</span><h1>Dashboards worth recognizing on sight</h1>
    <p class="lede">Five common operating dashboards with example data, to give you ideas and vocabulary. These are illustrative numbers, not LADWP figures. Practice reading each one out loud in 30 seconds: headline, trend, risk, action.</p></div></div>
  <div class="grid g2">
  ${dash('New Business service planning', 'p-comm', `${tiles([['Backlog', '4.2 mo', 'down from 5.6'], ['On-time energization', '88%', 'target 90%']])}
    <h4>Pipeline this quarter (jobs)</h4>${hbars([['Applications', 420], ['In design', 310], ['Permits', 240], ['Construction', 180], ['Energized', 150]], 'var(--accent)')}
    <h4>Median days to energize (commercial)</h4>${spark([128, 126, 125, 121, 119, 118, 114, 112, 110, 108, 105, 104], 'var(--accent)', { target: 100, labels: MONTHS, label: 'median days to energize' })}`,
    ['Where is the bottleneck? (Here: design to permits loses the most.)', 'Is intake growing faster than throughput?', 'Which job types drive the 90th-percentile tail?'])}
  ${dash('Safety performance', 'p-safety', `${tiles([['Job walks', '46 / 50', 'monthly plan'], ['Corrective actions on time', '93%', 'target 90%'], ['Near misses reported', '31', 'up from 18'], ['JHA quality audit', '92%', 'sampled JHAs']])}
    <h4>TRIR by quarter (lagging)</h4>${vbars([3.1, 2.9, 2.6, 2.4], ['Q1', 'Q2', 'Q3', 'Q4'], 'var(--safety)', { label: 'TRIR by quarter' })}`,
    ['Are leading indicators rising while injuries fall?', 'Which corrective actions are overdue and high severity?', 'What did the JLMSC raise this month, and is it closed?'])}
  ${dash('Customer service center', 'p-ops', `<div class="row" style="gap:20px;align-items:center">${gauge(71, 'var(--good)', 'First contact resolution')}<div class="tile"><span class="eyebrow">First contact resolution</span><span class="s">Good range 70–75%</span></div></div>
    ${tiles([['Abandonment', '4%', 'target under 5%'], ['CSAT', '82%', 'new service customers']])}
    <h4>Average speed of answer (seconds)</h4>${spark([62, 58, 55, 60, 52, 48, 45, 47, 44, 41, 43, 45], 'var(--good)', { target: 30, labels: MONTHS, label: 'average speed of answer' })}`,
    ['What are the top three reasons customers call about new service?', 'Could proactive status updates remove those calls?', 'How does ASA move with staffing?'])}
  ${dash('Capital project portfolio', 'p-strategy', `<h4>Projects by schedule and cost performance</h4>${quadrant([['A', 1.04, 1.02], ['B', 0.88, 0.95], ['C', 0.97, 1.08], ['D', 1.08, 0.91], ['E', 0.82, 0.84], ['F', 1.01, 0.99], ['G', 0.93, 1.03]])}
    <h4>Cumulative spend, actual vs plan ($M)</h4>${spark([0.4, 0.9, 1.5, 2.1, 2.8, 3.6, 4.4, 5.3, 6.1], 'var(--amber)', { series2: [0.4, 0.8, 1.3, 1.9, 2.5, 3.1, 3.8, 4.5, 5.2], labels: MONTHS.slice(0, 9), label: 'cumulative spend' })}<p class="small muted">Solid: actual. Dashed: plan. Burn rate is running ahead of plan since month 4.</p>`,
    ['Which projects are behind AND over (bottom-left)?', 'At the current burn rate, when does the budget run out?', 'What is the recovery plan and who owns it?'])}
  ${dash('Workforce & EEO compliance', 'p-eeo', `${tiles([['Vacancy rate', '14%', '120-day time to fill'], ['Overtime', '18%', 'guideline 10%']])}
    <h4>Harassment-prevention training current (%)</h4>${hbars([['Design', 100], ['Construction', 94], ['Planning', 97], ['Customer svc', 89], ['Admin', 100]], 'var(--eeo)', '%')}`,
    ['Who is out of compliance, and by when will they be current?', 'Is overtime evenly and fairly distributed?', 'What is our succession plan for critical roles?'])}
  ${dash('Executive one-pager (how to combine them)', 'p-vocab', `<p class="small">An assistant director’s weekly view usually fits on one page with five rows:</p>
    <ul class="dots small"><li><b>Safety:</b> leading indicators and open corrective actions</li><li><b>Customers:</b> cycle time, on-time %, backlog</li><li><b>Money:</b> burn rate vs plan, CPI/SPI of top projects</li><li><b>People:</b> vacancies, overtime, training compliance</li><li><b>Priorities:</b> top 10 projects with red/amber/green status and the one decision needed</li></ul>
    <p class="note">Read it in this order: what changed, why, what we are doing, what I need from you.</p>`,
    ['What decision do you need from me this week?', 'What is red, and what is the plan to get it to green?', 'What risk is not on this page yet?'])}
  </div>`;
};

/* ================= ACTIONS ================= */
VIEW.actions = function () {
  const all = EP.actions.map(a => ({ id: a.id, text: a.text, note: a.note, done: !!S.actions[a.id], custom: false })).concat(S.custom.map(c => ({ id: c.id, text: c.text, note: '', done: !!c.done, custom: true })));
  const open = all.filter(a => !a.done), done = all.filter(a => a.done);
  const row = a => `<li><label class="check ${a.done ? 'done' : ''}"><input type="checkbox" data-act="action" data-id="${a.id}" data-custom="${a.custom ? 1 : 0}" ${a.done ? 'checked' : ''}><span style="flex:1;min-width:0"><span class="t">${esc(a.text)}</span>${a.note ? `<br><span class="small muted">${esc(a.note)}</span>` : ''}</span>${a.custom ? `<button class="btn sm ghost" data-act="rmaction" data-id="${a.id}" aria-label="Remove">Remove</button>` : ''}</label></li>`;
  return `<div class="head"><div><span class="eyebrow">Actions & reminders</span><h1>Take action, then come back twice a day</h1>
    <p class="lede">Your reminders are on your Google Calendar. The action items below are the inputs that make this dashboard specific to your division.</p></div></div>
  <div class="grid g2">
    <section class="card"><h2>Reminder schedule</h2>
      <div class="sess"><span class="n">AM</span><div><b>Weekdays, 8:00 AM</b><div class="small muted">Check in · 60-second rapid fire · today’s interview question · read LAPP and LEAP</div></div><span class="pill p-comm">10 min</span></div>
      <div class="sess"><span class="n">PM</span><div><b>Weekdays, 4:05 PM</b><div class="small muted">Check in · weak-spot flashcards · one KPI out loud · polish your closing statement</div></div><span class="pill p-comm">10 min</span></div>
      <p class="note">Both reminders are recurring Google Calendar events (Pacific time) with a link back here. To change the time, edit the event in Google Calendar.</p></section>
    <section class="card"><h2>Weekly rhythm</h2><ul class="dots small">
      <li><b>Monday:</b> Safety deck + one safety STAR answer</li><li><b>Tuesday:</b> EEO deck + one EEO scenario answer</li>
      <li><b>Wednesday:</b> Case question with an issue tree</li><li><b>Thursday:</b> KPI library + one dashboard read out loud</li>
      <li><b>Friday:</b> Mock panel: 3 random questions, export the week’s Q&amp;A to Word</li></ul>
      <p class="note">Consistency beats intensity: two short sessions every weekday is the plan.</p></section>
  </div>
  <section class="card"><div class="card-h"><h2>Action items</h2><span class="mono small muted">${open.length} open · ${done.length} done</span></div>
    <ul class="clean">${open.map(row).join('')}</ul>
    <form class="row" id="addaction"><input type="text" id="newaction" placeholder="Add an action (for example: Ask director for the CAR deck)" style="flex:1;min-width:200px"><button class="btn primary" type="submit">Add</button></form>
    ${done.length ? `<details><summary class="small muted" style="cursor:pointer">Completed (${done.length})</summary><ul class="clean" style="margin-top:8px">${done.map(row).join('')}</ul></details>` : ''}
  </section>
  <section class="card"><h2>How to send documents</h2><p class="small">Open a Claude conversation, attach the file (IIPP, EEO policy, CAR New Business slides, top 10 projects), and ask: “Update my Executive Path dashboard with this.” The drills, playbook and interview questions will then use your division’s exact language and numbers.</p></section>`;
};

/* ================= events ================= */
const ACT = {
  step(b) {
    const k = b.dataset.step, slot = b.dataset.slot, d = day();
    if (k === 'checkin') { if (!d[slot]) { d[slot] = true; award(10, 'comm'); render(); } return; }
    d.steps[slot + ':' + k] = true; save();
    if (k === 'rapid') { go('drills'); startQuiz('acronyms', 'rapid'); }
    else if (k === 'weak') { go('drills'); startQuiz('weak', 'flash'); }
    else if (k === 'qod') { setQ(pick(EP.questions).id); go('interview'); }
    else if (k === 'playbook') { go('playbook'); award(3, 'safety', true); }
    else if (k === 'kpi') { kpiQ = pick(EP.kpis).name; go('kpis'); }
    else if (k === 'closing') { go('playbook'); setTimeout(() => { const el = $('#pb-closing'); if (el) el.scrollIntoView(); }, 50); }
  },
  useword() { const k = 'word:' + todayKey(); if (S.items[k]) { toast('Already logged today'); return; } S.items[k] = { r: 1, w: 0 }; award(5, 'vocab'); },
  openq(b) { setQ(b.dataset.q); if (cur === 'interview') render(); else go('interview'); },
  retry(b) { setQ(b.dataset.q); IV.text = ''; IV.crit = null; render(); window.scrollTo(0, 0); },
  jump(b) { const el = document.getElementById(b.dataset.to); if (el) el.scrollIntoView({ behavior: 'smooth' }); },
  copy(b) { copyText(b.dataset.text); },
  useclosing(b) { S.closing = EP.closings[+b.dataset.i].text; save(); render(); setTimeout(() => { const el = $('#closing'); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } }, 30); toast('Template copied into your draft'); },
  closingdone() { if (!S.closing.trim()) { toast('Write your closing first'); return; } const d = day(); const slot = new Date().getHours() < 13 ? 'am' : 'pm'; d.steps[slot + ':closing'] = true; if (!S.milestones.m3) S.milestones.m3 = todayKey(); award(10, 'comm'); },
  quiz(b) { if (cur !== 'drills') go('drills'); startQuiz(b.dataset.deck, b.dataset.mode); },
  quizexit() { Q = null; render(); },
  quizend() { finishQuiz(); },
  answer(b) {
    if (Q.answered) return; const it = Q.items[Q.i]; const o = Q.opts[+b.dataset.i]; Q.answered = o; const ok = o === it.answer; record(it, ok);
    render(); if (Q.mode === 'rapid') setTimeout(() => { if (Q && !Q.done) nextQ(); }, ok ? 350 : 900);
  },
  nextq() { nextQ(); },
  flip() { Q.flipped = !Q.flipped; render(); },
  flash(b) { const it = Q.items[Q.i]; const ok = b.dataset.ok === '1'; record(it, ok); if (!ok && Q.max < 60) { Q.items.push(it); Q.max++; } nextQ(); },
  ivcat(b) { IV.cat = b.dataset.cat; render(); },
  ivrandom() { setQ(EP.questions[Math.floor(Math.random() * EP.questions.length)].id); render(); },
  ivclock() { if (IV.tick) stopClock(); else startClock(); const b = document.querySelector('[data-act="ivclock"]'); if (b) b.textContent = IV.tick ? 'Pause' : 'Start clock'; },
  dictate() { if (IV.rec) stopDictation(); else startDictation(); },
  quick() { if (!IV.text.trim()) { toast('Write or dictate an answer first'); return; } IV.crit = quickCheck(IV.text, IV.secs); $('#crit').innerHTML = critHTML(); },
  coach() { coach(); },
  ivsave() { saveAnswer(); },
  sel(b, e) { e.stopPropagation(); if (b.checked) IV.sel.add(b.dataset.id); else IV.sel.delete(b.dataset.id); },
  del(b) { const id = b.dataset.id; if (IV.confirmDel !== id) { IV.confirmDel = id; $('#repo').innerHTML = repoHTML(); const d = document.querySelector(`[data-id="${id}"]`); if (d) d.closest('details').open = true; return; } answers = answers.filter(a => a.id !== id); IV.sel.delete(id); IV.confirmDel = null; dropAnswer(id); saveLocal(); $('#repo').innerHTML = repoHTML(); toast('Deleted'); },
  export(b) { doExport(b.dataset.fmt); },
  copyall() { if (!answers.length) { toast('Save an answer first'); return; } copyText(plainExport(exportSet())); },
  ms(b) { const id = b.dataset.id; if (b.checked) { S.milestones[id] = todayKey(); award(25, b.dataset.area); } else { delete S.milestones[id]; save(); } render(); },
  kpicat(b) { kpiCat = b.dataset.cat; render(); },
  kpilearn(b) { const k = 'kl:' + b.dataset.k; if (S.items[k]) return; S.items[k] = { r: 1, w: 0 }; award(3, 'ops'); $('#kpi-list').innerHTML = kpiList(); },
  action(b) {
    const id = b.dataset.id;
    if (b.dataset.custom === '1') { const c = S.custom.find(x => x.id === id); if (c) { c.done = b.checked; if (b.checked) award(10, 'strategy'); else save(); } }
    else if (b.checked) { S.actions[id] = todayKey(); award(10, 'strategy'); } else { delete S.actions[id]; save(); }
    render();
  },
  rmaction(b, e) { e.preventDefault(); S.custom = S.custom.filter(c => c.id !== b.dataset.id); save(); render(); }
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const fn = ACT[b.dataset.act]; if (!fn) return;
  if (b.tagName !== 'INPUT') e.preventDefault();
  fn(b, e);
});
document.addEventListener('submit', e => {
  if (e.target.id === 'addaction') { e.preventDefault(); const v = $('#newaction').value.trim(); if (!v) return; S.custom.push({ id: 'c' + Date.now(), text: v, done: false }); save(); render(); }
});
let draftT = null;
document.addEventListener('input', e => {
  const t = e.target; const k = t.dataset && t.dataset.in; if (!k) return;
  if (k === 'closing') { S.closing = t.value; save(); const n = (t.value.trim().match(/\S+/g) || []).length; const el = $('#closing-wc'); if (el) el.textContent = n + ' words · ~' + Math.round(n / 2.3) + 's spoken'; }
  else if (k === 'ivtext') { IV.text = t.value; if (!IV.tick && IV.text.length > 3) { startClock(); const b = document.querySelector('[data-act="ivclock"]'); if (b) b.textContent = 'Pause'; } updateWC(); clearTimeout(draftT); draftT = setTimeout(() => { try { localStorage.setItem(LS + ':draft', IV.text); } catch (er) { /* ignore */ } }, 500); }
  else if (k === 'kpi') { kpiQ = t.value; $('#kpi-list').innerHTML = kpiList(); }
});
document.addEventListener('change', e => {
  const t = e.target; if (t.dataset && t.dataset.in === 'date') { const k = t.dataset.k; if (k === 'interview' && !t.value) S.interview = ''; else if (t.value) S[k] = t.value; if (daysBetween(S.start, S.goal) < 14) S.goal = addDays(S.start, 14); save(); render(); }
});
window.addEventListener('hashchange', route);

/* ================= boot ================= */
loadLocal();
route();
initRemote();
})();
