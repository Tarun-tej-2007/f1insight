// ── Spinner ────────────────────────────────────────────────
export function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-20 ${className}`}>
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────
export function EmptyState({ icon = '🏁', title = 'No Data Yet', sub = 'Add data via the Admin Panel' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="text-5xl opacity-30">{icon}</div>
      <div className="text-sm font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{title}</div>
      {sub && <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{sub}</div>}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────
export function Modal({ title, sub, onClose, children, maxWidth = 540 }) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full overflow-y-auto"
        style={{
          maxWidth,
          maxHeight: '90vh',
          background: '#080808',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: 40,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-xl transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
        >
          ✕
        </button>
        <h2 className="font-black uppercase text-xl tracking-tight mb-1">{title}</h2>
        {sub && <p className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.05em' }}>{sub}</p>}
        <div className={sub ? '' : 'mt-7'}>{children}</div>
      </div>
    </div>
  )
}

// ── PosBadge ───────────────────────────────────────────────
export function PosBadge({ pos }) {
  const n = parseInt(pos)
  const style = n === 1
    ? { background: 'rgba(255,215,0,0.12)', color: 'gold' }
    : n === 2
    ? { background: 'rgba(192,192,192,0.12)', color: 'silver' }
    : n === 3
    ? { background: 'rgba(205,127,50,0.12)', color: '#CD7F32' }
    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }

  return (
    <span
      className="inline-flex items-center justify-center text-xs font-black"
      style={{ width: 28, height: 28, borderRadius: 2, ...style }}
    >
      {pos}
    </span>
  )
}

// ── TeamDot ────────────────────────────────────────────────
export function TeamDot({ color }) {
  return (
    <span
      className="inline-block rounded-full mr-2"
      style={{ width: 9, height: 9, background: color || '#888', flexShrink: 0 }}
    />
  )
}

// ── FormInput ──────────────────────────────────────────────
export function FormInput({ label, type = 'text', value, onChange, placeholder, required, min, step }) {
  return (
    <div className="mb-5">
      <label className="f1-label">{label}</label>
      <input
        className="f1-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
      />
    </div>
  )
}

// ── FormSelect ─────────────────────────────────────────────
export function FormSelect({ label, value, onChange, options = [], placeholder = 'Select...' }) {
  return (
    <div className="mb-5">
      <label className="f1-label">{label}</label>
      <select className="f1-input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── PageHeader ─────────────────────────────────────────────
export function PageHeader({ tag, title, sub }) {
  return (
    <div className="mb-12">
      {tag && <div className="section-tag">{tag}</div>}
      <h1 className="section-title">{title}</h1>
      {sub && <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 500, lineHeight: 1.7 }}>{sub}</p>}
    </div>
  )
}

// ── StatCard ───────────────────────────────────────────────
export function StatCard({ value, label, accent }) {
  return (
    <div className="surface-card p-5">
      <div
        className="text-3xl font-black mb-1"
        style={{ letterSpacing: '-0.04em', color: accent || '#fff' }}
      >
        {value}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.32)', letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  )
}

export default Spinner
