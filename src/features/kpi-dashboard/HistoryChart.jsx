import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'

export default function HistoryChart({ historyLog, kpiId, title, targetLine }) {
  const data = historyLog
    .filter((h) => h.summary)
    .map((h) => {
      const kpiData = h.summary[kpiId]
      return {
        name: h.label,
        percent: kpiData ? parseFloat(kpiData.percent.toFixed(2)) : null,
      }
    })
    .filter((d) => d.percent !== null)

  if (!data.length) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--c-text-2)' }}>
          {title}: ยังไม่มีข้อมูลย้อนหลัง
        </p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--c-text-1)' }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--c-text-2)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--c-border)' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: 'var(--c-text-2)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--c-border)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              color: 'var(--c-text-1)',
              fontSize: 12,
            }}
            formatter={(value) => [`${value}%`, '% ผลงาน']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--c-text-2)' }} />
          {targetLine && (
            <ReferenceLine
              y={targetLine}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{ value: `เป้า ${targetLine}%`, fill: '#EF4444', fontSize: 11 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="percent"
            name="% ผลงาน"
            stroke="var(--c-accent)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--c-accent)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
