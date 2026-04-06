import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner, EmptyState, PosBadge, TeamDot, StatCard, PageHeader } from '../components/common/index'
import { ProgressionChart, F1BarChart, RatingBar, PitStopBar } from '../components/charts/index'

const COLORS = ['#EE3F2C','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4','#84cc16']

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('standings')

  useEffect(() => {
    api.get('/analytics').then(r => setAnalytics(r.data)).finally(() => setLoading(false))
  }, [])

  const { driverStandings = [], teamStandings = [], pitEfficiency = [] } = analytics || {}

  // Build progression chart data
  const { progressionData, chartDrivers } = useMemo(() => {
    const top6 = driverStandings.slice(0, 6)
    if (!top6.length) return { progressionData: [], chartDrivers: [] }
    // Collect all race names from progressions
    const raceNames = [...new Set(
      top6.flatMap(d => (d.progression || []).map(p => p.race))
    )]
    const data = raceNames.map(race => {
      const row = { race: race.length > 14 ? race.slice(0, 13) + '…' : race }
      top6.forEach(d => {
        const pt = (d.progression || []).find(p => p.race === race)
        row[d.name] = pt?.cumulativePoints ?? undefined
      })
      return row
    })
    return { progressionData: data, chartDrivers: top6 }
  }, [driverStandings])

  const TABS = [
    { id: 'standings', label: 'Standings' },
    { id: 'progression', label: 'Points Progression' },
    { id: 'pitstops', label: 'Pit Stop Analysis' },
    { id: 'ratings', label: 'Performance Ratings' },
  ]

  if (loading) return <div className="pt-32 px-16"><Spinner /></div>

  const maxPitTime = Math.max(...pitEfficiency.map(p => p.avgTime), 1)

  return (
    <div className="pt-28 pb-20 px-8 md:px-16">
      <PageHeader
        tag="Dashboard"
        title={user ? `Welcome, ${user.name.split(' ')[0]}` : 'Analytics Overview'}
        sub="Real-time performance data and championship insights for the current season."
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard value={driverStandings.length} label="Drivers" />
        <StatCard value={teamStandings.length} label="Constructors" />
        <StatCard value={analytics?.totalRaces || 0} label="Races" />
        <StatCard value={pitEfficiency.length} label="Teams Tracked" accent="var(--red)" />
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-8 overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {TABS.map(t => (
          <button key={t.id} className={`f1-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Standings ── */}
      {tab === 'standings' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
              Driver Championship
            </div>
            {driverStandings.length === 0 ? <EmptyState icon="🏆" /> : (
              <table className="f1-table w-full">
                <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Pts</th></tr></thead>
                <tbody>
                  {driverStandings.slice(0, 12).map((d, i) => (
                    <tr key={d._id}>
                      <td><PosBadge pos={String(i + 1)} /></td>
                      <td><span className="font-bold">{d.name}</span></td>
                      <td>
                        <div className="flex items-center">
                          <TeamDot color={d.team?.color} />
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{d.team?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="font-black text-base">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
              Constructor Championship
            </div>
            {teamStandings.length === 0 ? <EmptyState icon="🏭" /> : (
              <table className="f1-table w-full">
                <thead><tr><th>Pos</th><th>Constructor</th><th>Wins</th><th>Pts</th></tr></thead>
                <tbody>
                  {teamStandings.slice(0, 12).map((t, i) => (
                    <tr key={t._id}>
                      <td><PosBadge pos={String(i + 1)} /></td>
                      <td><div className="flex items-center"><TeamDot color={t.color} /><span className="font-bold">{t.name}</span></div></td>
                      <td className="font-bold">{t.wins}</td>
                      <td className="font-black text-base">{t.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Progression ── */}
      {tab === 'progression' && (
        progressionData.length === 0
          ? <EmptyState icon="📈" title="No Progression Data" sub="Add races and results to see cumulative points charts." />
          : <div className="surface-card p-7">
              <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
                Points Progression — Top 6 Drivers
              </div>
              <ProgressionChart data={progressionData} drivers={chartDrivers} />
            </div>
      )}

      {/* ── Pit Stops ── */}
      {tab === 'pitstops' && (
        pitEfficiency.length === 0
          ? <EmptyState icon="⏱️" title="No Pit Stop Data" sub="Add pit stop records via Admin Panel." />
          : <div className="grid md:grid-cols-2 gap-8">
              <div className="surface-card p-7">
                <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
                  Avg Pit Stop Time (seconds)
                </div>
                {pitEfficiency.map((ps, i) => (
                  <PitStopBar
                    key={ps.team._id}
                    teamName={ps.team.name}
                    avgTime={ps.avgTime}
                    bestTime={ps.bestTime}
                    color={ps.team.color}
                    maxTime={maxPitTime}
                    rank={i}
                  />
                ))}
              </div>
              <div className="surface-card p-7">
                <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
                  Comparison Chart
                </div>
                <F1BarChart
                  data={pitEfficiency.map(p => ({ name: p.team.name, avgTime: p.avgTime }))}
                  dataKey="avgTime"
                  nameKey="name"
                  label="Avg Time (s)"
                  height={280}
                />
              </div>
            </div>
      )}

      {/* ── Ratings ── */}
      {tab === 'ratings' && (
        driverStandings.length === 0
          ? <EmptyState icon="⭐" title="No Rating Data" />
          : <div className="grid md:grid-cols-2 gap-8">
              <div className="surface-card p-7">
                <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
                  Performance Ratings (0–100)
                </div>
                {driverStandings.map(d => (
                  <RatingBar key={d._id} name={d.name} value={d.rating} />
                ))}
              </div>
              <div className="surface-card p-7">
                <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
                  Rating Distribution
                </div>
                <F1BarChart
                  data={driverStandings.slice(0, 10).map(d => ({ name: d.name, rating: d.rating }))}
                  dataKey="rating"
                  nameKey="name"
                  label="Rating"
                  height={300}
                />
              </div>
            </div>
      )}
    </div>
  )
}
