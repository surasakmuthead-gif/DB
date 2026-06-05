export default function RankingTable({ title, data, valueLabel = 'คะแนน' }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--c-text-1)' }}>
        {title}
      </h3>
      <div className="overflow-auto max-h-[420px]">
        <table className="data-table text-xs">
          <thead>
            <tr>
              <th className="text-center w-12">#</th>
              <th className="text-left">สาขา</th>
              <th className="text-right">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td className="text-center font-bold" style={{
                  color: i < 3 ? 'var(--c-accent)' : 'var(--c-text-2)',
                }}>
                  {i + 1}
                </td>
                <td className="text-left" style={{ color: 'var(--c-text-1)' }}>
                  {item.branch_name}
                </td>
                <td className="text-right font-mono font-bold" style={{
                  color: item.value >= 80 ? '#10B981' : item.value >= 60 ? '#F59E0B' : '#EF4444',
                }}>
                  {item.value.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
