import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Save, X, Download, Upload,
  Settings, Calendar, FileSpreadsheet, Target, Copy,
} from 'lucide-react'
import {
  loadKpiConfig, saveKpiConfig, loadDefaultKpiConfig,
  loadBranchData, saveBranchData, appendHistory,
  parseExcelFile, mapExcelToBranchData,
  extractFullDateFromFilename,
  appendDailySnapshot,
  generateExcelTemplate,
  loadKpiTargets, saveKpiTargets,
  loadDailyLog, clearDailyLog,
  computeAllBranchScores, rankBranches, exportKpiSummaryExcel,
} from '../../data/transformer'
import { BRANCHES } from '../../data/sampleData'
import AdminPinGate from './AdminPinGate'

// ─── Tab Config ───
const TABS = [
  { id: 'upload',   label: 'อัปโหลดข้อมูล',  Icon: FileSpreadsheet },
  { id: 'kpi',      label: 'จัดการ KPI',        Icon: Settings },
  { id: 'targets',  label: 'เกณฑ์รายสาขา',    Icon: Target },
]

// สีประจำระดับ (ค่า 1–5)
const LEVEL_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#22C55E', '#10B981']

const EMPTY_KPI = {
  kpi_id: '',
  kpi_name: '',
  unit: 'ราย',
  weight: 1.0,
  max_score: 5,
  category: '',
  display_size: 'small',
  thresholds: { score_1: 0, score_2: 0, score_3: 0, score_4: 0, score_5: 0 },
}

export default function AdminSettings() {
  // ─── Change 1: PIN Gate — always false on mount, no sessionStorage ───
  const [authenticated, setAuthenticated] = useState(false)

  // ─── Tabs ───
  const [activeTab, setActiveTab] = useState('upload')

  // ─── KPI Config ───
  const [kpiConfig, setKpiConfig] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingKpi, setEditingKpi] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_KPI })

  // ─── Branch Targets (Change 2) ───
  const [kpiTargets, setKpiTargets] = useState({})       // { branchName: { kpiId: { v1..v5 } } }
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0])
  const [copyFrom, setCopyFrom] = useState('')
  const [editingTargets, setEditingTargets] = useState({}) // { kpiId: { v1..v5 } } ของสาขาที่เลือก

  // ─── Upload ───
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [periodLabel, setPeriodLabel] = useState('')
  const [detectedDate, setDetectedDate] = useState(null)  // { date, label, period } จาก filename
  const [dailyLogCount, setDailyLogCount] = useState(0)

  // ─── Flash message ───
  const [saveMsg, setSaveMsg] = useState(null)
  const flash = useCallback((msg) => {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(null), 2800)
  }, [])

  // ─── Load on auth ───
  useEffect(() => {
    if (!authenticated) return
    ;(async () => {
      let config = loadKpiConfig()
      if (!config) config = await loadDefaultKpiConfig()
      setKpiConfig(config)
      setKpiTargets(loadKpiTargets())
      setDailyLogCount(loadDailyLog().length)
    })()
  }, [authenticated])

  // ─── Sync editingTargets เมื่อเปลี่ยนสาขาหรือ kpiConfig ───
  useEffect(() => {
    if (!kpiConfig.length) return
    const branchData = kpiTargets[selectedBranch] || {}
    const init = {}
    for (const kpi of kpiConfig) {
      init[kpi.kpi_id] = branchData[kpi.kpi_id]
        ? { ...branchData[kpi.kpi_id] }
        : { v1: 0, v2: 0, v3: 0, v4: 0, v5: 0 }
    }
    setEditingTargets(init)
  }, [selectedBranch, kpiConfig, kpiTargets])

  // ─── Template Download ───
  const handleDownloadTemplate = useCallback(() => {
    if (!kpiConfig.length) { flash('โหลด KPI Config ก่อนดาวน์โหลด Template'); return }
    const arrayBuffer = generateExcelTemplate(kpiConfig, BRANCHES)
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '_')
    a.href = url; a.download = `BAAC_KPI_Template_${today}.xlsx`; a.click()
    URL.revokeObjectURL(url)
  }, [kpiConfig])

  // ─── Upload Handler (เพิ่ม daily snapshot) ───
  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg(null)
    try {
      const rows = await parseExcelFile(file)
      const mapped = mapExcelToBranchData(rows, kpiConfig)
      saveBranchData(mapped)

      // ดึงวันที่จากชื่อไฟล์ (รองรับทั้ง รายวัน และ รายเดือน)
      const extracted = extractFullDateFromFilename(file.name)
      let date = null, label = null, period = selectedPeriod || null

      if (extracted) {
        date = extracted.date
        label = extracted.label
        period = selectedPeriod || extracted.period
        if (!periodLabel && extracted.label) setPeriodLabel(extracted.label)
        setDetectedDate(extracted)
      } else {
        // Fallback: วันนี้
        const today = new Date()
        date = today.toISOString().split('T')[0]
        label = `${today.getDate()} ${['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][today.getMonth()]} ${today.getFullYear()+543}`
        period = period || `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`
        setDetectedDate({ date, label, period })
      }

      // 1) บันทึก snapshot รายวัน (สะสมต่อกัน, ไม่ overwrite เดือน)
      appendDailySnapshot(date, label, period, mapped)

      // 2) บันทึก monthly summary (สำหรับ HistoryChart รายเดือน)
      if (period) appendHistory(period, periodLabel || label, mapped, kpiConfig)

      setDailyLogCount(loadDailyLog().length)
      setUploadMsg({ type: 'success', text: `✓ อัปโหลดสำเร็จ: ${mapped.length} สาขา  |  ${label}` })
    } catch (err) {
      setUploadMsg({ type: 'error', text: `✗ ${err.message}` })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }, [kpiConfig, selectedPeriod, periodLabel])

  // ─── Daily Log ───
  const handleClearDailyLog = useCallback(() => {
    if (!confirm(`ล้าง Daily Log ทั้งหมด ${dailyLogCount} วัน?\nข้อมูล Forecast จะหายถาวร`)) return
    clearDailyLog()
    setDailyLogCount(0)
    flash('ล้าง Daily Log เรียบร้อย')
  }, [dailyLogCount, flash])

  const handleExportSummary = useCallback(() => {
    if (!kpiConfig.length) { flash('โหลด KPI Config ก่อน'); return }
    const branchData = loadBranchData()
    if (!branchData?.length) { flash('ยังไม่มีข้อมูลสาขา — อัปโหลด Excel ก่อน'); return }
    const ranked = rankBranches(computeAllBranchScores(branchData, kpiConfig, kpiTargets))
    const buffer = exportKpiSummaryExcel(ranked, kpiConfig)
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '_')
    a.href = url; a.download = `BAAC_KPI_Summary_${today}.xlsx`; a.click()
    URL.revokeObjectURL(url)
  }, [kpiConfig, kpiTargets, flash])

  // ─── KPI CRUD ───
  const openAdd = () => {
    const nextNum = kpiConfig.length + 1
    setForm({ ...EMPTY_KPI, kpi_id: `kpi_${String(nextNum).padStart(2, '0')}` })
    setEditingKpi(null)
    setModalOpen(true)
  }
  const openEdit = (kpi) => {
    setForm({ ...kpi, thresholds: { ...kpi.thresholds } })
    setEditingKpi(kpi.kpi_id)
    setModalOpen(true)
  }
  const handleDelete = (kpiId) => {
    if (!confirm(`ลบ KPI "${kpiId}" ?`)) return
    const updated = kpiConfig.filter((k) => k.kpi_id !== kpiId)
    setKpiConfig(updated)
    saveKpiConfig(updated)
    flash('ลบ KPI เรียบร้อย')
  }
  const handleSaveKpi = () => {
    if (!form.kpi_id || !form.kpi_name) { alert('กรุณากรอก ID และ ชื่อ KPI'); return }
    let updated
    if (editingKpi) {
      updated = kpiConfig.map((k) => (k.kpi_id === editingKpi ? { ...form } : k))
    } else {
      if (kpiConfig.find((k) => k.kpi_id === form.kpi_id)) { alert(`KPI ID "${form.kpi_id}" ซ้ำ`); return }
      updated = [...kpiConfig, { ...form }]
    }
    setKpiConfig(updated)
    saveKpiConfig(updated)
    setModalOpen(false)
    flash(editingKpi ? 'แก้ไข KPI เรียบร้อย' : 'เพิ่ม KPI เรียบร้อย')
  }
  const handleExportKpi = () => {
    const blob = new Blob([JSON.stringify(kpiConfig, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'kpi-config.json'; a.click()
    URL.revokeObjectURL(url)
  }
  const handleImportKpi = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (Array.isArray(data)) { setKpiConfig(data); saveKpiConfig(data); flash(`นำเข้า ${data.length} KPI สำเร็จ`) }
      } catch { alert('ไฟล์ JSON ไม่ถูกต้อง') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }
  const handleResetKpi = async () => {
    if (!confirm('รีเซ็ตค่า KPI ทั้งหมดกลับเป็นค่าเริ่มต้น?')) return
    const config = await loadDefaultKpiConfig()
    setKpiConfig(config)
    flash('รีเซ็ต KPI เรียบร้อย')
  }

  // ─── Branch Targets (Change 2) ───
  const updateTarget = (kpiId, field, value) => {
    setEditingTargets((prev) => ({
      ...prev,
      [kpiId]: {
        ...(prev[kpiId] || { v1: 0, v2: 0, v3: 0, v4: 0, v5: 0 }),
        [field]: parseFloat(value) || 0,
      },
    }))
  }
  const saveTargets = () => {
    const updated = { ...kpiTargets, [selectedBranch]: editingTargets }
    setKpiTargets(updated)
    saveKpiTargets(updated)
    flash(`✓ บันทึกเกณฑ์ ${selectedBranch} เรียบร้อย`)
  }
  const handleCopyTargets = () => {
    if (!copyFrom) { flash('กรุณาเลือกสาขาต้นทางก่อน'); return }
    const src = kpiTargets[copyFrom]
    if (!src) { flash(`${copyFrom} ยังไม่มีข้อมูลเกณฑ์`); return }
    const init = {}
    for (const kpi of kpiConfig) {
      init[kpi.kpi_id] = src[kpi.kpi_id] ? { ...src[kpi.kpi_id] } : { v1: 0, v2: 0, v3: 0, v4: 0, v5: 0 }
    }
    setEditingTargets(init)
    flash(`คัดลอกจาก ${copyFrom} แล้ว — กด "บันทึก" เพื่อยืนยัน`)
  }
  const handleExportTargets = () => {
    const blob = new Blob([JSON.stringify(kpiTargets, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'kpi-targets.json'; a.click()
    URL.revokeObjectURL(url)
  }

  // ─── PIN Gate Screen ───
  if (!authenticated) {
    return <AdminPinGate onSuccess={() => setAuthenticated(true)} />
  }

  return (
    <div className="space-y-4">

      {/* ────── Header + Tab Bar ────── */}
      <div className="card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} style={{ color: 'var(--c-accent)' }} />
            <h1 className="text-sm font-bold" style={{ color: 'var(--c-text-1)' }}>Admin Panel</h1>
          </div>
          {saveMsg && (
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--c-accent)', animation: 'fadeIn 0.2s ease' }}
            >
              {saveMsg}
            </span>
          )}
        </div>
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors"
              style={{ color: activeTab === id ? 'var(--c-accent)' : 'var(--c-text-2)' }}
            >
              <Icon size={14} />
              {label}
              {activeTab === id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--c-accent)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Tab 1: อัปโหลดข้อมูล
      ═══════════════════════════════════════════════ */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          {/* ─── Upload Card ─── */}
          <div className="card p-5">
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--c-text-1)' }}>
              อัปโหลดข้อมูลผลงานรายวัน (Excel / CSV)
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {/* Template Download */}
              <button
                className="btn-secondary flex items-center gap-2 text-sm"
                onClick={handleDownloadTemplate}
                title="ดาวน์โหลดไฟล์ต้นแบบสำหรับกรอกข้อมูล"
              >
                <Download size={15} />
                ดาวน์โหลด Template
              </button>

              {/* Upload */}
              <label className="btn-primary flex items-center gap-2 text-sm cursor-pointer">
                <Upload size={15} />
                {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด Excel'}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Detected date badge */}
            {detectedDate && (
              <div
                className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'color-mix(in srgb, var(--c-accent) 10%, transparent)', color: 'var(--c-accent)' }}
              >
                <Calendar size={13} />
                <span>ตรวจพบวันที่: <strong>{detectedDate.label}</strong>  (date: {detectedDate.date})</span>
              </div>
            )}

            {/* Upload message */}
            {uploadMsg && (
              <div
                className={`mt-3 text-sm font-medium px-3 py-2 rounded-lg ${uploadMsg.type === 'success' ? 'num-positive' : 'num-negative'}`}
                style={{ backgroundColor: uploadMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}
              >
                {uploadMsg.text}
              </div>
            )}
          </div>

          {/* ─── Daily Log Status + Actions ─── */}
          <div className="card p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: 'var(--c-text-2)' }} />
              <span className="text-sm" style={{ color: 'var(--c-text-2)' }}>
                Daily Log: <strong style={{ color: 'var(--c-text-1)' }}>{dailyLogCount} วัน</strong>
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                className="btn-secondary flex items-center gap-1.5 text-sm"
                onClick={handleClearDailyLog}
                disabled={dailyLogCount === 0}
                title="ลบข้อมูล Daily Log ทั้งหมด (Forecast จะถูกรีเซ็ต)"
              >
                <Trash2 size={13} />
                ล้าง Daily Log
              </button>
              <button
                className="btn-primary flex items-center gap-1.5 text-sm"
                onClick={handleExportSummary}
                title="Export สรุปคะแนน KPI รายสาขาทุก KPI เป็น Excel"
              >
                <FileSpreadsheet size={13} />
                Export สรุปคะแนน
              </button>
            </div>
          </div>

          {/* ─── Format Guide Card ─── */}
          <div className="card p-4 text-sm" style={{ color: 'var(--c-text-2)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--c-text-1)' }}>📋 รูปแบบ Excel ที่รองรับ:</p>
            <div className="space-y-1">
              <p>• แถวแรก = Header เช่น{' '}
                <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--c-surface-alt)', color: 'var(--c-accent)' }}>
                  Branch_Name, KPI_01_Actual, KPI_02_Actual, ...
                </code>
              </p>
              <p>• ดาวน์โหลด Template จากปุ่มด้านบน ระบบสร้าง Header ถูกต้องให้อัตโนมัติ</p>
              <p className="font-medium mt-2" style={{ color: 'var(--c-text-1)' }}>📅 รูปแบบชื่อไฟล์สำหรับดึงวันที่อัตโนมัติ:</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1">
                {[
                  ['Data_2026_06_06.xlsx', '→ 6 มิ.ย. 2569'],
                  ['KPI_06-06-2026.xlsx',  '→ 6 มิ.ย. 2569'],
                  ['Report_20260606.xlsx', '→ 6 มิ.ย. 2569'],
                  ['Data_2026_06.xlsx',    '→ ใช้วันปัจจุบัน'],
                ].map(([fn, result]) => (
                  <div key={fn} className="flex items-center gap-2">
                    <code className="text-xs px-1 rounded" style={{ backgroundColor: 'var(--c-surface-alt)', color: 'var(--c-accent)' }}>{fn}</code>
                    <span className="text-xs">{result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Tab 2: จัดการ KPI (Change 3: ลด columns)
      ═══════════════════════════════════════════════ */}
      {activeTab === 'kpi' && (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={openAdd}>
              <Plus size={14} /> เพิ่ม KPI
            </button>
            <button className="btn-secondary flex items-center gap-1.5 text-sm" onClick={handleExportKpi}>
              <Download size={14} /> ส่งออก JSON
            </button>
            <label className="btn-secondary flex items-center gap-1.5 text-sm cursor-pointer">
              <Upload size={14} /> นำเข้า JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImportKpi} />
            </label>
            <button className="btn-secondary text-sm" onClick={handleResetKpi}>
              รีเซ็ตค่าเริ่มต้น
            </button>
            <span className="text-xs ml-auto" style={{ color: 'var(--c-text-2)' }}>
              {kpiConfig.length} ตัวชี้วัด
            </span>
          </div>

          {/* Change 3: ลบ หมวด, คะแนนเต็ม, ขนาดการ์ด ออกจากตาราง */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-center w-14">ID</th>
                    <th className="text-left">ชื่อ KPI</th>
                    <th className="text-center">หน่วย</th>
                    <th className="text-center">น้ำหนัก</th>
                    <th className="text-center w-24">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiConfig.map((kpi) => (
                    <tr key={kpi.kpi_id}>
                      <td
                        className="text-center font-mono font-bold"
                        style={{ color: 'var(--c-accent)' }}
                      >
                        {kpi.kpi_id.replace('kpi_', '')}
                      </td>
                      <td className="text-left font-medium" style={{ color: 'var(--c-text-1)' }}>
                        {kpi.kpi_name}
                      </td>
                      <td className="text-center text-sm">{kpi.unit}</td>
                      <td className="text-center font-mono">{kpi.weight}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEdit(kpi)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: 'var(--c-accent)' }}
                            title="แก้ไข"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(kpi.kpi_id)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: '#EF4444' }}
                            title="ลบ"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--c-text-2)' }}>
            💡 ตั้งค่าเกณฑ์คะแนน (ค่า 1–5) รายสาขาได้ที่แท็บ <strong>"เกณฑ์รายสาขา"</strong>
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Tab 3: เกณฑ์รายสาขา (Change 2: NEW)
      ═══════════════════════════════════════════════ */}
      {activeTab === 'targets' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="card p-4 flex flex-wrap items-center gap-3">
            {/* Branch Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--c-text-2)' }}>
                สาขา:
              </label>
              <select
                className="input-field text-sm w-auto"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Copy From */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--c-text-2)' }}>
                คัดลอกจาก:
              </label>
              <select
                className="input-field text-sm w-auto"
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
              >
                <option value="">-- เลือกสาขาต้นทาง --</option>
                {BRANCHES.filter((b) => b !== selectedBranch).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <button
                className="btn-secondary flex items-center gap-1.5 text-sm"
                onClick={handleCopyTargets}
              >
                <Copy size={13} /> คัดลอก
              </button>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                className="btn-secondary flex items-center gap-1.5 text-sm"
                onClick={handleExportTargets}
              >
                <Download size={13} /> Export ทั้งหมด
              </button>
              <button
                className="btn-primary flex items-center gap-2 text-sm"
                onClick={saveTargets}
              >
                <Save size={14} />
                บันทึก {selectedBranch.replace('สาขา', 'สาขา')}
              </button>
            </div>
          </div>

          {/* Threshold Table — inline editable */}
          <div className="card overflow-hidden">
            {/* Table Header Info */}
            <div
              className="px-4 py-2.5 border-b flex items-center gap-2 flex-wrap"
              style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface-alt)' }}
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--c-text-2)' }}>
                เกณฑ์คะแนน KPI — {selectedBranch}
              </span>
              <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>
                (กรอกตัวเลขตามหน่วยของแต่ละ KPI · ค่า 5 = เป้าหมายสูงสุด)
              </span>
              <div className="ml-auto flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n, i) => (
                  <span
                    key={n}
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: LEVEL_COLORS[i], color: '#fff' }}
                  >
                    ค่า {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th className="text-center w-12">ID</th>
                    <th className="text-left">ชื่อ KPI</th>
                    <th className="text-center w-16">หน่วย</th>
                    {[1, 2, 3, 4, 5].map((n, i) => (
                      <th key={n} className="text-center" style={{ minWidth: '90px' }}>
                        <span className="font-bold" style={{ color: LEVEL_COLORS[i] }}>ค่า {n}</span>
                        {n === 5 && (
                          <span
                            className="text-xs block font-normal"
                            style={{ color: 'var(--c-text-2)' }}
                          >
                            (เป้าหมาย)
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kpiConfig.map((kpi) => {
                    const t = editingTargets[kpi.kpi_id] || { v1: 0, v2: 0, v3: 0, v4: 0, v5: 0 }
                    const isReverse = kpi.kpi_id === 'kpi_08'

                    return (
                      <tr key={kpi.kpi_id}>
                        <td
                          className="text-center font-mono font-bold"
                          style={{ color: 'var(--c-accent)' }}
                        >
                          {kpi.kpi_id.replace('kpi_', '')}
                        </td>
                        <td className="text-left whitespace-nowrap" style={{ color: 'var(--c-text-1)' }}>
                          <span className="font-medium">{kpi.kpi_name}</span>
                          {isReverse && (
                            <span className="ml-1.5 text-xs" style={{ color: '#F97316' }}>
                              ↓ ยิ่งน้อยยิ่งดี
                            </span>
                          )}
                        </td>
                        <td className="text-center text-xs" style={{ color: 'var(--c-text-2)' }}>
                          {kpi.unit}
                        </td>
                        {[1, 2, 3, 4, 5].map((n, i) => {
                          const val = t[`v${n}`]
                          const hasVal = val && val > 0
                          return (
                            <td key={n} className="p-1.5 text-center">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="font-mono text-sm text-center rounded transition-all"
                                style={{
                                  width: '5.2rem',
                                  padding: '0.3rem 0.35rem',
                                  backgroundColor: 'var(--c-surface-alt)',
                                  color: 'var(--c-text-1)',
                                  border: `1.5px solid ${hasVal ? LEVEL_COLORS[i] + '88' : 'var(--c-border)'}`,
                                  outline: 'none',
                                }}
                                value={val || ''}
                                placeholder="0"
                                onChange={(e) => updateTarget(kpi.kpi_id, `v${n}`, e.target.value)}
                                onFocus={(e) => { e.target.style.borderColor = LEVEL_COLORS[i]; e.target.style.boxShadow = `0 0 0 2px ${LEVEL_COLORS[i]}33` }}
                                onBlur={(e) => { e.target.style.borderColor = hasVal ? LEVEL_COLORS[i] + '88' : 'var(--c-border)'; e.target.style.boxShadow = 'none' }}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Modal: Add / Edit KPI (Change 3: ลบ fields)
      ═══════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: 'var(--c-text-1)' }}>
                {editingKpi ? `แก้ไข KPI: ${editingKpi}` : 'เพิ่ม KPI ใหม่'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--c-text-2)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* ID + Name */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--c-text-2)' }}>
                    KPI ID
                  </label>
                  <input
                    className="input-field text-sm"
                    value={form.kpi_id}
                    onChange={(e) => setForm((p) => ({ ...p, kpi_id: e.target.value }))}
                    disabled={!!editingKpi}
                    placeholder="kpi_01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--c-text-2)' }}>
                    ชื่อ KPI
                  </label>
                  <input
                    className="input-field text-sm"
                    value={form.kpi_name}
                    onChange={(e) => setForm((p) => ({ ...p, kpi_name: e.target.value }))}
                    placeholder="ชื่อตัวชี้วัด"
                  />
                </div>
              </div>

              {/* Unit + Weight เท่านั้น (Change 3: ลบ category, max_score, display_size ออก) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--c-text-2)' }}>
                    หน่วย
                  </label>
                  <input
                    className="input-field text-sm"
                    value={form.unit}
                    onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                    placeholder="ราย, ล้านบาท, %"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--c-text-2)' }}>
                    น้ำหนักคะแนน (weight)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input-field text-sm"
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div
                className="rounded-lg p-3 text-xs"
                style={{ backgroundColor: 'var(--c-surface-alt)', color: 'var(--c-text-2)' }}
              >
                💡 ตั้งค่าเกณฑ์คะแนน (ค่า 1–5) รายสาขา ได้ที่แท็บ <strong>"เกณฑ์รายสาขา"</strong> หลังบันทึก KPI นี้แล้ว
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <button className="btn-secondary text-sm" onClick={() => setModalOpen(false)}>
                  ยกเลิก
                </button>
                <button
                  className="btn-primary flex items-center gap-1.5 text-sm"
                  onClick={handleSaveKpi}
                >
                  <Save size={14} />
                  {editingKpi ? 'บันทึกการแก้ไข' : 'เพิ่ม KPI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
