import { formatNumber, getPerformanceColor } from '../../data/transformer'

const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export default function KpiCardLarge({ kpi, summary, historyLog }) {
  const percent = summary?.percent || 0
  const color = getPerformanceColor(percent)

  const monthlyData = historyLog
    .filter((h) => h.summary && h.summary[kpi.kpi_id])
    .map((h) => ({
      label: h.label,
      value: h.summary[kpi.kpi_id].percent,
    }))

  return (
    <div className="card p-5 col-span-full lg:col-span-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: 'var(--c-accent)', color: '#fff' }}
          >
            {kpi.kpi_id.replace('kpi_', '')}
          </span>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text-1)' }}>
            {kpi.kpi_name}
          </h3>
        </div>
        <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>
          เป้าหมาย {kpi.thresholds?.score_5 ?? '-'}%
        </span>
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-bold" style={{ color }}>
            {formatNumber(summary.actual, kpi.unit)}
          </span>
          <span className="text-sm" style={{ color: 'var(--c-text-2)' }}>
            {kpi.unit} | {percent.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Monthly Grid */}
      <div className="grid grid-cols-6 gap-2">
        {THAI_MONTHS.map((month, i) => {
          const entry = monthlyData.find((m) => m.label.startsWith(month))
          const val = entry?.value
          const mColor = val != null ? getPerformanceColor(val) : 'var(--c-text-2)'

          return (
            <div
              key={i}
              className="rounded-lg p-2 text-center"
              style={{ backgroundColor: 'var(--c-surface-alt)' }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--c-text-2)' }}>
                {month}
              </div>
              <div className="text-sm font-bold" style={{ color: mColor }}>
                {val != null ? val.toFixed(2) : '-'}
              </div>
            </div>
          )
        })}
      </div>

      {!monthlyData.length && (
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--c-text-2)' }}>
          ยังไม่มีข้อมูลรายเดือน — อัปโหลด Excel เพื่อเพิ่มข้อมูล
        </p>
      )}
    </div>
  )
}
