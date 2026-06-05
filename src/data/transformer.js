import * as XLSX from 'xlsx'

const STORAGE_KEYS = {
  KPI_CONFIG: 'baac-kpi-config',
  BRANCH_DATA: 'baac-branch-data',
  HISTORY_LOG: 'baac-history-log',
  KPI_TARGETS: 'baac-kpi-targets',   // เกณฑ์รายสาขา (raw values)
  DAILY_LOG: 'baac-daily-log',       // ← ประวัติรายวัน (actuals snapshot)
}

// ─── KPI Config Storage ───

export function loadKpiConfig() {
  const saved = localStorage.getItem(STORAGE_KEYS.KPI_CONFIG)
  return saved ? JSON.parse(saved) : null
}

export function saveKpiConfig(config) {
  localStorage.setItem(STORAGE_KEYS.KPI_CONFIG, JSON.stringify(config))
}

export async function loadDefaultKpiConfig() {
  const res = await fetch('/data/kpi-config.json')
  const config = await res.json()
  saveKpiConfig(config)
  return config
}

// ─── Branch Data Storage ───

export function loadBranchData() {
  const saved = localStorage.getItem(STORAGE_KEYS.BRANCH_DATA)
  return saved ? JSON.parse(saved) : null
}

export function saveBranchData(data) {
  localStorage.setItem(STORAGE_KEYS.BRANCH_DATA, JSON.stringify(data))
}

// ─── History Log Storage ───

export function loadHistoryLog() {
  const saved = localStorage.getItem(STORAGE_KEYS.HISTORY_LOG)
  return saved ? JSON.parse(saved) : []
}

export function saveHistoryLog(log) {
  localStorage.setItem(STORAGE_KEYS.HISTORY_LOG, JSON.stringify(log))
}

export function appendHistory(period, label, branchData, kpiConfig) {
  const log = loadHistoryLog()
  const summary = computeProvinceSummary(branchData, kpiConfig)
  const existing = log.findIndex((h) => h.period === period)
  const entry = { period, label, summary, branchCount: branchData.length, timestamp: Date.now() }

  if (existing >= 0) {
    log[existing] = entry
  } else {
    log.push(entry)
    log.sort((a, b) => a.period.localeCompare(b.period))
  }

  saveHistoryLog(log)
  return log
}

// ─── KPI Targets (เกณฑ์รายสาขา) ───
// โครงสร้าง: kpiTargets[branchName][kpiId] = { v1, v2, v3, v4, v5 }
// v1 = ระดับ 1 (ต่ำสุด), v5 = ระดับ 5 (สูงสุด = เป้าหมาย)
// ค่าเป็นตัวเลขดิบ ไม่ใช่ % ของเป้าหมาย

export function loadKpiTargets() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.KPI_TARGETS)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export function saveKpiTargets(targets) {
  localStorage.setItem(STORAGE_KEYS.KPI_TARGETS, JSON.stringify(targets))
}

// ─── Excel Parsing Pipeline ───

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (!json.length) {
          reject(new Error('ไม่พบข้อมูลในไฟล์ Excel'))
          return
        }

        resolve(json)
      } catch (err) {
        reject(new Error(`อ่านไฟล์ Excel ไม่สำเร็จ: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'))
    reader.readAsArrayBuffer(file)
  })
}

export function mapExcelToBranchData(rows, kpiConfig) {
  const headers = Object.keys(rows[0])

  const branchCol = findHeader(headers, [
    'branch_name', 'Branch_Name', 'สาขา', 'ชื่อสาขา', 'branch', 'name',
  ])

  if (!branchCol) {
    throw new Error('ไม่พบคอลัมน์ชื่อสาขา (Branch_Name / สาขา)')
  }

  const branchData = []

  for (const row of rows) {
    const branchName = String(row[branchCol]).trim()
    if (!branchName) continue

    const kpis = {}
    for (const kpi of kpiConfig) {
      const kpiNum = kpi.kpi_id.replace('kpi_', '')
      const targetCol = findHeader(headers, [
        `KPI_${kpiNum}_Target`, `kpi_${kpiNum}_target`,
        `${kpi.kpi_name}_เป้าหมาย`, `เป้าหมาย_${kpiNum}`,
        `target_${kpiNum}`,
      ])
      const actualCol = findHeader(headers, [
        `KPI_${kpiNum}_Actual`, `kpi_${kpiNum}_actual`,
        `${kpi.kpi_name}_ผลงาน`, `ผลงาน_${kpiNum}`,
        `actual_${kpiNum}`,
      ])

      const target = targetCol ? parseFloat(row[targetCol]) || 0 : 0
      const actual = actualCol ? parseFloat(row[actualCol]) || 0 : 0

      kpis[kpi.kpi_id] = { target, actual }
    }

    branchData.push({ branch_name: branchName, kpis })
  }

  return branchData
}

function findHeader(headers, candidates) {
  const normalized = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  for (const c of candidates) {
    const target = c.trim().toLowerCase().replace(/\s+/g, '_')
    const idx = normalized.findIndex((h) => h === target || h.includes(target))
    if (idx >= 0) return headers[idx]
  }
  return null
}

export function extractPeriodFromFilename(filename) {
  const match = filename.match(/(\d{4})[_\-.](\d{2})/)
  if (match) {
    return { period: `${match[1]}-${match[2]}`, label: formatPeriodLabel(match[1], match[2]) }
  }
  return null
}

function formatPeriodLabel(year, month) {
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  const m = parseInt(month, 10)
  const thaiYear = parseInt(year, 10) > 2500 ? year : parseInt(year, 10) + 543
  return `${thaiMonths[m - 1]} ${thaiYear}`
}

// ─── Scoring Engine (Legacy) ───
// ใช้กรณีที่ยังไม่มี kpiTargets รายสาขา — อ่านจาก kpiConfig.thresholds (%)

export function computeBranchKpiScore(actual, target, kpiConfig) {
  if (!target || target === 0) return { target: 0, remaining: 0, percent: 0, level: 0, score: 0, thresholdValues: {} }

  const remaining = target - actual
  const percent = (actual / target) * 100
  const isReverse = kpiConfig.kpi_id === 'kpi_08'

  const thresholdValues = {}
  for (let i = 1; i <= 5; i++) {
    const pct = kpiConfig.thresholds?.[`score_${i}`] ?? 0
    thresholdValues[`score_${i}`] = isReverse ? pct : (target * pct) / 100
  }

  let level = 0
  if (isReverse) {
    for (let i = 5; i >= 1; i--) {
      if (actual <= thresholdValues[`score_${i}`]) {
        level = i
        break
      }
    }
  } else {
    for (let i = 5; i >= 1; i--) {
      if (actual >= thresholdValues[`score_${i}`]) {
        level = i
        break
      }
    }
  }

  const score = level * (kpiConfig.weight || 1)

  return { target, remaining, percent, level, score, thresholdValues }
}

// ─── Scoring Engine V2 (Raw Thresholds) ───
// ใช้เมื่อตั้งเกณฑ์รายสาขาแล้ว — rawThresholds = { v1, v2, v3, v4, v5 } (ตัวเลขดิบ)
// v5 = เป้าหมายสูงสุด (= target ที่แสดงในตาราง)

export function computeBranchKpiScoreV2(actual, rawThresholds, kpi) {
  if (!rawThresholds) {
    return { actual, target: 0, remaining: 0, percent: 0, level: 0, score: 0, thresholds: null, thresholdValues: {} }
  }

  const { v1 = 0, v2 = 0, v3 = 0, v4 = 0, v5 = 0 } = rawThresholds
  const target = v5
  const isReverse = kpi.kpi_id === 'kpi_08'

  // ต้องทำอีก: positive = ยังขาด, negative = เกินเป้าแล้ว
  const remaining = isReverse ? actual - v5 : v5 - actual
  const percent = target > 0 ? (actual / target) * 100 : 0

  let level = 0
  if (!isReverse) {
    // ปกติ: ยิ่งมากยิ่งดี
    if (actual >= v5) level = 5
    else if (actual >= v4) level = 4
    else if (actual >= v3) level = 3
    else if (actual >= v2) level = 2
    else if (actual >= v1) level = 1
  } else {
    // Reverse (NPL): ยิ่งน้อยยิ่งดี
    // v5 = ดีที่สุด (ต่ำสุด), v1 = แย่ที่สุด (สูงสุด)
    if (actual <= v5) level = 5
    else if (actual <= v4) level = 4
    else if (actual <= v3) level = 3
    else if (actual <= v2) level = 2
    else if (actual <= v1) level = 1
  }

  // thresholdValues ในรูปแบบเดิมเพื่อให้ KpiDetailSection ใช้งานได้เหมือนเดิม
  const thresholdValues = { score_1: v1, score_2: v2, score_3: v3, score_4: v4, score_5: v5 }

  return {
    actual,
    target,
    remaining,
    percent,
    level,
    score: level * (kpi.weight || 1),
    thresholds: rawThresholds,   // raw {v1..v5} สำหรับ reference
    thresholdValues,             // {score_1..score_5} สำหรับ UI เดิม
  }
}

// ─── Compute All Branch Scores ───
// kpiTargets เป็น optional: ถ้ามี ใช้ V2; ถ้าไม่มี fallback ไป legacy

export function computeAllBranchScores(branchData, kpiConfig, kpiTargets = {}) {
  return branchData.map((branch) => {
    const scores = {}
    let totalScore = 0
    let maxPossibleScore = 0

    for (const kpi of kpiConfig) {
      const kpiData = branch.kpis[kpi.kpi_id]
      const rawThresholds = kpiTargets[branch.branch_name]?.[kpi.kpi_id] || null

      if (!kpiData) {
        scores[kpi.kpi_id] = {
          actual: 0, target: 0, remaining: 0, percent: 0,
          level: 0, score: 0, thresholds: rawThresholds, thresholdValues: {},
        }
        continue
      }

      let result
      if (rawThresholds) {
        result = computeBranchKpiScoreV2(kpiData.actual, rawThresholds, kpi)
      } else {
        result = computeBranchKpiScore(kpiData.actual, kpiData.target, kpi)
      }

      scores[kpi.kpi_id] = result
      totalScore += result.score
      maxPossibleScore += 5 * (kpi.weight || 1)
    }

    return {
      branch_name: branch.branch_name,
      kpis: branch.kpis,
      scores,
      totalScore,
      maxPossibleScore,
      overallPercent: maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0,
    }
  })
}

// ─── Province Summary ───
// kpiTargets เป็น optional — ถ้ามีจะใช้ v5 เป็น target แทน Excel target

export function computeProvinceSummary(branchData, kpiConfig, kpiTargets = {}) {
  const summary = {}
  for (const kpi of kpiConfig) {
    const isPercent = kpi.unit === '%'
    let totalTarget = 0
    let totalActual = 0
    let count = 0

    for (const branch of branchData) {
      const d = branch.kpis[kpi.kpi_id]
      if (!d) continue

      // ใช้ v5 จาก kpiTargets ถ้ามี มิฉะนั้นใช้ target จาก Excel
      const rawThresholds = kpiTargets[branch.branch_name]?.[kpi.kpi_id]
      const effectiveTarget = rawThresholds ? (rawThresholds.v5 || 0) : d.target

      totalTarget += effectiveTarget
      totalActual += d.actual
      count++
    }

    if (isPercent && count > 0) {
      // KPI หน่วย % ใช้ค่าเฉลี่ย (ไม่ใช่ผลรวม)
      const avgTarget = totalTarget / count
      const avgActual = totalActual / count
      const percent = avgTarget > 0 ? (avgActual / avgTarget) * 100 : 0
      summary[kpi.kpi_id] = { target: avgTarget, actual: avgActual, percent }
    } else {
      const percent = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0
      summary[kpi.kpi_id] = { target: totalTarget, actual: totalActual, percent }
    }
  }
  return summary
}

export function rankBranches(computedBranches) {
  return [...computedBranches]
    .sort((a, b) => b.overallPercent - a.overallPercent)
    .map((b, i) => ({ ...b, rank: i + 1 }))
}

export function rankBranchesByKpi(computedBranches, kpiId) {
  return [...computedBranches]
    .sort((a, b) => (b.scores[kpiId]?.percent || 0) - (a.scores[kpiId]?.percent || 0))
    .map((b, i) => ({ ...b, kpiRank: i + 1 }))
}

// ─── Formatting Helpers ───

export function formatNumber(num, unit) {
  if (num === null || num === undefined) return '-'
  if (unit === '%') return num.toFixed(2)
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M'
  if (Math.abs(num) >= 1_000) return num.toLocaleString('th-TH', { maximumFractionDigits: 2 })
  return Number.isInteger(num) ? num.toString() : num.toFixed(2)
}

export function getPerformanceColor(percent) {
  if (percent >= 100) return '#10B981'
  if (percent >= 90) return '#F59E0B'
  return '#EF4444'
}

export function getScoreLevelColor(level) {
  if (level >= 5) return '#10B981'
  if (level >= 4) return '#22C55E'
  if (level >= 3) return '#F59E0B'
  if (level >= 2) return '#F97316'
  if (level >= 1) return '#EF4444'
  return '#6B7280'
}

// ═══════════════════════════════════════════════════════════
// ─── Daily Snapshot Log ───
// โครงสร้าง: { date, label, period, actuals: { branchName: { kpiId: actual } }, uploadedAt }
// ═══════════════════════════════════════════════════════════

export function loadDailyLog() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_LOG)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function saveDailyLog(log) {
  localStorage.setItem(STORAGE_KEYS.DAILY_LOG, JSON.stringify(log))
}

/**
 * บันทึก snapshot รายวัน — เก็บ actuals (ผลงานจริง) ของแต่ละสาขา×KPI
 * ถ้าวันเดิมมีแล้วจะ Overwrite, วันใหม่จะ append แล้ว sort
 */
export function appendDailySnapshot(date, label, period, branchData) {
  const log = loadDailyLog()

  // Compact format: เก็บเฉพาะ actual (targets ไม่เปลี่ยนรายวัน)
  const actuals = {}
  for (const branch of branchData) {
    actuals[branch.branch_name] = {}
    for (const [kpiId, data] of Object.entries(branch.kpis)) {
      actuals[branch.branch_name][kpiId] = data.actual
    }
  }

  const entry = { date, label, period, actuals, uploadedAt: Date.now() }

  const idx = log.findIndex((h) => h.date === date)
  if (idx >= 0) {
    log[idx] = entry     // Overwrite same date
  } else {
    log.push(entry)
    log.sort((a, b) => a.date.localeCompare(b.date))
  }

  saveDailyLog(log)
  return log
}

// ═══════════════════════════════════════════════════════════
// ─── Enhanced Date Extraction (รองรับทั้ง รายวัน และ รายเดือน) ───
// ═══════════════════════════════════════════════════════════

const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function makeDateResult(y, m, d) {
  const year = parseInt(y, 10)
  const month = parseInt(m, 10)
  const day = parseInt(d, 10)
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null

  // รองรับปีไทย (พ.ศ.) → แปลงเป็น ค.ศ.
  const ceYear = year > 2400 ? year - 543 : year
  const date = `${ceYear}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const period = `${ceYear}-${String(month).padStart(2,'0')}`
  const thaiYear = ceYear + 543
  const label = `${day} ${THAI_MONTHS[month-1]} ${thaiYear}`

  return { date, period, label, year: ceYear, month, day }
}

/**
 * ดึงวันที่จากชื่อไฟล์ รองรับรูปแบบต่างๆ:
 *   Data_2026_06_06.xlsx   → 2026-06-06
 *   KPI_06-06-2026.xlsx    → 2026-06-06
 *   Report_20260606.xlsx   → 2026-06-06
 *   KPI_06062026.xlsx      → 2026-06-06
 *   Data_2026_06.xlsx      → สิ้นเดือน (ใช้วันนี้)
 */
export function extractFullDateFromFilename(filename) {
  const name = filename.replace(/\.(xlsx|xls|csv)$/i, '')

  // Pattern 1: YYYY_MM_DD / YYYY-MM-DD / YYYY.MM.DD
  const p1 = name.match(/(\d{4})[_\-.](\d{1,2})[_\-.](\d{1,2})(?!\d)/)
  if (p1) return makeDateResult(p1[1], p1[2], p1[3])

  // Pattern 2: DD_MM_YYYY / DD-MM-YYYY
  const p2 = name.match(/(?<!\d)(\d{1,2})[_\-.](\d{1,2})[_\-.](\d{4})/)
  if (p2) return makeDateResult(p2[3], p2[2], p2[1])

  // Pattern 3: YYYYMMDD (8 digits รวม)
  const p3 = name.match(/(?<!\d)((?:25|20|19)\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(?!\d)/)
  if (p3) return makeDateResult(p3[1], p3[2], p3[3])

  // Pattern 4: DDMMYYYY
  const p4 = name.match(/(?<!\d)(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])((?:25|20|19)\d{2})(?!\d)/)
  if (p4) return makeDateResult(p4[3], p4[2], p4[1])

  // Fallback Pattern 5: YYYY_MM เท่านั้น → ใช้วันนี้เป็น day
  const p5 = name.match(/(\d{4})[_\-.](\d{1,2})/)
  if (p5) {
    const today = new Date()
    return makeDateResult(p5[1], p5[2], today.getDate())
  }

  return null
}

// ═══════════════════════════════════════════════════════════
// ─── Excel Template Generator ───
// ═══════════════════════════════════════════════════════════

export function generateExcelTemplate(kpiConfig, branches) {
  // Row 1: Headers
  const headers = [
    'Branch_Name',
    ...kpiConfig.map((k) => `KPI_${k.kpi_id.replace('kpi_', '')}_Actual`),
  ]

  // Rows 2–N: pre-fill branch names, zeros for actuals
  const dataRows = branches.map((branch) => [branch, ...kpiConfig.map(() => 0)])

  const wsData = [headers, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = [{ wch: 24 }, ...kpiConfig.map(() => ({ wch: 14 }))]

  // Instructions sheet
  const instrRows = [
    ['คำแนะนำการใช้งาน Template'],
    [''],
    ['1. กรอกผลงานจริง (Actual) ในคอลัมน์ KPI_XX_Actual ของแต่ละสาขา'],
    ['2. ห้ามลบ / เปลี่ยนชื่อ Branch หรือ Column Header'],
    ['3. ตั้งชื่อไฟล์เป็น Data_YYYY_MM_DD.xlsx เช่น Data_2026_06_06.xlsx'],
    ['   (ระบบดึงวันที่จากชื่อไฟล์โดยอัตโนมัติ)'],
    ['4. อัปโหลดในหน้า Admin Panel > อัปโหลดข้อมูล'],
    [''],
    ['รหัส KPI ที่รองรับ:'],
    ...kpiConfig.map((k) => [k.kpi_id, k.kpi_name, `(${k.unit})`]),
  ]
  const wsInstr = XLSX.utils.aoa_to_sheet(instrRows)
  wsInstr['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 15 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.utils.book_append_sheet(wb, wsInstr, 'คำแนะนำ')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

// ═══════════════════════════════════════════════════════════
// ─── Forecasting Engine ───
// Linear Regression → พยากรณ์ผลงาน ณ วันที่กำหนด
// ═══════════════════════════════════════════════════════════

/** แปลง date string เป็นจำนวนวัน (นับจาก 2000-01-01) */
function dateToOrdinal(dateStr) {
  const d = new Date(dateStr)
  const base = new Date('2000-01-01')
  return Math.floor((d - base) / 86_400_000)
}

/** Linear Regression เส้นตรง y = slope·x + intercept */
function linearRegression(points) {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 }

  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)

  const denom = n * sumX2 - sumX * sumX
  if (Math.abs(denom) < 1e-10) return { slope: 0, intercept: sumY / n }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

/**
 * พยากรณ์ค่า KPI ของสาขา×KPI ณ วันที่ forecastDate
 * @returns { projectedValue, slope, dataPoints, latestActual, latestDate } หรือ null
 */
export function forecastKpiValue(dailyLog, branchName, kpiId, forecastDate) {
  const points = dailyLog
    .filter((s) => s.actuals?.[branchName]?.[kpiId] !== undefined)
    .map((s) => ({ x: dateToOrdinal(s.date), y: s.actuals[branchName][kpiId], date: s.date }))
    .sort((a, b) => a.x - b.x)

  if (!points.length) return null

  const { slope, intercept } = linearRegression(points)
  const targetX = dateToOrdinal(forecastDate)
  const projected = slope * targetX + intercept

  return {
    projectedValue: Math.max(0, projected),
    slope,                                          // เพิ่ม/ลดต่อวัน
    dataPoints: points.length,
    latestActual: points[points.length - 1].y,
    latestDate: points[points.length - 1].date,
  }
}

/**
 * คำนวณพยากรณ์ทุก branch × KPI
 * @returns { branchName: { kpiId: { projectedValue, projectedLevel, slope, ... } } }
 */
export function computeAllForecasts(dailyLog, kpiConfig, kpiTargets, forecastDate) {
  if (!dailyLog.length || !forecastDate) return {}

  const result = {}
  const branchNames = [...new Set(dailyLog.flatMap((s) => Object.keys(s.actuals || {})))]

  for (const branchName of branchNames) {
    result[branchName] = {}
    for (const kpi of kpiConfig) {
      const fc = forecastKpiValue(dailyLog, branchName, kpi.kpi_id, forecastDate)
      if (!fc) continue

      const rawThresholds = kpiTargets[branchName]?.[kpi.kpi_id] || null
      let projectedLevel = 0
      let projectedPercent = 0

      if (rawThresholds) {
        const scored = computeBranchKpiScoreV2(fc.projectedValue, rawThresholds, kpi)
        projectedLevel = scored.level
        projectedPercent = scored.percent
      }

      result[branchName][kpi.kpi_id] = {
        ...fc,
        projectedLevel,
        projectedPercent,
        rawThresholds,
      }
    }
  }

  return result
}

/** สิ้นเดือนของ date string (YYYY-MM-DD) */
export function getEndOfMonth(dateStr) {
  const [y, m] = (dateStr || new Date().toISOString().split('T')[0]).split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return `${y}-${String(m).padStart(2,'0')}-${String(last).padStart(2,'0')}`
}

/** สิ้นปีของ date string */
export function getEndOfYear(dateStr) {
  const y = parseInt((dateStr || new Date().toISOString()).split('-')[0], 10)
  return `${y}-12-31`
}

/** วันนี้ในรูปแบบ YYYY-MM-DD */
export function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}
