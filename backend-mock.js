// 本機測試用的假資料庫(網址加 ?mock 才會載入):資料存 localStorage,多分頁即時同步。
// 每個分頁各自一個使用者(sessionStorage),方便一邊當隊長、一邊當隊員測試。
const KEY = 'mockdb.v1';
const USER_KEY = 'mockuser';
const SERVER_TS = { '.sv': 'timestamp' };

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = db => localStorage.setItem(KEY, JSON.stringify(db));
const keys = path => path.split('/').filter(Boolean);
const getPath = (obj, path) => {
  let o = obj;
  for (const k of keys(path)) { if (o == null) return null; o = o[k]; }
  return o === undefined ? null : o;
};
function setPath(obj, path, val) {
  const ks = keys(path);
  let o = obj;
  for (const k of ks.slice(0, -1)) {
    if (o[k] == null || typeof o[k] !== 'object') o[k] = {};
    o = o[k];
  }
  if (val == null) delete o[ks[ks.length - 1]];
  else o[ks[ks.length - 1]] = val;
}
function resolve(v) {
  if (!v || typeof v !== 'object') return v;
  if (v['.sv'] === 'timestamp') return Date.now();
  const out = {};
  for (const [k, x] of Object.entries(v)) if (x != null) out[k] = resolve(x);
  return out;
}

export function createBackend() {
  const watchers = new Set();
  const fire = () => {
    const db = load();
    for (const w of watchers) w.cb(structuredClone(getPath(db, w.path)));
  };
  window.addEventListener('storage', e => { if (e.key === KEY) fire(); });

  const db0 = load();
  if (!db0.admins) { db0.admins = { captain: true }; save(db0); }

  let user = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
  const authCbs = [];
  const setUser = u => {
    user = u;
    if (u) sessionStorage.setItem(USER_KEY, JSON.stringify(u)); else sessionStorage.removeItem(USER_KEY);
    authCbs.forEach(cb => cb(u));
  };

  return {
    kind: 'mock',
    serverTime: () => SERVER_TS,
    watch(path, cb) {
      const w = { path, cb };
      watchers.add(w);
      setTimeout(() => cb(structuredClone(getPath(load(), path))), 20);
      return () => watchers.delete(w);
    },
    watchConnected(cb) { setTimeout(() => cb(true), 20); return () => {}; },
    onAuth(cb) { authCbs.push(cb); setTimeout(() => cb(user), 0); },
    currentUser: () => user,
    async ensureUser() {
      if (!user) setUser({ uid: 'anon' + Math.random().toString(36).slice(2, 8), isAnonymous: true });
      return user.uid;
    },
    async captainSignIn() { setUser({ uid: 'captain', isAnonymous: false, email: 'captain@example.test' }); },
    async signOut() { setUser(null); },
    async claim(path, value) {
      const db = load();
      if (getPath(db, path) === value) return false;
      setPath(db, path, value);
      save(db);
      fire();
      return true;
    },
    async update(patch) {
      const db = load();
      for (const [p, v] of Object.entries(patch)) setPath(db, p, resolve(v));
      save(db);
      fire();
    },
  };
}
