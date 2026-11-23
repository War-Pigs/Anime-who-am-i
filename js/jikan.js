// MyAnimeList data through the free Jikan API (https://jikan.moe). Rate limit ~3 req/s, 60/min.
const API = 'https://api.jikan.moe/v4';
let lastCall = 0;
const cache = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function jget(path) {
  if (cache.has(path)) return cache.get(path);
  for (let attempt = 0; attempt < 5; attempt++) {
    const wait = lastCall + 420 - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
    let res;
    try { res = await fetch(API + path); } catch (e) { await sleep(800 * (attempt + 1)); continue; }
    if (res.status === 429 || res.status >= 500) { await sleep(1200 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error('MAL ' + res.status);
    const j = await res.json();
    cache.set(path, j);
    return j;
  }
  throw new Error('MyAnimeList ไม่ตอบกลับ ลองใหม่อีกครั้ง');
}

export function niceName(n) {
  if (!n) return '';
  const i = n.indexOf(', ');
  return i > 0 ? n.slice(i + 2) + ' ' + n.slice(0, i) : n;
}
const imgOf = o => o?.images?.webp?.image_url || o?.images?.jpg?.image_url || '';
const isPlaceholder = u => !u || /questionmark|apple-touch-icon/.test(u);

async function animeAtRank(rank) {
  const page = Math.ceil(rank / 25);
  const j = await jget(`/top/anime?page=${page}&limit=25`);
  const list = j.data || [];
  if (!list.length) return null;
  const a = list[Math.min(list.length - 1, (rank - 1) % 25)];
  return { id: a.mal_id, title: a.title_english || a.title, rank: a.rank || rank };
}

async function castOf(animeId, mainOnly) {
  const j = await jget(`/anime/${animeId}/characters`);
  let cast = (j.data || []).filter(c => !isPlaceholder(imgOf(c.character)));
  const main = cast.filter(c => c.role === 'Main');
  if (mainOnly) cast = main;
  else cast = main.concat(cast.filter(c => c.role !== 'Main').sort((a, b) => (b.favorites || 0) - (a.favorites || 0)).slice(0, 12));
  return cast;
}

// opts: {from, to, mainOnly}. Characters never repeat; several may come from the same anime.
export async function rollCharacters(n, opts, onProgress) {
  const usedAnime = new Set(), usedChar = new Set(), out = [];
  let tries = 0;
  while (out.length < n) {
    if (++tries > n * 12) throw new Error('สุ่มตัวละครไม่ครบ ลองขยายช่วงอันดับดูนะ');
    const rank = opts.from + Math.floor(Math.random() * (opts.to - opts.from + 1));
    const anime = await animeAtRank(rank);
    if (!anime || (opts.uniqueAnime && usedAnime.has(anime.id))) continue;
    const cast = (await castOf(anime.id, opts.mainOnly)).filter(c => !usedChar.has(c.character.mal_id));
    if (!cast.length) continue;
    const c = cast[Math.floor(Math.random() * cast.length)].character;
    usedAnime.add(anime.id); usedChar.add(c.mal_id);
    out.push({ id: c.mal_id, name: niceName(c.name), raw: c.name, img: imgOf(c), anime: anime.title, rank: anime.rank });
    onProgress && onProgress(out.length, n);
  }
  return out;
}

export async function searchCharacters(q) {
  const j = await jget(`/characters?q=${encodeURIComponent(q)}&limit=8&order_by=favorites&sort=desc`);
  return (j.data || []).map(c => ({ id: c.mal_id, name: niceName(c.name), img: imgOf(c), alt: (c.nicknames || []).slice(0, 2).join(', ') }));
}

// Lenient name match for typed guesses: word order and small typos are fine.
const norm = s => (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9฀-๿\s]/g, ' ').split(/\s+/).filter(Boolean);
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export function isCorrectGuess(guessText, guessId, char) {
  if (guessId && +guessId === +char.id) return true;
  const g = norm(guessText), t = norm(char.raw || char.name);
  if (!g.length) return false;
  const gs = g.slice().sort().join(' '), ts = t.slice().sort().join(' ');
  if (lev(gs, ts) <= Math.max(1, Math.floor(ts.length * 0.15))) return true;
  return t.length === 1 && g.length === 1 && lev(g[0], t[0]) <= 1;
}
