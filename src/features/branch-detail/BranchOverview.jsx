import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import {
  loadKpiConfig, loadDefaultKpiConfig, loadBranchData,
  loadKpiTargets, loadDailyLog,
  computeAllBranchScores, rankBranches, formatNumber,
  getPerformanceColor, getScoreLevelColor, loadHistoryLog,
} from '../../data/transformer'
import { SAMPLE_BRANCH_DATA } from '../../data/sampleData'
import HistoryChart from '../kpi-dashboard/HistoryChart'
import DailyTrendChart from '../analytics/DailyTrendChart'
import ForecastPanel from '../analytics/ForecastPanel'

export default function BranchOverview() {
  const [kpiConfig, setKpiConfig] = useState([])
  const [branchData, setBranchData] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [historyLog, setHistoryLog] = useState([])
  const [kpiTargets, setKpiTargets] = useState({})
  const [dailyLog, setDailyLog] = useState([])

  useEffect(() => {
    (async () => {
      let config = loadKpiConfig()
      if (!config) config = await loadDefaultKpiConfig()
      setKpiConfig(config)

      const data = loadBranchData() || SAMPLE_BRANCH_DATA
      setBranchData(data)
      if (data.length) setSelectedBranch(data[0].branch_name)

      setHistoryLog(loadHistoryLog())
      setKpiTargets(loadKpiTargets())
      setDailyLog(loadDailyLog())
    })()
  }, [])

  const computed = computeAllBranchScores(branchData, kpiConfig, kpiTargets)
  const ranked = rankBranches(computed)
  const branch = ranked.find((b) => b.branch_name === selectedBranch)

  return (
    <div className="space-y-6">
      {/* Branch Selector */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        <Users size={18} style={{ color: 'var(--c-accent)' }} />
        <h2 className="text-base font-bold" style={{ color: 'var(--c-text-1)' }}>
          ภาพรวมสาขา
        </h2>
        <select
          className="input-field text-sm w-auto"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          {branchData.map((b) => (
            <option key={b.branch_name} value={b.branch_name}>
              {b.branch_name}
            </option>
          ))}
        </select>
        {branch && (
          <span className="text-sm ml-auto" style={{ color: 'var(--c-text-2)' }}>
            อันดับ #{branch.rank} | คะแนนรวม {branch.overallPercent.toFixed(2)}%
          </span>
        )}
      </div>

      {branch && (
        <>
          {/* KPI Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpiConfig.map((kpi) => {
              const d = branch.kpis[kpi.kpi_id] || { target: 0, actual: 0 }
              const s = branch.scores[kpi.kpi_id] || {}
              const effectiveTarget = s.target !== undefined ? s.target : d.target
              const percent = effectiveTarget > 0 ? (d.actual / effectiveTarget) * 100 : 0
              const color = getPerformanceColor(percent)

              return (
                <div key={kpi.kpi_id} className="card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--c-accent)', color: '#fff', fontSize: '0.65rem' }}
                    >
                      {kpi.kpi_id.replace('kpi_', '')}
                    </span>
                    <span className="text-xs truncate" style={{ color: 'var(--c-text-2)' }}>
                      {kpi.kpi_name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold" style={{ color }}>
                      {formatNumber(d.actual, kpi.unit)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>
                      / {formatNumber(effectiveTarget, kpi.unit)}
                    </span>
                  </div>
                  <div className="progress-bar mt-1.5">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs font-mono" style={{ color }}>
                      {percent.toFixed(1)}%
                    </span>
                    <span
                      className="text-xs font-bold px-1.5 rounded"
                      style={{ backgroundColor: getScoreLevelColor(s.level || 0), color: '#fff' }}
                    >
                      ระดับ {s.level || 0}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Full KPI Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">ตัวชี้วัด</th>
                    <th className="text-right">เป้าหมาย</th>
                    <th className="text-right">ผลงาน</th>
                    <th className="text-right">ต้องทำอีก</th>
                    <th className="text-center">% ผลงาน</th>
                    <th className="text-center">ระดับ</th>
                    <th className="text-right">คะแนน</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiConfig.map((kpi) => {
                    const d = branch.kpis[kpi.kpi_id] || { target: 0, actual: 0 }
                    const s = branch.scores[kpi.kpi_id] || {}
                    const effectiveTarget = s.target !== undefined ? s.target : d.target
                    const remaining = effectiveTarget - d.actual
                    const percent = effectiveTarget > 0 ? (d.actual / effectiveTarget) * 100 : 0
                    const color = getPerformanceColor(percent)

                    return (
                      <tr key={kpi.kpi_id}>
                        <td className="text-left">
                          <span className="font-medium" style={{ color: 'var(--c-text-1)' }}>
                            {kpi.kpi_name}
                          </span>
                          <span className="text-xs ml-1" style={{ color: 'var(--c-text-2)' }}>
                            ({kpi.unit})
                          </span>
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
                          <span className="text-xs font-bold font-mono" style={{ color }}>
                            {percent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
                            style={{ backgroundColor: getScoreLevelColor(s.level || 0) }}
                          >
                            {s.level || 0}
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
                  <tr style={{ backgroundColor: 'var(--c-surface-alt)', fontWeight: 700 }}>
                    <td className="text-left" style={{ color: 'var(--c-accent)' }}>รวมคะแนน</td>
                    <td colSpan={5}></td>
                    <td className="text-right font-mono font-bold" style={{ color: 'var(--c-accent)' }}>
                      {branch.totalScore.toFixed(2)} / {branch.maxPossibleScore.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* History Chart (monthly) */}
          {historyLog.length > 0 && kpiConfig.length > 0 && (
            <HistoryChart
              historyLog={historyLog}
              kpiId={kpiConfig[0].kpi_id}
              title={`แนวโน้มผลงาน ${selectedBranch} (รายเดือน)`}
              targetLine={100}
            />
          )}

          {/* ────── Daily Trend Chart ────── */}
          {kpiConfig.length > 0 && (
            <div className="space-y-2">
              <h2
                className="text-sm font-bold uppercase tracking-wider px-1"
                style={{ color: 'var(--c-text-2)' }}
              >
                แนวโน้มรายวัน — {selectedBranch}
              </h2>
              <DailyTrendChart
                dailyLog={dailyLog}
                kpiConfig={kpiConfig}
                kpiTargets={kpiTargets}
                defaultBranch={selectedBranch}
              />
            </div>
          )}

          {/* ────── Forecast Panel ────── */}
          {kpiConfig.length > 0 && (
            <div className="space-y-2">
              <h2
                className="text-sm font-bold uppercase tracking-wider px-1"
                style={{ color: 'var(--c-text-2)' }}
              >
                พยากรณ์ผลงาน — {selectedBranch}
              </h2>
              <ForecastPanel
                dailyLog={dailyLog}
                kpiConfig={kpiConfig}
                kpiTargets={kpiTargets}
              />
            </div>
          )}
        </>
      )}

      {/* Future: รายคน */}
      <div className="card p-8 text-center" style={{ borderStyle: 'dashed' }}>
        <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--c-text-2)', opacity: 0.5 }} />
        <p className="text-sm font-medium" style={{ color: 'var(--c-text-2)' }}>
          หน้า "รายคน" — ฟีเจอร์ในอนาคต
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--c-text-2)', opacity: 0.6 }}>
          จะแสดงผลงาน KPI ของพนักงานแต่ละคน
        </p>
      </div>
    </div>
  )
}
