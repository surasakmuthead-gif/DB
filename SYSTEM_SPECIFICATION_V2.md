# 🏗️ System Specification & Master Prompt: KPI Dashboard System v2.0

**Master Blueprint สำหรับการพัฒนาระบบแดชบอร์ด KPI ครั้งที่ 2**

---

## 📋 ข้อมูลทั่วไป

- **ชื่อระบบ:** BAAC KPI Dashboard System v2.0
- **สถาปัตยกรรม:** Full-Stack Web Application (Next.js, Tailwind CSS, Supabase, Recharts)
- **ขอบเขต:** 9 จังหวัด (ฝ่ายภาค) + 90+ สาขา (ประมาณ)
- **เป้าหมาย:** ระบบแดชบอร์ดวิเคราะห์ผลงาน KPI ที่มีความยืดหยุ่น ปลอดภัย แสดงผลวันที่อย่างแม่นยำ
- **ความต่างจาก v1:** Multi-province, Supabase Backend, RBAC, Date Alignment Logic, Corrections & Audit Trail

---

## 1️⃣ PAGE HIERARCHY & UI LAYOUT (โครงสร้างหน้าจอ)

### 1.1 หน้าภาพรวมฝ่ายภาค (Regional Overview)

#### วัตถุประสงค์
แสดงภาพรวมและเปรียบเทียบผลงานระดับฝ่ายภาคของทั้ง 9 จังหวัด โครงสร้างหน้านี้เหมือนโครงสร้างหน้า ภาพรวมสาขา (v1)

#### การจัดเรียงลำดับจังหวัด (Fixed Order)
⚠️ **ต้องเซ็ต Custom Sorting แบบ "คงที่เสมอ"** (ห้ามเรียงตามตัวอักษรหรือคะแนน)

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

#### การแสดงผลวันที่ (As of Date Column)
- ในตารางเปรียบเทียบต้องมีคอลัมน์ **"ข้อมูล ณ วันที่"** (As of Date)
- แยกรายบรรทัดของแต่ละจังหวัด เพื่อแสดงสถานะอัปเดตจริง
- **ตัวอย่าง:**
  - สุโขทัย | ข้อมูล ณ 2026-06-09 | คะแนน 85.50%
  - อุทัยธานี | ข้อมูล ณ 2026-06-08 | คะแนน 78.30%
  - (แต่ละจังหวัดอาจส่งข้อมูลวันต่างกัน)

#### การ์ดคะแนนรวมภาค (Regional KPI Card)

**ตรรกะ "Complete Date Alignment Logic":**
- คะแนนเฉลี่ยรวมทั้งภาค = **ผลรวมจากวันล่าสุดที่ "ทุกจังหวัดส่งข้อมูลครบตรงกันแล้วเท่านั้น"**
- หากจังหวัดใดยังส่งไม่ครบ → ไม่นำวันใหม่มาเฉลี่ยรวม
- **เป้าหมาย:** ป้องกันค่าเฉลี่ยบิดเบือน

**ตัวอย่าง:**
```
วันที่ 9 มิถุนายน 2026:
- เพชรบูรณ์: ✅ 85.50%
- สุโขทัย: ✅ 88.20%
- นครสวรรค์: ✅ 82.10%
- พิษณุโลก: ✅ 79.50%
- พิจิตร: ✅ 86.40%
- กำแพงเพชร: ✅ 81.30%
- อุตรดิตถ์: ❌ (ยังไม่ส่ง)
- อุทัยธานี: ✅ 78.20%
- ตาก: ✅ 80.90%

→ เนื่องจาก "อุตรดิตถ์" ยังส่งไม่ครบ
→ Regional Card ยังใช้ข้อมูล วันที่ 8 มิถุนายน (วันสุดท้ายที่ครบ 9 จังหวัด)
→ Regional Score = 82.78% [จากข้อมูลวันที่ 8]
```

---

### 1.2 หน้าภาพรวมจังหวัด (Province Dashboard)

#### ลักษณะทั่วไป
- มี **Dropdown เลือกจังหวัด** (ยึดลำดับคงที่ 9 จังหวัดเสมอ)
- ให้ดูเป็นภาพรายสาขาได้ (เจาะลึก)
- แสดง **KPI ทุกตัว** เหมือนปัจจุบัน (v1)
- ระบุ **ป้ายวันที่ของข้อมูล** อย่างชัดเจนที่หัวจอ

#### Components
- KPI Cards (small/large)
- Ranking Table ของสาขาในจังหวัดนั้น
- History Chart (รายเดือน)
- Daily Trend Chart (รายวัน) + Tooltip แสดงวันที่
- Forecast Panel

---

### 1.3 แท็บข้อมูลรายบุคคล (Individual Performance Tracking)

#### แถบตัวกรอง (Dynamic Filter Bar)
```
┌─────────────────┬─────────────────┐
│ Dropdown 1      │ Dropdown 2      │
│ เลือกจังหวัด     │ เลือกหัวข้อ KPI  │
│ (Fixed order)   │ (Dynamic list)  │
└─────────────────┴─────────────────┘
```

**Dropdown 1 (จังหวัด):**
- ยึดลำดับคงที่ 9 จังหวัดเสมอ
- เลือกได้ 1 จังหวัด

**Dropdown 2 (KPI):**
- ดึงมาเฉพาะหัวข้อที่มีการบันทึกข้อมูลรายบุคคลจริงในระบบ
- ไม่ต้องแสดง KPI ที่ไม่มีข้อมูล

#### ตารางจัดอันดับ (Province Leaderboard)

| คอลัมน์ | รายละเอียด |
|--------|-----------|
| **อันดับ** | เรียงจากผลงานมากไปน้อย |
| **รหัสพนักงาน** | ID / Code |
| **ตำแหน่ง** | Job Title |
| **สาขาต้นสังกัด** | Branch |
| **ผลงานดิบ** | Raw Performance Value |
| **วันที่** | (Optional) ดึงจากการอัปโหลด |

---

## 2️⃣ BACKEND & DATABASE SPECIFICATION (ระบบหลังบ้านและฐานข้อมูล)

### 2.1 สถาปัตยกรรมฐานข้อมูลกลาง (Supabase)

#### จุดประสงค์
- **ย้าย** การเก็บข้อมูลจาก localStorage → Supabase PostgreSQL
- ทำให้เป็น Centralized Database
- รองรับ Multi-province + Multi-user

#### ตารางข้อมูลรายบุคคล (Flexible Schema)

**โครงสร้าง: Key-Value Row Pattern**
```sql
-- ตัวอย่าง Table: individual_kpi_data
CREATE TABLE individual_kpi_data (
  id UUID PRIMARY KEY,
  employee_id VARCHAR,
  employee_name VARCHAR,
  job_title VARCHAR,
  branch_id VARCHAR,
  province_id INT,
  kpi_id VARCHAR,              -- เช่น "kpi_01", "kpi_03"
  kpi_value NUMERIC,           -- ค่าผลงาน
  data_date DATE,              -- วันที่ของข้อมูล
  uploaded_by VARCHAR,         -- Admin ID
  uploaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**ลักษณะเด่น:**
- ✅ **Flexible:** พนักงานคนไหนมีข้อมูล KPI ข้อใดให้บันทึกแค่ข้อนั้น
- ✅ **ไม่บังคับเก็บครบ:** ไม่ต้องเก็บ NULL สำหรับ KPI ที่ไม่มีข้อมูล
- ✅ **รองรับการปรับเปลี่ยน:** เพิ่ม KPI ใหม่ได้ทันที ไม่ต้องเพิ่มคอลัมน์

---

### 2.2 ระบบจัดการสิทธิ์และการอัปโหลด (RBAC & Data Ingestion)

#### สิทธิ์การใช้งาน (Roles)

| Role | จำนวน | สิทธิ์ |
|------|-------|-------|
| **Super Admin** | 1 | ทั้งหมด + อนุมัติ |
| **Province Admin** | 9 | อัปโหลด/แก้ไข ของตัวเองเท่านั้น |
| **Viewer** | N | ดูเท่านั้น |

#### การอัปโหลด Excel

**ขั้นตอน:**
1. Province Admin เลือก Excel ของจังหวัดตัวเอง
2. ระบบ **ดึงวันที่อัตโนมัติ** จากชื่อไฟล์ (auto-detect)
3. Parse Excel → Map เป็น Structure ของ Supabase
4. **บันทึกเป็น Log ประวัติศาสตร์รายวัน (Time-Series)**
5. ✅ ห้ามเขียนทับข้อมูลเก่า → Keep all historical data

**Date Stamp Logic:**
- ดึงจากชื่อไฟล์ (เช่น `Data_2026_06_09.xlsx`)
- หรือ User กำหนดวันที่เมื่ออัปโหลด
- ลงบันทึก: `data_date`, `uploaded_at`, `uploaded_by`

#### Data Ingestion Pipeline
```
Excel Upload
    ↓
Extract Date & Parse
    ↓
Validate Data
    ↓
Insert to Supabase (No Overwrite)
    ↓
Generate Time-Series Log Entry
    ↓
Notify Admin (Success/Error)
```

---

### 2.3 ตรรกะเกณฑ์คะแนนตามช่วงเวลา (Effective Date Logic)

#### ปัญหา
- เกณฑ์คะแนน (v1-v5) อาจเปลี่ยนไปตามช่วงเวลา
- ข้อมูลเก่าต้องคงผลคะแนนตามเกณฑ์ ณ เวลานั้นๆ
- ห้ามคำนวณย้อนหลังตามเกณฑ์ใหม่ → จะทำให้กราฟแนวโน้มเพี้ยน

#### วิธีแก้ไข

**Table: kpi_threshold_history**
```sql
CREATE TABLE kpi_threshold_history (
  id UUID PRIMARY KEY,
  province_id INT,
  branch_id VARCHAR,
  kpi_id VARCHAR,
  v1 NUMERIC,
  v2 NUMERIC,
  v3 NUMERIC,
  v4 NUMERIC,
  v5 NUMERIC,
  effective_from DATE,    -- วันที่เริ่มใช้
  effective_to DATE,      -- วันที่สิ้นสุด (NULL = ยังใช้อยู่)
  created_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Calculation Logic:**
```javascript
function calculateScore(actual, kpiId, branchId, dataDate) {
  // 1. ดึงเกณฑ์ที่ "มีผลบังคับใช้" ณ dataDate
  const threshold = getThresholdAtDate(kpiId, branchId, dataDate);
  
  // 2. ใช้เกณฑ์นั้นคำนวณ
  const level = determineLevel(actual, threshold);
  const score = level * 20;
  
  return { level, score, threshold };
}
```

**ตัวอย่าง:**
```
ตั้งแต่ 2026-01-01 ถึง 2026-05-31: v1=50, v2=60, v3=70, v4=80, v5=100
ตั้งแต่ 2026-06-01 เป็นต้นไป:       v1=55, v2=65, v3=75, v4=85, v5=105

เมื่อดูข้อมูลวันที่ 2026-05-15: ใช้เกณฑ์แรก
เมื่อดูข้อมูลวันที่ 2026-06-15: ใช้เกณฑ์ที่สอง
```

---

## 3️⃣ DATA INTEGRITY & MAINTENANCE (ระบบบำรุงรักษาข้อมูล)

### 3.1 ระบบแก้ไขข้อมูลย้อนหลัง (Historical Data Correction)

#### เป้าหมาย
รองรับ Human Error โดย Province Admin สามารถแก้ไขข้อมูลย้อนหลังของตัวเองได้ทันที

#### วิธีแก้ไข 2 แบบ

**วิธีที่ 1: อัปโหลดไฟล์ใหม่ (Re-upload Overwrite)**
- อัปโหลดไฟล์ Excel ใหม่ทับวันเดิม
- เฉพาะของวันนั้น
- Logic: ลบข้อมูลเก่า → Insert ใหม่

**วิธีที่ 2: แก้ไขด้วย UI (Manual Adjustment)**
- Province Admin เปิด Record ที่ต้องแก้
- คลิก Edit → เปลี่ยนตัวเลข → Save
- ระบบบันทึก Correction Log

#### Targeted Recalculation

เมื่อมีการแก้ไขข้อมูลย้อนหลัง:
1. ดึงเกณฑ์คะแนนของช่วงเวลานั้นๆ
2. คำนวณผลคะแนนใหม่ให้ถูกต้องอัตโนมัติ
3. Update เฉพาะ Record ที่แก้ไข
4. **ไม่ต้อง Recalculate ทั้งหมด** (Targeted approach)

#### Correction Audit Trail

**Table: correction_audit_log**
```sql
CREATE TABLE correction_audit_log (
  id UUID PRIMARY KEY,
  corrected_by VARCHAR,         -- Admin ID
  corrected_date DATE,
  corrected_time TIMESTAMP,
  target_record_id UUID,        -- Record ที่แก้
  field_name VARCHAR,           -- Column ที่แก้
  old_value VARCHAR,
  new_value VARCHAR,
  reason TEXT,                  -- เหตุผลการแก้ไข (Mandatory)
  correction_method VARCHAR,    -- "re-upload" or "manual-ui"
  created_at TIMESTAMP DEFAULT NOW()
);
```

**ขั้นตอนบังคับ:**
1. Province Admin แก้ข้อมูล
2. ระบบ Pop-up: "เหตุผลในการแก้ไข (Required)"
3. Admin กรอกเหตุผล (Text Box)
4. Save → บันทึก Log
5. Super Admin สามารถ Review ทั้งหมด

---

### 3.2 หน้าประวัติการอัปเดตระบบ (System Changelog)

#### วัตถุประสงค์
แสดงประวัติการอัปเดตเวอร์ชันของระบบให้ผู้ใช้และผู้บริหารทราบ

#### UI: Timeline Layout
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 v2.0.1 — 2026-06-15
   [Added] Multi-province support
   [Added] Individual performance tracking
   
🟡 v2.0.0 — 2026-06-01
   [Changed] Migrate to Supabase backend
   [Changed] New date alignment logic

🔵 v1.9.5 — 2026-05-20
   [Fixed] KPI card rendering bug
   [Fixed] Export Excel error
   
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### ประเภท (Category & Color)
- 🟢 **[Added]** = เพิ่มฟีเจอร์ใหม่
- 🟡 **[Changed]** = ปรับปรุง/เปลี่ยน
- 🔵 **[Fixed]** = แก้ไขบั๊ก
- 🟣 **[Deprecated]** = ยกเลิก (ทำให้ตัวอักษรหรือ strikethrough)
- ⚫ **[Security]** = เรื่องความปลอดภัย

#### Admin Backend System

**Table: system_changelog**
```sql
CREATE TABLE system_changelog (
  id UUID PRIMARY KEY,
  version VARCHAR,              -- เช่น "2.0.1"
  release_date DATE,
  entries JSONB,                -- Array of changelog items
  created_by VARCHAR,           -- Super Admin ID
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example: entries = [
--   { "type": "Added", "text": "Multi-province support" },
--   { "type": "Changed", "text": "Migrate to Supabase" }
-- ]
```

**Admin UI:**
```
┌─────────────────────────────────────┐
│ System Changelog Management         │
├─────────────────────────────────────┤
│ Version:     [2.0.1____________]    │
│ Release Date: [2026-06-15____]      │
│                                     │
│ Changelog Entries:                  │
│ ┌──────────────────────────────┐   │
│ │ Type:  [Added▼]             │   │
│ │ Text:  [Multi-province...] │   │
│ │ [Add Entry] [Remove]        │   │
│ ├──────────────────────────────┤   │
│ │ Type:  [Changed▼]           │   │
│ │ Text:  [Migrate to Supabase]│   │
│ │ [Add Entry] [Remove]        │   │
│ └──────────────────────────────┘   │
│                                     │
│ [Preview] [Publish to Timeline]    │
└─────────────────────────────────────┘
```

**Publish Logic:**
- Super Admin เขียน version + entries
- เมื่อกด "Publish" → บันทึก DB
- Timeline Page ดึงอัตโนมัติจาก DB
- ไม่ต้องเขียนโค้ดใหม่ทุกครั้ง

---

## 🎯 Summary & Implementation Priority

| ลำดับ | ชื่อ | ขนาด | ความจำเป็น |
|------|------|------|-----------|
| 1 | Regional Overview (Date Alignment) | 🔴 ใหญ่ | ⭐⭐⭐ Critical |
| 2 | Supabase Backend + Tables | 🔴 ใหญ่ | ⭐⭐⭐ Critical |
| 3 | RBAC System | 🟡 กลาง | ⭐⭐⭐ Critical |
| 4 | Province Dashboard | 🟢 เล็ก | ⭐⭐ Important |
| 5 | Individual Performance Tab | 🟡 กลาง | ⭐⭐ Important |
| 6 | Data Correction UI | 🟡 กลาง | ⭐⭐ Important |
| 7 | Audit Trail Log | 🟡 กลาง | ⭐⭐ Important |
| 8 | System Changelog Timeline | 🟢 เล็ก | ⭐ Nice-to-have |
| 9 | Effective Date Logic | 🔴 ใหญ่ | ⭐⭐⭐ Critical |

---

## 📌 Key Technical Decisions

1. **Supabase vs Firebase:** Supabase (PostgreSQL) มีความยืดหยุ่นมากกว่า
2. **Next.js vs React:** Next.js (SSR, API Routes, better performance)
3. **Date Alignment:** ต้องเข้มงวดเพื่อไม่ให้ค่าเฉลี่ยบิดเบือน
4. **Audit Trail:** บังคับเพื่อความรับผิดชอบ + compliance
5. **Flexible Schema:** Key-Value เพื่อรองรับการเปลี่ยนแปลงเร็ว

---

**Created:** 2026-06-06  
**Version:** v2.0 (Master Blueprint)  
**Status:** Ready for Phase Planning
