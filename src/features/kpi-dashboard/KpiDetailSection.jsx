import { formatNumber, getPerformanceColor, getScoreLevelColor } from '../../data/transformer'
import { BRANCHES } from '../../data/sampleData'

const LEVELS = [1, 2, 3, 4, 5]

function formatDiff(diff) {
  // diff = actual - threshold
  // > 0 = เกินเป้า (เขียว +)
  // < 0 = ยังขาด (แดง -)
  const abs = Math.abs(diff)
  const formatted = abs.toLocaleString('th-TH', { maximumFractionDigits: 0 })
  if (diff > 0) return { text: `+${formatted}`, color: '#10b981' }
  if (diff < 0) return { text: `−${formatted}`, color: '#f43f5e' }
  return { text: '0', color: '#94a3b8' }
}

export default function KpiDetailSection({ kpi, computedBranches }) {
  // คำนวณ RANK ตาม % ผลงาน ก่อน
  const withRank = [...computedBranches]
    .sort((a, b) => (b.scores[kpi.kpi_id]?.percent || 0) - (a.scores[kpi.kpi_id]?.percent || 0))
    .map((b, i) => ({ ...b, kpiRank: i + 1 }))

  // จัดเรียงแสดงตามลำดับสาขาที่กำหนดไว้
  const ranked = BRANCHES
    .map((name) => withRank.find((b) => b.branch_name === name))
    .filter(Boolean)

  const totals = ranked.reduce(
    (acc, b) => {
      const d = b.kpis[kpi.kpi_id] || { target: 0, actual: 0 }
      const s = b.scores[kpi.kpi_id] || {}
      // ใช้ v5 (branch-specific target) ถ้ามี; ถ้าไม่มีใช้ Excel target
      const effectiveTarget = s.target !== undefined ? s.target : d.target
      acc.target += effectiveTarget
      acc.actual += d.actual
      return acc
    },
    { target: 0, actual: 0 }
  )
  const totalPercent = totals.target > 0 ? (totals.actual / totals.target) * 100 : 0

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface-alt)' }}
      >
        <span
          className="text-xs font-bold px-2.5 py-1 rounded"
          style={{ backgroundColor: 'var(--c-accent)', color: '#fff' }}
        >
          {kpi.max_score} คะแนน
        </span>
        <h3 className="text-sm font-bold" style={{ color: 'var(--c-text-1)' }}>
          {kpi.kpi_id.replace('kpi_', '')}. {kpi.kpi_name}
        </h3>
        <span className="text-xs ml-auto" style={{ color: 'var(--c-text-2)' }}>
          หน่วย: {kpi.unit} | น้ำหนัก: {kpi.weight}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {/* Left section */}
              <th className="text-left">สาขา</th>
              <th className="text-right">เป้าหมาย (ค่า5)</th>
              <th className="text-right">ผลงานจริง</th>
              <th className="text-right">ต้องทำอีก</th>
              <th className="text-center">% ผลงาน</th>
              <th className="text-center">Rank</th>
              {/* Right section — 5-level threshold diff */}
              <th
                className="text-center"
                style={{ borderLeft: '2px solid var(--c-border)' }}
              >
                ค่า1
              </th>
              <th className="text-center">ค่า2</th>
              <th className="text-center">ค่า3</th>
              <th className="text-center">ค่า4</th>
              <th className="text-center">ค่า5</th>
              <th className="text-center">ระดับ</th>
              <th className="text-right">คะแนน</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((branch) => {
              const d = branch.kpis[kpi.kpi_id] || { target: 0, actual: 0 }
              const s = branch.scores[kpi.kpi_id] || {}
              // ใช้ v5 จาก kpiTargets รายสาขา ถ้ามี; ไม่มีใช้ Excel target
              const effectiveTarget = s.target !== undefined ? s.target : d.target
              const remaining = effectiveTarget - d.actual
              const percent = effectiveTarget > 0 ? (d.actual / effectiveTarget) * 100 : 0
              const pColor = getPerformanceColor(percent)

              return (
                <tr key={branch.branch_name}>
                  {/* Left section */}
                  <td className="text-left font-medium whitespace-nowrap" style={{ color: 'var(--c-text-1)' }}>
                    {branch.branch_name}
                  </td>
                  <td className="text-right font-mono">{formatNumber(effectiveTarget, kpi.unit)}</td>
                  <td className="text-right font-mono font-semibold" style={{ color: 'var(--c-text-1)' }}>
                    {formatNumber(d.actual, kpi.unit)}
                  </td>
                  <td className="text-right font-mono">
                    {remaining > 0 ? (
                      <span className="num-negative">{formatNumber(remaining, kpi.unit)}</span>
                    ) : (
                      <span className="num-positive">✓</span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="progress-bar w-16">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: pColor }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono" style={{ color: pColor }}>
                        {percent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-center font-bold" style={{
                    color: branch.kpiRank <= 3 ? 'var(--c-accent)' : 'var(--c-text-2)',
                  }}>
                    {branch.kpiRank}
                  </td>

                  {/* 5-Level Threshold Diff: actual − threshold */}
                  {LEVELS.map((n, idx) => {
                    const thresh = s.thresholdValues?.[`score_${n}`] ?? 0
                    const { text, color } = formatDiff(d.actual - thresh)
                    return (
                      <td
                        key={n}
                        className="text-center font-mono text-xs"
                        style={idx === 0 ? { borderLeft: '2px solid var(--c-border)' } : undefined}
                      >
                        <span style={{ color, fontWeight: 600 }}>{text}</span>
                      </td>
                    )
                  })}

                  <td className="text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: getScoreLevelColor(s.level || 0) }}
                    >
                      {(s.level || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="text-right font-mono font-bold" style={{
                    color: getScoreLevelColor(s.level || 0),
                  }}>
                    {(s.score || 0).toFixed(2)}
                  </td>
                </tr>
              )
            })}

            {/* Province Total Row */}
            <tr style={{ backgroundColor: 'var(--c-surface-alt)', fontWeight: 700 }}>
              <td className="text-left" style={{ color: 'var(--c-accent)' }}>สนจ.สุโขทัย</td>
              <td className="text-right font-mono">{formatNumber(totals.target, kpi.unit)}</td>
              <td className="text-right font-mono" style={{ color: 'var(--c-text-1)' }}>
                {formatNumber(totals.actual, kpi.unit)}
              </td>
              <td className="text-right font-mono">
                {totals.target - totals.actual > 0 ? (
                  <span className="num-negative">{formatNumber(totals.target - totals.actual, kpi.unit)}</span>
                ) : (
                  <span className="num-positive">✓</span>
                )}
              </td>
              <td className="text-center">
                <span className="text-xs font-bold font-mono" style={{ color: getPerformanceColor(totalPercent) }}>
                  {totalPercent.toFixed(2)}%
                </span>
              </td>
              <td colSpan={8}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
