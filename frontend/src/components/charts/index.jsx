import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 2,
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Rubik, sans-serif',
  },
  itemStyle: { color: 'rgba(255,255,255,0.8)' },
  labelStyle: { color: 'rgba(255,255,255,0.45)', marginBottom: 4 },
}

const AXIS_STYLE = {
  stroke: 'rgba(255,255,255,0.15)',
  tick: { fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Rubik' },
}

const GRID_STYLE = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.05)' }

const COLORS = ['#EE3F2C', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#84cc16']

// ── Points Progression Line Chart ─────────────────────────
export function ProgressionChart({ data, drivers }) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="race" {...AXIS_STYLE} angle={-40} textAnchor="end" height={80} interval={0}
          tickFormatter={v => v.length > 14 ? v.slice(0, 13) + '…' : v} />
        <YAxis {...AXIS_STYLE} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, paddingTop: 20 }} />
        {drivers.map((d, i) => (
          <Line
            key={d._id}
            type="monotone"
            dataKey={d.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Bar Chart ──────────────────────────────────────────────
export function F1BarChart({ data, dataKey, nameKey = 'name', color = '#EE3F2C', height = 300, label }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey={nameKey} {...AXIS_STYLE} angle={-40} textAnchor="end" height={80}
          tickFormatter={v => v.length > 12 ? v.slice(0, 11) + '…' : v} />
        <YAxis {...AXIS_STYLE} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Bar dataKey={dataKey} fill={color} name={label || dataKey} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Area Chart ─────────────────────────────────────────────
export function F1AreaChart({ data, dataKey = 'cumulativePoints', height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid {...GRID_STYLE} />
        <XAxis dataKey="race" hide />
        <YAxis {...AXIS_STYLE} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="var(--red)"
          fill="rgba(238,63,44,0.08)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Rating Bar ─────────────────────────────────────────────
export function RatingBar({ name, value, max = 100 }) {
  const pct = Math.round((value / max) * 100)
  const color = value > 70 ? '#22c55e' : value > 40 ? '#f59e0b' : 'var(--red)'
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-sm font-black" style={{ color }}>{value}</span>
      </div>
      <div className="h-1" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color, borderRadius: 2 }}
        />
      </div>
    </div>
  )
}

// ── Pit Stop Bar ───────────────────────────────────────────
export function PitStopBar({ teamName, avgTime, bestTime, color, maxTime, rank }) {
  const pct = Math.round((avgTime / maxTime) * 100)
  return (
    <div className="flex items-center gap-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="text-sm font-bold" style={{ minWidth: 130 }}>
        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: color || 'var(--red)' }} />
        {teamName}
      </div>
      <div className="flex-1 h-2 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: color || 'var(--red)', borderRadius: 2 }} />
      </div>
      <span className="text-sm font-bold w-14 text-right" style={{ color: 'rgba(255,255,255,0.6)' }}>{avgTime}s</span>
      <span className={`badge ${rank === 0 ? 'badge-green' : 'badge-gray'}`}>{rank === 0 ? 'Fastest' : `#${rank + 1}`}</span>
    </div>
  )
}

// ── VS Comparison Bar ──────────────────────────────────────
export function VsBar({ label, valA, valB, colorA = 'var(--red)', colorB = '#3b82f6' }) {
  const total = Math.max(valA + valB, 1)
  const pctA = Math.round((valA / total) * 100)
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-sm font-black w-10 text-right" style={{ color: colorA }}>{valA}</span>
        <div className="flex-1 h-1.5 flex overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div style={{ width: `${pctA}%`, background: colorA, transition: 'width 1s ease' }} />
          <div style={{ width: `${100 - pctA}%`, background: colorB, transition: 'width 1s ease' }} />
        </div>
        <span className="text-sm font-black w-10" style={{ color: colorB }}>{valB}</span>
      </div>
      <div className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  )
}
