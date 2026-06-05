# 📋 BAAC KPI Dashboard — Feature Backlog & Reminder
> **โปรเจกต์:** ธ.ก.ส. สนจ.สุโขทัย | 14 สาขา  
> **Stack:** React 18 + Vite + Tailwind v4 + Recharts + SheetJS  
> **อัปเดตล่าสุด:** 2026-06-06 *(เพิ่ม 3 รายการ — จากคำสั่ง "จำนะ")*

---

## ✅ [COMPLETED] — ฟีเจอร์ที่ทำเสร็จแล้ว

### 🏗️ Core Infrastructure
- [x] สร้างโปรเจกต์ React + Vite + ติดตั้ง Dependencies (recharts, xlsx, lucide-react, react-router-dom)
- [x] ระบบธีม 3 แบบ (Dark / Light / Colorful) ด้วย CSS Variables (`--c-bg`, `--c-accent`, ฯลฯ)
- [x] Route Registry + Navbar + App Shell (3 routes: `/`, `/branch`, `/admin`)
- [x] KPI Config JSON + Sample Branch Data + `transformer.js` (compute scores, ranking, formatNumber)

### 📊 Dashboard & Analytics
- [x] หน้า Dashboard ส่วนบน — KPI Cards (small/large), Ranking Table
- [x] หน้า Dashboard ส่วนล่าง — KpiDetailSection ตาราง KPI รายตัว รายสาขา
- [x] HistoryChart — กราฟเส้นรายเดือน (recharts LineChart) จาก historyLog

### 🔐 Admin Panel (Phase A)
- [x] PIN Gate — `useState(false)` ไม่มี sessionStorage (ถามทุกครั้งที่เข้า)
- [x] Per-branch KPI Targets — `kpiTargets[branchName][kpiId] = { v1, v2, v3, v4, v5 }` ใน localStorage
- [x] Admin Tab "เกณฑ์รายสาขา" — inline editable table + copy-from-branch
- [x] Simplified Admin KPI Table — ลบคอลัมน์ หมวด / คะแนนเต็ม / ขนาดการ์ด ออก
- [x] `computeBranchKpiScoreV2()` — scoring V2 ใช้ raw thresholds (ไม่ใช่ %)
- [x] อัปเดต KpiDetailSection + ProvinceOverview + BranchOverview ให้ใช้ kpiTargets

### 📅 Daily Data & Forecast (Phase B)
- [x] Daily Upload — อัปโหลด Excel รายวัน, overwrite current data
- [x] ดาวน์โหลด Template — `generateExcelTemplate()` สร้าง XLSX พร้อม sheet คำแนะนำ
- [x] `extractFullDateFromFilename()` — detect วันที่จากชื่อไฟล์ (5 regex patterns รวม พ.ศ.)
- [x] Daily Snapshot Log — `appendDailySnapshot()` สะสมรายวันใน `baac-daily-log` (แยกจาก monthly)
- [x] `DailyTrendChart.jsx` — กราฟเส้นรายวัน (actual สีเขียว + forecast สีส้มประ) + threshold reference lines
- [x] `ForecastPanel.jsx` — ตารางพยากรณ์ระดับ ค่า1–5 ทุกสาขา×KPI (byBranch / byKpi mode)
- [x] Linear Regression Forecast — `forecastKpiValue()` + `computeAllForecasts()`
- [x] Integrate DailyTrendChart + ForecastPanel ใน ProvinceOverview + BranchOverview

---

## 🚧 [IN PROGRESS] — กำลังดำเนินการ

> *(ว่างอยู่ — ไม่มีงานค้างอยู่ขณะนี้)*

---

## 📥 [BACKLOG] — รายการฟีเจอร์ที่รอลงมือทำ

### 🛠️ Bug Fix & Quick Win *(จำนะ — 2026-06-06)*
- [ ] **[HIGH]** หน้า Admin — ซ่อนกล่อง "งวด" (period selector) ออกจาก Upload Tab
  - ปัจจุบัน: แสดง `<select>` ให้เลือกงวดด้วยตัวเอง
  - เป้าหมาย: ระบบ detect งวดอัตโนมัติจากชื่อไฟล์อยู่แล้ว (`extractFullDateFromFilename`) — **ไม่ต้องแสดง UI นี้**
  - ไฟล์: `src/features/admin-config/AdminSettings.jsx` → หา `<select>` งวด แล้ว remove หรือ comment ออก
  - 💡 คง `detectedDate` badge แสดงผลลัพธ์ที่ detect ได้ไว้เหมือนเดิม

- [ ] **[HIGH]** แก้ไข Feature Forecast *(รอรายละเอียดเพิ่มเติมจากผู้ใช้)*
  - ปัจจุบัน: `ForecastPanel.jsx` + `DailyTrendChart.jsx` + `computeAllForecasts()` ใน transformer.js
  - 🔔 *หมายเหตุ: ยังไม่ระบุว่าแก้จุดไหน — รอผู้ใช้อธิบายรายละเอียดก่อนลงมือ*

### 🎨 UI/UX Enhancement

### 👤 หน้ารายบุคคล (Individual Staff KPI)
- [ ] **[HIGH]** สร้างหน้า `/staff` แสดงผลงาน KPI ของพนักงานแต่ละคนในสาขา
  - โครงสร้างข้อมูล: `staffData[branchName][staffId] = { name, kpis: { kpiId: actual } }`
  - Import Excel รายคน หรือ manual input
  - Ranking พนักงานภายในสาขา
  - 🔔 *เงื่อนไขแจ้งเตือน: เมื่อหน้า BranchOverview ใช้งานได้เสถียรแล้ว (ทำเสร็จแล้ว)*

### 📤 Export & Report
- [ ] **[MEDIUM]** Export PDF Report รายงาน KPI สรุปรายเดือน
  - ใช้ `html2canvas` + `jsPDF` หรือ print CSS
  - รองรับทั้ง Provincial Summary และ Branch Detail
  - 🔔 *เงื่อนไขแจ้งเตือน: เมื่อ Daily Forecast ใช้งานได้แล้ว (ทำเสร็จแล้ว)*
- [ ] **[LOW]** Export Excel รายงานสรุปคะแนนรายสาขาทุก KPI
  - ใช้ SheetJS สร้าง workbook multi-sheet (1 sheet ต่อ KPI)

### 🔔 Notification & Alert System
- [ ] **[MEDIUM]** ระบบแจ้งเตือนสาขาที่ผลงานต่ำกว่าเกณฑ์ระดับ 3
  - แสดง badge/toast เมื่อเปิด Dashboard
  - กำหนด threshold สำหรับ alert ใน Admin
  - 🔔 *เงื่อนไขแจ้งเตือน: เมื่อ kpiTargets รายสาขาถูกตั้งค่าครบ*

### 🗄️ Data Management
- [ ] **[MEDIUM]** ระบบ Backup/Restore localStorage
  - Export ข้อมูลทั้งหมด (config + data + targets + logs) เป็น JSON file
  - Import/Restore จาก JSON file
  - 🔔 *เงื่อนไขแจ้งเตือน: ก่อน Production Deploy*
- [ ] **[LOW]** ล้างข้อมูล Daily Log เก่า (Data Retention Policy)
  - ตั้งค่าเก็บย้อนหลัง N วัน/เดือน
  - Auto-purge หรือ Manual clear ใน Admin

### 🎨 UI/UX Enhancement
- [ ] **[HIGH]** ปรับระบบ Typography ทั้งแอป *(จำนะ — 2026-06-06)*
  - **หัวข้อหลัก (H1/Page Title):** ขนาด + weight + สี ให้โดดเด่น
  - **หัวข้อรอง (H2/Section):** ขนาดและ tracking ที่เหมาะสม
  - **ตัวเด่น (Highlight/Value):** ตัวเลข KPI, คะแนน, badge — ชัดเจน อ่านง่าย
  - **ตัวรอง (Secondary/Label):** ชื่อ KPI, หน่วย, คำอธิบาย — ไม่แย่งสายตา
  - ควรกำหนด font-size scale ใน `index.css` ให้เป็น system เดียวกันทั้งแอป
  - ไฟล์ที่ต้องแก้: `src/index.css` (CSS vars), KPI Cards, Tables, Navbar, Admin
  - 💡 พิจารณาใช้ `clamp()` สำหรับ responsive font sizes
- [ ] **[LOW]** Dark Mode ปรับปรุง contrast ของ progress bar และ badge
- [ ] **[LOW]** Responsive Mobile — ปรับ KPI Cards ให้ scroll horizontal บน mobile
- [ ] **[LOW]** Loading Skeleton สำหรับหน้าที่ fetch data ช้า

### 🔒 Security & Auth
- [ ] **[LOW]** เปลี่ยน PIN Gate เป็นระบบ Login จริง (username/password)
  - หรือใช้ PIN 6 หลักแบบ hash (SHA-256) แทน plain text
  - 🔔 *เงื่อนไขแจ้งเตือน: เมื่อต้องการ deploy สู่ Production*

---

## 📝 หมายเหตุและข้อจำกัดที่รู้

| รายการ | รายละเอียด |
|--------|-----------|
| localStorage limit | ~5MB — ถ้า dailyLog สะสมนานมากอาจเต็ม ควรทำ retention policy |
| Forecast accuracy | Linear Regression ต้องการ ≥ 2 data points — ค่าพยากรณ์แม่นยำขึ้นเมื่อมีข้อมูลมากขึ้น |
| kpi_08 (NPL) | Reverse KPI — lower is better, ต้องตรวจสอบ scoring logic สม่ำเสมอ |
| Thai year (พ.ศ.) | filename regex แปลง พ.ศ.→ ค.ศ. แล้ว แต่ควร test edge case ปี 256X |

---

*ไฟล์นี้ดูแลโดย Feature Architect & Reminder Agent — อัปเดตอัตโนมัติเมื่อมีคำสั่ง "จำ" / "จดไว้หน่อย"*
