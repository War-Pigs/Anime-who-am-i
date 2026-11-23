// Network layer: Firebase Realtime Database when configured, otherwise a
// same-browser "local" mode (localStorage + storage events) for trying the game.
const split = p => p.split('/').filter(Boolean);
const clone = v => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

function localAdapter() {
  const KEY = 'agw-db-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const getAt = (o, p) => { for (const k of split(p)) { if (o == null || typeof o !== 'object') return null; o = o[k]; } return o === undefined ? null : o; };
  const setAt = (o, p, v) => {
    const ks = split(p); const last = ks.pop(); let cur = o;
    for (const k of ks) { if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; }
    if (v === null || v === undefined) delete cur[last]; else cur[last] = clone(v);
  };
  const listeners = new Set();
  const check = () => {
    const db = read();
    for (const l of listeners) {
      const v = getAt(db, l.path); const s = JSON.stringify(v);
      if (s !== l.last) { l.last = s; try { l.cb(clone(v)); } catch (e) { console.error(e); } }
    }
  };
  const write = fn => { const db = read(); fn(db); localStorage.setItem(KEY, JSON.stringify(db)); queueMicrotask(check); };
  addEventListener('storage', e => { if (e.key === KEY) check(); });
  const disc = new Map();
  addEventListener('pagehide', () => { write(db => { for (const [p, v] of disc) setAt(db, p, v); }); });
  return {
    mode: 'local',
    async get(p) { return clone(getAt(read(), p)); },
    async set(p, v) { write(db => setAt(db, p, v)); },
    async update(p, obj) { write(db => { for (const k in obj) setAt(db, (p ? p + '/' : '') + k, obj[k]); }); },
    async push(p, v) { const k = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); write(db => setAt(db, p + '/' + k, v)); return k; },
    async remove(p) { write(db => setAt(db, p, null)); },
    async tx(p, fn) { let out; write(db => { const nv = fn(clone(getAt(db, p))); if (nv !== undefined) { setAt(db, p, nv); out = nv; } }); return out; },
    on(p, cb) { const l = { path: p, cb, last: undefined }; listeners.add(l); queueMicrotask(check); return () => listeners.delete(l); },
    onDisconnect(p, v) { disc.set(p, v); },
    cancelDisconnect(p) { disc.delete(p); },
    onConnected(cb) { queueMicrotask(() => cb(true)); return () => {}; }
  };
}

async function firebaseAdapter(cfg) {
  const V = '10.12.2';
  const A = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const D = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`);
  const app = A.initializeApp(cfg);
  const db = D.getDatabase(app);
  const r = p => D.ref(db, p);
  return {
    mode: 'firebase',
    async get(p) { const s = await D.get(r(p)); return s.exists() ? s.val() : null; },
    set: (p, v) => D.set(r(p), v),
    update: (p, obj) => D.update(r(p || '/'), obj),
    async push(p, v) { const k = D.push(r(p)); await D.set(k, v); return k.key; },
    remove: p => D.remove(r(p)),
    async tx(p, fn) { const res = await D.runTransaction(r(p), cur => fn(cur)); return res.committed ? res.snapshot.val() : undefined; },
    on(p, cb) { return D.onValue(r(p), s => cb(s.val())); },
    onDisconnect(p, v) { const d = D.onDisconnect(r(p)); return v === null ? d.remove() : d.set(v); },
    cancelDisconnect(p) { return D.onDisconnect(r(p)).cancel(); },
    onConnected(cb) { return D.onValue(r('.info/connected'), s => cb(!!s.val())); }
  };
}

export async function createNet() {
  const cfg = window.FIREBASE_CONFIG;
  if (cfg && cfg.databaseURL && !/YOUR_/.test(JSON.stringify(cfg))) {
    try { return await firebaseAdapter(cfg); } catch (e) { console.error('Firebase failed, using local mode', e); }
  }
  return localAdapter();
}
