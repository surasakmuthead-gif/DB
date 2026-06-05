import { formatNumber, getPerformanceColor } from '../../data/transformer'

export default function KpiCard({ kpi, summary }) {
  if (!summary) return null

  const percent = summary.percent
  const color = getPerformanceColor(percent)

  return (
    <div className="card card-hover p-4 flex flex-col gap-2">
      {/* KPI Number + Name */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: 'var(--c-accent)', color: '#fff' }}
        >
          {kpi.kpi_id.replace('kpi_', '')}
        </span>
        <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>
          {kpi.unit}
        </span>
      </div>

      <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--c-text-1)' }}>
        {kpi.kpi_name}
      </h3>

      {/* Actual Number */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold" style={{ color }}>
          {formatNumber(summary.actual, kpi.unit)}
        </span>
        <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>
          {kpi.unit}
        </span>
      </div>

      {/* Target */}
      <div className="text-xs" style={{ color: 'var(--c-text-2)' }}>
        เป้าหมาย {formatNumber(summary.target, kpi.unit)}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Percent */}
      <div className="text-right">
        <span className="text-sm font-bold" style={{ color }}>
          {percent.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
