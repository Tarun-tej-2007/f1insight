import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Spinner, EmptyState, Modal, PosBadge, TeamDot, PageHeader } from '../components/common/index'

function CircuitSVG({ name = '' }) {
  const n = name.toLowerCase()
  if (n.includes('monaco'))
    return (
      <svg viewBox="0 0 400 280" className="w-full" style={{ maxHeight: 180 }}>
        <path d="M 70 230 L 70 80 Q 70 55 95 55 L 240 55 Q 330 55 345 115 L 345 175 Q 345 215 305 215 L 185 215 Q 148 215 148 195 L 148 155 Q 148 135 168 135 L 255 135"
          stroke="var(--red)" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="70" cy="230" r="6" fill="#22c55e" />
        <text x="82" y="234" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Rubik">Start/Finish</text>
      </svg>
    )
  if (n.includes('monza') || n.includes('italy'))
    return (
      <svg viewBox="0 0 400 280" className="w-full" style={{ maxHeight: 180 }}>
        <path d="M 40 140 L 180 140 L 200 70 L 235 70 L 255 140 L 360 140 L 360 195 L 255 195 L 235 255 L 160 255 L 140 195 L 40 195 Z"
          stroke="var(--red)" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="40" cy="167" r="6" fill="#22c55e" />
        <text x="52" y="171" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Rubik">S/F</text>
      </svg>
    )
  return (
    <svg viewBox="0 0 400 280" className="w-full" style={{ maxHeight: 180 }}>
      <ellipse cx="200" cy="140" rx="155" ry="95" stroke="var(--red)" strokeWidth="8" fill="none" />
      <ellipse cx="200" cy="140" rx="105" ry="52" stroke="rgba(238,63,44,0.2)" strokeWidth="4" fill="none" />
      <circle cx="200" cy="45" r="6" fill="#22c55e" />
      <text x="212" y="49" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Rubik">Start/Finish</text>
      <text x="148" y="148" fill="rgba(255,255,255,0.15)" fontSize="11" fontFamily="Rubik">DRS Zone</text>
    </svg>
  )
}

export default function Races() {
  const [races, setRaces] = useState([])
  const [results, setResults] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    Promise.all([api.get('/races'), api.get('/results'), api.get('/analytics')])
      .then(([r, res, a]) => {
        setRaces(r.data)
        setResults(res.data)
        setDrivers(a.data.driverStandings || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = races.filter(r => new Date(r.date) >= now)
  const past = races.filter(r => new Date(r.date) < now)
  const displayed = tab === 'upcoming' ? upcoming : tab === 'past' ? past : races

  function getRaceResults(raceId) {
    return results
      .filter(r => (r.race?._id || r.race) === raceId)
      .map(r => {
        const d = drivers.find(dr => dr._id === (r.driver?._id || r.driver))
        return { ...r, driverName: r.driver?.name || d?.name || 'Unknown', teamName: r.team?.name || d?.team?.name || '', teamColor: r.team?.color || d?.team?.color || '#888' }
      })
      .sort((a, b) => a.position - b.position)
  }

  if (loading) return <div className="pt-32 px-16"><Spinner /></div>

  return (
    <div className="pt-28 pb-20 px-8 md:px-16">
      <PageHeader tag="Calendar" title="Race Calendar" sub="All Formula 1 Grand Prix events, circuit details, and race results." />

      {/* Tabs */}
      <div className="flex border-b mb-8 overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {[
          { id: 'all', label: `All (${races.length})` },
          { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { id: 'past', label: `Completed (${past.length})` },
        ].map(t => (
          <button key={t.id} className={`f1-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState icon="🏁" title="No Races" sub="Add races via Admin Panel." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map(r => {
            const isPast = new Date(r.date) < now
            const raceResults = getRaceResults(r._id)
            return (
              <motion.div
                key={r._id}
                whileHover={{ y: -3 }}
                className="surface-card p-6 cursor-pointer transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setSelected({ race: r, raceResults })}
              >
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--red)', letterSpacing: '0.12em' }}>
                  Round {r.round} · {r.season}
                </div>
                <div className="font-black text-lg mb-1" style={{ letterSpacing: '-0.02em' }}>{r.name}</div>
                <div className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.circuit}</div>
                {r.country && <div className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>{r.country}</div>}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`badge ${isPast ? 'badge-gray' : 'badge-green'}`}>
                    {isPast ? 'Completed' : 'Upcoming'}
                  </span>
                </div>

                {isPast && raceResults.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Podium</div>
                    {raceResults.slice(0, 3).map(res => (
                      <div key={res._id} className="flex items-center gap-2 mb-1.5">
                        <PosBadge pos={String(res.position)} />
                        <span className="text-sm font-bold">{res.driverName}</span>
                        <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>{res.teamName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Race Detail Modal ── */}
      {selected && (
        <Modal
          title={selected.race.name}
          sub={`${selected.race.circuit || ''} · Round ${selected.race.round} · ${selected.race.season}`}
          onClose={() => setSelected(null)}
          maxWidth={620}
        >
          {/* Circuit SVG */}
          <div className="surface-card p-6 mb-6 flex items-center justify-center" style={{ minHeight: 200 }}>
            <CircuitSVG name={selected.race.circuit || selected.race.name} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { l: 'Season', v: selected.race.season },
              { l: 'Country', v: selected.race.country || '—' },
              { l: 'Laps', v: selected.race.laps || '—' },
              { l: 'Date', v: new Date(selected.race.date).toLocaleDateString('en-GB') },
            ].map((s, i) => (
              <div key={i} className="surface-card p-3 text-center">
                <div className="font-black text-base mb-0.5">{s.v}</div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Results */}
          {selected.raceResults.length > 0 ? (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>Race Results</div>
              <table className="f1-table w-full">
                <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Pts</th></tr></thead>
                <tbody>
                  {selected.raceResults.map(r => (
                    <tr key={r._id}>
                      <td><PosBadge pos={String(r.position)} /></td>
                      <td><span className="font-bold">{r.driverName}</span></td>
                      <td><div className="flex items-center"><TeamDot color={r.teamColor} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.teamName}</span></div></td>
                      <td className="font-black">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No results recorded for this race yet
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
