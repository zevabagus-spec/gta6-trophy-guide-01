// Leonida Platinum — GTA VI trophy guide & tracker.
// Data-driven: every trophy, guide, source, kind, missable flag and roadmap
// stage comes from data/trophies.json. Progress lives in localStorage
// (in-memory fallback when storage is unavailable) and can be exported
// to a file and imported back. No network request is ever made at run time
// except loading the app's own data file; source links open only when the
// reader follows them.

const STORAGE_KEY = 'leonida-platinum-earned-v1';
const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPane');
const statusEl = document.getElementById('status');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const gradeEl = document.getElementById('gradeFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const hideEarnedEl = document.getElementById('hideEarned');

let trophies = [];
let roadmap = [];
let earned = new Set();
let selectedId = null;
let view = 'checklist';
let storageOK = true;

// localStorage may be unavailable (private mode, disabled cookies):
// keep progress in memory instead and say so, rather than crashing.
function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => typeof n === 'string'));
  } catch {
    storageOK = false;
    return new Set();
  }
}
function saveStored() {
  if (!storageOK) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
  } catch {
    storageOK = false;
    setStatus('Browser storage is unavailable, so ticks are kept only until this tab closes.');
  }
}
function setStatus(msg) {
  statusEl.textContent = msg || '';
}

function isStory(t) { return t.kind === 'story'; }
function isHidden(t, earnedNow) {
  return spoilerEl.checked && isStory(t) && !earnedNow;
}
function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  const kind = kindEl.value;
  const grade = gradeEl.value;
  return trophies.filter((t) => {
    if (kind === 'online') return false; // No online trophies exist in this list.
    if (kind === 'missable' && !t.missable) return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (hideEarnedEl.checked && earned.has(t.name)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length || 55;
  document.getElementById('earnedCount').textContent = String(n);
  document.getElementById('progressFill').style.width = (n / total * 100) + '%';
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(n));
  document.getElementById('progressPct').textContent =
    Math.round(n / total * 100) + '% — ' +
    (n >= total ? 'every trophy earned.' : 'the platinum is ' + (total - n) + ' trophies away');
  document.getElementById('platinumNote').hidden = n < total;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  document.getElementById('emptyNote').hidden = shown.length > 0;
  document.getElementById('listMeta').textContent =
    'Showing ' + shown.length + ' of ' + trophies.length + ' trophies' +
    (kindEl.value === 'online' ? ' — 0 online trophies: every GTA VI trophy is single-player (PowerPyx).' : '') +
    (spoilerEl.checked ? ' — story trophies hidden until earned.' : '');
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'grade-' + t.grade + (earned.has(t.name) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      saveStored();
      renderAll();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'tName';
    if (isHidden(t, earned.has(t.name))) {
      name.textContent = 'Hidden story trophy — earn it to reveal';
    } else {
      name.textContent = t.name;
      if (t.hidden) {
        const tag = document.createElement('span');
        tag.className = 'hiddenTag';
        tag.textContent = 'Hidden on PSN';
        name.append(tag);
      }
    }
    const desc = document.createElement('div');
    desc.className = 'tDesc';
    desc.textContent = isHidden(t, earned.has(t.name)) ? 'Spoiler hidden until earned.' : t.description;
    const meta = document.createElement('div');
    meta.className = 'tMeta';
    const grade = document.createElement('span');
    grade.className = 'gradeLabel';
    const dot = document.createElement('span');
    dot.className = 'gradeDot';
    grade.append(dot, document.createTextNode(gradeLabel(t.grade)));
    meta.append(grade);
    const kindTag = document.createElement('span');
    kindTag.className = 'kindTag';
    kindTag.textContent = t.kind;
    meta.append(kindTag);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'missFlag';
      flag.textContent = 'MISSABLE';
      meta.append(flag);
    }
    const stage = document.createElement('span');
    stage.textContent = 'Roadmap stage ' + t.stage;
    meta.append(stage);
    body.append(name, desc, meta);
    const check = document.createElement('div');
    check.textContent = earned.has(t.name) ? '✓' : '';
    check.setAttribute('aria-hidden', 'true');
    li.append(box, body, check);
    li.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId) || trophies[0];
  if (!t) { detailEl.textContent = 'Loading…'; return; }
  selectedId = t.id;
  detailEl.replaceChildren();
  const h2 = document.createElement('h2');
  const off = document.createElement('p');
  off.className = 'offName';
  const guideH = document.createElement('h3');
  guideH.textContent = 'Guide';
  const guideP = document.createElement('p');
  guideP.className = 'guideText';
  const srcH = document.createElement('h3');
  srcH.textContent = 'Sources';
  const srcList = document.createElement('ul');
  srcList.className = 'sources';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earnBtn' + (earned.has(t.name) ? ' earned' : '');
  btn.textContent = earned.has(t.name) ? '✓ Earned — click to untick' : 'Mark as earned';
  btn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name); else earned.add(t.name);
    saveStored();
    renderAll();
  });
  if (isHidden(t, earned.has(t.name))) {
    h2.textContent = 'Hidden story trophy';
    off.textContent = t.grade ? gradeLabel(t.grade) + ' · Story · Roadmap stage ' + t.stage : '';
    const box = document.createElement('p');
    box.className = 'spoilerBox';
    box.textContent = 'Spoilers are hidden until this trophy is earned. Tick it off in the checklist (or press the button below) to reveal its name, description and guide.';
    detailEl.append(h2, off, box, btn);
    return;
  }
  h2.textContent = t.name;
  off.textContent = gradeLabel(t.grade) + ' · ' + t.kind +
    (t.missable ? ' · MISSABLE' : '') + ' · Roadmap stage ' + t.stage +
    (t.hidden ? ' · Hidden on PSN until earned' : '');
  const descP = document.createElement('p');
  descP.className = 'offDesc';
  descP.textContent = 'Official description: “' + t.description + '”';
  guideP.textContent = t.guide;
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const m = s.match(/^(.*?) — (https?:\S+)$/);
    if (m) {
      li.append(document.createTextNode(m[1] + ' — '));
      const a = document.createElement('a');
      a.href = m[2];
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = m[2];
      li.append(a);
    } else {
      li.textContent = s;
    }
    srcList.append(li);
  }
  detailEl.append(h2, off, descP, guideH, guideP, srcH, srcList, btn);
}

function renderRoadmap() {
  const ol = document.getElementById('roadmapList');
  ol.replaceChildren();
  for (const s of roadmap) {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    h3.textContent = s.title;
    const p = document.createElement('p');
    p.textContent = s.text;
    const count = document.createElement('p');
    count.className = 'stageCount';
    const done = trophies.filter((t) => t.stage === s.stage && earned.has(t.name)).length;
    const total = trophies.filter((t) => t.stage === s.stage).length;
    count.textContent = done + ' of ' + total + ' stage trophies earned';
    li.append(h3, p, count);
    ol.append(li);
  }
}

function renderMissables() {
  const box = document.getElementById('missableList');
  box.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  document.getElementById('missableCount').textContent = String(flagged.length);
  for (const t of flagged) {
    const card = document.createElement('div');
    card.className = 'missCard';
    const h3 = document.createElement('h3');
    h3.textContent = '⚠ ' + t.name + ' — ' + gradeLabel(t.grade);
    const p = document.createElement('p');
    p.textContent = t.missable_note || '';
    const g = document.createElement('p');
    g.textContent = t.guide;
    const link = document.createElement('p');
    const a = document.createElement('a');
    a.href = '#trophy=' + t.id;
    a.textContent = 'Open its full guide in the checklist →';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      selectedId = t.id;
      setView('checklist');
      renderAll();
    });
    link.append(a);
    card.append(h3, p, g, link);
    box.append(card);
  }
}

function setView(v) {
  view = v;
  document.getElementById('tab-checklist').classList.toggle('active', v === 'checklist');
  document.getElementById('tab-roadmap').classList.toggle('active', v === 'roadmap');
  document.getElementById('tab-missables').classList.toggle('active', v === 'missables');
  document.querySelector('.layout').hidden = v !== 'checklist';
  document.getElementById('toolbar').style.display = v === 'checklist' ? '' : 'none';
  document.getElementById('roadmapPage').hidden = v !== 'roadmap';
  document.getElementById('missablesPage').hidden = v !== 'missables';
  try {
    const url = new URL(location.href);
    url.hash = v === 'checklist' ? ('trophy=' + selectedId) : ('view=' + v);
    history.replaceState(null, '', url);
  } catch { /* deep links are a nicety, not a requirement */ }
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
  setView(view);
}

function exportProgress() {
  const data = JSON.stringify({ game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned].sort() }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  setStatus('Exported ' + earned.size + ' earned trophies to gta6-trophy-progress.json' + (earned.size === 0 ? ' (nothing ticked yet — the file holds an empty list).' : '.'));
}

async function importProgress(file) {
  if (!file) return;
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    setStatus('Import failed: that file is not valid JSON. Your saved progress was not changed.');
    return;
  }
  // Accept either a bare array of trophy names or an object with an "earned" array.
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names) || !names.every((n) => typeof n === 'string')) {
    setStatus('Import failed: expected a JSON array of trophy names, or {"earned": [...]}. Your saved progress was not changed.');
    return;
  }
  const known = new Set(trophies.map((t) => t.name));
  const good = names.filter((n) => known.has(n));
  const unknown = names.length - good.length;
  earned = new Set(good);
  saveStored();
  renderAll();
  setStatus('Imported ' + good.length + ' earned trophies' + (unknown ? ' (' + unknown + ' names were not in the 55-trophy list and were ignored).' : '.'));
}

async function boot() {
  const doc = await (await fetch('data/trophies.json')).json();
  trophies = doc.trophies;
  roadmap = doc.roadmap || [];
  earned = loadStored();
  if (!storageOK) setStatus('Browser storage is unavailable, so ticks are kept only until this tab closes.');
  // Screenshot/demo helper: ?seed=N ticks the first N trophies when no
  // progress is saved yet. Harmless in normal use (no saved progress +
  // no seed = empty checklist).
  const params = new URLSearchParams(location.search);
  const seed = Number(params.get('seed'));
  if (earned.size === 0 && Number.isInteger(seed) && seed > 0) {
    for (const t of trophies.slice(0, Math.min(seed, trophies.length))) earned.add(t.name);
    saveStored();
  }
  const viewParam = params.get('view');
  if (viewParam === 'roadmap' || viewParam === 'missables') view = viewParam;
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('view') === 'roadmap' || hash.get('view') === 'missables') view = hash.get('view');
  const trophyParam = hash.get('trophy') || params.get('trophy');
  if (trophyParam && trophies.some((t) => t.id === trophyParam)) selectedId = trophyParam;
  if (!selectedId && trophies.length) selectedId = trophies[0].id;
  renderAll();
}

document.getElementById('tab-checklist').addEventListener('click', () => { view = 'checklist'; renderAll(); });
document.getElementById('tab-roadmap').addEventListener('click', () => { view = 'roadmap'; renderAll(); });
document.getElementById('tab-missables').addEventListener('click', () => { view = 'missables'; renderAll(); });
searchEl.addEventListener('input', renderList);
kindEl.addEventListener('change', renderList);
gradeEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', renderAll);
hideEarnedEl.addEventListener('change', renderList);
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (e) => {
  importProgress(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (earned.size === 0) { setStatus('Nothing to reset — no trophies are ticked.'); return; }
  if (window.confirm('Clear all ' + earned.size + ' earned ticks?')) {
    earned = new Set();
    saveStored();
    renderAll();
    setStatus('Progress cleared.');
  }
});

boot();
