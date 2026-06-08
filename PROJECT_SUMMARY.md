# 📚 BAAC KPI Dashboard — Complete Project Summary

**สร้างเพื่อให้ AI/Developers เข้าใจโปรเจกต์นี้อย่างสมบูรณ์**

---

## 🎯 โปรเจกต์คืออะไร

**BAAC KPI Dashboard** — Web Application สำหรับจัดการและวิเคราะห์ผลงาน KPI ของสำนักงานจังหวัด (สนจ.) ธนาคารเพื่อการเกษตร (ธ.ก.ส.) ในภาคต่างๆ

### ข้อมูลพื้นฐาน
- **โปรเจกต์:** BAAC KPI Dashboard
- **องค์กร:** ธ.ก.ส. สนจ.สุโขทัย (ปัจจุบัน) → ขยายเป็น 9 สนจ. ในอนาคต
- **สาขา:** ตั้งแต่ 10-20+ สาขาต่อ สนจ. (ไม่กำหนด)
- **ผู้ใช้:** Admin จัดการข้อมูล + Viewers ดูผลงาน
- **Live URL:** https://baac-kpi-dashboard.vercel.app
- **GitHub:** https://github.com/surasakmuthead-gif/DB

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────┐
│      BAAC KPI Dashboard                  │
│    (React 18 + Vite + Tailwind v4)       │
│      [Frontend Web Application]          │
└─────────────────┬────────────────────────┘
                  │
         ┌────────┴───────┐
         ↓                ↓
    ┌──────────┐   ┌──────────────┐
    │ Browser  │   │ localStorage │
    │ (Local)  │   │ (5MB limit)  │
    └──────────┘   └──────────────┘

[ปัจจุบัน: ไม่มี Backend Database]
[อนาคต: ต้องเพิ่ม Supabase/Firebase]
```

---

## 📦 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.x |
| **Build Tool** | Vite | 8.x |
| **Styling** | Tailwind CSS | v4 |
| **Icons** | lucide-react | latest |
| **Charting** | Recharts | latest |
| **Data** | SheetJS (xlsx) | latest |
| **Routing** | react-router-dom | v6 |
| **Deployment** | Vercel | - |

---

## 📂 Folder Structure

```
baac-kpi-dashboard/
│
├── 📄 DOCUMENTATION
│   ├── README.md                    ← Overview
│   ├── HOW_TO_RUN.md               ← วิธีรันในเครื่อง
│   ├── WORKFLOW_GUIDE.md            ← สอนแก้จากที่อื่น
│   ├── Remind.md                    ← Backlog + Features
│   ├── PROJECT_SUMMARY.md           ← ไฟล์นี้
│
├── 🔧 BUILD CONFIGURATION
│   ├── package.json                 ← Dependencies
│   ├── vite.config.js               ← Vite config
│   ├── tailwind.config.js           ← Tailwind config
│   ├── .gitignore
│
├── 📁 public/
│   └── data/
│       ├── kpi-config.json          ← KPI configuration (16 KPI)
│       └── history-log.json         ← Sample history
│
├── 📁 src/
│   ├── 🎨 CSS
│   │   └── index.css                ← CSS Variables (3 themes: Dark/Light/Colorful)
│   │
│   ├── 📊 Data Layer (State Management)
│   │   ├── sampleData.js
│   │   │   └── Exports:
│   │   │       • BRANCHES (14 สาขา สุโขทัย)
│   │   │       • SAMPLE_BRANCH_DATA (ข้อมูลตัวอย่าง)
│   │   │
│   │   └── transformer.js (ไฟล์สำคัญมาก!)
│   │       └── Functions:
│   │           • loadKpiConfig / saveKpiConfig
│   │           • loadBranchData / saveBranchData
│   │           • loadKpiTargets / saveKpiTargets    [เกณฑ์รายสาขา]
│   │           • loadHistoryLog / appendHistory     [ประวัติรายเดือน]
│   │           • loadDailyLog / appendDailySnapshot [ประวัติรายวัน]
│   │           • computeBranchKpiScoreV2()          [คำนวณคะแนนตามเกณฑ์]
│   │           • computeAllBranchScores()
│   │           • computeProvinceSummary()
│   │           • rankBranches()
│   │           • extractFullDateFromFilename()      [detect วันจากไฟล์ 5 pattern]
│   │           • generateExcelTemplate()            [สร้าง template Excel]
│   │           • forecastKpiValue()                 [พยากรณ์ linear regression]
│   │           • computeAllForecasts()
│   │           • formatNumber / getPerformanceColor
│   │
│   ├── 🧩 Components
│   │   ├── Navbar.jsx               ← Navigation + Theme switcher
│   │   ├── ThemeSwitcher.jsx        ← Dark/Light/Colorful toggle
│   │
│   ├── 🎯 Features
│   │   ├── admin-config/
│   │   │   ├── AdminPinGate.jsx     ← PIN 4 หลัก (1234) ไม่มี sessionStorage
│   │   │   └── AdminSettings.jsx    ← 3 Tabs:
│   │   │       • อัพโหลด Excel (auto-detect date จากชื่อไฟล์)
│   │   │       • จัดการ KPI (CRUD)
│   │   │       • เกณฑ์รายสาขา (inline editable table)
│   │   │
│   │   ├── analytics/
│   │   │   ├── DailyTrendChart.jsx  ← กราฟเส้นรายวัน (actual + forecast)
│   │   │   │                         └── Reference lines v1-v5
│   │   │   │
│   │   │   └── ForecastPanel.jsx    ← ตารางพยากรณ์ 2 view:
│   │   │                              • byBranch: เลือกสาขา → แสดง KPI ทั้งหมด
│   │   │                              • byKpi: เลือก KPI → แสดงทุกสาขา
│   │   │
│   │   ├── branch-detail/
│   │   │   └── BranchOverview.jsx   ← ภาพรวมรายสาขา:
│   │   │       • KPI score cards
│   │   │       • KPI detail table
│   │   │       • Monthly history chart
│   │   │       • Daily trend chart
│   │   │       • Forecast panel
│   │   │
│   │   └── kpi-dashboard/
│   │       ├── ProvinceOverview.jsx ← หน้าหลัก Dashboard:
│   │       │   • KPI cards (small/large)
│   │       │   • Ranking table
│   │       │   • Monthly history chart
│   │       │   • Daily trend chart
│   │       │   • Forecast panel
│   │       │   • KPI detail tables
│   │       │
│   │       ├── KpiCard.jsx
│   │       ├── KpiCardLarge.jsx
│   │       ├── KpiDetailSection.jsx
│   │       ├── RankingTable.jsx
│   │       └── HistoryChart.jsx     ← กราฟเส้นรายเดือน (Recharts)
│   │
│   ├── 🪝 Hooks
│   │   └── useTheme.js              ← Theme context + toggles
│   │
│   ├── 🛣️ Routing
│   │   ├── routes.jsx               ← Route definitions
│   │   └── App.jsx                  ← Main app + router wrapper
│   │
│   └── 📍 Entry Point
│       ├── main.jsx
│       └── index.css
│
├── 📊 Git
│   └── .git/
│       ├── Remote: https://github.com/surasakmuthead-gif/DB
│       └── Branch: main
│
└── 🚀 Deployment
    └── Vercel
        └── https://baac-kpi-dashboard.vercel.app
```

---

## 🗄️ Data Storage (localStorage Keys)

```javascript
{
  "baac-kpi-config": {
    // 16 KPI definitions
    kpi_01: { kpi_id, kpi_name, unit, display_size, ... },
    kpi_02: { ... },
    ...
  },

  "baac-branch-data": {
    // Current month data
    branch: "สาขาสุโขทัย",
    kpis: {
      kpi_01: { target: 100, actual: 95 },
      ...
    }
  },

  "baac-kpi-targets": {
    // Per-branch scoring thresholds
    "สาขาสุโขทัย": {
      kpi_01: { v1: 50, v2: 60, v3: 70, v4: 80, v5: 100 },  // raw values
      ...
    },
    "สาขาสวรรคโลก": { ... }
  },

  "baac-history-log": {
    // Monthly snapshots (accumulated)
    [
      { period: "2026-06", label: "มิ.ย. 2569", summary: {...}, timestamp },
      { period: "2026-05", label: "พ.ค. 2569", summary: {...}, timestamp }
    ]
  },

  "baac-daily-log": {
    // Daily snapshots (NEW in Phase B)
    [
      {
        date: "2026-06-06",
        label: "6 มิ.ย. 2569",
        period: "2026-06",
        actuals: {
          "สาขาสุโขทัย": { kpi_01: 171, kpi_02: 42, ... },
          "สาขาสวรรคโลก": { ... }
        },
        uploadedAt: timestamp
      }
    ]
  }
}
```

---

## 🎨 UI/UX Features

### 🌓 Theme System (3 Themes)
```javascript
// CSS Variables
--c-bg              // Background
--c-surface         // Card/Panel
--c-surface-alt     // Alternate surface
--c-border          // Border color
--c-accent          // Primary color (green)
--c-text-1          // Main text
--c-text-2          // Secondary text
```

**Themes:**
- 🌙 **Dark Mode** (Default)
- ☀️ **Light Mode**
- 🎨 **Colorful Mode**

### 📱 Responsive
- Grid layout ที่ปรับตามขนาดหน้าจอ
- Mobile-friendly (ส่วนใหญ่)

---

## 🔄 Data Flow

### 1️⃣ Upload Excel
```
User → Admin Upload Tab → Select Excel
  ↓
extractFullDateFromFilename()  [detect date from filename]
  ↓
Parse Excel → Map to KPI structure
  ↓
appendDailySnapshot()  [บันทึก daily log]
  ↓
appendHistory()        [บันทึก monthly log]
  ↓
localStorage updated
  ↓
UI refresh (real-time)
```

### 2️⃣ View KPI Performance
```
Load from localStorage → computeAllBranchScores()
  ↓
Use kpiTargets[branch][kpi] = {v1-v5} to score
  ↓
computeBranchKpiScoreV2() → returns {level, score, percent}
  ↓
Render KPI Cards + Tables
```

### 3️⃣ View Forecast
```
dailyLog → filter by date
  ↓
forecastKpiValue() → linear regression
  ↓
computeAllForecasts() → all branches × all KPIs
  ↓
Render DailyTrendChart + ForecastPanel
```

---

## 📋 Features Checklist

### ✅ Phase A: Core Dashboard
- [x] 3-theme system (Dark/Light/Colorful)
- [x] Dashboard homepage with KPI cards
- [x] Branch ranking table
- [x] KPI detail tables
- [x] PIN-based admin access
- [x] KPI CRUD management
- [x] Per-branch KPI targets (เกณฑ์รายสาขา)
- [x] Monthly history chart

### ✅ Phase B: Daily Analytics + Forecast
- [x] Daily Excel upload with auto-date detection
- [x] Daily snapshot logging (separate from monthly)
- [x] Excel template generator
- [x] DailyTrendChart (actual + forecast lines)
- [x] ForecastPanel (2 view modes: byBranch / byKpi)
- [x] Linear regression forecasting
- [x] Reference level lines (v1-v5)

### ⏳ Backlog (To-Do)
- [ ] Clear Daily Log button
- [ ] Export Excel (all branches' summary)
- [ ] Backup/Restore localStorage
- [ ] Alert system (low performance branches)
- [ ] Export PDF reports
- [ ] Typography system overhaul
- [ ] Staff-level KPI page (/staff)
- [ ] **Backend Database** (Supabase/Firebase) [CRITICAL for multi-province]
- [ ] Authentication system
- [ ] Multi-tenant support

---

## 🔐 KPI Scoring Logic (V2)

```javascript
// computeBranchKpiScoreV2(actual, rawThresholds, kpi)
// rawThresholds = {v1, v2, v3, v4, v5}  [ค่าดิบ ไม่ใช่ %]

// Logic:
if (isReversed) {  // e.g., kpi_08 (NPL) — lower is better
  actual <= v5 → level 5
  actual <= v4 → level 4
  ...
} else {  // normal — higher is better
  actual >= v5 → level 5
  actual >= v4 → level 4
  ...
}

// Score = level × 20 (0-100 scale)
// Returns: {level, score, target (=v5), percent}
```

---

## 📅 Historical Data Structure

### Monthly Log (historyLog)
```javascript
{
  period: "2026-06",
  label: "มิ.ย. 2569",
  summary: {
    kpi_01: {percent: 95.5, level: 4, score: 80, ...},
    ...
  },
  branchCount: 14,
  timestamp: 1717864800000
}
```

### Daily Log (dailyLog) — NEW in Phase B
```javascript
{
  date: "2026-06-06",
  label: "6 มิ.ย. 2569",
  period: "2026-06",
  actuals: {
    "สาขาสุโขทัย": { kpi_01: 171, kpi_02: 42, ... },
    "สาขาสวรรคโลก": { kpi_01: 289, kpi_02: 58, ... },
    ...
  },
  uploadedAt: 1717864800000
}
```

---

## 📊 KPI Configuration (16 KPIs)

| ID | Name (TH) | Unit | Display | Description |
|----|-----------|------|---------|-------------|
| kpi_01 | ชุมนุมเงินฝากของสมาชิก | จำนวน | small | เงินฝากสมาชิก |
| kpi_02 | สินเชื่อเงินฝากอื่น | จำนวน | small | เกณฑ์สินเชื่อ |
| ... | (13 more KPIs) | ... | ... | ... |
| kpi_08 | **NPL** (Non-Performing Loan) | % | small | **Reverse**: lower is better ⚠️ |
| ... | ... | ... | ... | ... |

---

## 🚀 Deployment

### Live Server
- **Platform:** Vercel
- **URL:** https://baac-kpi-dashboard.vercel.app
- **Auto-Deploy:** Every `git push` to main branch

### Local Development
```bash
git clone https://github.com/surasakmuthead-gif/DB.git
cd DB
npm install
npm run dev  # http://localhost:5173
```

### Build
```bash
npm run build  # → dist/ folder
```

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **localStorage only** | No backend initially (MVP) |
| **Raw thresholds** (not %) | Flexibility per KPI/branch |
| **Separate daily + monthly logs** | Different use cases (daily trend vs monthly report) |
| **Date detection regex (5 patterns)** | Support various Excel filename formats |
| **Linear regression (not run-rate)** | More accurate for mid-month forecasting |
| **CSS Variables + 3 themes** | Easy theme switching without rebuild |
| **React Router SPA** | Fast navigation, no page reloads |

---

## ⚠️ Current Limitations

| Limitation | Impact | Solution |
|-----------|--------|----------|
| localStorage ~5MB | Limit on daily log size | Add Data Retention Policy |
| No backend | Single machine only | Add Supabase/Firebase |
| No authentication | PIN only, not secure | Add real auth system |
| Fixed 14 branches | Can't scale to 9 provinces | Make dynamic from Excel |
| No audit log | Can't track changes | Add audit trail table |
| No multi-user | Data isolation issues | Add role-based access |

---

## 📞 Quick Reference

| Need | File | Function |
|------|------|----------|
| Add new KPI | `public/data/kpi-config.json` | Add entry |
| Change thresholds | Admin → เกณฑ์รายสาขา tab | UI inline edit |
| Upload data | Admin → อัพโหลด Excel tab | Select file |
| View trends | Dashboard or Branch page | DailyTrendChart |
| View forecast | Dashboard or Branch page | ForecastPanel |
| Modify computation | `src/data/transformer.js` | computeBranchKpiScoreV2() |
| Change theme | Navbar → Theme switcher | 3 options |
| Deploy | `git push origin main` | Auto-deploy via Vercel |

---

## 🎓 For AI/Developers Reading This

**ถ้าคุณต้องการ:**

- ✅ **เข้าใจโครงสร้าง** → อ่านไฟล์นี้ + ดู Folder Structure
- ✅ **แก้ไขโค้ด** → ดู WORKFLOW_GUIDE.md
- ✅ **รันเองในเครื่อง** → ดู HOW_TO_RUN.md
- ✅ **ดูสิ่งที่ต้องทำต่อ** → ดู Remind.md
- ✅ **ขยายเป็น Multi-Province** → ดู PROJECT_SUMMARY.md (section โครงสร้างแนะนำ)

---

**Last Updated:** 2026-06-06  
**Created by:** Claude — Feature Architect & Reminder Agent  
**For:** BAAC KPI Dashboard Team & Future Developers
