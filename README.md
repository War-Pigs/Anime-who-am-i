# Anime Guess Who I Am — คู่มือเปิดเกมออนไลน์

เกมนี้เป็นเว็บธรรมดา (HTML/CSS/JS) ใช้ **Firebase Realtime Database** (ฟรี) สำหรับห้องออนไลน์
และ **Jikan API** (ข้อมูล MyAnimeList ฟรี ไม่ต้องสมัคร) สำหรับรูปและอันดับตัวละคร

```
index.html  style.css  config.js  ← ไฟล์ที่ต้องแก้มีแค่อันนี้
js/app.js  js/net.js  js/jikan.js
img/idle.webp  img/yes.webp  img/no.webp
```

---

## ขั้นที่ 1: สร้าง Firebase (ประมาณ 5 นาที ฟรี)

1. เข้า https://console.firebase.google.com แล้วล็อกอินด้วย Gmail
2. กด **Create a project** ตั้งชื่ออะไรก็ได้ เช่น `anime-guess-who` (ปิด Google Analytics ได้)
3. เมนูซ้าย **Build → Realtime Database → Create Database**
   - Location: เลือก **Singapore (asia-southeast1)** จะได้เร็วสำหรับไทย
   - เลือก **Start in test mode** → Enable
4. ไปแท็บ **Rules** วางอันนี้แทนของเดิม แล้วกด **Publish**

```json
{
  "rules": {
    "rooms":     { ".read": true, "$code": { ".write": true } },
    "roomIndex": { ".read": true, "$code": { ".write": true } }
  }
}
```
   (test mode จะหมดอายุใน 30 วัน กฎนี้ไม่หมดอายุ)

5. กดรูปเฟือง ⚙️ ข้าง Project Overview → **Project settings**
   เลื่อนลงไปที่ **Your apps** → กดไอคอน **`</>`** (Web) → ตั้งชื่อแอป → **Register app**
6. จะเห็นโค้ด `const firebaseConfig = { ... }` ให้ก๊อปเฉพาะส่วน `{ ... }`
   แล้วเปิดไฟล์ **config.js** เปลี่ยน `null` เป็นค่านั้น เช่น

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "anime-guess-who.firebaseapp.com",
  databaseURL: "https://anime-guess-who-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anime-guess-who",
  storageBucket: "anime-guess-who.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

> ⚠️ ต้องมี `databaseURL` ด้วย ถ้าในโค้ดที่ก๊อปมาไม่มี ให้ไปก๊อปลิงก์จากหน้า Realtime Database
> (ลิงก์ที่ขึ้นต้นด้วย `https://` และลงท้ายด้วย `firebasedatabase.app`) มาใส่เอง

---

## ขั้นที่ 2: อัปเว็บขึ้น GitHub Pages (ฟรี)

1. สมัคร/ล็อกอิน https://github.com
2. กด **+ → New repository** ตั้งชื่อ เช่น `anime-guess-who` เลือก **Public** → Create
3. กด **uploading an existing file** แล้วลาก **ไฟล์และโฟลเดอร์ทั้งหมดที่แตก zip ออกมา**
   (index.html ต้องอยู่ชั้นนอกสุด ไม่ใช่อยู่ในโฟลเดอร์ย่อยอีกชั้น) → **Commit changes**
4. ไป **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** / **(root)** → Save
5. รอ 1–2 นาที จะได้ลิงก์แบบ `https://ชื่อคุณ.github.io/anime-guess-who/`

ส่งลิงก์นั้นให้เพื่อนได้เลย มุมขวาบนของเกมจะขึ้น **● ออนไลน์** ถ้าตั้งค่าถูก

**แก้ไฟล์ทีหลัง:** เข้า repository → กดไฟล์ → ไอคอนดินสอ ✏️ → Commit แล้วรอ 1–2 นาที

---

## ลองเล่นก่อนตั้งค่า (โหมดทดลอง)

ถ้า `config.js` ยังเป็น `null` เกมจะอยู่ใน **โหมดทดลอง** เปิดหลายแท็บในเบราว์เซอร์เดียวกัน
แล้วเล่นเป็นหลายคนได้ (ยังเล่นข้ามเครื่องไม่ได้)
ถ้าเปิดไฟล์ index.html ด้วยการดับเบิลคลิกแล้วไม่ขึ้น ให้เปิดผ่าน GitHub Pages
หรือใช้ส่วนขยาย Live Server ใน VS Code แทน

---

## วิธีเล่นสั้นๆ

1. ใส่ชื่อ → **สร้างห้อง** (เลือก ห้องเปิด / ปิดมีรหัส / ซ่อน, ช่วง Top 1–50/500/1000)
   หรือเลือกห้องจากรายการ / พิมพ์ชื่อห้องเพื่อค้นหา / พิมพ์โค้ด 6 ตัวแล้วกด **เข้าด้วยโค้ด**
2. กดที่โค้ดห้องเพื่อคัดลอกลิงก์ส่งให้เพื่อน (เปิดลิงก์แล้วเข้าห้องได้ทันที)
3. หัวห้องกด **เริ่มเกม** → ทุกคนได้การ์ดตัวละครแปะหัว เห็นของเพื่อน ไม่เห็นของตัวเอง
4. คนที่ถึงตาถามในแชท ทุกคนกด **✓ YES / ✗ NO / ? ไม่แน่ใจ** ได้ตลอด ชิบิจะชูป้ายให้
5. กด **จบตา** ส่งตาต่อ หรือ **ขอเดา** (เดาผิดเสียตา) ใครเดาถูกก่อนได้อันดับดีกว่า

---

## ข้อควรรู้

- ข้อมูลตัวละครและรูปมาจาก MyAnimeList ผ่าน Jikan API ซึ่งจำกัดจำนวนครั้งที่ขอข้อมูลต่อนาที
  ตอนสุ่มอาจใช้เวลาประมาณ 2–10 วินาที ถ้า Jikan ล่มชั่วคราว เกมจะแจ้งให้ลองใหม่
- รหัสห้องใช้กันคนแปลกหน้าแบบง่ายๆ ไม่ใช่ระบบความปลอดภัยจริงจัง ห้ามใช้รหัสเดียวกับบัญชีสำคัญ
- ข้อมูลการ์ดทุกใบอยู่ในฐานข้อมูล คนที่เปิดเครื่องมือนักพัฒนาของเบราว์เซอร์เป็นจะแอบดูได้ เล่นกับเพื่อนที่ไว้ใจได้นะ
- ห้องจะหายจากรายการเมื่อหัวห้องออก (หัวห้องจะส่งต่อให้คนถัดไปอัตโนมัติ)
- ชิบิเป็นรูปที่คุณสร้างเอง ถ้าจะเปลี่ยนรูป ให้แทนไฟล์ใน `img/` โดยใช้ชื่อเดิม
  และวางตำแหน่งการ์ดบนหัวให้ใกล้เคียงของเดิม
