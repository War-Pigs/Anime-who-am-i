// Character data comes from anime.json (built once with tools/build-data.html from AniList).
// No live API calls while playing: rolling and searching are instant.
// Format: { anime: [ { t: title, c: [ [id, name, img, isMain, [alt names]] ] } ] }, index = popularity rank - 1.
let dataP = null;
export function loadData() {
  dataP ??= fetch('anime.json', { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error('ยังไม่มีไฟล์ anime.json ในเว็บ ให้รันหน้า tools/build-data.html ก่อน (ดู README)');
    return r.json();
  }).then(d => {
    if (!Array.isArray(d?.anime) || !d.anime.length) throw new Error('ไฟล์ anime.json ไม่ถูกต้อง ลองสร้างใหม่');
    return d;
  }).catch(e => { dataP = null; throw e; });
  return dataP;
}

const toChar = (c, a, rank) => ({ id: c[0], name: c[1], raw: c[1], img: c[2], alt: (c[4] || []).slice(0, 3), anime: a.t, rank });

// opts: {from, to, mainOnly}. Characters never repeat; several may come from the same anime.
export async function rollCharacters(n, opts, onProgress) {
  const { anime } = await loadData();
  const lo = Math.max(1, opts.from), hi = Math.min(anime.length, opts.to);
  if (hi < lo) throw new Error(`ไฟล์ข้อมูลมีแค่ ${anime.length} เรื่อง เลือกช่วงอันดับให้แคบลงนะ`);
  const used = new Set(), out = [];
  let tries = 0;
  while (out.length < n) {
    if (++tries > n * 200) throw new Error('สุ่มตัวละครไม่ครบ ลองขยายช่วงอันดับดูนะ');
    const rank = lo + Math.floor(Math.random() * (hi - lo + 1));
    const a = anime[rank - 1];
    const cast = (a.c || []).filter(c => (!opts.mainOnly || c[3]) && !used.has(c[0]));
    if (!cast.length) continue;
    const c = cast[Math.floor(Math.random() * cast.length)];
    used.add(c[0]);
    out.push(toChar(c, a, rank));
    onProgress && onProgress(out.length, n);
  }
  return out;
}

const norm = s => (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9฀-๿぀-ヿ一-鿿\s]/g, ' ').split(/\s+/).filter(Boolean);

let index = null;
async function getIndex() {
  if (index) return index;
  const { anime } = await loadData();
  const seen = new Map();
  anime.forEach((a, i) => (a.c || []).forEach(c => {
    if (seen.has(c[0])) return;
    const keys = [c[1], ...(c[4] || [])].map(s => norm(s).join(' ')).filter(Boolean);
    seen.set(c[0], { id: c[0], name: c[1], img: c[2], anime: a.t, rank: i + 1, keys });
  }));
  return (index = [...seen.values()]);
}

// Instant autocomplete over every character in the file: all typed words must start a word of the name.
export async function searchCharacters(q) {
  const words = norm(q); if (!words.length) return [];
  const idx = await getIndex(), hits = [];
  for (const e of idx) {
    let best = -1;
    for (const k of e.keys) {
      const parts = k.split(' ');
      if (words.every(w => parts.some(p => p.startsWith(w)))) { best = k.startsWith(words[0]) ? 0 : 1; break; }
    }
    if (best >= 0) hits.push([best, e]);
    if (hits.length > 400) break;
  }
  hits.sort((a, b) => a[0] - b[0] || a[1].rank - b[1].rank);
  return hits.slice(0, 8).map(([, e]) => ({ id: e.id, name: e.name, img: e.img, alt: e.anime }));
}

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
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
