# 📚 คู่มือการแก้งาน — ทำงานจากเครื่องอื่น

---

## 🎯 บทบาท

คุณจะเรียนรู้วิธี **ดึงโค้ดจากเครื่องอื่น** → **แก้ไขไฟล์** → **ส่งกลับขึ้น GitHub** 

ครั้งแรกอาจเข้าใจยากหน่อย แต่หลังจากนี้มันง่ายมากครับ 😊

---

## 📖 หลักการทำงาน (Workflow)

```
GitHub Repository (เก็บโค้ดกลาง)
        ↓ (Clone)
    เครื่องของคุณ ← ←
        ↓         ↓
    แก้ไฟล์    Push
        ↓
    Commit
        ↓
    Push ขึ้น GitHub
```

### 🔄 รอบการทำงาน 1 ครั้ง (Cycle)

| ขั้น | คำสั่ง | ทำหน้าที่ |
|------|--------|----------|
| 1️⃣ | `git clone <URL>` | ดึงโค้ดจาก GitHub ลงเครื่อง |
| 2️⃣ | `cd DB` | เข้าไปในโฟลเดอร์โปรเจกต์ |
| 3️⃣ | `npm install` | ติดตั้ง libraries ที่ต้องใช้ |
| 4️⃣ | `npm run dev` | รันแอพในโหมด dev เพื่อแก้ไข |
| 5️⃣ | _(แก้ไฟล์ใน Code Editor)_ | เปลี่ยนแปลงโค้ด |
| 6️⃣ | `git add .` | เตรียมไฟล์ที่แก้ไข |
| 7️⃣ | `git commit -m "..."` | บันทึกการเปลี่ยนแปลง |
| 8️⃣ | `git push` | ส่งกลับขึ้น GitHub |

---

## 🚀 ขั้นตอนละเอียด (Step by Step)

### **ขั้นตอนที่ 1: ดึงโค้ดจาก GitHub**

เปิด **Terminal / Command Prompt** และรัน:

```bash
git clone https://github.com/surasakmuthead-gif/DB.git
```

💬 **คำอธิบาย:**
- `git clone` = คำสั่งดึงโค้ด
- `https://github.com/...` = ที่อยู่ของ repo บน GitHub
- ผลลัพธ์ = โฟลเดอร์ `DB` ที่มีไฟล์ทั้งหมด

✅ **ตรวจสอบ:** ถ้าเห็นข้อความแบบนี้ = สำเร็จ
```
Cloning into 'DB'...
...
Resolving deltas: 100% (30/30), done.
```

---

### **ขั้นตอนที่ 2: เข้าไปในโฟลเดอร์โปรเจกต์**

```bash
cd DB
```

💬 **คำอธิบาย:**
- `cd` = Change Directory (เข้าไปในโฟลเดอร์)
- `DB` = ชื่อโฟลเดอร์ที่เพิ่งสร้างจากการ clone

---

### **ขั้นตอนที่ 3: ติดตั้ง Dependencies (Libraries)**

```bash
npm install
```

💬 **คำอธิบาย:**
- `npm install` = ติดตั้ง packages ทั้งหมดที่กำหนดใน `package.json`
- มันจะสร้างโฟลเดอร์ `node_modules/` (ใหญ่มาก ~500MB)
- ใช้เวลา ~30 วินาที

✅ **ตรวจสอบ:** หากเห็น
```
added 210 packages in 30s
```
= ติดตั้งสำเร็จ

---

### **ขั้นตอนที่ 4: รันแอพในโหมด Development**

```bash
npm run dev
```

💬 **คำอธิบาย:**
- รันเซิร์ฟเวอร์ local เพื่อดูแอพผ่าน browser
- เซิร์ฟเวอร์จะเปิดที่ `http://localhost:5173`

✅ **ผลลัพธ์:**
```
Local:   http://localhost:5173
```

**เปิด URL นี้ในเบราว์เซอร์ → เห็นแอพแล้ว!**

---

### **ขั้นตอนที่ 5: แก้ไขไฟล์ (Edit Code)**

เปิด **Code Editor** (VS Code, Sublime, etc.) ด้วยโฟลเดอร์ `DB`

**ตัวอย่าง:** แก้ไฟล์ `src/features/admin-config/AdminSettings.jsx`

```javascript
// เปลี่ยนแปลงบางอย่าง เช่น:
// ลบบรรทัด หรือ เพิ่มโค้ดใหม่
```

💬 **หลักการ:**
- **ใช้เบราว์เซอร์เพื่อดูผลลัพธ์** — หน้าเวบจะ auto-refresh เมื่อแก้ไฟล์
- **ถ้าเห็น Error** → ตรวจสอบ Terminal ดูข้อความ error → แก้ไฟล์

---

### **ขั้นตอนที่ 6: เตรียมส่งกลับขึ้น GitHub**

เมื่อแก้ไฟล์เสร็จแล้ว ให้ **หยุด dev server ก่อน** (กด `Ctrl + C`)

จากนั้นรัน:

```bash
git add .
```

💬 **คำอธิบาย:**
- `git add` = เพิ่มไฟล์ที่เปลี่ยนแปลง
- `.` = เพิ่มทั้งหมด
- **ตรวจสอบด้วย:** `git status`

```bash
git status
```

ควรเห็น:
```
Changes to be committed:
  modified:   src/features/admin-config/AdminSettings.jsx
  modified:   src/data/transformer.js
  ...
```

---

### **ขั้นตอนที่ 7: บันทึกการเปลี่ยนแปลง (Commit)**

```bash
git commit -m "แก้ไขคำอธิบายของสิ่งที่คุณทำ"
```

💬 **ตัวอย่าง:**
```bash
git commit -m "Fix: remove period selector from admin upload"
```

⚠️ **ข้อมูลส่วนตัว:** ถ้าเป็นครั้งแรก Git อาจขอชื่อและอีเมล:
```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```

---

### **ขั้นตอนที่ 8: ส่งขึ้น GitHub (Push)**

```bash
git push
```

💬 **คำอธิบาย:**
- `git push` = ส่งการเปลี่ยนแปลงขึ้น GitHub

✅ **ผลลัพธ์:**
```
Counting objects: 5, done.
...
main -> main
```

---

## 📊 ตัวอย่างการทำงานจริง

### สถานการณ์: แก้ไฟล์ `AdminSettings.jsx` 

**ขั้นตอน 1-3: ดึงโค้ด + ติดตั้ง**
```bash
git clone https://github.com/surasakmuthead-gif/DB.git
cd DB
npm install
```

**ขั้นตอนที่ 4: รัน dev server**
```bash
npm run dev
```
→ เปิดเบราว์เซอร์ ไป `http://localhost:5173/admin`

**ขั้นตอยที่ 5: แก้ไปตั้ง CSS ของปุ่ม**
```javascript
// File: src/features/admin-config/AdminSettings.jsx
// เปลี่ยนสี ขนาด ฯลฯ
```
→ เบราว์เซอร์ auto-refresh → เห็นการเปลี่ยนแปลงเลย!

**ขั้นตอนที่ 6-8: ส่งกลับ GitHub**
```bash
git add .
git commit -m "Style: improve admin button styling"
git push
```

**ผลลัพธ์:**
- ✅ GitHub ได้รับการเปลี่ยนแปลง
- ✅ Vercel auto-deploy (ประมาณ 1-2 นาที)
- ✅ https://baac-kpi-dashboard.vercel.app อัปเดตแล้ว

---

## ⚠️ ข้อสำคัญ

### ✅ ทำ
- ✔️ ดึง (`clone`) ก่อนแก้ไข
- ✔️ บอก commit message ว่าแก้ไขอะไร
- ✔️ Push ทันทีเมื่อแก้เสร็จ
- ✔️ ตรวจสอบ `git status` ก่อน commit

### ❌ อย่าทำ
- ❌ แก้ไฟล์ที่ `node_modules/` (ลบเมื่อ clone ใหม่ได้)
- ❌ ลืม push แล้วปิด terminal
- ❌ Commit โดยไม่มี message (`-m "..."`)

---

## 🔧 แก้ปัญหา

### ❓ ปัญหา: `git clone` ล้มเหลว
```
fatal: repository not found
```
**วิธีแก้:** ตรวจสอบ URL GitHub ว่าถูกต้อง + มี access

---

### ❓ ปัญหา: `npm install` ช้า
**วิธีแก้:** เปิด Proxy หรือใช้ npm mirror:
```bash
npm install --registry https://registry.npmmirror.com
```

---

### ❓ ปัญหา: แก้ไฟล์แล้วเบราว์เซอร์ไม่ update
**วิธีแก้:**
1. กด Ctrl+Shift+R (refresh แรง) บนเบราว์เซอร์
2. ตรวจสอบ Terminal มี error ไหม
3. ลองปิด dev server + รัน `npm run dev` ใหม่

---

## 🎓 สรุป

| ครั้ง | ทำอย่างไร |
|------|----------|
| **ครั้งแรก** | `git clone` → `npm install` → `npm run dev` |
| **ครั้งต่อๆ** | `npm run dev` → แก้ไฟล์ → `git add . && git commit -m "..." && git push` |

ง่ายมากใช่ไหมครับ! 😊

---

*เขียนโดย Claude — Feature Architect & Reminder Agent*
