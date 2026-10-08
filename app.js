import { FIREBASE_CONFIG } from './firebase-config.js';

/* ================= 基本資料 ================= */
const LS_ME = 'roster.me';
const LS_FILTER = 'roster.filter';
const MAX_PREFS = 3;

const ROLES = {
  tank: { zh: '坦克', en: 'TANK', emoji: '🛡️', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5l-8-3z"/></svg>' },
  dps: { zh: '輸出', en: 'DPS', emoji: '⚔️', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>' },
  support: { zh: '輔助', en: 'SUPPORT', emoji: '✨', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>' },
  healer: { zh: '治療', en: 'HEALER', emoji: '➕', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z"/></svg>' },
};

// 武器/裝備名稱 → Albion 道具 ID(圖示來自 render.albiononline.com)
const ITEMS = [
  [['heavy mace'], 'T8_2H_MACE', 'Heavy Mace', '重型錘矛'],
  [['incubus', 'incubus mace'], 'T8_MAIN_MACE_HELL', 'Incubus Mace', '夢魘錘矛'],
  [['hammer'], 'T8_MAIN_HAMMER', 'Hammer', '鎚子'],
  [['earthrune', 'earthrune staff'], 'T8_2H_SHAPESHIFTER_KEEPER', 'Earthrune Staff', '大地符文法杖'],
  [['forge hammer', 'forge hammers'], 'T8_2H_DUALHAMMER_HELL', 'Forge Hammers', '鍛造鎚'],
  [['melee'], null, 'Melee', '近戰(自選)'],
  [['lightcaller'], 'T8_2H_SHAPESHIFTER_AVALON', 'Lightcaller', '光之召喚者'],
  [['dawnsong'], 'T8_2H_FIRE_RINGPAIR_AVALON', 'Dawnsong', '暮歌之戒'],
  [['gloves'], 'T8_2H_KNUCKLES_SET1', 'Gloves', '拳套(自選)'],
  [['shadowcaller'], 'T8_MAIN_CURSEDSTAFF_AVALON', 'Shadowcaller', '喚影者'],
  [['rootbound', 'rootbound staff'], 'T8_2H_SHAPESHIFTER_SET2', 'Rootbound Staff', '林語者法杖'],
  [['oath', 'oathkeeper', 'oathkeepers'], 'T8_2H_DUALMACE_AVALON', 'Oathkeepers', '守誓者'],
  [['evensong'], 'T8_2H_ARCANE_RINGPAIR_AVALON', 'Evensong', '夜禱之戒'],
  [['ga', 'great arcane', 'great arcane staff'], 'T8_2H_ARCANESTAFF', 'Great Arcane Staff', '祕術長杖'],
  [['occu', 'occult', 'occult staff'], 'T8_2H_ARCANESTAFF_HELL', 'Occult Staff', '奧祕法杖'],
  [['redemption', 'redemption staff'], 'T8_2H_HOLYSTAFF_UNDEAD', 'Redemption Staff', '贖罪法杖'],
  [['fallen', 'fallen staff'], 'T8_2H_HOLYSTAFF_HELL', 'Fallen Staff', '墮落法杖'],
  [['blight', 'blight staff'], 'T8_2H_NATURESTAFF_HELL', 'Blight Staff', '瘟疫法杖'],
  [['royal armor'], 'T8_ARMOR_PLATE_ROYAL', 'Royal Armor', '皇家護甲'],
  [['royal jacket'], 'T8_ARMOR_LEATHER_ROYAL', 'Royal Jacket', '皇家外套'],
  [['royal robe'], 'T8_ARMOR_CLOTH_ROYAL', 'Royal Robe', '皇家長袍'],
  [['pve weapon', 'pve'], null, 'PvE Weapon', 'PvE 武器'],
];

const DEFAULT_CONFIG = {
  event: { title: '20 人隊伍名單', time: '', note: '' },
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

// Firebase 會把 [a,b] 存成 {0:a,1:b},讀回來可能是陣列也可能是物件
function asList(v) {
  if (Array.isArray(v)) return v.filter(x => x != null);
  if (v && typeof v === 'object') return Object.keys(v).sort((a, b) => a - b).map(k => v[k]).filter(x => x != null);
  return [];
}

const norm = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
const ITEM_INDEX = new Map();
for (const [aliases, id, en, zh] of ITEMS) for (const a of aliases) ITEM_INDEX.set(a, { id, en, zh });
function lookup(name) {
  const n = norm(name);
  if (!n) return null;
  return ITEM_INDEX.get(n) || ITEM_INDEX.get(n.replace(/s$/, '')) || null;
}
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

const roleOf = g => ROLES[g.role] || { zh: '隊伍', en: '', emoji: '•', svg: ROLES.support.svg };
const pad2 = n => String(n).padStart(2, '0');

function rel(ts) {
  if (!ts) return '';
  const sec = (Date.now() - ts) / 1000;
  if (sec < 60) return '剛剛';
  if (sec < 3600) return `${Math.floor(sec / 60)} 分鐘前`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} 小時前`;
  return new Date(ts).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
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
  let t = null;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function errMsg(e) {
  const s = String((e && (e.code || e.message)) || e);
  if (/permission/i.test(s)) return '沒有權限(資料庫規則還沒設定,或你不是隊長)';
  if (/network|offline/i.test(s)) return '網路連線有問題,請稍後再試';
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

function matchesPref(su, x) {
  if (!su) return false;
  return asList(su.prefs).some(p => (p.startsWith('role:') ? x.g.role === p.slice(5) : canon(x.s.weapon) === p));
}

/* ================= 畫面 ================= */
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
}
const boardHasFocus = () => !!document.activeElement && document.activeElement.matches('#board input');
function flushStale() { if (state.boardStale && !state.dragging && !boardHasFocus()) render(); }

function renderHeader() {
  const ev = cfg().event || {};
  const title = ev.title || '隊伍名單';
  $('#title').textContent = title;
  document.title = `${title} · Albion`;
  const meta = $('#eventMeta');
  meta.replaceChildren();
  if (ev.time) meta.append(h('span', { class: 'meta-chip' }, '🕘 ', ev.time));
  if (ev.note) meta.append(h('span', { class: 'meta-chip' }, '📢 ', ev.note));
  meta.hidden = !meta.children.length || (state.isAdmin && state.editEvent);
  const edit = $('#eventEdit');
  edit.hidden = !(state.isAdmin && state.editEvent);
  if (!edit.hidden) for (const inp of edit.querySelectorAll('input')) {
    if (document.activeElement !== inp) inp.value = ev[inp.dataset.key] || '';
  }
}

function renderOverview() {
  const slots = flatSlots();
  const groups = comp();
  const filled = slots.filter(x => sidAt(x.idx)).length;
  $('#filledNum').textContent = filled;
  $('#totalNum').textContent = slots.length;
  $('.fill').classList.toggle('full', slots.length > 0 && filled === slots.length);

  const bar = $('#segbar');
  bar.replaceChildren(...groups.map((g, gi) => {
    const grp = h('div', { class: `seg-group role-${g.role || 'other'}`, style: `flex:${g.slots.length} 1 0` });
    for (const x of slots.filter(y => y.gi === gi)) {
      const su = signup(sidAt(x.idx));
      const w = lookup(x.s.weapon);
      grp.append(h('div', { class: 'seg' + (su ? ' on' : ''), title: `#${pad2(x.idx + 1)} ${w ? w.en : x.s.weapon} — ${su ? su.name : '空缺'}` }));
    }
    return grp;
  }));
  $('#legend').replaceChildren(...groups.map((g, gi) => {
    const mine = slots.filter(x => x.gi === gi);
    const n = mine.filter(x => sidAt(x.idx)).length;
    return h('span', { class: `role-${g.role || 'other'}` }, h('i'), g.name || roleOf(g).zh, ' ', h('b', {}, `${n}/${mine.length}`));
  }));
}

function renderLive() {
  const live = $('#live'), txt = $('#liveText');
  live.classList.remove('pending', 'error');
  if (!state.backend) { live.classList.add('error'); txt.textContent = '尚未連接資料庫'; return; }
  if (!state.connected) { live.classList.add('pending'); txt.textContent = '連線中…'; return; }
  txt.textContent = `即時同步中 · ${sortedSignups().length} 人報名`;
}

function renderToolbar() {
  const btn = $('#signupBtn');
  btn.disabled = !state.backend || !state.loaded.has('signups');
  btn.textContent = signup(mySid()) ? '✏️ 修改報名' : '📝 我要報名';
  $('#loginBtn').hidden = state.isAdmin || !state.backend;
}

function renderAdminBar() {
  const on = state.isAdmin;
  document.body.classList.toggle('is-admin', on);
  $('#adminbar').hidden = !on;
  $('#evToggle').setAttribute('aria-pressed', String(state.editEvent));
  $('#compToggle').setAttribute('aria-pressed', String(state.editComp));
}

function srcBadge(source) {
  if (source === 'discord') return h('span', { class: 'src src-discord', title: '從 Discord 報名' }, 'DC');
  if (source === 'manual') return h('span', { class: 'src src-manual', title: '隊長新增' }, '隊長');
  return h('span', { class: 'src src-web', title: '從網站報名' }, '網站');
}

function prefChip(p) {
  if (p.startsWith('role:')) {
    const r = ROLES[p.slice(5)];
    return h('span', { class: `pchip pchip-role role-${p.slice(5)}` }, r ? `${r.emoji} ${r.zh}` : p);
  }
  const it = lookup(p);
  return h('span', { class: 'pchip', title: it ? it.zh : null },
    it && it.id ? iconImg(it.id, it.en, 44) : null, h('span', {}, it ? it.en : p));
}
const fillChip = () => h('span', { class: 'pchip pchip-fill' }, '🪑 補位');

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
    const head = h('header', { class: 'group-head' },
      emblem,
      h('div', { class: 'group-title' }, g.name || role.zh, role.en ? h('small', {}, role.en) : null),
      h('span', { class: 'group-count' + (n === mine.length ? ' full' : '') }, `${n}/${mine.length}`));
    const list = h('div', { class: 'slots' });
    for (const x of mine) list.append(renderSlot(x, !!prev && prev[x.idx] !== cur[x.idx]));
    board.append(h('section', { class: `group g${gi} role-${g.role || 'other'}` }, head, list));
  });
}

function slotIcon(s, idx) {
  const w = lookup(s.weapon);
  return h('div', { class: 'slot-icon', title: w ? `${w.en}・${w.zh}` : (s.weapon || '') },
    h('span', { class: 'slot-no' }, pad2(idx + 1)),
    w && w.id ? iconImg(w.id, w.en, 96) : h('span', { class: 'glyph' }, '⚔'));
}

function noteChip(c) {
  const label = c.kind === 'wear' ? '穿' : c.kind === 'bring' ? '帶' : null;
  return h('span', { class: `chip k-${c.kind}`, title: c.item ? c.item.zh : null },
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
    if (w && w.zh) info.append(h('div', { class: 'w-zh' }, w.zh));
    const list = parseNote(s.note);
    if (list.length) chips = h('div', { class: 'chips' }, list.map(noteChip));
  }

  const player = h('div', { class: 'slot-player' });
  if (su) {
    const mini = h('div', { class: 'mini', title: su.name }, srcBadge(su.source), h('span', { class: 'p-name' }, su.name));
    if (admin) {
      mini.draggable = true;
      bindDrag(mini, sid);
      mini.append(h('button', { class: 'mini-x', type: 'button', title: '移回報名池', 'aria-label': '移回報名池', onclick: e => { e.stopPropagation(); unassign(sid); } }, '✕'));
    }
    player.append(mini);
  } else {
    player.append(h('span', { class: 'p-open' }, admin && state.selected ? '點這裡放入' : '空缺 · OPEN'));
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
  write({ 'config/comp': state.config.comp }, '配置已更新');
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
  const wInp = h('input', { class: 'inp', type: 'text', placeholder: '武器(例:heavy mace)', 'aria-label': '武器', spellcheck: 'false' });
  const nInp = h('input', { class: 'inp', type: 'text', placeholder: '備註(例:bring incubus)', 'aria-label': '備註', spellcheck: 'false' });
  wInp.value = s.weapon || '';
  nInp.value = s.note || '';
  wInp.addEventListener('input', () => {
    const t = configSlots()[idx];
    if (!t) return;
    t.weapon = wInp.value;
    wInp.closest('.slot').querySelector('.slot-icon').replaceWith(slotIcon(t, idx));
    saveComp();
  });
  nInp.addEventListener('input', () => {
    const t = configSlots()[idx];
    if (!t) return;
    t.note = nInp.value;
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
  const filters = [['all', `全部 ${list.length}`], ['open', `未排 ${list.length - nAssigned}`], ['fill', `補位 ${nFill}`]];

  const head = h('div', { class: 'pool-head' },
    h('h2', {}, '📋 報名名單'),
    h('div', { class: 'seg-filter', role: 'tablist' }, filters.map(([k, label]) =>
      h('button', {
        type: 'button', class: state.filter === k ? 'on' : null, role: 'tab', 'aria-selected': String(state.filter === k),
        onclick: () => { state.filter = k; store.set(LS_FILTER, k); renderPool(); applySearch(); },
      }, label))),
    admin ? h('button', { class: 'btn small', type: 'button', onclick: () => openSignup('admin-new') }, '➕ 新增') : null);

  const shown = list.filter(([sid, su]) => (state.filter === 'open' ? !smap.has(sid) : state.filter === 'fill' ? su.fill : true));
  const grid = h('div', { class: 'pool-grid' });
  shown.forEach(([sid, su]) => grid.append(renderCard(sid, su, smap.get(sid), list.findIndex(([x]) => x === sid) + 1)));
  if (!shown.length) grid.append(h('div', { class: 'pool-empty' }, list.length ? '這個分類沒有人' : '還沒有人報名,搶頭香!'));
  pool.replaceChildren(head, grid, admin ? h('p', { class: 'pool-hint' }, '把名單上的人拖回這裡 = 取消排位') : '');
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
    const w = x && lookup(x.s.weapon);
    slotLabel = h('span', { class: `card-slot role-${x ? x.g.role : 'other'}` }, `#${pad2(slotIdx + 1)} ${w ? w.en : (x ? x.s.weapon : '')}`);
  }
  const prefs = asList(su.prefs);
  el.append(...[
    h('div', { class: 'card-top' },
      h('span', { class: 'card-no' }, order),
      srcBadge(su.source),
      h('b', { class: 'card-name', title: su.name }, su.name),
      mine ? h('span', { class: 'you' }, '你') : null),
    slotLabel ? h('div', { class: 'card-assigned' }, '已排 ', slotLabel) : null,
    (prefs.length || su.fill) ? h('div', { class: 'pchips' }, prefs.map(prefChip), su.fill ? fillChip() : null) : null,
    su.note ? h('div', { class: 'card-note' }, su.note) : null,
    h('div', { class: 'card-meta' },
      h('span', {}, rel(su.createdAt)),
      admin ? h('span', { class: 'card-actions' },
        h('button', { type: 'button', title: '編輯', 'aria-label': '編輯', onclick: e => { e.stopPropagation(); openSignup('admin-edit', sid); } }, '✎'),
        h('button', { type: 'button', title: '刪除', 'aria-label': '刪除', onclick: e => { e.stopPropagation(); deleteCard(sid); } }, '🗑')) : null),
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
    const w = lookup(x.s.weapon);
    status = h('span', { class: 'mine-status ok' }, `🎯 已排在 #${pad2(idx + 1)} ${w ? w.en : x.s.weapon}(${roleOf(x.g).zh})`);
  } else {
    status = h('span', { class: 'mine-status' }, '⏳ 等待隊長排位');
  }
  box.hidden = false;
  box.replaceChildren(
    h('div', { class: 'mine-main' }, h('b', {}, `✅ 你已報名:${su.name}`), status),
    h('div', { class: 'pchips' }, asList(su.prefs).map(prefChip), su.fill ? fillChip() : null),
    h('div', { class: 'mine-actions' },
      h('button', { class: 'btn small', type: 'button', onclick: () => openSignup('self-edit', sid) }, '✏️ 修改'),
      h('button', { class: 'btn small danger', type: 'button', onclick: withdraw }, '取消報名')));
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
    h('span', { class: 'sel-text' }, '已選 ', h('b', {}, su.name), ' — 點一個位置放入'),
    assigned ? h('button', { class: 'btn small', type: 'button', onclick: () => unassign(state.selected) }, '移回報名池') : null,
    h('button', { class: 'btn small ghost', type: 'button', onclick: () => select(null) }, '取消'),
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
    toast('⚠ 寫入失敗:' + errMsg(e), 5000);
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
  if (!su || !confirm(`刪除「${su.name}」的報名?`)) return;
  const patch = { [`signups/${sid}`]: null };
  const from = slotMap().get(sid);
  if (from != null) patch[`assign/s${from}`] = null;
  if (state.selected === sid) state.selected = null;
  await write(patch, '已刪除');
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

function openSignup(mode, sid) {
  if (!state.backend) return;
  if (mode === 'self-new' && signup(mySid())) { mode = 'self-edit'; sid = mySid(); }
  const su = sid ? signup(sid) : null;
  state.dlg = { mode, sid, prefs: asList(su && su.prefs).slice(0, MAX_PREFS) };
  $('#suTitle').textContent = { 'self-new': '📝 我要報名', 'self-edit': '✏️ 修改報名', 'admin-new': '➕ 新增卡片', 'admin-edit': '✎ 編輯卡片' }[mode];
  $('#suName').value = su ? su.name : (mode === 'self-new' ? (store.get(LS_ME) || '') : '');
  $('#suFill').checked = su ? !!su.fill : false;
  $('#suNote').value = (su && su.note) || '';
  $('#suWithdraw').hidden = mode !== 'self-edit';
  $('#suSubmit').textContent = mode === 'self-new' ? '送出報名' : '儲存';
  $('#suMsg').textContent = '';
  renderPicker();
  $('#signupDlg').showModal();
  if (!$('#suName').value) $('#suName').focus();
}

function renderPicker() {
  const box = $('#suPicker');
  const sel = state.dlg.prefs;
  const full = sel.length >= MAX_PREFS;
  $('#suCount').textContent = `(已選 ${sel.length}/${MAX_PREFS})`;
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
      h('div', { class: 'pick-head' }, h('i'), role.zh),
      h('div', { class: 'pick-row' },
        btn(`role:${g.role}`, g.role, [h('span', { class: 'pick-any' }, role.emoji), h('span', {}, `任何${role.zh}`)], `任何${role.zh}位置都可以`),
        weapons.filter(w => w.role === g.role).map(w => btn(w.key, g.role, [
          w.item && w.item.id ? iconImg(w.item.id, w.item.en, 64) : h('span', { class: 'pick-any' }, '⚔'),
          h('span', {}, w.item ? w.item.en : w.text),
        ], w.item ? w.item.zh : null))));
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
  if (!name) { msg.textContent = '請輸入遊戲名字'; $('#suName').focus(); return; }
  if (!prefs.length && !fill) { msg.textContent = '請至少選一個位置或職業,或勾選補位'; return; }
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
    toast(mode === 'self-new' ? '✅ 報名成功!隊長排位後這裡會即時更新' : '已儲存');
    if (mode.startsWith('self')) { state.query = name; $('#search').value = name; }
    render();
  } catch (err) {
    console.error(err);
    msg.textContent = '送出失敗:' + errMsg(err);
  } finally {
    btn.disabled = false;
  }
}

async function withdraw() {
  const sid = mySid();
  if (!signup(sid) || !confirm('確定要取消報名嗎?')) return;
  if ($('#signupDlg').open) $('#signupDlg').close();
  await write({ [`signups/${sid}`]: null }, '已取消報名');
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
    out.append('你在 ');
    for (const x of hits.slice(0, 4)) {
      const w = lookup(x.s.weapon);
      out.append(h('button', { type: 'button', onclick: () => scrollToEl(`.slot[data-idx="${x.idx}"]`) }, `#${pad2(x.idx + 1)} ${w ? w.en : x.s.weapon}(${roleOf(x.g).zh})`));
    }
    return;
  }
  const waiting = sortedSignups().find(([, su]) => norm(su.name).includes(q));
  if (waiting) {
    out.append(h('button', { type: 'button', onclick: () => scrollToEl(`.card[data-sid="${waiting[0]}"]`) }, '已報名,等待隊長排位'));
    return;
  }
  out.textContent = '名單上還沒有這個名字';
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
        if (!was) toast('👑 已進入隊長模式');
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
    await write({ config: DEFAULT_CONFIG }, '已建立預設配置');
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
  await write(patch, `已匯入舊名單(${n} 人)`);
}

async function captainLogin() {
  try {
    await state.backend.captainSignIn();
    onAuthChanged(state.backend.currentUser());
  } catch (e) {
    if (/popup-closed|cancelled-popup/.test(e.code || '')) return;
    console.error(e);
    toast('⚠ 登入失敗:' + errMsg(e), 6000);
  }
}

async function logout() {
  await state.backend.signOut();
  onAuthChanged(null);
  toast('已登出');
}

function connect(B) {
  state.backend = B;
  B.watchConnected(c => { state.connected = c; renderLive(); });
  B.watch('config', v => {
    state.config = v;
    state.loaded.add('config');
    seedConfig();
    render();
  });
  B.watch('assign', v => {
    state.assign = v || {};
    state.loaded.add('assign');
    render();
  });
  B.watch('signups', v => {
    const next = v || {};
    if (state.knownSids && state.isAdmin) {
      for (const [sid, su] of Object.entries(next)) if (!state.knownSids.has(sid) && su && su.name) toast(`🆕 ${su.name} 報名了`);
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
  $('#copyBtn').addEventListener('click', async () => toast(await copyText(toDiscord()) ? '📋 已複製,直接貼到 Discord 就好' : '⚠ 複製失敗'));
  $('#loginBtn').addEventListener('click', captainLogin);
  $('#logoutBtn').addEventListener('click', logout);
  $('#adminDlgLogout').addEventListener('click', () => { $('#adminDlg').close(); logout(); });
  $('#uidCopy').addEventListener('click', async () => toast(await copyText($('#uidText').textContent) ? 'UID 已複製' : '⚠ 複製失敗'));

  $('#evToggle').addEventListener('click', () => { state.editEvent = !state.editEvent; render(); });
  $('#compToggle').addEventListener('click', () => { state.editComp = !state.editComp; state.prevSlotSids = null; render(); });
  $('#addCardBtn').addEventListener('click', () => openSignup('admin-new'));
  $('#clearAssignBtn').addEventListener('click', () => {
    if (confirm('清空全部位置的排位?(報名卡片會留著)')) write({ assign: null }, '已清空排位');
  });
  $('#resetBtn').addEventListener('click', () => {
    if (confirm('開新一場:清空「所有報名」和「排位」,確定嗎?\n(隊伍配置和活動資訊會保留)')) write({ signups: null, assign: null }, '已開新一場');
  });

  const saveEvent = debounce((key, val) => write({ [`config/event/${key}`]: val }), 600);
  for (const inp of document.querySelectorAll('#eventEdit input')) {
    inp.addEventListener('input', () => {
      if (inp.dataset.key === 'title') $('#title').textContent = inp.value || '隊伍名單';
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
  bindUI();
  const me = store.get(LS_ME);
  if (me) { state.query = me; $('#search').value = me; }
  const params = new URLSearchParams(location.search);
  try {
    if (params.has('mock')) connect((await import('./backend-mock.js')).createBackend());
    else if (FIREBASE_CONFIG) connect((await import('./backend-firebase.js')).createBackend(FIREBASE_CONFIG));
  } catch (e) {
    console.error(e);
    toast('⚠ 資料庫連線失敗:' + errMsg(e), 8000);
  }
  if (!state.backend) { state.config = null; render(); }
}

init();
