import { useState, useMemo } from 'react'
import { Target, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react'
import { BRANCHES } from '../../data/sampleData'
import {
  computeAllForecasts,
  getEndOfMonth, getEndOfYear, getTodayStr,
  formatNumber, getScoreLevelColor,
} from '../../data/transformer'

const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const LEVEL_COLORS = ['#6B7280','#EF4444','#F97316','#F59E0B','#22C55E','#10B981']

function longDateLabel(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${THAI_MONTHS[m-1]} ${y+543}`
}

function TrendIcon({ slope, unit }) {
  if (Math.abs(slope) < 0.001) return <Minus size={13} style={{ color: '#94a3b8' }} />
  if (slope > 0) return <TrendingUp size={13} style={{ color: '#10B981' }} />
  return <TrendingDown size={13} style={{ color: '#EF4444' }} />
}

function LevelBadge({ level }) {
  const color = LEVEL_COLORS[Math.min(level, 5)]
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color, minWidth: '1.75rem', textAlign: 'center' }}
    >
      {level}
    </span>
  )
}

export default function ForecastPanel({ dailyLog, kpiConfig, kpiTargets }) {
  const [forecastTo, setForecastTo] = useState('endOfMonth')
  const [viewMode, setViewMode] = useState('byBranch')      // 'byBranch' | 'byKpi'
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0])
  const [selectedKpi, setSelectedKpi] = useState(kpiConfig[0]?.kpi_id || '')
  const [expandedRows, setExpandedRows] = useState(new Set())

  const today = getTodayStr()
  const forecastDate = forecastTo === 'endOfMonth' ? getEndOfMonth(today) : getEndOfYear(today)

  // ─── Compute all forecasts ───
  const allForecasts = useMemo(
    () => computeAllForecasts(dailyLog, kpiConfig, kpiTargets, forecastDate),
    [dailyLog, kpiConfig, kpiTargets, forecastDate]
  )

  const hasForecast = Object.keys(allForecasts).length > 0

  if (!hasForecast) {
    return (
      <div className="card p-8 flex flex-col items-center gap-3 text-center">
        <Target size={36} style={{ color: 'var(--c-text-2)', opacity: 0.4 }} />
        <p className="text-sm font-medium" style={{ color: 'var(--c-text-2)' }}>
          ยังไม่มีข้อมูลสำหรับพยากรณ์
        </p>
        <p className="text-xs" style={{ color: 'var(--c-text-2)', opacity: 0.7 }}>
          ต้องการข้อมูลรายวัน ≥ 2 วัน จึงจะคำนวณแนวโน้มได้
        </p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* ─── Header ─── */}
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface-alt)' }}
      >
        <div className="flex items-center gap-2">
          <Target size={15} style={{ color: 'var(--c-accent)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--c-text-1)' }}>
            พยากรณ์ผลงาน ณ {longDateLabel(forecastDate)}
          </h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* View Mode */}
          <div className="flex rounded-lg overflow-hidden text-xs" style={{ border: '1px solid var(--c-border)' }}>
            {[['byBranch','รายสาขา'],['byKpi','ราย KPI']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-1.5 transition-colors"
                style={{
                  backgroundColor: viewMode === mode ? 'var(--c-accent)' : 'transparent',
                  color: viewMode === mode ? '#fff' : 'var(--c-text-2)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Forecast To */}
          <select
            className="input-field text-xs w-auto"
            value={forecastTo}
            onChange={(e) => setForecastTo(e.target.value)}
          >
            <option value="endOfMonth">ถึงสิ้นเดือน</option>
            <option value="endOfYear">ถึงสิ้นปี</option>
          </select>
        </div>
      </div>

      {/* ─── View: By Branch (เลือกสาขา → แสดงทุก KPI) ─── */}
      {viewMode === 'byBranch' && (
        <div>
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <select
              className="input-field text-sm w-auto"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <BranchForecastTable
            branchName={selectedBranch}
            forecasts={allForecasts[selectedBranch] || {}}
            kpiConfig={kpiConfig}
            kpiTargets={kpiTargets}
          />
        </div>
      )}

      {/* ─── View: By KPI (เลือก KPI → แสดงทุกสาขา) ─── */}
      {viewMode === 'byKpi' && (
        <div>
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <select
              className="input-field text-sm w-auto"
              value={selectedKpi}
              onChange={(e) => setSelectedKpi(e.target.value)}
            >
              {kpiConfig.map((k) => (
                <option key={k.kpi_id} value={k.kpi_id}>
                  {k.kpi_id.replace('kpi_','')}. {k.kpi_name}
                </option>
              ))}
            </select>
          </div>
          <KpiForecastTable
            kpiId={selectedKpi}
            kpiConfig={kpiConfig}
            allForecasts={allForecasts}
            kpiTargets={kpiTargets}
          />
        </div>
      )}

      {/* ─── Legend ─── */}
      <div
        className="px-5 py-2.5 border-t flex items-center gap-4 text-xs flex-wrap"
        style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-2)' }}
      >
        <span className="font-medium" style={{ color: 'var(--c-text-1)' }}>ระดับ:</span>
        {[1,2,3,4,5].map((n) => (
          <span key={n} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: LEVEL_COLORS[n] }} />
            ระดับ {n}
          </span>
        ))}
        <span className="ml-auto opacity-60">⚠ พยากรณ์อิงจาก Linear Regression · ข้อมูลน้อย = ความแม่นยำต่ำ</span>
      </div>
    </div>
  )
}

// ─── Branch → all KPI table ───
function BranchForecastTable({ branchName, forecasts, kpiConfig, kpiTargets }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-left w-10">ID</th>
            <th className="text-left">ชื่อ KPI</th>
            <th className="text-center">หน่วย</th>
            <th className="text-right">ผลงานล่าสุด</th>
            <th className="text-right">ค่าพยากรณ์</th>
            <th className="text-center">ระดับพยากรณ์</th>
            <th className="text-center">แนวโน้ม/วัน</th>
            <th className="text-center">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {kpiConfig.map((kpi) => {
            const fc = forecasts[kpi.kpi_id]
            const hasThresholds = !!kpiTargets[branchName]?.[kpi.kpi_id]

            if (!fc) {
              return (
                <tr key={kpi.kpi_id}>
                  <td className="text-center font-mono font-bold" style={{ color: 'var(--c-accent)' }}>
                    {kpi.kpi_id.replace('kpi_','')}
                  </td>
                  <td className="text-left" style={{ color: 'var(--c-text-1)' }}>{kpi.kpi_name}</td>
                  <td colSpan={6} className="text-center text-xs" style={{ color: 'var(--c-text-2)' }}>
                    — ไม่มีข้อมูล —
                  </td>
                </tr>
              )
            }

            const statusColor = fc.projectedLevel >= 5 ? '#10B981' : fc.projectedLevel >= 3 ? '#F59E0B' : '#EF4444'
            const statusText = fc.projectedLevel >= 5 ? '🎯 ถึงเป้า' : fc.projectedLevel >= 3 ? '⚡ ใกล้เคียง' : '⚠️ เสี่ยง'

            return (
              <tr key={kpi.kpi_id}>
                <td className="text-center font-mono font-bold" style={{ color: 'var(--c-accent)' }}>
                  {kpi.kpi_id.replace('kpi_','')}
                </td>
                <td className="text-left font-medium" style={{ color: 'var(--c-text-1)' }}>{kpi.kpi_name}</td>
                <td className="text-center text-xs" style={{ color: 'var(--c-text-2)' }}>{kpi.unit}</td>
                <td className="text-right font-mono">{formatNumber(fc.latestActual, kpi.unit)}</td>
                <td className="text-right font-mono font-semibold" style={{ color: 'var(--c-text-1)' }}>
                  {formatNumber(fc.projectedValue, kpi.unit)}
                </td>
                <td className="text-center">
                  {hasThresholds ? (
                    <LevelBadge level={fc.projectedLevel} />
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>ไม่มีเกณฑ์</span>
                  )}
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendIcon slope={fc.slope} unit={kpi.unit} />
                    <span className="font-mono text-xs" style={{ color: fc.slope >= 0 ? '#10B981' : '#EF4444' }}>
                      {fc.slope >= 0 ? '+' : ''}{formatNumber(fc.slope, kpi.unit)}/d
                    </span>
                  </div>
                </td>
                <td className="text-center text-xs font-semibold" style={{ color: statusColor }}>
                  {hasThresholds ? statusText : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── KPI → all branches table ───
function KpiForecastTable({ kpiId, kpiConfig, allForecasts, kpiTargets }) {
  const kpi = kpiConfig.find((k) => k.kpi_id === kpiId)
  if (!kpi) return null

  const rows = BRANCHES.map((branch) => {
    const fc = allForecasts[branch]?.[kpiId]
    const hasThresholds = !!kpiTargets[branch]?.[kpiId]
    return { branch, fc, hasThresholds }
  })

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="text-left">สาขา</th>
            <th className="text-right">ผลงานล่าสุด</th>
            <th className="text-right">ค่าพยากรณ์</th>
            <th className="text-center">ระดับพยากรณ์</th>
            <th className="text-center">แนวโน้ม/วัน</th>
            <th className="text-center">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ branch, fc, hasThresholds }) => {
            if (!fc) {
              return (
                <tr key={branch}>
                  <td className="text-left font-medium" style={{ color: 'var(--c-text-1)' }}>{branch}</td>
                  <td colSpan={5} className="text-center text-xs" style={{ color: 'var(--c-text-2)' }}>
                    — ไม่มีข้อมูล —
                  </td>
                </tr>
              )
            }

            const statusColor = fc.projectedLevel >= 5 ? '#10B981' : fc.projectedLevel >= 3 ? '#F59E0B' : '#EF4444'
            const statusText = fc.projectedLevel >= 5 ? '🎯 ถึงเป้า' : fc.projectedLevel >= 3 ? '⚡ ใกล้เคียง' : '⚠️ เสี่ยง'

            return (
              <tr key={branch}>
                <td className="text-left font-medium" style={{ color: 'var(--c-text-1)' }}>{branch}</td>
                <td className="text-right font-mono">{formatNumber(fc.latestActual, kpi.unit)}</td>
                <td className="text-right font-mono font-semibold" style={{ color: 'var(--c-text-1)' }}>
                  {formatNumber(fc.projectedValue, kpi.unit)}
                </td>
                <td className="text-center">
                  {hasThresholds ? (
                    <LevelBadge level={fc.projectedLevel} />
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>ไม่มีเกณฑ์</span>
                  )}
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendIcon slope={fc.slope} />
                    <span className="font-mono text-xs" style={{ color: fc.slope >= 0 ? '#10B981' : '#EF4444' }}>
                      {fc.slope >= 0 ? '+' : ''}{formatNumber(fc.slope, kpi.unit)}/d
                    </span>
                  </div>
                </td>
                <td className="text-center text-xs font-semibold" style={{ color: statusColor }}>
                  {hasThresholds ? statusText : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
