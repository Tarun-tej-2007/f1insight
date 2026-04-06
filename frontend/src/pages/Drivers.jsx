import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, EmptyState, Modal, PosBadge, TeamDot, FormSelect, PageHeader } from '../components/common/index'
import { F1AreaChart, VsBar, RatingBar } from '../components/charts/index'

const METRICS = [
  { key: 'points', label: 'Points' },
  { key: 'wins', label: 'Wins' },
  { key: 'podiums', label: 'Podiums' },
  { key: 'rating', label: 'Rating' },
  { key: 'consistency', label: 'Consistency' },
]

export default function Drivers() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState(null)
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')
  const [favs, setFavs] = useState([])

  useEffect(() => {
    api.get('/analytics').then(r => setStandings(r.data.driverStandings || [])).finally(() => setLoading(false))
    if (user) setFavs(user.favorites?.drivers?.map(d => d._id || d) || [])
  }, [])

  const driverA = standings.find(d => d._id === compareA)
  const driverB = standings.find(d => d._id === compareB)

  async function toggleFav(driverId) {
    if (!user) return toast('Please login to save favorites')
    try {
      const res = await api.post(`/users/favorites/drivers/${driverId}`)
      setFavs(res.data.drivers.map(d => d._id || d))
      await refreshUser()
      toast(favs.includes(driverId) ? 'Removed from favorites' : 'Added to favorites', 'success')
    } catch (e) { toast(e.message) }
  }

  const isFav = id => favs.some(f => (f._id || f) === id)
  const favDrivers = standings.filter(d => isFav(d._id))

  if (loading) return <div className="pt-32 px-16"><Spinner /></div>

  return (
    <div className="pt-28 pb-20 px-8 md:px-16">
      <PageHeader tag="Athletes" title="Driver Profiles" sub="Full season statistics, performance ratings, and head-to-head comparisons." />

      {/* Tabs */}
      <div className="flex border-b mb-8 overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {[
          { id: 'all', label: 'All Drivers' },
          { id: 'compare', label: 'Head to Head' },
          { id: 'favorites', label: `Favorites (${favDrivers.length})` },
        ].map(t => (
          <button key={t.id} className={`f1-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── All Drivers ── */}
      {tab === 'all' && (
        standings.length === 0 ? <EmptyState icon="🏎️" title="No Drivers" sub="Add drivers via Admin Panel." /> :
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {standings.map((d, i) => (
            <motion.div
              key={d._id}
              whileHover={{ y: -4 }}
              className="glass-card p-7 cursor-pointer transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={() => setSelected(d)}
            >
              {/* Team color bar */}
              <div className="h-0.5 mb-5 rounded-full" style={{ background: d.team?.color || 'var(--red)' }} />
              <div className="font-black mb-0.5" style={{ fontSize: 56, lineHeight: 1, color: 'rgba(255,255,255,0.07)', fontFamily: 'Rubik Mono One, monospace' }}>
                {d.number || i + 1}
              </div>
              <div className="font-black text-lg mb-1" style={{ letterSpacing: '-0.02em' }}>{d.name}</div>
              <div className="flex items-center mb-5">
                <TeamDot color={d.team?.color} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{d.team?.name || 'No Team'}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[{ v: d.wins, l: 'Wins' }, { v: d.podiums, l: 'Podiums' }, { v: d.points, l: 'Pts' }, { v: d.rating, l: 'Rtg' }].map((s, j) => (
                  <div key={j}>
                    <div className="font-black text-lg" style={{ color: j === 3 ? (d.rating > 70 ? '#22c55e' : d.rating > 40 ? '#f59e0b' : 'var(--red)') : '#fff', letterSpacing: '-0.03em' }}>{s.v}</div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <button
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 transition-all ${isFav(d._id) ? 'badge-red' : 'badge-gray'} badge`}
                onClick={e => { e.stopPropagation(); toggleFav(d._id) }}
              >
                {isFav(d._id) ? '★ Saved' : '☆ Save'}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Compare ── */}
      {tab === 'compare' && (
        <div>
          <div className="grid md:grid-cols-2 gap-5 mb-8">
            <FormSelect label="Driver A" value={compareA} onChange={setCompareA}
              options={standings.map(d => ({ value: d._id, label: d.name }))} />
            <FormSelect label="Driver B" value={compareB} onChange={setCompareB}
              options={standings.map(d => ({ value: d._id, label: d.name }))} />
          </div>

          {driverA && driverB ? (
            <div className="surface-card p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 pb-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <div className="font-black text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>{driverA.name}</div>
                  <div className="flex items-center"><TeamDot color={driverA.team?.color} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{driverA.team?.name}</span></div>
                </div>
                <div className="font-black text-3xl" style={{ color: 'rgba(255,255,255,0.12)', letterSpacing: '-0.05em' }}>VS</div>
                <div className="text-right">
                  <div className="font-black text-xl mb-1" style={{ letterSpacing: '-0.02em' }}>{driverB.name}</div>
                  <div className="flex items-center justify-end"><TeamDot color={driverB.team?.color} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{driverB.team?.name}</span></div>
                </div>
              </div>
              {METRICS.map(m => (
                <VsBar
                  key={m.key}
                  label={m.label}
                  valA={driverA[m.key] || 0}
                  valB={driverB[m.key] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Select two drivers above to compare head-to-head
            </div>
          )}
        </div>
      )}

      {/* ── Favorites ── */}
      {tab === 'favorites' && (
        !user ? (
          <EmptyState icon="☆" title="Login Required" sub="Please login to see your saved drivers." />
        ) : favDrivers.length === 0 ? (
          <EmptyState icon="☆" title="No Favorites Yet" sub="Star drivers on the All Drivers tab to save them here." />
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {favDrivers.map(d => (
              <div key={d._id} className="surface-card p-6 cursor-pointer" onClick={() => setSelected(d)}>
                <div className="h-0.5 mb-4" style={{ background: d.team?.color || 'var(--red)' }} />
                <div className="font-black text-lg mb-1">{d.name}</div>
                <div className="flex items-center mb-4"><TeamDot color={d.team?.color} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{d.team?.name}</span></div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ v: d.wins, l: 'Wins' }, { v: d.podiums, l: 'Podiums' }, { v: d.points, l: 'Points' }].map((s, i) => (
                    <div key={i}><div className="font-black text-lg">{s.v}</div><div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.l}</div></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Driver Detail Modal ── */}
      {selected && (
        <Modal title={selected.name} sub={`${selected.nationality || ''} · ${selected.team?.name || 'No Team'}`} onClose={() => setSelected(null)}>
          <div className="h-0.5 mb-6 rounded-full" style={{ background: selected.team?.color || 'var(--red)' }} />

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[{ v: selected.wins, l: 'Wins' }, { v: selected.podiums, l: 'Podiums' }, { v: selected.points, l: 'Points' }, { v: selected.rating, l: 'Rating' }].map((s, i) => (
              <div key={i} className="surface-card p-4 text-center">
                <div className="font-black text-2xl mb-1" style={{ letterSpacing: '-0.04em', color: i === 3 ? (selected.rating > 70 ? '#22c55e' : selected.rating > 40 ? '#f59e0b' : 'var(--red)') : '#fff' }}>{s.v}</div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="mb-6">
            <RatingBar name="Performance Rating" value={selected.rating} />
            <RatingBar name="Consistency Score" value={selected.consistency} />
          </div>

          {/* Progression chart */}
          {selected.progression?.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.12em' }}>
                Points Progression
              </div>
              <F1AreaChart data={selected.progression} dataKey="cumulativePoints" height={180} />
            </div>
          )}

          <div className="mt-6 pt-5 flex gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              className={`btn-clip btn-clip-sm ${isFav(selected._id) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => toggleFav(selected._id)}
            >
              {isFav(selected._id) ? '★ Saved' : '☆ Save Driver'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
