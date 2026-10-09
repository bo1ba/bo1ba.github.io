import { FIREBASE_CONFIG } from './firebase-config.js?v=4';
import { LANGS, STRINGS, ITEM_NAMES, detectLang } from './i18n.js?v=4';

/* ================= 基本資料 ================= */
const LS_ME = 'roster.me';
const LS_FILTER = 'roster.filter';
const LS_LANG = 'roster.lang';
const LS_NOTIFY = 'roster.notify';
const LS_LOCKSEEN = 'roster.lockSeen';
const MAX_PREFS = 3;
const LOCK_MS = 15 * 60e3;        // 開始前 15 分鐘鎖定
const END_MS = 6 * 3600e3;        // 開始後 6 小時視為活動結束

const ROLES = {
  tank: { en: 'TANK', emoji: '🛡️', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5l-8-3z"/></svg>' },
  dps: { en: 'DPS', emoji: '⚔️', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>' },
  support: { en: 'SUPPORT', emoji: '✨', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>' },
  healer: { en: 'HEALER', emoji: '➕', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z"/></svg>' },
};

// 武器/裝備名稱 → Albion 道具 ID(圖示來自 render.albiononline.com);第 4 欄 = 自選類的翻譯 key
const ITEMS = [
  [['heavy mace'], 'T8_2H_MACE', 'Heavy Mace'],
  [['incubus', 'incubus mace'], 'T8_MAIN_MACE_HELL', 'Incubus Mace'],
  [['hammer'], 'T8_MAIN_HAMMER', 'Hammer'],
  [['earthrune', 'earthrune staff'], 'T8_2H_SHAPESHIFTER_KEEPER', 'Earthrune Staff'],
  [['forge hammer', 'forge hammers'], 'T8_2H_DUALHAMMER_HELL', 'Forge Hammers'],
  [['melee'], null, 'Melee', 'w.melee'],
  [['lightcaller'], 'T8_2H_SHAPESHIFTER_AVALON', 'Lightcaller'],
  [['dawnsong'], 'T8_2H_FIRE_RINGPAIR_AVALON', 'Dawnsong'],
  [['gloves'], 'T8_2H_KNUCKLES_SET1', 'Gloves', 'w.gloves'],
  [['shadowcaller'], 'T8_MAIN_CURSEDSTAFF_AVALON', 'Shadowcaller'],
  [['rootbound', 'rootbound staff'], 'T8_2H_SHAPESHIFTER_SET2', 'Rootbound Staff'],
  [['oath', 'oathkeeper', 'oathkeepers'], 'T8_2H_DUALMACE_AVALON', 'Oathkeepers'],
  [['evensong'], 'T8_2H_ARCANE_RINGPAIR_AVALON', 'Evensong'],
  [['ga', 'great arcane', 'great arcane staff'], 'T8_2H_ARCANESTAFF', 'Great Arcane Staff'],
  [['occu', 'occult', 'occult staff'], 'T8_2H_ARCANESTAFF_HELL', 'Occult Staff'],
  [['redemption', 'redemption staff'], 'T8_2H_HOLYSTAFF_UNDEAD', 'Redemption Staff'],
  [['fallen', 'fallen staff'], 'T8_2H_HOLYSTAFF_HELL', 'Fallen Staff'],
  [['blight', 'blight staff'], 'T8_2H_NATURESTAFF_HELL', 'Blight Staff'],
  [['royal armor'], 'T8_ARMOR_PLATE_ROYAL', 'Royal Armor'],
  [['royal jacket'], 'T8_ARMOR_LEATHER_ROYAL', 'Royal Jacket'],
  [['royal robe'], 'T8_ARMOR_CLOTH_ROYAL', 'Royal Robe'],
  [['pve weapon', 'pve'], null, 'PvE Weapon', 'w.pve'],
];

const DEFAULT_CONFIG = {
  event: { title: '20-Man Roster', time: '', note: '' },
  comp: [
    { role: 'tank', slots: [
      { weapon: 'heavy mace', note: 'bring incubus' },
      { weapon: 'heavy mace', note: 'bring incubus' },
      { weapon: 'hammer', note: '' },
      { weapon: 'earthrune', note: 'Royal Armor' },
    ] },
    { role: 'dps', slots: [
      { weapon: 'forge hammer', note: 'bring pve weapon' },
      { weapon: 'melee', note: '' },
      { weapon: 'lightcaller', note: '' },
      { weapon: 'lightcaller', note: '' },
      { weapon: 'lightcaller', note: '' },
      { weapon: 'dawnsong', note: '' },
      { weapon: 'Gloves', note: '' },
      { weapon: 'shadowcaller', note: '' },
    ] },
    { role: 'support', slots: [
      { weapon: 'Rootbound', note: 'Royal Armor bring occu' },
      { weapon: 'oath', note: 'royal jacket bring pve weapon' },
      { weapon: 'evensong', note: 'bring occu' },
      { weapon: 'GA', note: '' },
    ] },
    { role: 'healer', slots: [
      { weapon: 'Redemption', note: 'bring Royal robe' },
      { weapon: 'Redemption', note: 'bring Royal robe' },
      { weapon: 'Fallen', note: 'bring Royal robe' },
      { weapon: 'blight', note: 'bring pve weapon' },
    ] },
  ],
};

/* ================= 小工具 ================= */
const $ = (sel, root = document) => root.querySelector(sel);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* 無痕模式等 */ } },
};

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : String(kid));
  }
  return el;
}

/* ---------- 多語系 ---------- */
let LANG = 'zh';
const langMeta = code => LANGS.find(l => l.code === code) || LANGS[0];
function t(key, vars) {
  let s = (STRINGS[LANG] || {})[key] ?? STRINGS.en[key] ?? STRINGS.zh[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  return s;
}
// 模板裡的 {name} 換成 DOM 節點(例如粗體名字)
function tNodes(key, nodes) {
  return t(key).split(/(\{\w+\})/).filter(Boolean).map(part => {
    const m = part.match(/^\{(\w+)\}$/);
    return m && nodes[m[1]] != null ? nodes[m[1]] : part;
  });
}
const loadedFonts = new Set();
function loadFont(meta) {
  if (!meta.font || loadedFonts.has(meta.font)) return;
  loadedFonts.add(meta.font);
  document.head.append(h('link', { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?family=${meta.font}:wght@400;500;700;900&display=swap` }));
}

// Firebase 會把 [a,b] 存成 {0:a,1:b},讀回來可能是陣列也可能是物件
function asList(v) {
  if (Array.isArray(v)) return v.filter(x => x != null);
  if (v && typeof v === 'object') return Object.keys(v).sort((a, b) => a - b).map(k => v[k]).filter(x => x != null);
  return [];
}

const norm = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
const ITEM_INDEX = new Map();
for (const [aliases, id, en, key] of ITEMS) for (const a of aliases) ITEM_INDEX.set(a, { id, en, key });
function lookup(name) {
  const n = norm(name);
  if (!n) return null;
  return ITEM_INDEX.get(n) || ITEM_INDEX.get(n.replace(/s$/, '')) || null;
}
// 道具的在地名稱(官方譯名;自選類用翻譯 key)
const itemSub = it => (!it ? '' : it.key ? t(it.key) : ((ITEM_NAMES[it.id] || {})[LANG] || ''));
const itemTitle = it => (it ? [it.en, itemSub(it)].filter(Boolean).join('・') : null);
// 報名偏好用的武器代號,例如 'GA' → 'great arcane staff'
const canon = weapon => { const it = lookup(weapon); return norm(it ? it.en : weapon); };

function parseNote(note) {
  const text = String(note || '').trim();
  if (!text) return [];
  const [wear, ...rest] = text.split(/\bbring\b/i);
  const chips = [];
  const w = wear.trim();
  if (w) { const item = lookup(w); chips.push({ kind: item ? 'wear' : 'info', text: w, item }); }
  const b = rest.join(' bring ').trim();
  if (b) for (const part of b.split(/\s*(?:,|\+|&|\/|\band\b)\s*/i).filter(Boolean)) chips.push({ kind: 'bring', text: part, item: lookup(part) });
  return chips;
}

const iconUrl = (id, size) => `https://render.albiononline.com/v1/item/${id}.png?size=${size}`;
function iconImg(id, alt, size) {
  const img = h('img', { src: iconUrl(id, size), alt: alt || '', loading: 'lazy', decoding: 'async', width: size, height: size });
  img.addEventListener('error', () => img.replaceWith(h('span', { class: 'glyph' }, '⚔')), { once: true });
  return img;
}

function roleOf(g) {
  const r = ROLES[g && g.role];
  const name = (g && g.name) || t(`role.${r ? g.role : 'other'}`);
  return { name, en: r ? r.en : '', emoji: r ? r.emoji : '•', svg: (r || ROLES.support).svg };
}
const pad2 = n => String(n).padStart(2, '0');

function rel(ts) {
  if (!ts) return '';
  const sec = (Date.now() - ts) / 1000;
  if (sec < 60) return t('time.now');
  if (sec < 3600) return t('time.min', { n: Math.floor(sec / 60) });
  if (sec < 86400) return t('time.hour', { n: Math.floor(sec / 3600) });
  return new Date(ts).toLocaleString(langMeta(LANG).locale, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

let toastTimer = null;
function toast(msg, ms = 3200) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function debounce(fn, ms) {
  let tm = null;
  return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); };
}

function errMsg(e) {
  const s = String((e && (e.code || e.message)) || e);
  if (/permission/i.test(s)) return t('err.perm');
  if (/network|offline/i.test(s)) return t('err.net');
  return s;
}

/* ================= 狀態 ================= */
const state = {
  backend: null,
  config: undefined,     // undefined = 還沒讀到;null = 資料庫裡沒有
  assign: {},            // { s0: signupId, ... }
  signups: {},           // { id: {name, source, prefs, fill, note, createdAt} }
  loaded: new Set(),
  connected: false,
  user: null,
  isAdmin: false,
  editComp: false,
  editEvent: false,
  selected: null,        // 隊長點選中的卡片
  dragging: null,
  query: '',
  filter: store.get(LS_FILTER) || 'all',
  boardStale: false,
  prevSlotSids: null,
  knownSids: null,
  dlg: null,
};

const cfg = () => state.config || DEFAULT_CONFIG;
const comp = () => asList(cfg().comp).map(g => ({ ...g, slots: asList(g.slots) }));
function flatSlots() {
  const out = [];
  comp().forEach((g, gi) => g.slots.forEach((s, si) => out.push({ g, gi, s, si, idx: out.length })));
  return out;
}
const signup = sid => (sid && state.signups && state.signups[sid]) || null;
const sidAt = idx => { const sid = state.assign && state.assign['s' + idx]; return signup(sid) ? sid : null; };
function slotMap() {
  const m = new Map();
  for (const x of flatSlots()) { const sid = sidAt(x.idx); if (sid && !m.has(sid)) m.set(sid, x.idx); }
  return m;
}
const mySid = () => (state.user ? 'w_' + state.user.uid : null);
const sortedSignups = () => Object.entries(state.signups || {})
  .filter(([, su]) => su && su.name)
  .sort((a, b) => ((a[1].createdAt || 0) - (b[1].createdAt || 0)) || (a[0] < b[0] ? -1 : 1));
const weaponLabel = s => { const w = lookup(s.weapon); return w ? w.en : s.weapon; };

/* ---------- 活動時間 / 鎖定 ---------- */
const startAt = () => { const v = (cfg().event || {}).startAt; return typeof v === 'number' ? v : null; };
// none = 沒設時間;open = 可報名;locked = 開始前 15 分鐘;started = 進行中;ended = 已結束
function phase(now = Date.now()) {
  const s = startAt();
  if (!s) return 'none';
  if (now < s - LOCK_MS) return 'open';
  if (now < s) return 'locked';
  if (now < s + END_MS) return 'started';
  return 'ended';
}
const isLocked = () => ['locked', 'started'].includes(phase());
const signupClosed = () => isLocked() && !state.isAdmin;

function fmtDate(ts, timeZone) {
  return new Intl.DateTimeFormat(langMeta(LANG).locale, {
    timeZone, weekday: 'short', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(ts);
}
function utcOffset(ts) {
  const m = -new Date(ts).getTimezoneOffset();
  const a = Math.abs(m);
  return `UTC${m >= 0 ? '+' : '-'}${Math.floor(a / 60)}${a % 60 ? ':' + pad2(a % 60) : ''}`;
}
const localTimeText = ts => `${fmtDate(ts)} (${utcOffset(ts)})`;
const utcTimeText = ts => `${fmtDate(ts, 'UTC')} UTC`;
function fmtDur(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), hh = Math.floor((s % 86400) / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  if (d) return t('dur.days', { d, h: hh });
  return `${hh ? hh + ':' : ''}${pad2(mm)}:${pad2(ss)}`;
}
function countdownText(now = Date.now()) {
  const s = startAt();
  switch (phase(now)) {
    case 'open': return t('cd.open', { dur: fmtDur(s - now) });
    case 'locked': return t('cd.locked', { dur: fmtDur(s - now) });
    case 'started': return t('cd.started');
    case 'ended': return t('cd.ended');
    default: return '';
  }
}
// datetime-local 的值一律當作 UTC
const toUtcInput = ts => new Date(ts).toISOString().slice(0, 16);
function fromUtcInput(v) {
  const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null;
}

function matchesPref(su, x) {
  if (!su) return false;
  return asList(su.prefs).some(p => (p.startsWith('role:') ? x.g.role === p.slice(5) : canon(x.s.weapon) === p));
}

/* ================= 畫面 ================= */
function applyStatic() {
  const meta = langMeta(LANG);
  document.documentElement.lang = meta.html;
  loadFont(meta);
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); }); // 內建固定字串
  $('#langName').textContent = meta.native;
}

function render() {
  renderHeader();
  renderOverview();
  renderAdminBar();
  renderMine();
  renderToolbar();
  renderLive();
  if (state.dragging || boardHasFocus()) state.boardStale = true;
  else { renderBoard(); renderPool(); state.boardStale = false; }
  renderSelBar();
  applySearch();
  if ($('#lockDlg').open) renderLockDlg();
}
const boardHasFocus = () => !!document.activeElement && document.activeElement.matches('#board input');
function flushStale() { if (state.boardStale && !state.dragging && !boardHasFocus()) render(); }

function renderHeader() {
  const ev = cfg().event || {};
  const title = ev.title || t('title.default');
  $('#title').textContent = title;
  document.title = `${title} · Albion`;
  const meta = $('#eventMeta');
  meta.replaceChildren();
  const s = startAt();
  const ph = phase();
  if (s) {
    meta.append(
      h('span', { class: 'meta-chip', title: t('ev.yourTime') }, '🕘 ', localTimeText(s)),
      h('span', { class: 'meta-chip muted' }, '🌐 ', utcTimeText(s)),
      h('span', { class: `meta-chip cd cd-${ph}`, id: 'cdChip' }, countdownText()));
    if (ph === 'locked' || ph === 'started') {
      meta.append(h('button', { class: 'meta-chip lock-view', type: 'button', onclick: () => openLockDlg(false) }, t('lock.view')));
    }
  } else if (ev.time) {
    meta.append(h('span', { class: 'meta-chip' }, '🕘 ', ev.time));   // 舊版自由文字時間
  }
  if (ev.note) meta.append(h('span', { class: 'meta-chip' }, '📢 ', ev.note));
  meta.hidden = !meta.children.length;
  const edit = $('#eventEdit');
  edit.hidden = !(state.isAdmin && state.editEvent);
  if (!edit.hidden) {
    for (const inp of edit.querySelectorAll('input[data-key]')) {
      if (document.activeElement !== inp) inp.value = ev[inp.dataset.key] || '';
    }
    const st = $('#evStart');
    if (document.activeElement !== st) st.value = s ? toUtcInput(s) : '';
    $('#evStartHint').textContent = s ? `= ${t('ev.yourTime')} ${localTimeText(s)}` : '';
  }
}

function renderOverview() {
  const slots = flatSlots();
  const groups = comp();
  const filled = slots.filter(x => sidAt(x.idx)).length;
  $('#filledNum').textContent = filled;
  $('#totalNum').textContent = slots.length;
  $('.fill').classList.toggle('full', slots.length > 0 && filled === slots.length);

  $('#segbar').replaceChildren(...groups.map((g, gi) => {
    const grp = h('div', { class: `seg-group role-${g.role || 'other'}`, style: `flex:${g.slots.length} 1 0` });
    for (const x of slots.filter(y => y.gi === gi)) {
      const su = signup(sidAt(x.idx));
      grp.append(h('div', { class: 'seg' + (su ? ' on' : ''), title: `#${pad2(x.idx + 1)} ${weaponLabel(x.s)} — ${su ? su.name : t('slot.empty')}` }));
    }
    return grp;
  }));
  $('#legend').replaceChildren(...groups.map((g, gi) => {
    const mine = slots.filter(x => x.gi === gi);
    const n = mine.filter(x => sidAt(x.idx)).length;
    return h('span', { class: `role-${g.role || 'other'}` }, h('i'), roleOf(g).name, ' ', h('b', {}, `${n}/${mine.length}`));
  }));
}

function renderLive() {
  const live = $('#live'), txt = $('#liveText');
  live.classList.remove('pending', 'error');
  if (!state.backend) { live.classList.add('error'); txt.textContent = t('live.noDb'); return; }
  if (!state.connected) { live.classList.add('pending'); txt.textContent = t('live.connecting'); return; }
  txt.textContent = t('live.ok', { n: sortedSignups().length });
}

function renderToolbar() {
  const btn = $('#signupBtn');
  const closed = signupClosed();
  btn.disabled = !state.backend || !state.loaded.has('signups') || closed;
  btn.textContent = closed ? t('lock.closed') : signup(mySid()) ? t('btn.editSignup') : t('btn.signup');
  $('#loginBtn').hidden = state.isAdmin || !state.backend;
  const nb = $('#notifyBtn');
  const ph = phase();
  nb.hidden = !(ph === 'open' || ph === 'locked');
  const on = notifyOn();
  nb.textContent = on ? t('notify.on') : t('notify.off');
  nb.setAttribute('aria-pressed', String(on));
}

function renderAdminBar() {
  const on = state.isAdmin;
  document.body.classList.toggle('is-admin', on);
  $('#adminbar').hidden = !on;
  $('#evToggle').setAttribute('aria-pressed', String(state.editEvent));
  $('#compToggle').setAttribute('aria-pressed', String(state.editComp));
}

function srcBadge(source) {
  if (source === 'discord') return h('span', { class: 'src src-discord', title: t('src.discord') }, 'DC');
  if (source === 'manual') return h('span', { class: 'src src-manual', title: t('src.manual') }, t('src.manualBadge'));
  return h('span', { class: 'src src-web', title: t('src.web') }, t('src.webBadge'));
}

function prefChip(p) {
  if (p.startsWith('role:')) {
    const role = p.slice(5);
    const r = roleOf({ role });
    return h('span', { class: `pchip pchip-role role-${role}` }, `${r.emoji} ${r.name}`);
  }
  const it = lookup(p);
  return h('span', { class: 'pchip', title: itemTitle(it) },
    it && it.id ? iconImg(it.id, it.en, 44) : null, h('span', {}, it ? it.en : p));
}
const fillChip = () => h('span', { class: 'pchip pchip-fill' }, t('fill'));

/* ---------- 名單(20 個位置) ---------- */
function renderBoard() {
  const board = $('#board');
  const slots = flatSlots();
  const groups = comp();
  const cur = slots.map(x => sidAt(x.idx));
  const prev = state.prevSlotSids;
  state.prevSlotSids = cur;
  board.replaceChildren();
  board.classList.toggle('auto', groups.length !== 4);
  groups.forEach((g, gi) => {
    const role = roleOf(g);
    const mine = slots.filter(x => x.gi === gi);
    const n = mine.filter(x => sidAt(x.idx)).length;
    const emblem = h('span', { class: 'role-emblem', 'aria-hidden': 'true' });
    emblem.innerHTML = role.svg; // 內建固定 SVG
    const showEn = role.en && norm(role.en) !== norm(role.name);
    const head = h('header', { class: 'group-head' },
      emblem,
      h('div', { class: 'group-title' }, role.name, showEn ? h('small', {}, role.en) : null),
      h('span', { class: 'group-count' + (n === mine.length ? ' full' : '') }, `${n}/${mine.length}`));
    const list = h('div', { class: 'slots' });
    for (const x of mine) list.append(renderSlot(x, !!prev && prev[x.idx] !== cur[x.idx]));
    board.append(h('section', { class: `group g${gi} role-${g.role || 'other'}` }, head, list));
  });
}

function slotIcon(s, idx) {
  const w = lookup(s.weapon);
  return h('div', { class: 'slot-icon', title: itemTitle(w) || s.weapon || '' },
    h('span', { class: 'slot-no' }, pad2(idx + 1)),
    w && w.id ? iconImg(w.id, w.en, 96) : h('span', { class: 'glyph' }, '⚔'));
}

function noteChip(c) {
  const label = c.kind === 'wear' ? t('note.wear') : c.kind === 'bring' ? t('note.bring') : null;
  return h('span', { class: `chip k-${c.kind}`, title: itemTitle(c.item) },
    label ? h('b', {}, label) : null,
    c.item && c.item.id ? iconImg(c.item.id, c.item.en, 44) : null,
    h('span', {}, c.item ? c.item.en : c.text));
}

function renderSlot(x, flash) {
  const { s, idx } = x;
  const admin = state.isAdmin;
  const sid = sidAt(idx);
  const su = signup(sid);
  const w = lookup(s.weapon);
  const sel = signup(state.selected);
  const cls = ['slot', su ? 'is-filled' : 'is-open'];
  if (flash) cls.push('flash');
  if (admin && sel && matchesPref(sel, x)) cls.push('is-suggest');
  if (admin && sid && sid === state.selected) cls.push('is-selected');
  const el = h('article', { class: cls.join(' '), 'data-idx': idx });
  el.dataset.player = norm(su && su.name);

  const info = h('div', { class: 'slot-info' });
  let chips = null;
  if (admin && state.editComp) {
    info.append(compInputs(s, idx));
  } else {
    info.append(h('div', { class: 'w-en' }, w ? w.en : (s.weapon || '—')));
    const sub = itemSub(w);
    if (sub) info.append(h('div', { class: 'w-zh' }, sub));
    const list = parseNote(s.note);
    if (list.length) chips = h('div', { class: 'chips' }, list.map(noteChip));
  }

  const player = h('div', { class: 'slot-player' });
  if (su) {
    const mini = h('div', { class: 'mini', title: su.name }, srcBadge(su.source), h('span', { class: 'p-name' }, su.name));
    if (admin) {
      mini.draggable = true;
      bindDrag(mini, sid);
      mini.append(h('button', { class: 'mini-x', type: 'button', title: t('slot.unassign'), 'aria-label': t('slot.unassign'), onclick: e => { e.stopPropagation(); unassign(sid); } }, '✕'));
    }
    player.append(mini);
  } else {
    player.append(h('span', { class: 'p-open' }, admin && state.selected ? t('slot.drop') : t('slot.open')));
  }
  el.append(h('div', { class: 'slot-top' }, slotIcon(s, idx), info), chips || '', player);

  if (admin) {
    el.addEventListener('click', e => {
      if (e.target.closest('input, button')) return;
      if (state.selected) assignTo(state.selected, idx);
      else if (sid) select(sid);
    });
    el.addEventListener('dragover', e => { if (state.dragging) { e.preventDefault(); el.classList.add('drop-over'); } });
    el.addEventListener('dragleave', () => el.classList.remove('drop-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      const dropped = e.dataTransfer.getData('text/plain') || state.dragging;
      endDrag();
      if (dropped) assignTo(dropped, idx);
    });
  }
  return el;
}

const saveComp = debounce(() => {
  if (!state.isAdmin || !state.config) return;
  write({ 'config/comp': state.config.comp }, t('toast.compSaved'));
}, 700);

// 直接指向 state.config.comp 裡的 slot 物件(編輯時就地修改)
function configSlots() {
  if (!state.config) return [];
  state.config.comp = asList(state.config.comp);
  const out = [];
  for (const g of state.config.comp) { g.slots = asList(g.slots); out.push(...g.slots); }
  return out;
}

function compInputs(s, idx) {
  const wInp = h('input', { class: 'inp', type: 'text', placeholder: 'heavy mace', 'aria-label': 'weapon', spellcheck: 'false' });
  const nInp = h('input', { class: 'inp', type: 'text', placeholder: 'bring incubus', 'aria-label': 'note', spellcheck: 'false' });
  wInp.value = s.weapon || '';
  nInp.value = s.note || '';
  wInp.addEventListener('input', () => {
    const tg = configSlots()[idx];
    if (!tg) return;
    tg.weapon = wInp.value;
    wInp.closest('.slot').querySelector('.slot-icon').replaceWith(slotIcon(tg, idx));
    saveComp();
  });
  nInp.addEventListener('input', () => {
    const tg = configSlots()[idx];
    if (!tg) return;
    tg.note = nInp.value;
    saveComp();
  });
  for (const inp of [wInp, nInp]) inp.addEventListener('blur', () => setTimeout(flushStale, 0));
  return h('div', { class: 'comp-edit' }, wInp, nInp);
}

/* ---------- 報名池(卡片) ---------- */
function renderPool() {
  const pool = $('#pool');
  const admin = state.isAdmin;
  const list = sortedSignups();
  const smap = slotMap();
  const nAssigned = list.filter(([sid]) => smap.has(sid)).length;
  const nFill = list.filter(([, su]) => su.fill).length;
  const filters = [['all', t('pool.all', { n: list.length })], ['open', t('pool.open', { n: list.length - nAssigned })], ['fill', t('pool.fill', { n: nFill })]];

  const head = h('div', { class: 'pool-head' },
    h('h2', {}, t('pool.title')),
    h('div', { class: 'seg-filter', role: 'tablist' }, filters.map(([k, label]) =>
      h('button', {
        type: 'button', class: state.filter === k ? 'on' : null, role: 'tab', 'aria-selected': String(state.filter === k),
        onclick: () => { state.filter = k; store.set(LS_FILTER, k); renderPool(); applySearch(); },
      }, label))),
    admin ? h('button', { class: 'btn small', type: 'button', onclick: () => openSignup('admin-new') }, t('pool.add')) : null);

  const shown = list.filter(([sid, su]) => (state.filter === 'open' ? !smap.has(sid) : state.filter === 'fill' ? su.fill : true));
  const grid = h('div', { class: 'pool-grid' });
  shown.forEach(([sid, su]) => grid.append(renderCard(sid, su, smap.get(sid), list.findIndex(([x]) => x === sid) + 1)));
  if (!shown.length) grid.append(h('div', { class: 'pool-empty' }, list.length ? t('pool.emptyCat') : t('pool.empty')));
  pool.setAttribute('aria-label', t('pool.title'));
  pool.replaceChildren(head, grid, admin ? h('p', { class: 'pool-hint' }, t('pool.hint')) : '');
}

function bindPoolDrop() {
  const pool = $('#pool');
  pool.addEventListener('dragover', e => {
    if (state.isAdmin && state.dragging && slotMap().has(state.dragging)) { e.preventDefault(); pool.classList.add('drop-over'); }
  });
  pool.addEventListener('dragleave', e => { if (!pool.contains(e.relatedTarget)) pool.classList.remove('drop-over'); });
  pool.addEventListener('drop', e => {
    if (!state.isAdmin) return;
    e.preventDefault();
    pool.classList.remove('drop-over');
    const sid = e.dataTransfer.getData('text/plain') || state.dragging;
    endDrag();
    if (sid) unassign(sid);
  });
}

function renderCard(sid, su, slotIdx, order) {
  const admin = state.isAdmin;
  const mine = sid === mySid();
  const cls = ['card'];
  if (slotIdx != null) cls.push('is-assigned');
  if (state.selected === sid) cls.push('is-selected');
  if (mine) cls.push('is-mine');
  const el = h('div', { class: cls.join(' '), 'data-sid': sid });
  el.dataset.player = norm(su.name);
  let slotLabel = null;
  if (slotIdx != null) {
    const x = flatSlots()[slotIdx];
    slotLabel = h('span', { class: `card-slot role-${x ? x.g.role : 'other'}` }, `#${pad2(slotIdx + 1)} ${x ? weaponLabel(x.s) : ''}`);
  }
  const prefs = asList(su.prefs);
  el.append(...[
    h('div', { class: 'card-top' },
      h('span', { class: 'card-no' }, order),
      srcBadge(su.source),
      h('b', { class: 'card-name', title: su.name }, su.name),
      mine ? h('span', { class: 'you' }, t('card.you')) : null),
    slotLabel ? h('div', { class: 'card-assigned' }, t('card.assigned'), slotLabel) : null,
    (prefs.length || su.fill) ? h('div', { class: 'pchips' }, prefs.map(prefChip), su.fill ? fillChip() : null) : null,
    su.note ? h('div', { class: 'card-note' }, su.note) : null,
    h('div', { class: 'card-meta' },
      h('span', {}, rel(su.createdAt)),
      admin ? h('span', { class: 'card-actions' },
        h('button', { type: 'button', title: t('card.edit'), 'aria-label': t('card.edit'), onclick: e => { e.stopPropagation(); openSignup('admin-edit', sid); } }, '✎'),
        h('button', { type: 'button', title: t('card.delete'), 'aria-label': t('card.delete'), onclick: e => { e.stopPropagation(); deleteCard(sid); } }, '🗑')) : null),
  ].filter(Boolean));
  if (admin) {
    el.draggable = true;
    bindDrag(el, sid);
    el.addEventListener('click', e => { if (!e.target.closest('button')) select(state.selected === sid ? null : sid); });
  }
  return el;
}

/* ---------- 我的報名 ---------- */
function renderMine() {
  const box = $('#mine');
  const sid = mySid();
  const su = signup(sid);
  if (!su) { box.hidden = true; box.replaceChildren(); return; }
  const idx = slotMap().get(sid);
  let status;
  if (idx != null) {
    const x = flatSlots()[idx];
    status = h('span', { class: 'mine-status ok' }, t('mine.assigned', { no: pad2(idx + 1), weapon: weaponLabel(x.s), role: roleOf(x.g).name }));
  } else {
    status = h('span', { class: 'mine-status' }, t('mine.waiting'));
  }
  box.hidden = false;
  box.replaceChildren(
    h('div', { class: 'mine-main' }, h('b', {}, t('mine.signed', { name: su.name })), status),
    h('div', { class: 'pchips' }, asList(su.prefs).map(prefChip), su.fill ? fillChip() : null),
    signupClosed() ? h('span', { class: 'mine-status' }, t('lock.closed')) : h('div', { class: 'mine-actions' },
      h('button', { class: 'btn small', type: 'button', onclick: () => openSignup('self-edit', sid) }, t('mine.edit')),
      h('button', { class: 'btn small danger', type: 'button', onclick: withdraw }, t('mine.withdraw'))));
}

/* ---------- 隊長:選取 / 拖曳 / 排位 ---------- */
function select(sid) {
  state.selected = sid;
  render();
}

function renderSelBar() {
  const bar = $('#selbar');
  const su = state.isAdmin ? signup(state.selected) : null;
  document.body.classList.toggle('has-sel', !!su);
  if (!su) { bar.hidden = true; return; }
  const assigned = slotMap().has(state.selected);
  bar.hidden = false;
  bar.replaceChildren(...[
    h('span', { class: 'sel-text' }, tNodes('sel.text', { name: h('b', {}, su.name) })),
    assigned ? h('button', { class: 'btn small', type: 'button', onclick: () => unassign(state.selected) }, t('sel.back')) : null,
    h('button', { class: 'btn small ghost', type: 'button', onclick: () => select(null) }, t('sel.cancel')),
  ].filter(Boolean));
}

function bindDrag(el, sid) {
  el.addEventListener('dragstart', e => {
    e.stopPropagation();
    state.dragging = sid;
    e.dataTransfer.setData('text/plain', sid);
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging');
    const su = signup(sid);
    for (const x of flatSlots()) {
      const slot = document.querySelector(`.slot[data-idx="${x.idx}"]`);
      if (slot) slot.classList.toggle('is-suggest', matchesPref(su, x));
    }
  });
  el.addEventListener('dragend', endDrag);
}

function endDrag() {
  if (!state.dragging) return;
  state.dragging = null;
  document.body.classList.remove('dragging');
  document.querySelectorAll('.drop-over').forEach(x => x.classList.remove('drop-over'));
  document.querySelectorAll('.slot.is-suggest').forEach(x => x.classList.remove('is-suggest'));
  setTimeout(flushStale, 0);
}

async function write(patch, okMsg) {
  try {
    await state.backend.update(patch);
    if (okMsg) toast(okMsg);
    return true;
  } catch (e) {
    console.error(e);
    toast(t('toast.writeFail', { err: errMsg(e) }), 5000);
    return false;
  }
}

// 順便清掉指向已刪除報名、或重複指向同一人的排位
function cleanupPatch(patch) {
  const seen = new Set();
  for (const [k, sid] of Object.entries(state.assign || {})) {
    const key = `assign/${k}`;
    if (key in patch) { if (patch[key]) seen.add(patch[key]); continue; }
    if (!signup(sid) || seen.has(sid) || Object.values(patch).includes(sid)) patch[key] = null;
    else seen.add(sid);
  }
  return patch;
}

async function assignTo(sid, idx) {
  if (!signup(sid)) return;
  const from = slotMap().get(sid);
  state.selected = null;
  if (from === idx) { render(); return; }
  const occupant = sidAt(idx);
  const patch = { [`assign/s${idx}`]: sid };
  if (from != null) patch[`assign/s${from}`] = occupant || null;   // 從別的位置拖來 = 互換
  await write(cleanupPatch(patch));
}

async function unassign(sid) {
  const from = slotMap().get(sid);
  state.selected = null;
  if (from == null) { render(); return; }
  await write(cleanupPatch({ [`assign/s${from}`]: null }));
}

async function deleteCard(sid) {
  const su = signup(sid);
  if (!su || !confirm(t('confirm.delete', { name: su.name }))) return;
  const patch = { [`signups/${sid}`]: null };
  const from = slotMap().get(sid);
  if (from != null) patch[`assign/s${from}`] = null;
  if (state.selected === sid) state.selected = null;
  await write(patch, t('toast.deleted'));
}

/* ---------- 報名表單 ---------- */
function uniqueWeapons() {
  const seen = new Map();
  for (const x of flatSlots()) {
    const key = canon(x.s.weapon);
    if (key && !seen.has(key)) seen.set(key, { key, role: x.g.role, item: lookup(x.s.weapon), text: x.s.weapon });
  }
  return [...seen.values()];
}

const SIGNUP_TITLES = { 'self-new': 'su.titleNew', 'self-edit': 'su.titleEdit', 'admin-new': 'su.titleAdminNew', 'admin-edit': 'su.titleAdminEdit' };

function openSignup(mode, sid) {
  if (!state.backend) return;
  if (mode.startsWith('self') && signupClosed()) { toast(t('lock.closed')); return; }
  if (mode === 'self-new' && signup(mySid())) { mode = 'self-edit'; sid = mySid(); }
  const su = sid ? signup(sid) : null;
  state.dlg = { mode, sid, prefs: asList(su && su.prefs).slice(0, MAX_PREFS) };
  $('#suName').value = su ? su.name : (mode === 'self-new' ? (store.get(LS_ME) || '') : '');
  $('#suFill').checked = su ? !!su.fill : false;
  $('#suNote').value = (su && su.note) || '';
  $('#suWithdraw').hidden = mode !== 'self-edit';
  $('#suMsg').textContent = '';
  renderSignupLabels();
  $('#signupDlg').showModal();
  if (!$('#suName').value) $('#suName').focus();
}

function renderSignupLabels() {
  if (!state.dlg) return;
  $('#suTitle').textContent = t(SIGNUP_TITLES[state.dlg.mode]);
  $('#suSubmit').textContent = state.dlg.mode === 'self-new' ? t('su.submit') : t('su.save');
  renderPicker();
}

function renderPicker() {
  const box = $('#suPicker');
  const sel = state.dlg.prefs;
  const full = sel.length >= MAX_PREFS;
  $('#suCount').textContent = t('su.count', { n: sel.length, max: MAX_PREFS });
  const btn = (key, role, content, title) => {
    const on = sel.includes(key);
    return h('button', {
      type: 'button', class: `pick role-${role}${on ? ' on' : ''}`, 'aria-pressed': String(on), title,
      disabled: !on && full ? true : null,
      onclick: () => {
        const i = sel.indexOf(key);
        if (i >= 0) sel.splice(i, 1); else if (sel.length < MAX_PREFS) sel.push(key);
        renderPicker();
      },
    }, content);
  };
  const weapons = uniqueWeapons();
  box.replaceChildren(...comp().map(g => {
    const role = roleOf(g);
    return h('div', { class: `pick-group role-${g.role}` },
      h('div', { class: 'pick-head' }, h('i'), role.name),
      h('div', { class: 'pick-row' },
        btn(`role:${g.role}`, g.role, [h('span', { class: 'pick-any' }, role.emoji), h('span', {}, t('su.any', { role: role.name }))], t('su.anyTitle', { role: role.name })),
        weapons.filter(w => w.role === g.role).map(w => btn(w.key, g.role, [
          w.item && w.item.id ? iconImg(w.item.id, w.item.en, 64) : h('span', { class: 'pick-any' }, '⚔'),
          h('span', {}, w.item ? w.item.en : w.text),
        ], itemTitle(w.item)))));
  }));
}

async function submitSignup(e) {
  e.preventDefault();
  const B = state.backend;
  const msg = $('#suMsg');
  const name = $('#suName').value.trim();
  const fill = $('#suFill').checked;
  const note = $('#suNote').value.trim();
  const prefs = state.dlg.prefs.slice(0, MAX_PREFS);
  if (!name) { msg.textContent = t('su.errName'); $('#suName').focus(); return; }
  if (!prefs.length && !fill) { msg.textContent = t('su.errPrefs'); return; }
  const btn = $('#suSubmit');
  btn.disabled = true;
  msg.textContent = '';
  try {
    const { mode } = state.dlg;
    let sid = state.dlg.sid;
    if (mode.startsWith('self')) {
      sid = 'w_' + await B.ensureUser();
      store.set(LS_ME, name);
    } else if (mode === 'admin-new') {
      sid = 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }
    const patch = {};
    if (signup(sid)) {
      const body = { name, prefs: prefs.length ? prefs : null, fill, note: note || null, updatedAt: B.serverTime() };
      for (const [k, v] of Object.entries(body)) patch[`signups/${sid}/${k}`] = v;
    } else {
      const rec = { name, fill, source: mode.startsWith('admin') ? 'manual' : 'web', createdAt: B.serverTime() };
      if (prefs.length) rec.prefs = prefs;
      if (note) rec.note = note;
      patch[`signups/${sid}`] = rec;
    }
    await B.update(patch);
    $('#signupDlg').close();
    toast(mode === 'self-new' ? t('toast.signedUp') : t('toast.saved'));
    if (mode.startsWith('self')) { state.query = name; $('#search').value = name; }
    render();
  } catch (err) {
    console.error(err);
    msg.textContent = t('su.errSend') + errMsg(err);
  } finally {
    btn.disabled = false;
  }
}

async function withdraw() {
  const sid = mySid();
  if (signupClosed()) { toast(t('lock.closed')); return; }
  if (!signup(sid) || !confirm(t('confirm.withdraw'))) return;
  if ($('#signupDlg').open) $('#signupDlg').close();
  await write({ [`signups/${sid}`]: null }, t('toast.withdrawn'));
}

/* ================= 搜尋 / 複製 ================= */
function applySearch() {
  const q = norm(state.query);
  const out = $('#searchResult');
  document.querySelectorAll('.slot, .card').forEach(el => el.classList.toggle('is-match', !!q && (el.dataset.player || '').includes(q)));
  out.replaceChildren();
  if (!q) return;
  const hits = flatSlots().filter(x => { const su = signup(sidAt(x.idx)); return su && norm(su.name).includes(q); });
  if (hits.length) {
    out.append(t('search.youAre'));
    for (const x of hits.slice(0, 4)) {
      out.append(h('button', { type: 'button', onclick: () => scrollToEl(`.slot[data-idx="${x.idx}"]`) }, `#${pad2(x.idx + 1)} ${weaponLabel(x.s)} (${roleOf(x.g).name})`));
    }
    return;
  }
  const waiting = sortedSignups().find(([, su]) => norm(su.name).includes(q));
  if (waiting) {
    out.append(h('button', { type: 'button', onclick: () => scrollToEl(`.card[data-sid="${waiting[0]}"]`) }, t('search.waiting')));
    return;
  }
  out.textContent = t('search.none');
}

function scrollToEl(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function toDiscord() {
  const slots = flatSlots();
  return comp().map((g, gi) => slots.filter(x => x.gi === gi).map(x => {
    const su = signup(sidAt(x.idx));
    return `${x.s.weapon}${x.s.note ? ` (${x.s.note})` : ''} - @${su ? su.name : ''}`;
  }).join('\n')).join('\n\n');
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = h('textarea', { style: 'position:fixed;left:-9999px;opacity:0' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
}

/* ================= 鎖定畫面 / 提醒 ================= */
function myRosterStatus() {
  const slots = flatSlots();
  const sid = mySid();
  let idx = sid ? slotMap().get(sid) : undefined;
  const me = norm(store.get(LS_ME));
  if (idx == null && me) {
    const x = slots.find(y => { const su = signup(sidAt(y.idx)); return su && norm(su.name) === me; });
    if (x) idx = x.idx;
  }
  if (idx != null) return { inRoster: true, x: slots[idx] };
  if (signup(sid) || (me && sortedSignups().some(([, su]) => norm(su.name) === me))) return { inRoster: false };
  return null;
}

function renderLockDlg() {
  const s = startAt();
  if (!s) return;
  $('#lockTime').textContent = `🕘 ${localTimeText(s)} · ${utcTimeText(s)}`;
  updateLockCountdown();

  const you = $('#lockYou');
  const st = myRosterStatus();
  you.hidden = !st;
  if (st) {
    you.className = `lock-you ${st.inRoster ? 'ok' : 'bench'}`;
    you.textContent = st.inRoster
      ? t('lock.youIn', { no: pad2(st.x.idx + 1), weapon: weaponLabel(st.x.s), role: roleOf(st.x.g).name })
      : t('lock.youBench');
  }

  const slots = flatSlots();
  const myIdx = st && st.inRoster ? st.x.idx : -1;
  $('#lockRoster').replaceChildren(...comp().map((g, gi) => {
    const mine = slots.filter(x => x.gi === gi);
    const role = roleOf(g);
    return h('section', { class: `lock-group role-${g.role || 'other'}` },
      h('div', { class: 'lock-ghead' }, h('i'), role.name, h('b', {}, `${mine.filter(x => sidAt(x.idx)).length}/${mine.length}`)),
      mine.map(x => {
        const su = signup(sidAt(x.idx));
        const w = lookup(x.s.weapon);
        return h('div', { class: `lock-row${su ? '' : ' empty'}${x.idx === myIdx ? ' me' : ''}` },
          h('span', { class: 'lock-no' }, pad2(x.idx + 1)),
          w && w.id ? iconImg(w.id, w.en, 44) : h('span', { class: 'glyph' }, '⚔'),
          h('span', { class: 'lock-w' }, weaponLabel(x.s)),
          h('span', { class: 'lock-p' }, su ? su.name : t('slot.empty')));
      }));
  }));

  const smap = slotMap();
  const bench = sortedSignups().filter(([sid]) => !smap.has(sid)).map(([, su]) => su.name);
  const benchEl = $('#lockBench');
  benchEl.hidden = !bench.length;
  benchEl.replaceChildren(h('b', {}, `${t('lock.bench')} (${bench.length})`), h('span', {}, bench.join('、')));
}

function updateLockCountdown(now = Date.now()) {
  const s = startAt();
  if (!s) return;
  const started = now >= s;
  $('#lockCdLabel').textContent = started ? '' : t('lock.startsIn');
  $('#lockCd').textContent = started ? t('lock.started') : fmtDur(s - now);
  $('#lockDlg').classList.toggle('is-started', started);
}

function openLockDlg(auto) {
  const dlg = $('#lockDlg');
  if (!startAt()) return;
  renderLockDlg();
  if (!dlg.open) dlg.showModal();
  if (!auto) $('#lockOk').focus();
}

function closeLockDlg() {
  const s = startAt();
  if (s) store.set(LS_LOCKSEEN, String(s));
  stopTitleFlash();
  if ($('#lockDlg').open) $('#lockDlg').close();
}

const notifyOn = () => store.get(LS_NOTIFY) === '1';

let audioCtx = null;
function unlockAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch { audioCtx = null; }
}
// 鬧鐘:嗶嗶嗶 × 3 組(Web Audio 產生,不需要音檔)
function chime(rounds = 3) {
  unlockAudio();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime + 0.05;
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < 3; i++) {
      const at = t0 + r * 1.1 + i * 0.22;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 2 ? 1175 : 880;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.3, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(at);
      osc.stop(at + 0.2);
    }
  }
}

let flashTimer = null;
function startTitleFlash() {
  stopTitleFlash();
  let on = false;
  flashTimer = setInterval(() => {
    on = !on;
    document.title = on ? t('title.alarm') : `${(cfg().event || {}).title || t('title.default')} · Albion`;
  }, 1000);
}
function stopTitleFlash() {
  if (!flashTimer) return;
  clearInterval(flashTimer);
  flashTimer = null;
  renderHeader();
}

function systemNotify() {
  if (!notifyOn() || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const title = (cfg().event || {}).title || t('title.default');
    const n = new Notification(t('notify.title', { title }), { body: t('notify.body'), tag: `roster-lock-${startAt()}`, icon: iconUrl('T8_2H_MACE', 128) });
    n.onclick = () => { window.focus(); n.close(); };
  } catch { /* 部分手機瀏覽器不支援頁面直接發通知 */ }
}

// 開始前 15 分鐘:響鈴 + 系統通知 + 標題閃爍 + 跳出鎖定名單
function triggerAlarm() {
  chime();
  systemNotify();
  if (document.hidden) startTitleFlash();
  openLockDlg(true);
}

async function toggleNotify() {
  if (notifyOn()) {
    store.set(LS_NOTIFY, '0');
    toast(t('notify.disabled'));
  } else {
    store.set(LS_NOTIFY, '1');
    chime(1);   // 使用者點擊時先響一次,順便解鎖瀏覽器的自動播放限制
    let perm = 'Notification' in window ? Notification.permission : 'denied';
    if (perm === 'default') { try { perm = await Notification.requestPermission(); } catch { perm = 'denied'; } }
    toast(perm === 'granted' ? t('notify.enabled') : t('notify.denied'), 6000);
  }
  renderToolbar();
}

// 每秒:更新倒數;階段改變時重畫,從「可報名」進入「鎖定」時觸發提醒
function tick() {
  const now = Date.now();
  const ph = phase(now);
  const chip = $('#cdChip');
  if (chip) chip.textContent = countdownText(now);
  if ($('#lockDlg').open) updateLockCountdown(now);
  if (!state.loaded.has('config')) return;
  const prev = state.phase;
  if (ph === prev) return;
  state.phase = ph;
  render();
  const s = startAt();
  if (ph === 'locked' && prev === 'open') triggerAlarm();
  else if ((ph === 'locked' || ph === 'started') && store.get(LS_LOCKSEEN) !== String(s)) openLockDlg(true);
  else if (!(ph === 'locked' || ph === 'started') && $('#lockDlg').open) $('#lockDlg').close();
}

/* ================= 語言選擇 ================= */
function setLang(code) {
  LANG = langMeta(code).code;
  store.set(LS_LANG, LANG);
  applyStatic();
  render();
  if ($('#signupDlg').open) renderSignupLabels();
}

function openLangDlg(gate) {
  const dlg = $('#langDlg');
  dlg.dataset.gate = gate ? '1' : '';
  $('#langClose').hidden = !!gate;
  const suggested = gate ? detectLang() : LANG;
  $('#langGrid').replaceChildren(...LANGS.map(l => h('button', {
    type: 'button', class: `lang-opt${l.code === suggested ? ' suggested' : ''}${!gate && l.code === LANG ? ' current' : ''}`, lang: l.html,
    onclick: () => { dlg.close(); setLang(l.code); },
  }, h('b', {}, l.native), h('small', {}, l.en))));
  dlg.showModal();
  const focus = dlg.querySelector('.lang-opt.suggested') || dlg.querySelector('.lang-opt');
  if (focus) focus.focus();
}

/* ================= 登入 / 資料連線 ================= */
let adminUnsub = null;
function onAuthChanged(user) {
  state.user = user ? { uid: user.uid, isAnonymous: !!user.isAnonymous } : null;
  if (adminUnsub) { adminUnsub(); adminUnsub = null; }
  state.isAdmin = false;
  state.editComp = false;
  state.editEvent = false;
  state.selected = null;
  if (user && !user.isAnonymous) {
    adminUnsub = state.backend.watch(`admins/${user.uid}`, v => {
      const was = state.isAdmin;
      state.isAdmin = v === true;
      if (state.isAdmin) {
        if ($('#adminDlg').open) $('#adminDlg').close();
        if (!was) toast(t('toast.captain'));
        seedConfig();
      } else {
        $('#uidText').textContent = user.uid;
        if (!$('#adminDlg').open) $('#adminDlg').showModal();
      }
      state.prevSlotSids = null;
      render();
    }, () => { state.isAdmin = false; render(); });
  }
  render();
}

// 資料庫還沒有配置時(隊長第一次登入):有舊版名單 legacy-roster.json 就整份搬過來,否則用預設配置
let seeding = false;
async function seedConfig() {
  if (seeding || !state.isAdmin || !state.loaded.has('config') || state.config != null) return;
  seeding = true;
  let legacy = null;
  try {
    const res = await fetch('legacy-roster.json', { cache: 'no-store' });
    if (res.ok) legacy = await res.json();
  } catch { /* 沒有舊名單就用預設 */ }
  if (!legacy || !Array.isArray(legacy.groups)) {
    await write({ config: DEFAULT_CONFIG }, t('toast.seeded'));
    return;
  }
  const ev = legacy.event || {};
  const patch = {
    config: {
      event: { title: ev.title || DEFAULT_CONFIG.event.title, time: ev.time || '', note: ev.note || '' },
      comp: legacy.groups.map(g => ({ role: g.role, slots: g.slots.map(s => ({ weapon: s.weapon || '', note: s.note || '' })) })),
    },
  };
  let idx = 0, n = 0;
  for (const g of legacy.groups) for (const s of g.slots) {
    const name = String(s.player || '').trim().slice(0, 32);
    if (name) {
      const sid = `m_old${pad2(idx)}`;
      patch[`signups/${sid}`] = { name, source: 'manual', fill: false, prefs: [canon(s.weapon)], createdAt: state.backend.serverTime() };
      patch[`assign/s${idx}`] = sid;
      n++;
    }
    idx++;
  }
  await write(patch, t('toast.imported', { n }));
}

async function captainLogin() {
  try {
    await state.backend.captainSignIn();
    onAuthChanged(state.backend.currentUser());
  } catch (e) {
    if (/popup-closed|cancelled-popup/.test(e.code || '')) return;
    console.error(e);
    toast(t('toast.loginFail', { err: errMsg(e) }), 6000);
  }
}

async function logout() {
  await state.backend.signOut();
  onAuthChanged(null);
  toast(t('toast.loggedOut'));
}

function connect(B) {
  state.backend = B;
  B.watchConnected(c => { state.connected = c; renderLive(); });
  B.watch('config', v => {
    state.config = v;
    state.loaded.add('config');
    seedConfig();
    render();
    tick();
  });
  B.watch('assign', v => {
    state.assign = v || {};
    state.loaded.add('assign');
    render();
  });
  B.watch('signups', v => {
    const next = v || {};
    if (state.knownSids && state.isAdmin) {
      for (const [sid, su] of Object.entries(next)) if (!state.knownSids.has(sid) && su && su.name) toast(t('toast.newSignup', { name: su.name }));
    }
    state.knownSids = new Set(Object.keys(next));
    state.signups = next;
    state.loaded.add('signups');
    if (state.selected && !next[state.selected]) state.selected = null;
    render();
  });
  B.onAuth(onAuthChanged);
}

/* ================= 事件綁定 ================= */
function bindUI() {
  const search = $('#search');
  search.addEventListener('input', () => { state.query = search.value; store.set(LS_ME, search.value.trim()); applySearch(); });
  search.addEventListener('keydown', e => { if (e.key === 'Enter') { const b = $('#searchResult button'); if (b) b.click(); } });

  $('#signupBtn').addEventListener('click', () => openSignup('self-new'));
  $('#copyBtn').addEventListener('click', async () => toast(await copyText(toDiscord()) ? t('toast.copied') : t('toast.copyFail')));
  $('#loginBtn').addEventListener('click', captainLogin);
  $('#langBtn').addEventListener('click', () => openLangDlg(false));
  $('#langClose').addEventListener('click', () => $('#langDlg').close());
  $('#langDlg').addEventListener('cancel', e => { if ($('#langDlg').dataset.gate) e.preventDefault(); });
  $('#logoutBtn').addEventListener('click', logout);
  $('#adminDlgLogout').addEventListener('click', () => { $('#adminDlg').close(); logout(); });
  $('#uidCopy').addEventListener('click', async () => toast(await copyText($('#uidText').textContent) ? t('toast.uidCopied') : t('toast.copyFail')));

  $('#evToggle').addEventListener('click', () => { state.editEvent = !state.editEvent; render(); });
  $('#compToggle').addEventListener('click', () => { state.editComp = !state.editComp; state.prevSlotSids = null; render(); });
  $('#addCardBtn').addEventListener('click', () => openSignup('admin-new'));
  $('#clearAssignBtn').addEventListener('click', () => { if (confirm(t('confirm.clear'))) write({ assign: null }, t('toast.cleared')); });
  $('#resetBtn').addEventListener('click', () => { if (confirm(t('confirm.reset'))) write({ signups: null, assign: null }, t('toast.reset')); });

  $('#evStart').addEventListener('change', e => {
    const ts = fromUtcInput(e.target.value);
    if (ts) write({ 'config/event/startAt': ts, 'config/event/time': null });
  });
  $('#evStartClear').addEventListener('click', () => write({ 'config/event/startAt': null }));
  $('#notifyBtn').addEventListener('click', toggleNotify);
  $('#lockOk').addEventListener('click', closeLockDlg);
  $('#lockDlg').addEventListener('cancel', e => { e.preventDefault(); closeLockDlg(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) stopTitleFlash(); });

  const saveEvent = debounce((key, val) => write({ [`config/event/${key}`]: val }), 600);
  for (const inp of document.querySelectorAll('#eventEdit input[data-key]')) {
    inp.addEventListener('input', () => {
      if (inp.dataset.key === 'title') $('#title').textContent = inp.value || t('title.default');
      saveEvent(inp.dataset.key, inp.value);
    });
  }

  bindPoolDrop();
  $('#signupForm').addEventListener('submit', submitSignup);
  $('#suWithdraw').addEventListener('click', withdraw);
  document.querySelectorAll('dialog [data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.selected && !document.querySelector('dialog[open]')) select(null);
  });
  setInterval(() => { if (!state.dragging && !boardHasFocus()) renderPool(); }, 60000);
}

async function init() {
  const params = new URLSearchParams(location.search);
  const urlLang = params.get('lang');
  const saved = store.get(LS_LANG);
  const chosen = (urlLang && LANGS.some(l => l.code === urlLang)) ? urlLang : saved;
  LANG = chosen || detectLang();
  if (urlLang && chosen === urlLang) store.set(LS_LANG, urlLang);
  applyStatic();
  bindUI();
  const me = store.get(LS_ME);
  if (me) { state.query = me; $('#search').value = me; }
  if (!chosen) openLangDlg(true);   // 第一次來:先選語言
  try {
    if (params.has('mock')) connect((await import('./backend-mock.js')).createBackend());
    else if (FIREBASE_CONFIG) connect((await import('./backend-firebase.js?v=4')).createBackend(FIREBASE_CONFIG));
  } catch (e) {
    console.error(e);
    toast(t('toast.dbFail', { err: errMsg(e) }), 8000);
  }
  if (!state.backend) { state.config = null; render(); }
  setInterval(tick, 1000);
}

init();
