import { useState, useEffect } from 'react'
import KpiCard from './KpiCard'
import KpiCardLarge from './KpiCardLarge'
import KpiDetailSection from './KpiDetailSection'
import RankingTable from './RankingTable'
import HistoryChart from './HistoryChart'
import DailyTrendChart from '../analytics/DailyTrendChart'
import ForecastPanel from '../analytics/ForecastPanel'
import {
  loadKpiConfig, loadDefaultKpiConfig, loadBranchData, saveBranchData,
  loadHistoryLog, loadKpiTargets, loadDailyLog,
  computeAllBranchScores, computeProvinceSummary, rankBranches,
} from '../../data/transformer'
import { SAMPLE_BRANCH_DATA } from '../../data/sampleData'

export default function ProvinceOverview() {
  const [kpiConfig, setKpiConfig] = useState([])
  const [branchData, setBranchData] = useState([])
  const [historyLog, setHistoryLog] = useState([])
  const [kpiTargets, setKpiTargets] = useState({})
  const [dailyLog, setDailyLog] = useState([])

  useEffect(() => {
    (async () => {
      let config = loadKpiConfig()
      if (!config) config = await loadDefaultKpiConfig()
      setKpiConfig(config)

      let data = loadBranchData()
      if (!data) {
        data = SAMPLE_BRANCH_DATA
        saveBranchData(data)
      }
      setBranchData(data)

      setHistoryLog(loadHistoryLog())
      setKpiTargets(loadKpiTargets())
      setDailyLog(loadDailyLog())
    })()
  }, [])

  const computedBranches = computeAllBranchScores(branchData, kpiConfig, kpiTargets)
  const rankedBranches = rankBranches(computedBranches)
  const provinceSummary = computeProvinceSummary(branchData, kpiConfig, kpiTargets)

  const smallKpis = kpiConfig.filter((k) => k.display_size === 'small')
  const largeKpis = kpiConfig.filter((k) => k.display_size === 'large')
  const detailKpis = kpiConfig.filter((k) => k.display_size !== 'large')

  return (
    <div className="space-y-6">
      {/* ────── Top Section: KPI Cards + Ranking ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPI Cards — Left 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          {smallKpis.length > 0 && (
            <div>
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
                style={{ color: 'var(--c-text-2)' }}
              >
                ภาพรวมตัวชี้วัดหลัก
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {smallKpis.map((kpi) => (
                  <KpiCard
                    key={kpi.kpi_id}
                    kpi={kpi}
                    summary={provinceSummary[kpi.kpi_id]}
                  />
                ))}
              </div>
            </div>
          )}

          {largeKpis.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {largeKpis.map((kpi) => (
                <KpiCardLarge
                  key={kpi.kpi_id}
                  kpi={kpi}
                  summary={provinceSummary[kpi.kpi_id]}
                  historyLog={historyLog}
                />
              ))}
            </div>
          )}
        </div>

        {/* Ranking Tables — Right 1 col */}
        <div className="space-y-4">
          <RankingTable
            title="Ranking คะแนนรวม KPI — ระดับ สนจ."
            data={rankedBranches.map((b) => ({
              branch_name: b.branch_name,
              value: b.overallPercent,
            }))}
            valueLabel="คะแนน"
          />
        </div>
      </div>

      {/* ────── History Chart (monthly) ────── */}
      {historyLog.length > 0 && (
        <HistoryChart
          historyLog={historyLog}
          kpiId={kpiConfig[0]?.kpi_id}
          title="แนวโน้มผลงานภาพรวมจังหวัด (รายเดือน)"
          targetLine={100}
        />
      )}

      {/* ────── Daily Trend Chart ────── */}
      {kpiConfig.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: 'var(--c-text-2)' }}>
            แนวโน้มรายวัน
          </h2>
          <DailyTrendChart
            dailyLog={dailyLog}
            kpiConfig={kpiConfig}
            kpiTargets={kpiTargets}
          />
        </div>
      )}

      {/* ────── Forecast Panel ────── */}
      {kpiConfig.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: 'var(--c-text-2)' }}>
            พยากรณ์ผลงาน (Linear Forecast)
          </h2>
          <ForecastPanel
            dailyLog={dailyLog}
            kpiConfig={kpiConfig}
            kpiTargets={kpiTargets}
          />
        </div>
      )}

      {/* ────── Bottom Section: Detail per KPI ────── */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold" style={{ color: 'var(--c-text-1)' }}>
          รายละเอียด KPI รายตัว
        </h2>
        {detailKpis.map((kpi) => (
          <KpiDetailSection
            key={kpi.kpi_id}
            kpi={kpi}
            computedBranches={computedBranches}
          />
        ))}
      </div>
    </div>
  )
}
