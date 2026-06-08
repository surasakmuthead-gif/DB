# 📋 BAAC KPI Dashboard — Feature Backlog & Reminder
> **โปรเจกต์:** ธ.ก.ส. สนจ.สุโขทัย | 14 สาขา  
> **Stack:** React 18 + Vite + Tailwind v4 + Recharts + SheetJS  
> **อัปเดตล่าสุด:** 2026-06-06 *(เพิ่ม Git reminder rule)*

---

## 🔔 [STANDING RULES] — กฎแจ้งเตือนประจำ

> กฎเหล่านี้ให้ Agent ตรวจและแจ้งเตือน **ทุกครั้ง** ที่เงื่อนไขตรง

| # | เงื่อนไขแจ้งเตือน | สิ่งที่ต้องทำ |
|---|------------------|--------------|
| R1 | **Plan usage ใกล้หมด (5-hour limit)** | แจ้งเตือนให้ `git add . && git commit && git push` ก่อน session หมด |
| R2 | **มีการแก้ไขโค้ดหลายไฟล์ในเซสชัน** | เตือนให้ push ขึ้น GitHub ก่อนปิด |
| R3 | **ก่อน Deploy to Cloud** | ตรวจให้แน่ใจว่า push ล่าสุดขึ้น GitHub แล้ว + ตรวจ build ไม่มี error |

### 📌 Git Remote Info
```
Repository : https://github.com/surasakmuthead-gif/DB.git
Branch     : main
Command    : git add . && git commit -m "..." && git push
```

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
- [x] **[HIGH]** หน้า Admin — ซ่อนกล่อง "งวด" (period selector) ออกจาก Upload Tab *(เสร็จ 2026-06-06)*
  - ปัจจุบัน: แสดง `<select>` ให้เลือกงวดด้วยตัวเอง
  - เป้าหมาย: ระบบ detect งวดอัตโนมัติจากชื่อไฟล์อยู่แล้ว (`extractFullDateFromFilename`) — **ไม่ต้องแสดง UI นี้**
  - ไฟล์: `src/features/admin-config/AdminSettings.jsx` → หา `<select>` งวด แล้ว remove หรือ comment ออก
  - 💡 คง `detectedDate` badge แสดงผลลัพธ์ที่ detect ได้ไว้เหมือนเดิม

- [ ] **[HIGH → v2.0]** แก้ไข Feature Forecast
  - *เลื่อนไปทำใน v2.0*

### 👤 หน้ารายบุคคล (Individual Staff KPI) — ย้ายไป v2.0
- [ ] **[HIGH → v2.0]** สร้างหน้า `/staff` แสดงผลงาน KPI ของพนักงานแต่ละคนในสาขา
  - *เลื่อนไปทำใน v2.0 กับ RBAC + backend*

### 📤 Export & Report
- [ ] **[MEDIUM]** Export PDF Report รายงาน KPI สรุปรายเดือน
  - ใช้ `html2canvas` + `jsPDF` หรือ print CSS
  - รองรับทั้ง Provincial Summary และ Branch Detail
  - 🔔 *เงื่อนไขแจ้งเตือน: เมื่อ Daily Forecast ใช้งานได้แล้ว (ทำเสร็จแล้ว)*
- [x] **[LOW]** Export Excel รายงานสรุปคะแนนรายสาขาทุก KPI *(เสร็จ 2026-06-09)*
  - ปุ่ม "Export สรุปคะแนน" ใน Admin > อัปโหลดข้อมูล
  - 2 sheets: ผลงานจริง (Actual) + ระดับคะแนน (Level 1-5)

### 🔔 Notification & Alert System
- [ ] **[MEDIUM]** ระบบแจ้งเตือนสาขาที่ผลงานต่ำกว่าเกณฑ์ระดับ 3
  - แสดง badge/toast เมื่อเปิด Dashboard
  - กำหนด threshold สำหรับ alert ใน Admin
  - 🔔 *เงื่อนไขแจ้งเตือน: เมื่อ kpiTargets รายสาขาถูกตั้งค่าครบ*

### ☁️ Cloud Deployment *(จำนะ)*
- [ ] **[HIGH]** Deploy แอพขึ้น Cloud ให้เข้าถึงได้จากอินเทอร์เน็ต
  - **แนะนำ: Vercel** (ฟรี, เชื่อม GitHub โดยตรง, deploy อัตโนมัติทุกครั้งที่ push)
  - ขั้นตอน: ไป [vercel.com](https://vercel.com) → Import GitHub repo → Deploy (จบใน 2 นาที)
  - ทางเลือก: Netlify / GitHub Pages
  - 🔔 *เงื่อนไข: ต้อง push โค้ดล่าสุดขึ้น GitHub ก่อน + ตรวจ `npm run build` ไม่มี error*

### 🗄️ Data Management
- [ ] **[MEDIUM]** ระบบ Backup/Restore localStorage
  - Export ข้อมูลทั้งหมด (config + data + targets + logs) เป็น JSON file
  - Import/Restore จาก JSON file
  - 🔔 *เงื่อนไขแจ้งเตือน: ก่อน Production Deploy*
- [x] **[LOW]** ล้างข้อมูล Daily Log เก่า *(เสร็จ 2026-06-09)*
  - ปุ่ม "ล้าง Daily Log" ใน Admin > อัปโหลดข้อมูล พร้อมแสดงจำนวนวัน + confirm dialog

### 🎨 UI/UX Enhancement — ย้ายไป v2.0
- [ ] **[HIGH → v2.0]** ปรับระบบ Typography ทั้งแอป
  - *เลื่อนไปออกแบบตั้งแต่ต้นใน v2.0*
- [ ] **[LOW]** Dark Mode ปรับปรุง contrast ของ progress bar และ badge
- [ ] **[LOW]** Responsive Mobile — ปรับ KPI Cards ให้ scroll horizontal บน mobile
- [ ] **[LOW]** Loading Skeleton สำหรับหน้าที่ fetch data ช้า

### ☁️ Backend & Data Persistence *(จำนะ — อนาคต)*
- [ ] **[MEDIUM]** เพิ่ม Backend เพื่อให้ข้อมูล sync ข้ามเครื่อง / หลายคนใช้ร่วมกันได้
  - **ปัญหาปัจจุบัน:** ข้อมูลทั้งหมดอยู่ใน `localStorage` ของ browser — ใช้ได้แค่เครื่องเดียว
  - **Option A — Supabase** *(แนะนำ)*: PostgreSQL ฟรี + REST API + Auth ในตัว เชื่อม Vercel ได้ตรง
  - **Option B — Google Sheets + Apps Script**: ง่ายที่สุด ฟรี 100% เหมาะถ้าไม่อยากตั้ง server
  - **Option C — Firebase**: Firestore (NoSQL) + Google Auth พร้อม
  - สิ่งที่ต้อง migrate: `kpiConfig`, `branchData`, `kpiTargets`, `historyLog`, `dailyLog`
  - 🔔 *เงื่อนไขแจ้งเตือน: **เมื่อทุกฟีเจอร์ใช้งานถูกต้อง ~99% แล้วเท่านั้น** — ห้ามทำก่อน*

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

## 🚀 [V2.0 PLANNING] — BAAC KPI Dashboard System v2.0

> **สถาปัตยกรรม:** Next.js + Tailwind + Supabase + Recharts  
> **ขอบเขต:** 9 จังหวัด (ฝ่ายภาค) × 90+ สาขา (ประมาณ)  
> **ความต่าง v1:** Multi-province, Backend DB, RBAC, Date Alignment, Audit Trail

### 📍 ข้อเด่น v2.0
- ✅ **Regional Overview** (9 จังหวัด + Date Alignment Logic)
- ✅ **Supabase PostgreSQL** (Multi-user, Time-series storage)
- ✅ **RBAC:** Super Admin / Province Admin / Viewer
- ✅ **Individual Performance** (Staff/Employee KPI tracking)
- ✅ **Effective Date Logic** (เกณฑ์คะแนนเปลี่ยนตามช่วงเวลา)
- ✅ **Data Correction + Audit Trail** (บันทึกการแก้ไข)
- ✅ **System Changelog** (เวอร์ชันระบบ)

---

### 🔴 [CRITICAL] — งานห้ามทำผิด (ต้องแม่นยำ)

| # | งาน | หมายเหตุ |
|---|-----|---------|
| 1 | **Regional Overview + Date Alignment** | ต้อง "ทุกจังหวัดส่งครบ" วันเดียวกันเท่านั้น ไม่เช่นนั้นใช้วันเก่า |
| 2 | **Supabase Backend + Tables** | Core infrastructure — Key-value flexible schema |
| 3 | **Effective Date Logic** | เกณฑ์เปลี่ยน → ต้องใช้เกณฑ์ ณ วันที่ของข้อมูล ห้าม Recalc ทั้งหมด |
| 4 | **RBAC System** | Super Admin ได้ทั้งหมด, Province Admin เฉพาะตัวเอง, Viewer ดูได้อย่างเดียว |
| 5 | **Correction Audit Trail** | บังคับบันทึก "เหตุผล" + ผู้แก้ไข ทุกครั้ง |

---

### 🟡 [IMPORTANT] — งานต้องทำเพื่อให้ครบชุด

| # | งาน | ขนาด | ลำดับทำ |
|---|-----|------|--------|
| 6 | Province Dashboard (Dropdown เลือกจังหวัด) | 🟢 Small | หลัง Supabase |
| 7 | Individual Performance Tab (Staff Leaderboard) | 🟡 Medium | หลัง RBAC |
| 8 | Data Correction UI (Manual edit + Re-upload) | 🟡 Medium | หลัง Audit Trail |
| 9 | Audit Trail Log (correction_audit_log table) | 🟡 Medium | หลัง Schema |

---

### 🟢 [NICE-TO-HAVE] — งานช่วยเพิ่มประสบการณ์

| # | งาน | หมายเหตุ |
|---|-----|---------|
| 10 | System Changelog Timeline (เวอร์ชัน + Release notes) | Admin UI สำหรับ publish ข้อความประกาศ |

---

### 🗂️ ตัวอักษร Schema ที่สำคัญ

**ตารางหลัก:**
```
✅ individual_kpi_data
   - employee_id, employee_name, job_title, branch_id, province_id
   - kpi_id, kpi_value, data_date, uploaded_by, uploaded_at

✅ kpi_threshold_history
   - province_id, branch_id, kpi_id
   - v1, v2, v3, v4, v5 (เกณฑ์คะแนน)
   - effective_from, effective_to (วันเริ่ม-สิ้นสุด)

✅ correction_audit_log
   - corrected_by, corrected_date, corrected_time
   - target_record_id, field_name, old_value, new_value
   - reason (บังคับ), correction_method (re-upload/manual-ui)

✅ system_changelog
   - version (เช่น "2.0.1"), release_date
   - entries (JSONB: type + text, เช่น "Added", "Fixed")
```

---

### 🎯 จังหวัด 9 ฝ่ายภาค (Fixed Order)
```
1. เพชรบูรณ์
2. สุโขทัย
3. นครสวรรค์
4. พิษณุโลก
5. พิจิตร
6. กำแพงเพชร
7. อุตรดิตถ์
8. อุทัยธานี
9. ตาก
```

---

*Master Spec: SYSTEM_SPECIFICATION_V2.md*

---

*ไฟล์นี้ดูแลโดย Feature Architect & Reminder Agent — อัปเดตอัตโนมัติเมื่อมีคำสั่ง "จำ" / "จดไว้หน่อย"*
