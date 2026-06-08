# 🚀 วิธีรันโปรเจกต์ BAAC KPI Dashboard

---

## ✅ สิ่งที่ต้องมีก่อน (Prerequisites)

| โปรแกรม | Version | ดาวน์โหลด |
|---------|---------|-----------|
| **Node.js** | v18 ขึ้นไป | https://nodejs.org |
| **Git** | ล่าสุด | https://git-scm.com |

ตรวจสอบว่าติดตั้งแล้วด้วยคำสั่ง:
```bash
node -v
npm -v
```

---

## 📥 ขั้นตอนที่ 1 — ดึงโค้ดจาก GitHub

```bash
git clone https://github.com/surasakmuthead-gif/DB.git
cd DB
```

---

## 📦 ขั้นตอนที่ 2 — ติดตั้ง Dependencies

```bash
npm install
```

> รอสักครู่ (~30 วินาที) จนเสร็จ

---

## ▶️ ขั้นตอนที่ 3 — รันในโหมด Development

```bash
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่:

```
http://localhost:5173
```

> กด `Ctrl + C` เพื่อหยุด server

---

## 🌐 ดูแอพ Live บน Internet (ไม่ต้องรัน)

เข้าได้เลยที่:
```
https://baac-kpi-dashboard.vercel.app
```

---

## 🔐 รหัส Admin PIN

```
1234
```

---

## 🏗️ Build สำหรับ Production

```bash
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/`

---

## 📁 โครงสร้างโปรเจกต์

```
baac-kpi-dashboard/
├── public/
│   └── data/
│       └── kpi-config.json     ← ตั้งค่า KPI เริ่มต้น
├── src/
│   ├── data/
│   │   ├── sampleData.js       ← ข้อมูล 14 สาขา + BRANCHES list
│   │   └── transformer.js      ← ฟังก์ชันคำนวณ KPI ทั้งหมด
│   ├── features/
│   │   ├── admin-config/       ← หน้า Admin (PIN + Upload + ตั้งค่า)
│   │   ├── analytics/          ← DailyTrendChart + ForecastPanel
│   │   ├── branch-detail/      ← หน้าภาพรวมสาขา
│   │   └── kpi-dashboard/      ← หน้าหลัก ภาพรวมจังหวัด
│   └── index.css               ← CSS Variables + Theme
├── Remind.md                   ← Backlog & Feature Notes
└── HOW_TO_RUN.md               ← ไฟล์นี้
```

---

## ⚠️ หมายเหตุสำคัญ

- ข้อมูลทั้งหมดเก็บใน **localStorage** ของเบราว์เซอร์
- ถ้า Clear Browser Data → ข้อมูลจะหายต้องอัปโหลดใหม่
- แต่ละเครื่อง/เบราว์เซอร์มีข้อมูลแยกกัน (ยังไม่มี Backend)
