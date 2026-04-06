import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Spinner, EmptyState, PosBadge, TeamDot } from '../components/common/index'

export default function Home() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/analytics'), api.get('/races')])
      .then(([a, r]) => { setAnalytics(a.data); setRaces(r.data) })
      .finally(() => setLoading(false))
  }, [])

  const upcoming = races.filter(r => new Date(r.date) > new Date()).slice(0, 3)
  const topDrivers = analytics?.driverStandings?.slice(0, 8) || []

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260227_042027_c4b2f2ea-1c7c-4d6e-9e3d-81a78063703f.mp4"
          autoPlay loop muted playsInline
        />
        {/* Bottom gradient for content readability */}
        <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />

        <div className="absolute z-[2] bottom-20 left-16 md:left-24 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Live tag */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5"
              style={{ background: 'rgba(238,63,44,0.15)', border: '1px solid rgba(238,63,44,0.4)' }}>
              <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'blink 1.5s infinite' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--red)' }}>Live Season 2025</span>
            </div>

            <h1 className="font-black uppercase leading-none mb-6"
              style={{ fontSize: 'clamp(44px,6vw,82px)', letterSpacing: '-0.03em' }}>
              Swift and{' '}
              <span style={{ color: 'var(--red)' }}>Simple</span>
              <br />F1 Analytics
            </h1>

            <p className="mb-10 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 460 }}>
              Real-time Formula 1 performance data, pit stop analysis,
              driver comparisons, and championship insights — all in one place.
            </p>

            <div className="flex gap-4 items-center flex-wrap">
              <button className="btn-clip btn-primary" onClick={() => navigate('/dashboard')}>
                Get Started
              </button>
              <button className="btn-clip btn-outline" onClick={() => navigate('/drivers')}>
                View Drivers
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute z-[2] bottom-10 right-16 flex flex-col items-center gap-2"
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom,var(--red),transparent)', animation: 'heroLine 1.6s ease infinite' }} />
          Scroll
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="grid grid-cols-2 md:grid-cols-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.85)' }}>
        {[
          { v: analytics?.driverStandings?.length || 0, l: 'Drivers' },
          { v: analytics?.teamStandings?.length || 0, l: 'Constructors' },
          { v: analytics?.totalRaces || 0, l: 'Races' },
          { v: analytics?.pitEfficiency?.length || 0, l: 'Teams Analysed' },
        ].map((s, i) => (
          <div key={i} className="px-8 py-7" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
            <div className="font-black leading-none mb-1" style={{ fontSize: 38, letterSpacing: '-0.05em', color: 'var(--red)' }}>{s.v}</div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── STANDINGS PREVIEW ── */}
      <section className="px-8 md:px-16 py-20">
        <div className="mb-12">
          <div className="section-tag">Championship</div>
          <h2 className="section-title">Driver Standings</h2>
          <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 440, lineHeight: 1.7 }}>
            Current World Championship standings ranked by total points.
          </p>
        </div>

        {loading ? <Spinner /> : topDrivers.length === 0 ? (
          <EmptyState icon="🏎️" title="No Standings Yet" sub="An admin needs to add drivers, races and results first." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="f1-table">
                <thead>
                  <tr>
                    <th>Pos</th><th>Driver</th><th>Team</th>
                    <th>Wins</th><th>Podiums</th><th>Points</th><th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topDrivers.map((d, i) => (
                    <tr key={d._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/drivers')}>
                      <td><PosBadge pos={String(i + 1)} /></td>
                      <td>
                        <div className="font-bold">{d.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>#{d.number}</div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <TeamDot color={d.team?.color} />
                          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{d.team?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="font-bold">{d.wins}</td>
                      <td className="font-bold">{d.podiums}</td>
                      <td className="font-black text-lg">{d.points}</td>
                      <td>
                        <span className="font-black text-sm"
                          style={{ color: d.rating > 70 ? '#22c55e' : d.rating > 40 ? '#f59e0b' : 'var(--red)' }}>
                          {d.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="btn-clip btn-clip-sm btn-outline" onClick={() => navigate('/dashboard')}>
                Full Standings →
              </button>
            </div>
          </>
        )}
      </section>

      {/* ── UPCOMING RACES ── */}
      {upcoming.length > 0 && (
        <section className="px-8 md:px-16 pb-20">
          <div className="mb-10">
            <div className="section-tag">Calendar</div>
            <h2 className="section-title">Upcoming Races</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {upcoming.map(r => (
              <motion.div
                key={r._id}
                whileHover={{ borderColor: 'rgba(238,63,44,0.4)', y: -3 }}
                className="surface-card p-6 cursor-pointer transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => navigate('/races')}
              >
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--red)' }}>
                  Round {r.round} · {r.season}
                </div>
                <div className="font-black text-lg mb-1" style={{ letterSpacing: '-0.02em' }}>{r.name}</div>
                <div className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.circuit}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="badge badge-green">Upcoming</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
