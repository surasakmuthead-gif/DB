import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'
import { BRANCHES } from '../../data/sampleData'
import {
  forecastKpiValue, computeBranchKpiScoreV2,
  getEndOfMonth, getEndOfYear, getTodayStr,
  formatNumber, getScoreLevelColor,
} from '../../data/transformer'

const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const LEVEL_COLORS = ['#6B7280','#EF4444','#F97316','#F59E0B','#22C55E','#10B981']

function shortDateLabel(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const thaiY = y + 543
  return `${d}/${m}/${thaiY}`
}

function longDateLabel(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${THAI_MONTHS[m-1]} ${y+543}`
}

// ─── Custom Tooltip ───
function CustomTooltip({ active, payload, label, kpi }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs shadow-xl"
      style={{
        backgroundColor: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        color: 'var(--c-text-1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="font-semibold mb-1.5" style={{ color: 'var(--c-text-2)' }}>{label}</p>
      {payload.map((p) => (
        p.value !== null && p.value !== undefined && (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span style={{ color: 'var(--c-text-2)' }}>
              {p.dataKey === 'actual' ? 'ผลงานจริง' : 'พยากรณ์'}:
            </span>
            <span className="font-mono font-semibold ml-1">
              {formatNumber(p.value, kpi?.unit)} {kpi?.unit}
            </span>
          </div>
        )
      ))}
    </div>
  )
}

export default function DailyTrendChart({ dailyLog, kpiConfig, kpiTargets, defaultBranch }) {
  const [selectedKpi, setSelectedKpi] = useState(kpiConfig[0]?.kpi_id || '')
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch || 'province')
  const [showForecast, setShowForecast] = useState(true)
  const [forecastTo, setForecastTo] = useState('endOfMonth')

  const kpi = useMemo(() => kpiConfig.find((k) => k.kpi_id === selectedKpi), [kpiConfig, selectedKpi])
  const today = getTodayStr()
  const forecastDate = forecastTo === 'endOfMonth' ? getEndOfMonth(today) : getEndOfYear(today)

  // ─── Historical chart data ───
  const historicalData = useMemo(() => {
    if (!dailyLog.length || !kpi) return []

    const dates = [...new Set(dailyLog.map((s) => s.date))].sort()

    return dates.map((date) => {
      const snap = dailyLog.find((s) => s.date === date)
      if (!snap) return null

      let actual = null
      if (selectedBranch === 'province') {
        // Province = ผลรวม (ยกเว้น % unit ใช้ค่าเฉลี่ย)
        const vals = Object.values(snap.actuals || {})
          .map((b) => b[selectedKpi])
          .filter((v) => v !== undefined && v !== null)
        if (vals.length > 0) {
          actual = kpi.unit === '%'
            ? vals.reduce((s, v) => s + v, 0) / vals.length
            : vals.reduce((s, v) => s + v, 0)
        }
      } else {
        actual = snap.actuals?.[selectedBranch]?.[selectedKpi] ?? null
      }

      return { date, label: shortDateLabel(date), actual }
    }).filter(Boolean)
  }, [dailyLog, selectedKpi, selectedBranch, kpi])

  // ─── Forecast extension ───
  const forecastData = useMemo(() => {
    if (!showForecast || historicalData.length < 2 || !kpi) return []

    // Build mini log for regression
    const miniLog = historicalData
      .filter((d) => d.actual !== null)
      .map((d) => ({
        date: d.date,
        actuals: { _key: { [selectedKpi]: d.actual } },
      }))

    if (miniLog.length < 2) return []

    // Generate weekly forecast points from last actual to forecastDate
    const lastDate = miniLog[miniLog.length - 1].date
    const result = []

    // Start from day after last actual
    let cur = new Date(lastDate)
    const end = new Date(forecastDate)

    // First point = last actual (connects the lines visually)
    const lastActual = historicalData.find((d) => d.date === lastDate)?.actual ?? 0
    result.push({ date: lastDate, label: shortDateLabel(lastDate), forecast: lastActual })

    // Intermediate points (every 3 days or fewer for short periods)
    const totalDays = Math.floor((end - cur) / 86_400_000)
    const step = totalDays <= 14 ? 3 : totalDays <= 60 ? 7 : 14

    cur.setDate(cur.getDate() + step)
    while (cur < end) {
      const dateStr = cur.toISOString().split('T')[0]
      const fc = forecastKpiValue(miniLog, '_key', selectedKpi, dateStr)
      if (fc) {
        result.push({ date: dateStr, label: shortDateLabel(dateStr), forecast: Math.max(0, fc.projectedValue) })
      }
      cur.setDate(cur.getDate() + step)
    }

    // Exact end date
    const fcEnd = forecastKpiValue(miniLog, '_key', selectedKpi, forecastDate)
    if (fcEnd) {
      result.push({ date: forecastDate, label: shortDateLabel(forecastDate), forecast: Math.max(0, fcEnd.projectedValue) })
    }

    return result
  }, [historicalData, selectedKpi, showForecast, forecastDate, kpi])

  // ─── Merged chart data ───
  const chartData = useMemo(() => {
    const map = new Map()
    historicalData.forEach((d) => map.set(d.date, { ...d }))
    forecastData.forEach((d) => {
      if (map.has(d.date)) {
        map.get(d.date).forecast = d.forecast
      } else {
        map.set(d.date, { date: d.date, label: d.label, forecast: d.forecast, actual: null })
      }
    })
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
  }, [historicalData, forecastData])

  // ─── Thresholds for branch-specific reference lines ───
  const thresholds = selectedBranch !== 'province'
    ? kpiTargets[selectedBranch]?.[selectedKpi] || null
    : null

  // ─── Forecast summary ───
  const forecastSummary = useMemo(() => {
    if (!showForecast || forecastData.length < 2 || !kpi) return null
    const endFc = forecastData[forecastData.length - 1]
    if (!endFc) return null

    const projectedValue = endFc.forecast
    let projectedLevel = 0
    if (thresholds) {
      const scored = computeBranchKpiScoreV2(projectedValue, thresholds, kpi)
      projectedLevel = scored.level
    }

    const lastActual = historicalData.filter((d) => d.actual !== null).slice(-1)[0]?.actual ?? 0
    const change = projectedValue - lastActual
    const slope = forecastData.length >= 2
      ? (forecastData[forecastData.length-1].forecast - forecastData[0].forecast) /
        Math.max(1, forecastData.length - 1)
      : 0

    return { projectedValue, projectedLevel, change, slope }
  }, [showForecast, forecastData, thresholds, kpi, historicalData])

  // ─── Empty state ───
  if (!dailyLog.length) {
    return (
      <div className="card p-8 flex flex-col items-center gap-3 text-center">
        <BarChart2 size={36} style={{ color: 'var(--c-text-2)', opacity: 0.4 }} />
        <p className="text-sm font-medium" style={{ color: 'var(--c-text-2)' }}>
          ยังไม่มีข้อมูลรายวัน
        </p>
        <p className="text-xs" style={{ color: 'var(--c-text-2)', opacity: 0.7 }}>
          อัปโหลดไฟล์ Excel ในหน้า Admin → อัปโหลดข้อมูล เพื่อเริ่มบันทึกแนวโน้ม
        </p>
      </div>
    )
  }

  return (
    <div className="card p-4 space-y-3">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} style={{ color: 'var(--c-accent)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--c-text-1)' }}>
            แนวโน้มผลงานรายวัน
          </h3>
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--c-surface-alt)', color: 'var(--c-text-2)' }}>
            {dailyLog.length} วัน
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* KPI Selector */}
          <select
            className="input-field text-xs w-auto"
            value={selectedKpi}
            onChange={(e) => setSelectedKpi(e.target.value)}
          >
            {kpiConfig.map((k) => (
              <option key={k.kpi_id} value={k.kpi_id}>
                {k.kpi_id.replace('kpi_', '')}. {k.kpi_name}
              </option>
            ))}
          </select>

          {/* Branch Selector */}
          <select
            className="input-field text-xs w-auto"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="province">📊 ภาพรวม สนจ.</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          {/* Forecast toggle */}
          <label
            className="flex items-center gap-1.5 text-xs cursor-pointer px-2.5 py-1.5 rounded-lg"
            style={{ backgroundColor: showForecast ? 'color-mix(in srgb, #F59E0B 15%, transparent)' : 'var(--c-surface-alt)', color: showForecast ? '#F59E0B' : 'var(--c-text-2)' }}
          >
            <input
              type="checkbox"
              checked={showForecast}
              onChange={(e) => setShowForecast(e.target.checked)}
              className="w-3 h-3"
            />
            พยากรณ์
          </label>

          {showForecast && (
            <select
              className="input-field text-xs w-auto"
              value={forecastTo}
              onChange={(e) => setForecastTo(e.target.value)}
            >
              <option value="endOfMonth">ถึงสิ้นเดือน</option>
              <option value="endOfYear">ถึงสิ้นปี</option>
            </select>
          )}
        </div>
      </div>

      {/* ─── Chart ─── */}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--c-text-2)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--c-border)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: 'var(--c-text-2)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--c-border)' }}
            tickLine={false}
            width={50}
            tickFormatter={(v) => formatNumber(v, kpi?.unit)}
          />
          <Tooltip content={<CustomTooltip kpi={kpi} />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--c-text-2)', paddingTop: 4 }}
            formatter={(v) => v === 'actual' ? 'ผลงานจริง' : 'พยากรณ์'}
          />

          {/* Threshold reference lines */}
          {thresholds && [1,2,3,4,5].map((n, i) => (
            thresholds[`v${n}`] > 0 ? (
              <ReferenceLine
                key={n}
                y={thresholds[`v${n}`]}
                stroke={LEVEL_COLORS[i+1]}
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{
                  value: `ค่า${n}`,
                  fill: LEVEL_COLORS[i+1],
                  fontSize: 9,
                  position: 'insideTopRight',
                }}
              />
            ) : null
          ))}

          {/* Today marker */}
          <ReferenceLine
            x={shortDateLabel(today)}
            stroke="var(--c-accent)"
            strokeDasharray="4 3"
            strokeOpacity={0.6}
            label={{ value: 'วันนี้', fill: 'var(--c-accent)', fontSize: 9, position: 'insideTopLeft' }}
          />

          {/* Actual */}
          <Line
            type="monotone"
            dataKey="actual"
            name="actual"
            stroke="var(--c-accent)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--c-accent)', r: 3.5, strokeWidth: 0 }}
            activeDot={{ r: 5.5 }}
            connectNulls={false}
          />

          {/* Forecast (dotted) */}
          {showForecast && (
            <Line
              type="monotone"
              dataKey="forecast"
              name="forecast"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* ─── Forecast Summary Badge ─── */}
      {forecastSummary && (
        <div
          className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-xl text-xs"
          style={{ backgroundColor: 'var(--c-surface-alt)' }}
        >
          <span style={{ color: 'var(--c-text-2)' }}>
            พยากรณ์ ณ <strong style={{ color: 'var(--c-text-1)' }}>{longDateLabel(forecastDate)}</strong>:
          </span>
          <span className="font-mono font-bold" style={{ color: 'var(--c-text-1)' }}>
            {formatNumber(forecastSummary.projectedValue, kpi?.unit)} {kpi?.unit}
          </span>
          {forecastSummary.projectedLevel > 0 && (
            <span
              className="font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: LEVEL_COLORS[forecastSummary.projectedLevel] }}
            >
              ระดับ {forecastSummary.projectedLevel}
            </span>
          )}
          <span style={{ color: forecastSummary.change >= 0 ? '#10B981' : '#EF4444' }}>
            {forecastSummary.change >= 0 ? '▲' : '▼'}{' '}
            {formatNumber(Math.abs(forecastSummary.change), kpi?.unit)} {kpi?.unit}
            {' '}จากวันล่าสุด
          </span>
          <span
            className="ml-auto font-semibold"
            style={{
              color: forecastSummary.projectedLevel >= 5
                ? '#10B981'
                : forecastSummary.projectedLevel >= 3
                  ? '#F59E0B'
                  : '#EF4444',
            }}
          >
            {forecastSummary.projectedLevel >= 5
              ? '🎯 จะถึงเป้าหมาย'
              : forecastSummary.projectedLevel >= 3
                ? '⚡ ใกล้เคียงเป้า'
                : '⚠️ ต้องเร่งผลงาน'}
          </span>
        </div>
      )}
    </div>
  )
}
