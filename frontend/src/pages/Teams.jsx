import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, EmptyState, Modal, TeamDot, PageHeader } from '../components/common/index'
import { F1BarChart } from '../components/charts/index'

export default function Teams() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [favs, setFavs] = useState([])

  useEffect(() => {
    api.get('/analytics').then(r => setStandings(r.data.teamStandings || [])).finally(() => setLoading(false))
    if (user) setFavs(user.favorites?.teams?.map(t => t._id || t) || [])
  }, [])

  const isFav = id => favs.some(f => (f._id || f) === id)

  async function toggleFav(teamId) {
    if (!user) return toast('Please login to follow teams')
    try {
      const res = await api.post(`/users/favorites/teams/${teamId}`)
      setFavs(res.data.teams.map(t => t._id || t))
      await refreshUser()
      toast(isFav(teamId) ? 'Unfollowed team' : 'Team followed', 'success')
    } catch (e) { toast(e.message) }
  }

  if (loading) return <div className="pt-32 px-16"><Spinner /></div>

  return (
    <div className="pt-28 pb-20 px-8 md:px-16">
      <PageHeader tag="Constructors" title="Teams" sub="Constructor standings, driver lineups, and team performance this season." />

      {standings.length === 0 ? (
        <EmptyState icon="🏭" title="No Teams Yet" sub="Add teams via Admin Panel." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {standings.map((t, i) => (
              <motion.div
                key={t._id}
                whileHover={{ y: -4 }}
                className="surface-card p-7 cursor-pointer transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setSelected(t)}
              >
                <div className="h-1 mb-6 rounded-sm" style={{ background: t.color || 'var(--red)' }} />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      P{i + 1} Constructor
                    </div>
                    <div className="font-black text-xl" style={{ letterSpacing: '-0.03em' }}>{t.name}</div>
                    {t.nationality && <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.nationality}</div>}
                  </div>
                  <div className="font-black text-4xl" style={{ letterSpacing: '-0.05em', color: t.color || 'var(--red)', lineHeight: 1 }}>
                    {t.points}
                  </div>
                </div>

                {t.drivers?.length > 0 && (
                  <div className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {t.drivers.map(d => d.name).join(' · ')}
                  </div>
                )}

                <div className="flex gap-6 pt-4 mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="font-black text-xl" style={{ letterSpacing: '-0.03em' }}>{t.wins}</div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Wins</div>
                  </div>
                  <div>
                    <div className="font-black text-xl" style={{ letterSpacing: '-0.03em' }}>{t.podiums}</div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Podiums</div>
                  </div>
                  <div>
                    <div className="font-black text-xl" style={{ letterSpacing: '-0.03em' }}>{t.drivers?.length || 0}</div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Drivers</div>
                  </div>
                </div>

                <button
                  className={`badge text-xs ${isFav(t._id) ? 'badge-red' : 'badge-gray'}`}
                  onClick={e => { e.stopPropagation(); toggleFav(t._id) }}
                >
                  {isFav(t._id) ? '★ Following' : '☆ Follow'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Points chart */}
          <div className="surface-card p-7">
            <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
              Constructor Points Comparison
            </div>
            <F1BarChart
              data={standings.map(t => ({ name: t.name, points: t.points }))}
              dataKey="points"
              nameKey="name"
              label="Points"
              height={300}
            />
          </div>
        </>
      )}

      {selected && (
        <Modal title={selected.name} sub={selected.nationality || 'Formula 1 Constructor'} onClose={() => setSelected(null)}>
          <div className="h-1 mb-6 rounded-sm" style={{ background: selected.color || 'var(--red)' }} />
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[{ v: selected.points, l: 'Points' }, { v: selected.wins, l: 'Wins' }, { v: selected.podiums, l: 'Podiums' }].map((s, i) => (
              <div key={i} className="surface-card p-4 text-center">
                <div className="font-black text-2xl mb-1" style={{ letterSpacing: '-0.04em' }}>{s.v}</div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.l}</div>
              </div>
            ))}
          </div>
          {selected.drivers?.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>Driver Lineup</div>
              {selected.drivers.map(d => (
                <div key={d._id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <TeamDot color={selected.color} />
                  <span className="font-bold text-sm">{d.name}</span>
                  {d.number && <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>#{d.number}</span>}
                </div>
              ))}
            </div>
          )}
          <button
            className={`btn-clip btn-clip-sm ${isFav(selected._id) ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => toggleFav(selected._id)}
          >
            {isFav(selected._id) ? '★ Following' : '☆ Follow Team'}
          </button>
        </Modal>
      )}
    </div>
  )
}
