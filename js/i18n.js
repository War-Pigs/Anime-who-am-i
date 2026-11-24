// All UI text in one place. Add a language: copy one block, translate, add it to LANGS.
// {name} style placeholders are filled by t(key, {name: ...}).
export const LANGS = { th: 'ไทย', en: 'EN', ja: '日本語' };

const D = {
  th: {
    modeOnline: '● ออนไลน์', modeLocal: 'โหมดทดลอง (ในเครื่องนี้)', modeLocalTip: 'ยังไม่ได้ตั้งค่า Firebase: เล่นได้เฉพาะหลายแท็บในเบราว์เซอร์เดียวกัน',
    heroTitle: 'ตัวละครบนหัวเธอ<br>คือใครกันนะ?',
    heroText: 'สุ่มตัวละครจากอนิเมะยอดนิยม (ข้อมูลจาก AniList) ให้ทุกคนแปะบนหัว เห็นของเพื่อนแต่ไม่เห็นของตัวเอง ถามไป เพื่อนชูป้าย ✓ ✗ แล้วเดาให้ถูกก่อนใคร',
    yourName: 'ชื่อของคุณ', namePh: 'นิรนาม', openRooms: 'ห้องที่เปิดอยู่', createRoom: '+ สร้างห้อง',
    searchPh: 'ค้นหาชื่อห้อง หรือพิมพ์โค้ด 6 ตัว', joinByCode: 'เข้าด้วยโค้ด', copyCode: 'คัดลอกโค้ดห้อง',
    leave: 'ออกจากห้อง', players: 'ผู้เล่น', start: 'เริ่มเกม', settings: '⚙️ ตั้งค่าห้อง',
    yes: 'YES', no: 'NO', maybe: 'ไม่แน่ใจ', guess: 'ขอเดา', endTurn: 'จบตา', skipTurn: 'ข้ามตาคนนี้', endGame: 'จบเกม',
    chatPh: 'ถามคำถาม เช่น ฉันเป็นผู้หญิงไหม?', send: 'ส่ง',
    createTitle: 'สร้างห้อง', settingsTitle: 'ตั้งค่าห้อง', roomName: 'ชื่อห้อง', roomNamePh: 'ตั้งชื่อห้องของคุณ',
    visibility: 'การมองเห็น', visOpen: '🔓 เปิด', visLock: '🔒 ปิด (มีรหัส)', visHidden: 'ซ่อน (เข้าด้วยโค้ด)',
    roomPass: 'รหัสผ่านห้อง', roomPassPh: 'อย่าใช้รหัสเดียวกับบัญชีสำคัญ',
    pool: 'คลังตัวละคร', poolTop: '🏆 ตามอันดับความนิยม', poolPick: '📚 เลือกเรื่องเอง', topCustom: 'กำหนดเอง',
    fromRank: 'จากอันดับ', toRank: 'ถึงอันดับ', maxPlayers: 'จำนวนคนสูงสุด', chars: 'ตัวละคร',
    mainOnly: 'ตัวเอกเท่านั้น', mainAll: 'ตัวเอก + ตัวรอง', cancel: 'ยกเลิก', createBtn: 'สร้างห้อง', save: 'บันทึก',
    pickSearchPh: 'พิมพ์ชื่อเรื่อง เช่น One Piece, Naruto', pickCount: 'เลือกแล้ว {n}/50 เรื่อง · ตัวละคร {c} ตัว',
    pickClear: 'ล้างทั้งหมด', pickEmpty: 'ยังไม่ได้เลือกเรื่อง กดชื่อเรื่องด้านล่างเพื่อเพิ่ม', pickMax: 'เลือกได้สูงสุด 50 เรื่อง',
    pickNone: 'ไม่เจอเรื่องนี้ในไฟล์ข้อมูล ลองพิมพ์ชื่ออังกฤษหรือโรมาจิ', pickMeta: 'อันดับ #{rank} · ตัวเอก {m} / ทั้งหมด {a}',
    pickRemove: 'เอา {t} ออก', showMore: 'แสดงเพิ่ม (เหลืออีก {n} เรื่อง)', poolEnough: 'ตัวละครพอสำหรับ {c} คน',
    passTitle: '🔒 ห้องนี้มีรหัส', password: 'รหัสผ่าน', wrongPass: 'รหัสไม่ถูกต้อง', enter: 'เข้าห้อง',
    guessTitle: 'ฉันคือ...', guessLabel: 'พิมพ์ชื่อตัวละครหรือชื่อเรื่อง (อังกฤษ/โรมาจิ) แล้วเลือกจากรายชื่อ', guessPh: 'เช่น Gojo หรือ Jujutsu Kaisen',
    guessNote: 'เลือกจากรายชื่อหรือพิมพ์เองก็ได้ สลับชื่อ-นามสกุลหรือพิมพ์ผิดเล็กน้อยได้ เดาผิดจะเสียตา', confirm: 'ยืนยันคำตอบ',
    guessEmpty: 'พิมพ์ชื่อตัวละครก่อนนะ', notInList: 'ไม่เจอในรายชื่อ พิมพ์ชื่อเต็มเองได้', searchFail: 'ค้นหาไม่ได้ตอนนี้ พิมพ์ชื่อเองได้เลย',
    results: 'สรุปผล', again: 'เล่นอีกรอบ', keepViewing: 'ดูโต๊ะต่อ', isChar: 'คือ', resSolved: 'เดาถูกเป็นอันดับ {place} ใช้ {turns} ตา', resNot: 'ยังเดาไม่ถูก',
    needName: 'ใส่ชื่อของคุณก่อนนะ', roomOff: 'ห้องนี้เต็มหรือกำลังเล่นอยู่', codeHint: 'พิมพ์โค้ดห้อง 6 ตัว หรือกดเลือกห้องจากรายการ',
    notFound: 'ไม่พบห้องนี้ เช็กโค้ดอีกทีนะ', noOne: 'ห้องนี้ไม่มีคนอยู่แล้ว', isPlaying: 'ห้องนี้กำลังเล่นอยู่ รอรอบหน้านะ', isFull: 'ห้องเต็มแล้ว',
    closed: 'ห้องถูกปิดแล้ว', kicked: 'คุณถูกเชิญออกจากห้อง', copied: 'คัดลอกลิงก์ห้องแล้ว ส่งให้เพื่อนได้เลย', codeIs: 'โค้ดห้อง: {code}', copiedCode: 'คัดลอกโค้ดแล้ว: {code} ส่งให้เพื่อนได้เลย',
    hashHint: 'ใส่ชื่อแล้วกด "เข้าด้วยโค้ด" ได้เลย', saved: 'บันทึกการตั้งค่าแล้ว',
    errRoomName: 'ตั้งชื่อห้องก่อนนะ', errPass: 'ห้องปิดต้องมีรหัสผ่าน', errRange: 'ช่วงอันดับต้องห่างกันอย่างน้อย 10 อันดับ', errPick: 'เลือกอย่างน้อย 1 เรื่อง',
    visOpenS: '🔓 ห้องเปิด', visLockS: '🔒 ห้องปิด', visHiddenS: 'ห้องซ่อน', topS: 'Top {a}–{b}', pickS: '📚 เลือกเอง {n} เรื่อง',
    waiting: 'รอเริ่ม', playingS: 'กำลังเล่น', noRooms: 'ยังไม่มีห้องเปิดอยู่ สร้างห้องแรกเลย!', noMatch: 'ไม่เจอห้องที่ค้นหา ลองพิมพ์โค้ด 6 ตัวแล้วกด "เข้าด้วยโค้ด"',
    you: '(คุณ)', kick: 'เชิญออก', kickAria: 'เชิญ {name} ออก', needMore: 'รอเพื่อนอีกอย่างน้อย 1 คน กดที่โค้ดห้องเพื่อคัดลอกโค้ดส่งให้เพื่อน',
    ready: 'พร้อมแล้ว กดเริ่มได้เลย!', waitHost: 'รอหัวห้องกดเริ่มเกม', notEnough: 'ตัวละครไม่พอสำหรับ {n} คน (มี {c} ตัว) ลองเพิ่มเรื่องหรือเปิดตัวรอง',
    poolTitle: 'เรื่องที่ใช้ในห้องนี้ ({n})',
    dealing: 'กำลังแจกการ์ดตัวละคร… {p}/{n}', ended: 'จบเกมแล้ว! การ์ดทุกใบเปิดหมดแล้ว',
    myTurn: '<b>ตาของคุณ!</b> ถามลักษณะของตัวเองในแชท แล้วกดจบตาหรือขอเดา', solvedWatch: 'คุณเดาถูกแล้ว! ตอนนี้ตาของ <b>{name}</b> ช่วยชูป้ายตอบด้วยนะ',
    otherTurn: 'ตาของ <b>{name}</b> ช่วยชูป้าย ✓ ✗ ตอบคำถามด้วยนะ',
    guessed: 'เดาว่าเป็น', correct: 'ถูกต้อง!', wrong: '✗ ยังไม่ใช่',
    sJoined: '{name} เข้าห้องมาแล้ว', sLeft: '{name} ออกจากห้อง', sNewHost: '{name} เป็นหัวห้องคนใหม่', sKicked: '{name} ถูกเชิญออกจากห้อง',
    sStart: 'เริ่มเกม! ตาแรกคือ {name}', sTurn: 'ตาของ {name}', sAllDone: 'ทุกคนเล่นครบแล้ว จบเกม!', sHostEnded: 'หัวห้องจบเกมแล้ว', sSettings: 'หัวห้องเปลี่ยนการตั้งค่าห้อง',
    eNoData: 'ยังไม่มีไฟล์ anime.json ในเว็บ ให้รันหน้า tools/build-data.html ก่อน (ดู README)', eBadData: 'ไฟล์ anime.json ไม่ถูกต้อง ลองสร้างใหม่',
    eRange: 'ไฟล์ข้อมูลมีแค่ {n} เรื่อง เลือกช่วงอันดับให้แคบลงนะ', eRoll: 'สุ่มตัวละครไม่ครบ ลองเพิ่มเรื่องหรือเปิดตัวรองดูนะ',
    b_title: 'สร้างไฟล์ข้อมูลตัวละคร', b_intro: 'หน้านี้ดึงอนิเมะยอดนิยมจาก AniList พร้อมตัวละครและรูป แล้วรวมเป็นไฟล์ <b>anime.json</b> ให้เกมใช้สุ่มโดยไม่ต้องต่อเว็บอื่นตอนเล่น รันครั้งเดียว อยากอัปเดตเมื่อไหร่ค่อยรันใหม่',
    b_count: 'จำนวนอนิเมะ', b_go: 'เริ่มดึงข้อมูล', b_dl: 'ดาวน์โหลด anime.json', b_partial: 'ดึงข้อมูลไม่ครบ ({m}) แต่ได้มาแล้ว {n} เรื่อง กดดาวน์โหลดเท่าที่ได้ หรือกดเริ่มใหม่ภายหลัง', b_dlPart: 'ดาวน์โหลดเท่าที่ได้ ({n} เรื่อง)',
    b_idle: 'ยังไม่ได้เริ่ม ใช้เวลาประมาณ 5–10 นาทีสำหรับ 1000 เรื่อง และ 15–30 นาทีสำหรับ 3000 เรื่อง (AniList จำกัดจำนวนคำขอต่อนาที) ระหว่างนี้อย่าปิดหน้านี้',
    b_page: 'กำลังดึงหน้า {p}… ได้แล้ว {n}/{w} เรื่อง', b_wait: 'AniList ขอให้รอ {s} วินาที (ปกติ ไม่ต้องทำอะไร)…', b_shrink: 'ลดขนาดคำขอเหลือ {n} เรื่องต่อหน้า', b_jump: 'ถึงขีดจำกัด 5000 อันดับของ AniList ไล่ต่อจากความนิยมต่ำกว่า {p}',
    b_log: 'หน้า {p}: รวม {n} เรื่อง (ข้ามภาคต่อ/ไม่มีตัวละคร {s})', b_done: 'เสร็จแล้ว! {n} เรื่อง ตัวละคร {c} ตัว ({mb} MB) กดดาวน์โหลดได้เลย',
    b_conn: 'เชื่อมต่อไม่ได้ ลองใหม่…', b_err: 'ผิดพลาด: {m} ลองใหม่…', b_noreply: 'AniList ไม่ตอบกลับ ลองกดเริ่มใหม่อีกครั้งภายหลัง',
    b_next: 'เสร็จแล้วทำต่อ', b_s1: 'กด <b>ดาวน์โหลด anime.json</b>', b_s2: 'เข้า repository บน GitHub → <b>Add file → Upload files</b>',
    b_s3: 'ลากไฟล์ <b>anime.json</b> ลงไปตรงๆ (ให้อยู่ชั้นเดียวกับ index.html) → <b>Commit changes</b>', b_s4: 'รอ 1–2 นาที แล้วเปิดเกมใหม่ (Ctrl+F5)'
  },
  en: {
    modeOnline: '● Online', modeLocal: 'Test mode (this device)', modeLocalTip: 'Firebase is not set up: you can only play across tabs in this browser',
    heroTitle: 'Who is the character<br>on your forehead?',
    heroText: 'Everyone gets a random character from popular anime (data from AniList) taped to their head. You see your friends’ cards but not your own. Ask questions, friends raise ✓ ✗ signs, and guess before anyone else!',
    yourName: 'Your name', namePh: 'Anonymous', openRooms: 'Open rooms', createRoom: '+ Create room',
    searchPh: 'Search room name or type a 6-letter code', joinByCode: 'Join by code', copyCode: 'Copy room code',
    leave: 'Leave room', players: 'Players', start: 'Start game', settings: '⚙️ Room settings',
    yes: 'YES', no: 'NO', maybe: 'Not sure', guess: 'Guess', endTurn: 'End turn', skipTurn: 'Skip this turn', endGame: 'End game',
    chatPh: 'Ask a question, e.g. Am I a girl?', send: 'Send',
    createTitle: 'Create room', settingsTitle: 'Room settings', roomName: 'Room name', roomNamePh: 'Name your room',
    visibility: 'Visibility', visOpen: '🔓 Open', visLock: '🔒 Locked (password)', visHidden: 'Hidden (code only)',
    roomPass: 'Room password', roomPassPh: 'Don’t reuse an important password',
    pool: 'Character pool', poolTop: '🏆 By popularity rank', poolPick: '📚 Pick anime', topCustom: 'Custom',
    fromRank: 'From rank', toRank: 'To rank', maxPlayers: 'Max players', chars: 'Characters',
    mainOnly: 'Main only', mainAll: 'Main + supporting', cancel: 'Cancel', createBtn: 'Create room', save: 'Save',
    pickSearchPh: 'Type an anime title, e.g. One Piece, Naruto', pickCount: '{n}/50 anime picked · {c} characters',
    pickClear: 'Clear all', pickEmpty: 'Nothing picked yet. Tap a title below to add it.', pickMax: 'You can pick up to 50 anime',
    pickNone: 'Not in the data file. Try the English or romaji title.', pickMeta: 'Rank #{rank} · {m} main / {a} total',
    pickRemove: 'Remove {t}', showMore: 'Show more ({n} left)', poolEnough: 'Enough characters for {c} players',
    passTitle: '🔒 This room is locked', password: 'Password', wrongPass: 'Wrong password', enter: 'Join',
    guessTitle: 'I am...', guessLabel: 'Type a character or anime title (English/romaji), then pick from the list', guessPh: 'e.g. Gojo or Jujutsu Kaisen',
    guessNote: 'Pick from the list or type it yourself. Name order and small typos are fine. A wrong guess ends your turn.', confirm: 'Confirm',
    guessEmpty: 'Type a character name first', notInList: 'Not in the list. You can type the full name yourself.', searchFail: 'Search is unavailable. Type the name yourself.',
    results: 'Results', again: 'Play again', keepViewing: 'Keep viewing', isChar: 'is', resSolved: 'Guessed #{place} in {turns} turns', resNot: 'Not guessed',
    needName: 'Enter your name first', roomOff: 'This room is full or already playing', codeHint: 'Type a 6-letter room code or pick a room from the list',
    notFound: 'Room not found. Check the code.', noOne: 'Nobody is in this room anymore', isPlaying: 'This room is playing. Wait for the next round.', isFull: 'This room is full',
    closed: 'The room was closed', kicked: 'You were removed from the room', copied: 'Room link copied. Send it to your friends!', codeIs: 'Room code: {code}', copiedCode: 'Code copied: {code} Send it to your friends!',
    hashHint: 'Enter your name, then press "Join by code"', saved: 'Settings saved',
    errRoomName: 'Give your room a name', errPass: 'A locked room needs a password', errRange: 'The rank range must span at least 10', errPick: 'Pick at least 1 anime',
    visOpenS: '🔓 Open', visLockS: '🔒 Locked', visHiddenS: 'Hidden', topS: 'Top {a}–{b}', pickS: '📚 {n} picked anime',
    waiting: 'Waiting', playingS: 'Playing', noRooms: 'No open rooms yet. Create the first one!', noMatch: 'No rooms match. Try a 6-letter code and press "Join by code".',
    you: '(you)', kick: 'Remove', kickAria: 'Remove {name}', needMore: 'Waiting for at least 1 more player. Tap the room code to copy it.',
    ready: 'Ready! Press start.', waitHost: 'Waiting for the host to start', notEnough: 'Not enough characters for {n} players ({c} available). Add anime or allow supporting characters.',
    poolTitle: 'Anime in this room ({n})',
    dealing: 'Dealing character cards… {p}/{n}', ended: 'Game over! All cards are revealed.',
    myTurn: '<b>Your turn!</b> Ask about yourself in the chat, then end your turn or guess.', solvedWatch: 'You got it! Now it’s <b>{name}</b>’s turn. Help answer with the signs.',
    otherTurn: '<b>{name}</b>’s turn. Answer with the ✓ ✗ signs!',
    guessed: 'guessed', correct: 'Correct!', wrong: '✗ Not yet',
    sJoined: '{name} joined', sLeft: '{name} left', sNewHost: '{name} is the new host', sKicked: '{name} was removed',
    sStart: 'Game start! First turn: {name}', sTurn: '{name}’s turn', sAllDone: 'Everyone is done. Game over!', sHostEnded: 'The host ended the game', sSettings: 'The host changed the room settings',
    eNoData: 'anime.json is missing. Run tools/build-data.html first (see README).', eBadData: 'anime.json is invalid. Build it again.',
    eRange: 'The data file only has {n} anime. Choose a narrower range.', eRoll: 'Couldn’t deal enough characters. Add anime or allow supporting characters.',
    b_title: 'Build the character data file', b_intro: 'This page downloads popular anime with their characters and pictures from AniList and bundles them into <b>anime.json</b>, so the game never calls another site while playing. Run it once; run again whenever you want fresh data.',
    b_count: 'Number of anime', b_go: 'Start', b_dl: 'Download anime.json', b_partial: 'Stopped early ({m}) but {n} anime were fetched. Download what you have, or start again later.', b_dlPart: 'Download what we have ({n} anime)',
    b_idle: 'Not started. Takes about 5–10 minutes for 1000 anime and 15–30 minutes for 3000 (AniList limits requests per minute). Keep this page open.',
    b_page: 'Fetching page {p}… {n}/{w} anime so far', b_wait: 'AniList asked us to wait {s} seconds (normal, nothing to do)…', b_shrink: 'Reduced request size to {n} anime per page', b_jump: 'Hit AniList’s 5000-entry limit, continuing below popularity {p}',
    b_log: 'Page {p}: {n} anime total (skipped sequels/no characters: {s})', b_done: 'Done! {n} anime, {c} characters ({mb} MB). Download it now.',
    b_conn: 'Connection failed, retrying…', b_err: 'Error: {m} Retrying…', b_noreply: 'AniList is not responding. Try again later.',
    b_next: 'When it’s done', b_s1: 'Press <b>Download anime.json</b>', b_s2: 'Open your GitHub repository → <b>Add file → Upload files</b>',
    b_s3: 'Drop <b>anime.json</b> in (same level as index.html) → <b>Commit changes</b>', b_s4: 'Wait 1–2 minutes, then reload the game (Ctrl+F5)'
  },
  ja: {
    modeOnline: '● オンライン', modeLocal: 'テストモード（この端末のみ）', modeLocalTip: 'Firebase が未設定です：同じブラウザの複数タブでのみ遊べます',
    heroTitle: 'おでこのキャラは<br>だれだろう？',
    heroText: '人気アニメ（AniList のデータ）のキャラがランダムに全員のおでこに貼られます。友だちのカードは見えるけど自分のは見えない。質問して、みんなが ✓ ✗ の札で答えて、誰よりも早く当てよう！',
    yourName: 'あなたの名前', namePh: '名無し', openRooms: '公開中のルーム', createRoom: '＋ ルームを作る',
    searchPh: 'ルーム名を検索、または6文字のコード', joinByCode: 'コードで参加', copyCode: 'ルームコードをコピー',
    leave: '退出', players: 'プレイヤー', start: 'ゲーム開始', settings: '⚙️ ルーム設定',
    yes: 'YES', no: 'NO', maybe: 'わからない', guess: '答える', endTurn: 'ターン終了', skipTurn: 'このターンをスキップ', endGame: 'ゲーム終了',
    chatPh: '質問しよう 例：わたしは女の子？', send: '送信',
    createTitle: 'ルームを作る', settingsTitle: 'ルーム設定', roomName: 'ルーム名', roomNamePh: 'ルームに名前をつけよう',
    visibility: '公開設定', visOpen: '🔓 公開', visLock: '🔒 鍵付き（パスワード）', visHidden: '非表示（コードのみ）',
    roomPass: 'ルームのパスワード', roomPassPh: '大事なアカウントと同じパスワードは使わないで',
    pool: 'キャラの範囲', poolTop: '🏆 人気ランキング', poolPick: '📚 作品を選ぶ', topCustom: 'カスタム',
    fromRank: '開始順位', toRank: '終了順位', maxPlayers: '最大人数', chars: 'キャラ',
    mainOnly: 'メインのみ', mainAll: 'メイン＋サブ', cancel: 'キャンセル', createBtn: '作成', save: '保存',
    pickSearchPh: '作品名を入力 例：One Piece, Naruto', pickCount: '{n}/50 作品 · キャラ {c} 人',
    pickClear: 'すべて解除', pickEmpty: 'まだ選んでいません。下の作品をタップして追加', pickMax: '最大50作品まで選べます',
    pickNone: 'データにありません。英語かローマ字のタイトルで試してください', pickMeta: '{rank}位 · メイン {m} / 全 {a}',
    pickRemove: '{t} を外す', showMore: 'もっと見る（残り {n} 作品）', poolEnough: '{c} 人分のキャラがあります',
    passTitle: '🔒 鍵付きルーム', password: 'パスワード', wrongPass: 'パスワードが違います', enter: '参加',
    guessTitle: 'わたしは…', guessLabel: 'キャラ名か作品名を入力（英語/ローマ字）してリストから選ぶ', guessPh: '例：Gojo、Jujutsu Kaisen',
    guessNote: 'リストから選んでも自分で入力してもOK。姓名の順番や小さな打ち間違いも大丈夫。外れるとターン終了。', confirm: '決定',
    guessEmpty: 'キャラ名を入力してね', notInList: 'リストにありません。フルネームを入力してもOK', searchFail: '今は検索できません。名前を入力してください',
    results: '結果', again: 'もう一回', keepViewing: 'テーブルを見る', isChar: 'は', resSolved: '{place}番目に正解・{turns}ターン', resNot: '未正解',
    needName: '先に名前を入力してね', roomOff: 'このルームは満員かプレイ中です', codeHint: '6文字のルームコードを入力するか、リストから選んでね',
    notFound: 'ルームが見つかりません。コードを確認してね', noOne: 'このルームにはもう誰もいません', isPlaying: 'プレイ中です。次のラウンドを待ってね', isFull: '満員です',
    closed: 'ルームが閉じられました', kicked: 'ルームから外されました', copied: 'リンクをコピーしました。友だちに送ろう！', codeIs: 'ルームコード：{code}', copiedCode: 'コードをコピーしました：{code} 友だちに送ろう！',
    hashHint: '名前を入れて「コードで参加」を押してね', saved: '設定を保存しました',
    errRoomName: 'ルーム名を入れてね', errPass: '鍵付きルームにはパスワードが必要です', errRange: '順位の範囲は10以上あけてね', errPick: '1作品以上選んでね',
    visOpenS: '🔓 公開', visLockS: '🔒 鍵付き', visHiddenS: '非表示', topS: 'Top {a}–{b}', pickS: '📚 {n}作品から',
    waiting: '待機中', playingS: 'プレイ中', noRooms: 'まだルームがありません。最初のルームを作ろう！', noMatch: '見つかりません。6文字のコードを入れて「コードで参加」を押してね',
    you: '（あなた）', kick: '外す', kickAria: '{name} を外す', needMore: 'あと1人以上待っています。コードをタップしてコピー',
    ready: '準備OK！開始を押してね', waitHost: 'ホストの開始を待っています', notEnough: '{n}人分のキャラが足りません（{c}人）。作品を増やすかサブキャラを含めてね',
    poolTitle: 'このルームの作品（{n}）',
    dealing: 'キャラカードを配っています… {p}/{n}', ended: 'ゲーム終了！全部のカードが公開されました',
    myTurn: '<b>あなたの番！</b> チャットで自分のことを質問して、ターン終了か回答を', solvedWatch: '正解！今は <b>{name}</b> の番。札で答えてあげてね',
    otherTurn: '<b>{name}</b> の番。✓ ✗ の札で答えよう！',
    guessed: 'の答え：', correct: '正解！', wrong: '✗ ハズレ',
    sJoined: '{name} が参加しました', sLeft: '{name} が退出しました', sNewHost: '{name} が新しいホストです', sKicked: '{name} が外されました',
    sStart: 'ゲーム開始！最初は {name}', sTurn: '{name} の番', sAllDone: '全員終わりました。ゲーム終了！', sHostEnded: 'ホストがゲームを終了しました', sSettings: 'ホストがルーム設定を変更しました',
    eNoData: 'anime.json がありません。先に tools/build-data.html を実行してください（README参照）', eBadData: 'anime.json が正しくありません。作り直してください',
    eRange: 'データには {n} 作品しかありません。範囲を狭めてください', eRoll: 'キャラが足りません。作品を増やすかサブキャラを含めてください',
    b_title: 'キャラデータファイルを作る', b_intro: 'AniList から人気アニメとキャラ・画像を取得して <b>anime.json</b> にまとめます。プレイ中は外部サイトに接続しません。一度実行すればOK、更新したいときにまた実行してください。',
    b_count: '作品数', b_go: '取得開始', b_dl: 'anime.json をダウンロード', b_partial: '途中で止まりました（{m}）。{n} 作品は取得済みです。取得分をダウンロードするか、あとでやり直してください', b_dlPart: '取得分をダウンロード（{n} 作品）',
    b_idle: '未開始。1000作品で5〜10分、3000作品で15〜30分ほどかかります（AniList は1分あたりのリクエスト数に制限あり）。このページを閉じないでね',
    b_page: '{p}ページ目を取得中… {n}/{w} 作品', b_wait: 'AniList から {s} 秒待つよう指示されました（正常です）…', b_shrink: '1ページ {n} 作品に減らしました', b_jump: 'AniList の5000件制限に達したので、人気度 {p} 未満から続けます',
    b_log: '{p}ページ目：合計 {n} 作品（続編・キャラなしをスキップ：{s}）', b_done: '完了！{n} 作品、キャラ {c} 人（{mb} MB）。ダウンロードしてね',
    b_conn: '接続できません。再試行中…', b_err: 'エラー：{m} 再試行中…', b_noreply: 'AniList が応答しません。あとでもう一度試してください',
    b_next: '終わったら', b_s1: '<b>anime.json をダウンロード</b> を押す', b_s2: 'GitHub のリポジトリ → <b>Add file → Upload files</b>',
    b_s3: '<b>anime.json</b> をそのままドロップ（index.html と同じ階層）→ <b>Commit changes</b>', b_s4: '1〜2分待ってゲームを再読み込み（Ctrl+F5）'
  }
};

function pickLang() {
  try { const s = localStorage.getItem('agw-lang'); if (D[s]) return s; } catch {}
  const n = (navigator.language || '').toLowerCase();
  return n.startsWith('th') ? 'th' : n.startsWith('ja') ? 'ja' : 'en';
}
export let lang = pickLang();
const listeners = new Set();

export function t(key, p = {}) {
  const s = D[lang][key] ?? D.en[key] ?? D.th[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (p[k] ?? ''));
}
// Fill placeholders with escaped values, for strings that contain trusted markup like <b>.
export function th(key, p = {}, esc) { const q = {}; for (const k in p) q[k] = esc(p[k]); return t(key, q); }

export function applyI18n(root = document) {
  document.documentElement.lang = lang;
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  root.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}
export function setLang(l) {
  if (!D[l]) return;
  lang = l; try { localStorage.setItem('agw-lang', l); } catch {}
  applyI18n(); listeners.forEach(f => f(l));
}
export const onLang = f => listeners.add(f);
// Language buttons: <div class="langs"></div> anywhere on the page.
export function mountLangButtons(el) {
  el.innerHTML = Object.entries(LANGS).map(([k, v]) => `<button type="button" data-lang="${k}">${v}</button>`).join('');
  el.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) setLang(b.dataset.lang); });
}
