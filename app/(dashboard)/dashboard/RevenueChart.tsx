'use client'

interface DataPoint {
  month: string
  value: number
}

export default function RevenueChart({ data }: { data: DataPoint[] }) {
  const W = 380
  const H = 160
  const padL = 52
  const padR = 16
  const padT = 12
  const padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const maxVal = Math.max(...data.map(d => d.value), 1000)
  const roundedMax = Math.ceil(maxVal / 5000) * 5000

  const xs = data.map((_, i) => padL + (i / Math.max(data.length - 1, 1)) * plotW)
  const ys = data.map(d => padT + plotH - (d.value / roundedMax) * plotH)

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const areaPath = `${linePath} L${xs[xs.length - 1]},${padT + plotH} L${xs[0]},${padT + plotH} Z`

  const yLabels = [0, roundedMax * 0.25, roundedMax * 0.5, roundedMax * 0.75, roundedMax]

  function fmtY(v: number) {
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
    return String(v)
  }

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.01"/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((v, i) => {
          const y = padT + plotH - (v / roundedMax) * plotH
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F3F4F6" strokeWidth="1"/>
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{fmtY(v)}</text>
            </g>
          )
        })}

        {/* Area fill */}
        {data.length > 1 && (
          <path d={areaPath} fill="url(#areaGrad)"/>
        )}

        {/* Line */}
        {data.length > 1 && (
          <path d={linePath} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        )}

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xs[i]} cy={ys[i]} r="4" fill="white" stroke="#7C3AED" strokeWidth="2"/>
            {/* Month label */}
            <text x={xs[i]} y={H - 6} textAnchor="middle" fontSize="10" fill="#6B7280">{d.month}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
