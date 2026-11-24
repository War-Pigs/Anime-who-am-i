import { createNet } from './net.js';
import { loadData, rollCharacters, searchCharacters, isCorrectGuess } from './anime.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => (typeof u === 'string' && u.startsWith('https://') ? u : '');
const okKey = k => /^[A-Za-z0-9_-]{1,40}$/.test(k);
// Sprite metrics in original pixels (sprite height 862): card centre x and card bottom y per pose.
const SP = { idle: { cx: 253, cb: 233 }, yes: { cx: 312, cb: 218 }, no: { cx: 259, cb: 245 } }, SH = 862;
for (const p in SP) { const i = new Image(); i.src = `img/${p}.webp`; }

let net;
const pid = (() => {
  let p; try { p = sessionStorage.getItem('agw-pid'); } catch {}
  if (!p) { p = 'p' + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('agw-pid', p); } catch {} }
  return p;
})();
const st = { code: null, info: null, players: {}, game: null, chat: {}, unsubs: [], seenRx: {}, timers: {}, lastStatus: null,
  hostIdx: false, idxSig: '', idxAt: 0, offSince: {}, joined: false, leaving: false, chatSeen: null, solvedSeen: {} };
let roomIndex = {};

/* ---------- helpers ---------- */
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
async function hash(s) {
  if (crypto?.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  let h = 5381; for (const c of s) h = ((h << 5) + h + c.codePointAt(0)) | 0; return 'h' + (h >>> 0).toString(16);
}
const R = p => `rooms/${st.code}/${p}`;
const amHost = () => st.info?.host === pid;
const online = () => Object.entries(st.players).filter(([k, p]) => okKey(k) && p && p.online !== false).sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0));
const myName = () => st.players[pid]?.name || $('#nameIn').value.trim();
function requireName() {
  const n = $('#nameIn').value.trim().slice(0, 12);
  if (!n) { toast('ใส่ชื่อของคุณก่อนนะ'); $('#nameIn').focus(); return null; }
  try { localStorage.setItem('agw-name', n); } catch {}
  return n;
}
const say = (type, extra = {}) => net.push(R('chat'), { pid, name: myName(), type, ts: Date.now(), ...extra });
const sys = text => net.push(R('chat'), { type: 'sys', text, ts: Date.now() });
const rangeText = i => `Top ${i.from}–${i.to}`;
for (const d of document.querySelectorAll('dialog')) d.addEventListener('click', e => { if (e.target.closest('[data-close]')) d.close(); });

/* ---------- home / lobby list ---------- */
function renderRooms() {
  const q = $('#search').value.trim(), ql = q.toLowerCase(), qu = q.toUpperCase();
  const now = Date.now();
  const rows = Object.entries(roomIndex || {}).filter(([c, r]) => okKey(c) && r && now - (r.ts || 0) < 120000)
    .filter(([c, r]) => !q || (r.nameLower || '').includes(ql) || c.startsWith(qu))
    .sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
  $('#roomList').innerHTML = rows.length ? rows.map(([c, r]) => {
    const off = r.status !== 'lobby' || r.count >= r.max;
    return `<button class="room${off ? ' off' : ''}" data-code="${esc(c)}" ${off ? 'aria-disabled="true"' : ''}>
      <span class="ico" aria-hidden="true">${r.hasPass ? '🔒' : '🔓'}</span>
      <span><b>${esc(r.name)}</b><small>${esc(rangeText(r))} · ${r.mainOnly ? 'ตัวเอกเท่านั้น' : 'ตัวเอก + ตัวรอง'} · ${r.status === 'lobby' ? 'รอเริ่ม' : 'กำลังเล่น'}</small></span>
      <span class="cnt">${+r.count || 0}/${+r.max || 0}</span></button>`;
  }).join('') : `<div class="empty">${q ? 'ไม่เจอห้องที่ค้นหา ลองพิมพ์โค้ด 6 ตัวแล้วกด "เข้าด้วยโค้ด"' : 'ยังไม่มีห้องเปิดอยู่ สร้างห้องแรกเลย!'}</div>`;
}
$('#search').addEventListener('input', renderRooms);
$('#roomList').addEventListener('click', e => {
  const b = e.target.closest('.room'); if (!b) return;
  if (b.classList.contains('off')) { toast('ห้องนี้เต็มหรือกำลังเล่นอยู่'); return; }
  joinRoom(b.dataset.code);
});
$('#searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const q = $('#search').value.trim().toUpperCase();
  if (/^[A-Z0-9]{6}$/.test(q)) joinRoom(q); else toast('พิมพ์โค้ดห้อง 6 ตัว หรือกดเลือกห้องจากรายการ');
});

/* ---------- create ---------- */
const cf = $('#createForm');
cf.addEventListener('change', () => {
  $('#cPassWrap').hidden = cf.vis.value !== 'lock';
  $('#cCustom').hidden = cf.rng.value !== 'custom';
});
$('#createBtn').addEventListener('click', () => { if (!requireName()) return; $('#cErr').textContent = ''; $('#dlgCreate').showModal(); });
cf.addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('#cName').value.trim().slice(0, 20), vis = cf.vis.value, pass = $('#cPass').value;
  let from = 1, to = 50;
  if (cf.rng.value === 'custom') { from = Math.max(1, +$('#cFrom').value | 0); to = Math.min(5000, +$('#cTo').value | 0); }
  else [from, to] = cf.rng.value.split('-').map(Number);
  const err = m => { $('#cErr').textContent = m; };
  if (!name) return err('ตั้งชื่อห้องก่อนนะ');
  if (vis === 'lock' && !pass) return err('ห้องปิดต้องมีรหัสผ่าน');
  if (!(to - from >= 9)) return err('ช่วงอันดับต้องห่างกันอย่างน้อย 10 อันดับ');
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  for (let i = 0; i < 6; i++) { code = Array.from({ length: 6 }, () => A[Math.floor(Math.random() * A.length)]).join(''); if (!(await net.get(`rooms/${code}/info`))) break; }
  const info = { name, nameLower: name.toLowerCase(), hidden: vis === 'hidden', passHash: vis === 'lock' ? await hash(code + pass) : '',
    from, to, mainOnly: $('#cRole').value === 'main', max: +$('#cMax').value, host: pid, status: 'lobby', created: Date.now() };
  await net.set(`rooms/${code}/info`, info);
  $('#dlgCreate').close();
  joinRoom(code, true);
});

/* ---------- join / leave ---------- */
function askPass(code, want) {
  return new Promise(res => {
    const d = $('#dlgPass'), f = $('#passForm');
    $('#passIn').value = ''; $('#passErr').textContent = '';
    const done = v => { f.onsubmit = null; d.onclose = null; if (d.open) d.close(); res(v); };
    f.onsubmit = async e => { e.preventDefault(); if ((await hash(code + $('#passIn').value)) === want) done(true); else $('#passErr').textContent = 'รหัสไม่ถูกต้อง'; };
    d.onclose = () => done(false);
    d.showModal();
  });
}
async function joinRoom(code, created = false) {
  const name = requireName(); if (!name) return;
  const info = await net.get(`rooms/${code}/info`);
  if (!info) return toast('ไม่พบห้องนี้ เช็กโค้ดอีกทีนะ');
  const players = (await net.get(`rooms/${code}/players`)) || {};
  const mine = players[pid];
  const others = Object.entries(players).filter(([k, p]) => k !== pid && p && p.online !== false);
  if (!created && !mine) {
    if (!others.length) return toast('ห้องนี้ไม่มีคนอยู่แล้ว');
    if (info.status !== 'lobby') return toast('ห้องนี้กำลังเล่นอยู่ รอรอบหน้านะ');
    if (others.length >= info.max) return toast('ห้องเต็มแล้ว');
    if (info.passHash && !(await askPass(code, info.passHash))) return;
  }
  const taken = new Set(Object.entries(players).filter(([k]) => k !== pid).map(([, p]) => p?.name));
  let nm = name, i = 2; while (taken.has(nm)) nm = name.slice(0, 9) + ' ' + i++;
  await net.update(`rooms/${code}/players/${pid}`, { name: nm, online: true, joinedAt: mine?.joinedAt || Date.now() });
  net.onDisconnect(`rooms/${code}/players/${pid}/online`, false);
  enter(code);
  if (!mine) sys(`${nm} เข้าห้องมาแล้ว`);
}
function enter(code) {
  Object.assign(st, { code, info: null, players: {}, game: null, chat: {}, seenRx: {}, rxReady: false, lastStatus: null, hostIdx: false, idxSig: '', offSince: {}, joined: false, leaving: false, chatSeen: null, solvedSeen: {} });
  $('#vHome').hidden = true; $('#vRoom').hidden = false;
  history.replaceState(null, '', '#' + code);
  $('#stage').innerHTML = ''; $('#lobbyStage').innerHTML = ''; $('#chatLog').innerHTML = '';
  st.unsubs = [
    net.on(R('info'), v => { if (!v) return leaveLocal('ห้องถูกปิดแล้ว'); st.info = v; onState(); }),
    net.on(R('players'), v => {
      st.players = v || {};
      if (st.players[pid]) st.joined = true; else if (st.joined && !st.leaving) return leaveLocal('คุณถูกเชิญออกจากห้อง');
      onState();
    }),
    net.on(R('game'), v => { st.game = v; onState(); }),
    net.on(R('chat'), v => { st.chat = v || {}; renderChat(); })
  ];
}
function leaveLocal(msg) {
  st.unsubs.forEach(u => { try { u(); } catch {} }); st.unsubs = [];
  if (st.code) { net.cancelDisconnect(`rooms/${st.code}/players/${pid}/online`); net.cancelDisconnect(`roomIndex/${st.code}`); }
  Object.values(st.timers).forEach(clearTimeout);
  st.code = null; st.info = null;
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  $('#vRoom').hidden = true; $('#vHome').hidden = false;
  history.replaceState(null, '', location.pathname + location.search);
  if (msg) toast(msg);
}
$('#leaveBtn').addEventListener('click', async () => {
  const code = st.code; if (!code) return;
  st.leaving = true;
  const others = online().filter(([k]) => k !== pid);
  const wasHost = amHost(), name = myName();
  if (!others.length) { await net.remove(`rooms/${code}`); await net.remove(`roomIndex/${code}`); }
  else {
    if (st.info.status === 'playing' && st.game?.turn === pid) await advanceFrom(pid, {}, new Set([pid]));
    if (wasHost) { await net.set(R('info/host'), others[0][0]); await net.remove(`roomIndex/${code}`); }
    await sys(`${name} ออกจากห้อง`);
    await net.remove(R(`players/${pid}`));
  }
  leaveLocal();
});
$('#codeChip').addEventListener('click', async () => {
  const link = location.origin + location.pathname + '#' + st.code;
  try { await navigator.clipboard.writeText(link); toast('คัดลอกลิงก์ห้องแล้ว ส่งให้เพื่อนได้เลย'); } catch { toast('โค้ดห้อง: ' + st.code); }
});

/* ---------- host duties ---------- */
function hostDuties() {
  const info = st.info, P = st.players;
  if (!info) return;
  const hostOk = P[info.host] && P[info.host].online !== false;
  if (!hostOk) {
    const c = online();
    if (c[0]?.[0] === pid) net.tx(R('info/host'), cur => (cur && P[cur] && P[cur].online !== false ? undefined : pid))
      .then(v => { if (v === pid) sys(`${myName()} เป็นหัวห้องคนใหม่`); });
  }
  if (!amHost()) { st.hostIdx = false; return; }
  const now = Date.now();
  if (info.status === 'lobby') {
    for (const [k, p] of Object.entries(P)) {
      if (k === pid || !p || p.online !== false) { delete st.offSince[k]; continue; }
      st.offSince[k] ??= now;
      if (now - st.offSince[k] > 20000) { delete st.offSince[k]; net.remove(R(`players/${k}`)); }
    }
  }
  syncIndex();
}
function syncIndex(force) {
  const info = st.info; if (!info || !amHost()) return;
  if (info.hidden) { if (!st.idxSig) { net.remove(`roomIndex/${st.code}`); st.idxSig = 'hidden'; } return; }
  const entry = { name: info.name, nameLower: info.nameLower, hasPass: !!info.passHash, from: info.from, to: info.to, mainOnly: !!info.mainOnly, max: info.max, status: info.status === 'lobby' ? 'lobby' : 'playing', count: online().length };
  const sig = JSON.stringify(entry);
  if (!force && sig === st.idxSig && Date.now() - st.idxAt < 30000) return;
  st.idxSig = sig; st.idxAt = Date.now();
  net.set(`roomIndex/${st.code}`, { ...entry, ts: Date.now() });
  if (!st.hostIdx) { net.onDisconnect(`roomIndex/${st.code}`, null); st.hostIdx = true; }
}
setInterval(() => { if (st.code) hostDuties(); }, 10000);

/* ---------- state → screen ---------- */
function onState() {
  const info = st.info; if (!info || !st.code) return;
  hostDuties();
  $('#rName').textContent = info.name;
  $('#codeChip').textContent = st.code;
  $('#rSet').textContent = `${info.passHash ? '🔒 ห้องปิด' : info.hidden ? 'ห้องซ่อน' : '🔓 ห้องเปิด'} · ${rangeText(info)} · ${info.mainOnly ? 'ตัวเอกเท่านั้น' : 'ตัวเอก + ตัวรอง'}`;
  const lobby = info.status === 'lobby';
  $('#lobbyPane').hidden = !lobby; $('#gamePane').hidden = lobby;
  if (lobby) renderLobby(); else renderGame();
  playReactions();
  if (info.status !== st.lastStatus) {
    if (info.status === 'ended') showResults();
    if (info.status === 'lobby') $('#dlgResult').open && $('#dlgResult').close();
    st.lastStatus = info.status;
  }
}
function renderLobby() {
  const info = st.info, list = online();
  $('#pCount').textContent = `${list.length}/${info.max}`;
  $('#pList').innerHTML = list.map(([k, p]) => `<li><span>${k === info.host ? '👑 ' : ''}${esc(p.name)}${k === pid ? ' (คุณ)' : ''}</span>${amHost() && k !== pid ? `<button data-kick="${esc(k)}" aria-label="เชิญ ${esc(p.name)} ออก">เชิญออก</button>` : ''}</li>`).join('');
  $('#startBtn').hidden = !amHost();
  $('#startBtn').disabled = list.length < 2;
  $('#startNote').textContent = amHost() ? (list.length < 2 ? 'รอเพื่อนอีกอย่างน้อย 1 คน กดที่โค้ดห้องเพื่อคัดลอกลิงก์ส่งให้เพื่อน' : 'พร้อมแล้ว กดเริ่มได้เลย!') : 'รอหัวห้องกดเริ่มเกม';
  renderStage($('#lobbyStage'), list.map(([k, p]) => ({ k, p })), 'lobby');
}
$('#pList').addEventListener('click', e => { const b = e.target.closest('[data-kick]'); if (b && amHost()) { const n = st.players[b.dataset.kick]?.name; net.remove(R(`players/${b.dataset.kick}`)); sys(`${n} ถูกเชิญออกจากห้อง`); } });

function renderGame() {
  const info = st.info, g = st.game || {}, P = st.players, status = info.status;
  const order = (g.order || '').split(',').filter(k => P[k]);
  const list = (order.length ? order : online().map(([k]) => k)).map(k => ({ k, p: P[k] }));
  renderStage($('#stage'), list, status, g.turn);
  const me = P[pid] || {}, myTurn = status === 'playing' && g.turn === pid;
  const tn = P[g.turn]?.name;
  const banner = $('#turnBanner');
  if (status === 'rolling') banner.textContent = `กำลังแจกการ์ดตัวละคร… ${g.progress || 0}/${g.n || list.length}`;
  else if (status === 'ended') banner.textContent = 'จบเกมแล้ว! การ์ดทุกใบเปิดหมดแล้ว';
  else if (myTurn) banner.innerHTML = '<b>ตาของคุณ!</b> ถามลักษณะของตัวเองในแชท แล้วกดจบตาหรือขอเดา';
  else if (me.solved) banner.innerHTML = `คุณเดาถูกแล้ว! ตอนนี้ตาของ <b>${esc(tn)}</b> ช่วยชูป้ายตอบด้วยนะ`;
  else banner.innerHTML = tn ? `ตาของ <b>${esc(tn)}</b> ช่วยชูป้าย ✓ ✗ ตอบคำถามด้วยนะ` : '';
  $('#guessBtn').disabled = !myTurn || !!me.solved;
  $('#endTurnBtn').disabled = status !== 'playing' || !(myTurn || amHost());
  $('#endTurnBtn').textContent = myTurn || !amHost() ? 'จบตา' : 'ข้ามตาคนนี้';
  $('#endGameBtn').hidden = !(amHost() && status === 'playing');
  document.querySelectorAll('.rx').forEach(b => { b.disabled = status !== 'playing'; });
}

/* ---------- stage of chibis ---------- */
function renderStage(el, list, mode, turn) {
  const n = Math.max(1, list.length), W = el.clientWidth || 800;
  const perRow = W < 600 ? Math.min(n, 3) : n;
  const S = Math.round(Math.max(130, Math.min(250, (W - 30) / (perRow * 0.78))));
  const keep = new Set();
  for (const { k, p } of list) {
    if (!okKey(k) || !p) continue;
    keep.add(k);
    let slot = el.querySelector(`[data-pid="${k}"]`);
    if (!slot) {
      slot = document.createElement('div'); slot.className = 'slot'; slot.dataset.pid = k;
      slot.innerHTML = '<div class="fig"><img class="spr" alt="" src="img/idle.webp"><div class="card"></div></div><div class="tag"></div>';
      el.appendChild(slot); slot.dataset.pose = 'idle';
    }
    if (+slot.dataset.s !== S) { slot.dataset.s = S; const f = slot.querySelector('.fig'); f.style.width = S * 0.7 + 'px'; f.style.height = S + 'px'; setPose(slot, slot.dataset.pose || 'idle'); }
    const c = p.char, reveal = mode === 'ended' || k !== pid || p.solved;
    let ck, html;
    if (mode === 'lobby') { ck = 'q'; html = '<span class="qm">?</span>'; }
    else if (!c) { ck = 'ld'; html = '<span class="ld"></span>'; }
    else if (!reveal) { ck = 'q'; html = '<span class="qm">?</span>'; }
    else { ck = 'c' + c.id; html = safeUrl(c.img) ? `<img src="${esc(safeUrl(c.img))}" alt="${esc(c.name)}" title="${esc(c.name)} · ${esc(c.anime)}">` : `<span>${esc(c.name)}</span>`; }
    const card = slot.querySelector('.card');
    if (slot.dataset.ck !== ck) { const flip = slot.dataset.ck === 'q' && ck.startsWith('c') && k === pid; slot.dataset.ck = ck; card.innerHTML = html; card.classList.remove('flip'); if (flip) { void card.offsetWidth; card.classList.add('flip'); } }
    slot.querySelector('.tag').textContent = (k === st.info?.host ? '👑 ' : '') + p.name + (k === pid ? ' (คุณ)' : '');
    slot.classList.toggle('me', k === pid);
    slot.classList.toggle('turn', mode === 'playing' && turn === k);
    slot.classList.toggle('solved', !!p.solved);
    slot.classList.toggle('off', p.online === false);
  }
  for (const s of [...el.children]) if (!keep.has(s.dataset.pid)) s.remove();
}
function setPose(slot, pose) {
  const m = SP[pose] || SP.idle, S = +slot.dataset.s || 200, k = S / SH, img = slot.querySelector('.spr'), card = slot.querySelector('.card');
  slot.dataset.pose = pose;
  if (!img.src.endsWith(`img/${pose}.webp`)) img.src = `img/${pose}.webp`;
  img.style.height = S + 'px'; img.style.left = (S * 0.35 - m.cx * k) + 'px';
  const w = S * 0.21, h = S * 0.28;
  Object.assign(card.style, { width: w + 'px', height: h + 'px', left: (S * 0.35 - w / 2) + 'px', top: (m.cb * k - h) + 'px' });
}
function slotOf(k) { return document.querySelector(`#${st.info?.status === 'lobby' ? 'lobbyStage' : 'stage'} [data-pid="${k}"]`); }
function playReactions() {
  for (const [k, p] of Object.entries(st.players)) {
    if (!okKey(k)) continue;
    const ts = +p?.rx?.ts || 0;
    if (!st.rxReady) { st.seenRx[k] = ts; continue; }
    if (ts <= (st.seenRx[k] ?? 0)) continue;
    st.seenRx[k] = ts;
    const rx = p.rx;
    const slot = slotOf(k); if (!slot) continue;
    clearTimeout(st.timers[k]);
    slot.querySelector('.think')?.remove();
    slot.classList.remove('pop', 'happy', 'sad'); void slot.offsetWidth;
    const pose = { yes: 'yes', no: 'no', happy: 'yes', sad: 'no' }[rx.t] || 'idle';
    setPose(slot, pose);
    slot.classList.add(rx.t === 'happy' ? 'happy' : rx.t === 'sad' ? 'sad' : 'pop');
    if (rx.t === 'maybe') { const t = document.createElement('div'); t.className = 'think'; t.textContent = '?'; slot.querySelector('.fig').appendChild(t); }
    if (rx.t === 'happy') confetti(slot);
    st.timers[k] = setTimeout(() => { setPose(slot, 'idle'); slot.classList.remove('pop', 'happy', 'sad'); slot.querySelector('.think')?.remove(); }, 3000);
  }
  if (Object.keys(st.players).length) st.rxReady = true;
}
function confetti(slot) {
  const box = document.createElement('div'); box.className = 'confetti';
  const cols = ['#ff6f9f', '#6b4fd0', '#2fb877', '#f2b632', '#4fb3ff'];
  box.innerHTML = Array.from({ length: 26 }, (_, i) => `<i style="background:${cols[i % 5]};--x:${Math.round(Math.random() * 240 - 120)}px;--y:${Math.round(Math.random() * -200 + 40)}px"></i>`).join('');
  slot.querySelector('.fig').appendChild(box); setTimeout(() => box.remove(), 1400);
}
let rsz; addEventListener('resize', () => { clearTimeout(rsz); rsz = setTimeout(() => st.code && onState(), 150); });

/* ---------- chat & reactions ---------- */
function renderChat() {
  const log = $('#chatLog'), near = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
  const items = Object.entries(st.chat).filter(([, m]) => m && typeof m === 'object').sort((a, b) => (a[1].ts || 0) - (b[1].ts || 0) || (a[0] < b[0] ? -1 : 1)).slice(-120);
  const RX = { yes: '<span class="pill yes">✓ YES</span>', no: '<span class="pill no">✗ NO</span>', maybe: '<span class="pill maybe">? ไม่แน่ใจ</span>' };
  log.innerHTML = items.map(([, m]) => {
    if (m.type === 'sys') return `<div class="msg sys">${esc(m.text)}</div>`;
    if (RX[m.type]) return `<div class="msg react"><b>${esc(m.name)}</b>${RX[m.type]}</div>`;
    if (m.type === 'guess') return `<div class="msg guess"><b>${esc(m.name)}</b> เดาว่าเป็น “${esc(m.text)}” ${m.ok ? '<b>ถูกต้อง!</b>' : '— ยังไม่ใช่'}</div>`;
    return `<div class="msg"><b>${esc(m.name)}:</b> ${esc(m.text)}</div>`;
  }).join('');
  if (near || st.chatSeen === null) log.scrollTop = log.scrollHeight;
  const firstLoad = st.chatSeen === null; st.chatSeen ??= new Set();
  for (const [key, m] of items) {
    if (st.chatSeen.has(key)) continue; st.chatSeen.add(key);
    if (!firstLoad && m.type === 'msg' && okKey(m.pid || '')) bubble(m.pid, m.text);
  }
}
function bubble(k, text) {
  const slot = slotOf(k); if (!slot) return;
  slot.querySelector('.bubble')?.remove();
  const b = document.createElement('div'); b.className = 'bubble'; b.textContent = text; slot.prepend(b);
  setTimeout(() => b.remove(), 6000);
}
$('#chatForm').addEventListener('submit', e => {
  e.preventDefault();
  const t = $('#chatIn').value.trim().slice(0, 120); if (!t || !st.code) return;
  $('#chatIn').value = ''; say('msg', { text: t });
});
let rxAt = 0;
document.querySelector('.reacts').addEventListener('click', e => {
  const b = e.target.closest('[data-rx]'); if (!b || !st.code || Date.now() - rxAt < 350) return;
  rxAt = Date.now();
  net.set(R(`players/${pid}/rx`), { t: b.dataset.rx, ts: Date.now() });
  say(b.dataset.rx);
});

/* ---------- game flow ---------- */
$('#startBtn').addEventListener('click', async () => {
  if (!amHost()) return;
  const info = st.info, ps = online();
  if (ps.length < 2) return;
  $('#startBtn').disabled = true;
  const reset = { 'info/status': 'rolling', game: { progress: 0, n: ps.length }, chat: null };
  for (const k of Object.keys(st.players)) Object.assign(reset, { [`players/${k}/char`]: null, [`players/${k}/solved`]: null, [`players/${k}/place`]: null, [`players/${k}/turns`]: 0, [`players/${k}/rx`]: null });
  await net.update(`rooms/${st.code}`, reset);
  let chars;
  try { chars = await rollCharacters(ps.length, { from: info.from, to: info.to, mainOnly: info.mainOnly, uniqueAnime: false }, i => net.set(R('game/progress'), i)); }
  catch (e) { toast(e.message || 'สุ่มไม่สำเร็จ'); await net.update(`rooms/${st.code}`, { 'info/status': 'lobby', game: null }); return; }
  const order = ps.map(([k]) => k).sort(() => Math.random() - 0.5);
  const upd = { 'info/status': 'playing', game: { turn: order[0], order: order.join(','), solved: 0 } };
  ps.forEach(([k], i) => { upd[`players/${k}/char`] = chars[i]; });
  await net.update(`rooms/${st.code}`, upd);
  sys(`เริ่มเกม! ตาแรกคือ ${st.players[order[0]]?.name}`);
});
function nextTurn(from, done = new Set()) {
  const order = (st.game?.order || '').split(','), P = st.players, i = order.indexOf(from);
  for (let s = 1; s <= order.length; s++) {
    const k = order[(i + s) % order.length];
    if (P[k] && P[k].online !== false && !P[k].solved && !done.has(k)) return k;
  }
  return null;
}
async function advanceFrom(cur, upd = {}, done = new Set()) {
  upd[`players/${cur}/turns`] = (st.players[cur]?.turns || 0) + 1;
  const nx = nextTurn(cur, done);
  if (nx) upd['game/turn'] = nx; else upd['info/status'] = 'ended';
  await net.update(`rooms/${st.code}`, upd);
  if (nx && nx !== cur) sys(`ตาของ ${st.players[nx]?.name}`);
  if (!nx) sys('ทุกคนเล่นครบแล้ว จบเกม!');
}
$('#endTurnBtn').addEventListener('click', () => {
  const g = st.game; if (!g || st.info.status !== 'playing') return;
  if (g.turn === pid || amHost()) advanceFrom(g.turn);
});
$('#endGameBtn').addEventListener('click', async () => { if (amHost()) { await net.set(R('info/status'), 'ended'); sys('หัวห้องจบเกมแล้ว'); } });

/* guess dialog with instant search over anime.json */
let guessSel = null, searchT;
$('#guessBtn').addEventListener('click', () => {
  guessSel = null; $('#guessIn').value = ''; $('#sugg').innerHTML = ''; $('#guessErr').textContent = '';
  $('#dlgGuess').showModal(); $('#guessIn').focus();
});
$('#guessIn').addEventListener('input', () => {
  guessSel = null; clearTimeout(searchT);
  const q = $('#guessIn').value.trim();
  if (q.length < 2) { $('#sugg').innerHTML = ''; return; }
  searchT = setTimeout(async () => {
    try {
      const r = await searchCharacters(q);
      if ($('#guessIn').value.trim() !== q) return;
      $('#sugg').innerHTML = r.map(c => `<button type="button" data-id="${+c.id}" data-name="${esc(c.name)}">${safeUrl(c.img) ? `<img src="${esc(safeUrl(c.img))}" alt="">` : ''}<span>${esc(c.name)}${c.alt ? `<small>${esc(c.alt)}</small>` : ''}</span></button>`).join('');
    } catch { $('#sugg').innerHTML = '<p class="note">ค้นหาไม่ได้ตอนนี้ พิมพ์ชื่อเองได้เลย</p>'; }
  }, 150);
});
$('#sugg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  guessSel = +b.dataset.id; $('#guessIn').value = b.dataset.name;
  $('#sugg').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
});
$('#guessForm').addEventListener('submit', async e => {
  e.preventDefault();
  const text = $('#guessIn').value.trim();
  if (!text) { $('#guessErr').textContent = 'พิมพ์ชื่อตัวละครก่อนนะ'; return; }
  const me = st.players[pid], g = st.game;
  if (!me?.char || g?.turn !== pid || st.info.status !== 'playing') { $('#dlgGuess').close(); return; }
  $('#dlgGuess').close();
  const ok = isCorrectGuess(text, guessSel, me.char);
  await say('guess', { text: ok ? me.char.name : text, ok });
  if (ok) {
    const place = await net.tx(R('game/solved'), c => (c || 0) + 1);
    await net.set(R(`players/${pid}/rx`), { t: 'happy', ts: Date.now() });
    await advanceFrom(pid, { [`players/${pid}/solved`]: true, [`players/${pid}/place`]: place || 1 }, new Set([pid]));
  } else {
    await net.set(R(`players/${pid}/rx`), { t: 'sad', ts: Date.now() });
    await advanceFrom(pid);
  }
});

function showResults() {
  const P = st.players;
  const list = Object.entries(P).filter(([k, p]) => okKey(k) && p?.char)
    .sort((a, b) => (a[1].place || 99) - (b[1].place || 99) || (a[1].turns || 0) - (b[1].turns || 0));
  $('#resultList').innerHTML = list.map(([k, p]) => `<li><div class="res">${safeUrl(p.char.img) ? `<img src="${esc(safeUrl(p.char.img))}" alt="">` : ''}<div><b>${esc(p.name)}${k === pid ? ' (คุณ)' : ''}</b> คือ <b>${esc(p.char.name)}</b><small>${esc(p.char.anime)} · Top #${+p.char.rank || '?'} · ${p.solved ? `เดาถูกเป็นอันดับ ${+p.place} ใช้ ${+p.turns || 0} ตา` : 'ยังเดาไม่ถูก'}</small></div></div></li>`).join('');
  $('#againBtn').hidden = !amHost();
  $('#dlgResult').showModal();
}
$('#againBtn').addEventListener('click', async () => {
  if (!amHost()) return;
  const upd = { 'info/status': 'lobby', game: null, chat: null };
  for (const k of Object.keys(st.players)) Object.assign(upd, { [`players/${k}/char`]: null, [`players/${k}/solved`]: null, [`players/${k}/place`]: null, [`players/${k}/turns`]: null, [`players/${k}/rx`]: null });
  await net.update(`rooms/${st.code}`, upd);
});

/* ---------- boot ---------- */
(async () => {
  try { $('#nameIn').value = localStorage.getItem('agw-name') || ''; } catch {}
  loadData().catch(e => toast(e.message));
  net = await createNet();
  $('#modeTag').textContent = net.mode === 'firebase' ? '● ออนไลน์' : 'โหมดทดลอง (ในเครื่องนี้)';
  if (net.mode !== 'firebase') $('#modeTag').title = 'ยังไม่ได้ตั้งค่า Firebase: เล่นได้เฉพาะหลายแท็บในเบราว์เซอร์เดียวกัน';
  net.on('roomIndex', v => { roomIndex = v || {}; renderRooms(); });
  setInterval(renderRooms, 30000);
  net.onConnected(c => { if (c && st.code && st.players[pid]) { net.set(R(`players/${pid}/online`), true); net.onDisconnect(R(`players/${pid}/online`), false); st.hostIdx = false; syncIndex(true); } });
  const h = location.hash.slice(1).toUpperCase();
  if (/^[A-Z0-9]{6}$/.test(h)) {
    $('#search').value = h; renderRooms();
    if ($('#nameIn').value.trim()) joinRoom(h); else toast('ใส่ชื่อแล้วกด "เข้าด้วยโค้ด" ได้เลย');
  }
  $('#logo').addEventListener('click', e => { e.preventDefault(); });
})();
