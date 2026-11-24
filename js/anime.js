// Character data comes from anime.json (built once with tools/build-data.html from AniList).
// No live API calls while playing: rolling and searching are instant.
// Format: { anime: [ { id, t: title, r?: romaji, c: [ [id, name, img, isMain, [alt names]] ] } ] }, index = popularity rank - 1.
// Errors carry .code (eNoData, eBadData, eRange, eRoll) + .params so the UI can translate them.
const fail = (code, params) => Object.assign(new Error(code), { code, params });
let dataP = null, data = null;
export function loadData() {
  dataP ??= fetch('anime.json', { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw fail('eNoData');
    return r.json();
  }).then(d => {
    if (!Array.isArray(d?.anime) || !d.anime.length) throw fail('eBadData');
    d.anime.forEach((a, i) => { a.rank = i + 1; a.id ??= 'r' + (i + 1); });
    return (data = d);
  }).catch(e => { dataP = null; throw e.code ? e : fail('eNoData'); });
  return dataP;
}
export const dataReady = () => !!data;

const toChar = (c, a) => ({ id: c[0], name: c[1], raw: c[1], img: c[2], alt: (c[4] || []).slice(0, 3), anime: a.t, rank: a.rank });

// The list of anime a room draws from: a rank range, or the picked anime ids.
function poolAnime(anime, opts) {
  if (opts.picks && opts.picks.length) { const s = new Set(opts.picks.map(String)); return anime.filter(a => s.has(String(a.id))); }
  const lo = Math.max(1, opts.from), hi = Math.min(anime.length, opts.to);
  if (hi < lo) throw fail('eRange', { n: anime.length });
  return anime.slice(lo - 1, hi);
}
// How many different characters a room can deal (null until the data file has loaded).
export function poolSize(opts) {
  if (!data) return null;
  try {
    const ids = new Set();
    for (const a of poolAnime(data.anime, opts)) for (const c of a.c || []) if (!opts.mainOnly || c[3]) ids.add(c[0]);
    return ids.size;
  } catch { return 0; }
}

// opts: {from, to, mainOnly, picks?}. Characters never repeat; several may come from the same anime.
export async function rollCharacters(n, opts, onProgress) {
  const { anime } = await loadData();
  const pool = poolAnime(anime, opts);
  if (!pool.length) throw fail('eRoll');
  const used = new Set(), out = [];
  let tries = 0;
  while (out.length < n) {
    if (++tries > n * 300) throw fail('eRoll');
    const a = pool[Math.floor(Math.random() * pool.length)];
    const cast = (a.c || []).filter(c => (!opts.mainOnly || c[3]) && !used.has(c[0]));
    if (!cast.length) continue;
    const c = cast[Math.floor(Math.random() * cast.length)];
    used.add(c[0]);
    out.push(toChar(c, a));
    onProgress && onProgress(out.length, n);
  }
  return out;
}

const norm = s => (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9฀-๿぀-ヿ一-鿿\s]/g, ' ').split(/\s+/).filter(Boolean);
const wordsMatch = (words, key) => { const parts = key.split(' '); return words.every(w => parts.some(p => p.startsWith(w))); };

/* ---------- picking anime for a room ---------- */
const animeCard = a => {
  const main = (a.c || []).filter(c => c[3]);
  return { id: a.id, title: a.t, romaji: a.r || '', rank: a.rank, img: (main[0] || a.c?.[0] || [])[2] || '', main: main.length, all: (a.c || []).length };
};
// Title search for the room settings. Empty query lists the most popular titles.
export async function searchAnime(q, limit = 30) {
  const { anime } = await loadData();
  const words = norm(q);
  if (!words.length) return anime.slice(0, limit).map(animeCard);
  const hits = [];
  for (const a of anime) {
    const keys = [a.t, a.r].filter(Boolean).map(s => norm(s).join(' '));
    if (keys.some(k => wordsMatch(words, k))) hits.push([keys.some(k => k.startsWith(words.join(' '))) ? 0 : 1, a]);
  }
  hits.sort((x, y) => x[0] - y[0] || x[1].rank - y[1].rank);
  return hits.slice(0, limit).map(([, a]) => animeCard(a));
}
// Titles for a list of picked ids (for chips and the room's pool list).
export async function animeByIds(ids) {
  const { anime } = await loadData();
  const m = new Map(anime.map(a => [String(a.id), a]));
  return ids.map(id => m.get(String(id))).filter(Boolean).map(animeCard);
}

/* ---------- guessing ---------- */
let index = null;
async function getIndex() {
  if (index) return index;
  const { anime } = await loadData();
  const seen = new Map(), titles = [];
  anime.forEach(a => {
    const cast = [];
    (a.c || []).forEach(c => {
      const keys = [c[1], ...(c[4] || [])].map(s => norm(s).join(' ')).filter(Boolean);
      const e = seen.get(c[0]) || { id: c[0], name: c[1], img: c[2], anime: a.t, rank: a.rank, keys, main: !!c[3] };
      seen.set(c[0], e); cast.push(e);
    });
    cast.sort((x, y) => y.main - x.main);
    titles.push({ keys: [a.t, a.r].filter(Boolean).map(s => norm(s).join(' ')), rank: a.rank, title: a.t, cast });
  });
  return (index = { chars: [...seen.values()], titles });
}
const out = (e, title) => ({ id: e.id, name: e.name, img: e.img, anime: title || e.anime, alt: title || e.anime });

// Instant autocomplete: characters whose name matches come first, then the cast of anime whose title matches.
export async function searchCharacters(q, limit = 20) {
  const words = norm(q); if (!words.length) return [];
  const { chars, titles } = await getIndex(), hits = [];
  for (const e of chars) {
    const k = e.keys.find(k => wordsMatch(words, k));
    if (k !== undefined) hits.push([k.startsWith(words[0]) ? 0 : 1, e]);
  }
  hits.sort((a, b) => a[0] - b[0] || a[1].rank - b[1].rank);
  const res = hits.slice(0, limit).map(([, e]) => out(e)), have = new Set(res.map(r => r.id));
  for (const t of titles) {
    if (res.length >= limit) break;
    if (!t.keys.some(k => wordsMatch(words, k))) continue;
    for (const e of t.cast) { if (res.length >= limit) break; if (!have.has(e.id)) { have.add(e.id); res.push(out(e, t.title)); } }
  }
  return res;
}

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// Best character for a typed (not picked) guess, so everyone can see who was guessed. null if nothing close.
export async function findCharacter(text) {
  const g = norm(text); if (!g.length) return null;
  const gs = g.slice().sort().join(' ');
  const { chars } = await getIndex();
  let best = null, bestD = Infinity;
  for (const e of chars) for (const k of e.keys) {
    const ks = k.split(' ').sort().join(' ');
    if (Math.abs(ks.length - gs.length) > 3) continue;
    const d = lev(gs, ks);
    if (d < bestD || (d === bestD && e.rank < best.rank)) { best = e; bestD = d; }
  }
  if (best && bestD <= Math.max(1, Math.floor(gs.length * 0.2))) return out(best);
  const pre = (await searchCharacters(text, 1))[0];
  return pre && chars.find(c => c.id === pre.id && c.keys.some(k => wordsMatch(g, k))) ? pre : null;
}

// Lenient check for typed guesses: word order, small typos and alternative names are fine.
export function isCorrectGuess(guessText, guessId, char) {
  if (guessId && +guessId === +char.id) return true;
  const g = norm(guessText); if (!g.length) return false;
  const gs = g.slice().sort().join(' ');
  for (const name of [char.raw || char.name, ...(char.alt || [])]) {
    const t = norm(name); if (!t.length) continue;
    const ts = t.slice().sort().join(' ');
    if (lev(gs, ts) <= Math.max(1, Math.floor(ts.length * 0.15))) return true;
    if (t.length === 1 && g.length === 1 && lev(g[0], t[0]) <= 1) return true;
  }
  return false;
}
