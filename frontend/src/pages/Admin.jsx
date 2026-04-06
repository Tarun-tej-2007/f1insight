import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, EmptyState, Modal, PosBadge, TeamDot, FormInput, FormSelect } from '../components/common/index'
import api from '../services/api'

const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

// ── Sidebar nav ───────────────────────────────────────────
const NAV = [
  { id: 'overview', icon: '▣', label: 'Overview' },
  { id: 'drivers', icon: '🏎', label: 'Drivers' },
  { id: 'teams', icon: '🏭', label: 'Teams' },
  { id: 'races', icon: '🏁', label: 'Races' },
  { id: 'results', icon: '📊', label: 'Results' },
  { id: 'pitstops', icon: '⏱', label: 'Pit Stops' },
]

// ── Danger delete button ──────────────────────────────────
function DelBtn({ onClick }) {
  return (
    <button
      className="btn-clip btn-clip-sm btn-danger"
      onClick={onClick}
      style={{ fontFamily: 'Rubik, sans-serif' }}
    >
      Delete
    </button>
  )
}

// ── Driver Form ───────────────────────────────────────────
function DriverForm({ teams, initial, onDone }) {
  const toast = useToast()
  const [name, setName] = useState(initial?.name || '')
  const [number, setNumber] = useState(initial?.number || '')
  const [nationality, setNationality] = useState(initial?.nationality || '')
  const [teamId, setTeamId] = useState(initial?.team?._id || initial?.team || '')

  async function submit(e) {
    e.preventDefault()
    try {
      const body = { name, number, nationality, team: teamId || undefined }
      if (initial) await api.put(`/drivers/${initial._id}`, body)
      else await api.post('/drivers', body)
      toast(initial ? 'Driver updated' : 'Driver added', 'success')
      onDone()
    } catch (err) { toast(err.message) }
  }

  return (
    <form onSubmit={submit}>
      <FormInput label="Driver Name" value={name} onChange={setName} required />
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Car Number" value={number} onChange={setNumber} placeholder="44" />
        <FormInput label="Nationality" value={nationality} onChange={setNationality} placeholder="British" />
      </div>
      <FormSelect label="Team" value={teamId} onChange={setTeamId}
        options={teams.map(t => ({ value: t._id, label: t.name }))} />
      <button className="btn-clip btn-primary" type="submit">{initial ? 'Update Driver' : 'Add Driver'}</button>
    </form>
  )
}

// ── Team Form ─────────────────────────────────────────────
function TeamForm({ initial, onDone }) {
  const toast = useToast()
  const [name, setName] = useState(initial?.name || '')
  const [shortName, setShortName] = useState(initial?.shortName || '')
  const [nationality, setNationality] = useState(initial?.nationality || '')
  const [color, setColor] = useState(initial?.color || '#EE3F2C')

  async function submit(e) {
    e.preventDefault()
    try {
      const body = { name, shortName, nationality, color }
      if (initial) await api.put(`/teams/${initial._id}`, body)
      else await api.post('/teams', body)
      toast(initial ? 'Team updated' : 'Team added', 'success')
      onDone()
    } catch (err) { toast(err.message) }
  }

  return (
    <form onSubmit={submit}>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Team Name" value={name} onChange={setName} required />
        <FormInput label="Short Name" value={shortName} onChange={setShortName} placeholder="RBR" />
      </div>
      <FormInput label="Nationality" value={nationality} onChange={setNationality} placeholder="Austrian" />
      <div className="mb-5">
        <label className="f1-label">Team Color</label>
        <div className="flex gap-3 items-center">
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            style={{ width: 48, height: 40, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
          <input className="f1-input flex-1" value={color} onChange={e => setColor(e.target.value)} />
        </div>
      </div>
      <button className="btn-clip btn-primary" type="submit">{initial ? 'Update Team' : 'Add Team'}</button>
    </form>
  )
}

// ── Race Form ─────────────────────────────────────────────
function RaceForm({ initial, onDone }) {
  const toast = useToast()
  const [name, setName] = useState(initial?.name || '')
  const [circuit, setCircuit] = useState(initial?.circuit || '')
  const [country, setCountry] = useState(initial?.country || '')
  const [date, setDate] = useState(initial?.date ? initial.date.slice(0, 10) : '')
  const [season, setSeason] = useState(initial?.season || '2025')
  const [round, setRound] = useState(String(initial?.round || ''))
  const [laps, setLaps] = useState(String(initial?.laps || ''))

  async function submit(e) {
    e.preventDefault()
    try {
      const body = { name, circuit, country, date, season, round: parseInt(round) || undefined, laps: parseInt(laps) || undefined }
      if (initial) await api.put(`/races/${initial._id}`, body)
      else await api.post('/races', body)
      toast(initial ? 'Race updated' : 'Race added', 'success')
      onDone()
    } catch (err) { toast(err.message) }
  }

  return (
    <form onSubmit={submit}>
      <FormInput label="Race Name" value={name} onChange={setName} placeholder="Monaco Grand Prix" required />
      <FormInput label="Circuit" value={circuit} onChange={setCircuit} placeholder="Circuit de Monaco" />
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Country" value={country} onChange={setCountry} placeholder="Monaco" />
        <FormInput label="Date" type="date" value={date} onChange={setDate} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FormInput label="Season" value={season} onChange={setSeason} />
        <FormInput label="Round #" value={round} onChange={setRound} type="number" min="1" />
        <FormInput label="Total Laps" value={laps} onChange={setLaps} type="number" min="1" />
      </div>
      <button className="btn-clip btn-primary" type="submit">{initial ? 'Update Race' : 'Add Race'}</button>
    </form>
  )
}

// ── Result Form ───────────────────────────────────────────
function ResultForm({ drivers, teams, races, onDone }) {
  const toast = useToast()
  const [driverId, setDriverId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [raceId, setRaceId] = useState('')
  const [position, setPosition] = useState('')
  const [points, setPoints] = useState('')
  const [gridPosition, setGridPosition] = useState('')
  const [fastestLap, setFastestLap] = useState(false)

  function onPosChange(v) {
    setPosition(v)
    const p = parseInt(v)
    if (p >= 1 && p <= 20) setPoints(String(F1_POINTS[p - 1] + (fastestLap && p <= 10 ? 1 : 0)))
  }

  async function submit(e) {
    e.preventDefault()
    try {
      await api.post('/results', {
        driver: driverId, team: teamId, race: raceId,
        position: parseInt(position), points: parseFloat(points) || 0,
        gridPosition: parseInt(gridPosition) || undefined, fastestLap,
      })
      toast('Result added', 'success')
      onDone()
    } catch (err) { toast(err.message) }
  }

  return (
    <form onSubmit={submit}>
      <FormSelect label="Driver" value={driverId} onChange={setDriverId}
        options={drivers.map(d => ({ value: d._id, label: d.name }))} />
      <FormSelect label="Team" value={teamId} onChange={setTeamId}
        options={teams.map(t => ({ value: t._id, label: t.name }))} />
      <FormSelect label="Race" value={raceId} onChange={setRaceId}
        options={races.map(r => ({ value: r._id, label: `${r.name} (${r.season})` }))} />
      <div className="grid grid-cols-3 gap-4">
        <FormInput label="Finish Pos." value={position} onChange={onPosChange} type="number" min="1" />
        <FormInput label="Grid Pos." value={gridPosition} onChange={setGridPosition} type="number" min="1" />
        <FormInput label="Points" value={points} onChange={setPoints} type="number" step="0.5" />
      </div>
      <div className="flex items-center gap-3 mb-5">
        <input type="checkbox" id="fl" checked={fastestLap} onChange={e => setFastestLap(e.target.checked)}
          style={{ accentColor: 'var(--red)', width: 16, height: 16 }} />
        <label htmlFor="fl" className="text-sm font-semibold cursor-pointer">Fastest Lap (+1 pt if P1–P10)</label>
      </div>
      <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>Points auto-fill from position. F1 scoring: 25-18-15-12-10-8-6-4-2-1</p>
      <button className="btn-clip btn-primary" type="submit">Add Result</button>
    </form>
  )
}

// ── Pit Stop Form ─────────────────────────────────────────
function PitStopForm({ drivers, teams, races, onDone }) {
  const toast = useToast()
  const [driverId, setDriverId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [raceId, setRaceId] = useState('')
  const [lap, setLap] = useState('')
  const [duration, setDuration] = useState('')
  const [stopNumber, setStopNumber] = useState('1')

  async function submit(e) {
    e.preventDefault()
    try {
      await api.post('/pitstops', {
        driver: driverId, team: teamId, race: raceId,
        lap: parseInt(lap), duration: parseFloat(duration), stopNumber: parseInt(stopNumber) || 1,
      })
      toast('Pit stop added', 'success')
      onDone()
    } catch (err) { toast(err.message) }
  }

  return (
    <form onSubmit={submit}>
      <FormSelect label="Team" value={teamId} onChange={setTeamId} options={teams.map(t => ({ value: t._id, label: t.name }))} />
      <FormSelect label="Driver" value={driverId} onChange={setDriverId} options={drivers.map(d => ({ value: d._id, label: d.name }))} />
      <FormSelect label="Race" value={raceId} onChange={setRaceId} options={races.map(r => ({ value: r._id, label: r.name }))} />
      <div className="grid grid-cols-3 gap-4">
        <FormInput label="Lap #" value={lap} onChange={setLap} type="number" min="1" />
        <FormInput label="Duration (s)" value={duration} onChange={setDuration} placeholder="2.6" step="0.001" />
        <FormInput label="Stop #" value={stopNumber} onChange={setStopNumber} type="number" min="1" />
      </div>
      <button className="btn-clip btn-primary" type="submit">Add Pit Stop</button>
    </form>
  )
}

// ── Main Admin Component ───────────────────────────────────
export default function Admin() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [section, setSection] = useState('overview')
  const [drivers, setDrivers] = useState([])
  const [teams, setTeams] = useState([])
  const [races, setRaces] = useState([])
  const [results, setResults] = useState([])
  const [pitStops, setPitStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [d, t, r, res, ps] = await Promise.all([
        api.get('/drivers'), api.get('/teams'), api.get('/races'),
        api.get('/results'), api.get('/pitstops'),
      ])
      setDrivers(d.data); setTeams(t.data); setRaces(r.data)
      setResults(res.data); setPitStops(ps.data)
    } catch (e) { toast(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openModal(type, target = null) { setModal(type); setEditTarget(target) }
  function closeModal() { setModal(null); setEditTarget(null); load() }

  async function del(endpoint, id, label) {
    if (!window.confirm(`Delete this ${label}?`)) return
    try { await api.delete(`/${endpoint}/${id}`); toast(`${label} deleted`, 'success'); load() }
    catch (e) { toast(e.message) }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--red)' }}>Access Denied</div>
        <button className="btn-clip btn-primary" onClick={() => navigate('/')}>Return Home</button>
      </div>
    )
  }

  const counts = { drivers: drivers.length, teams: teams.length, races: races.length, results: results.length, pitstops: pitStops.length }

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="fixed top-0 left-0 bottom-0 z-40 flex flex-col"
        style={{ width: 240, background: 'rgba(0,0,0,0.97)', borderRight: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
        <div className="px-6 py-5 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="font-black text-base tracking-tight">
            F1<span style={{ color: 'var(--red)' }}>·</span>INSIGHT
          </div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>
            Admin Panel
          </div>
        </div>

        <div className="text-xs font-bold uppercase tracking-widest px-6 mb-2" style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em' }}>
          Management
        </div>

        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setSection(n.id)}
            className="flex items-center gap-3 px-6 py-3 text-left transition-all w-full"
            style={{
              fontFamily: 'Rubik, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              borderLeft: section === n.id ? '2px solid var(--red)' : '2px solid transparent',
              color: section === n.id ? '#fff' : 'rgba(255,255,255,0.45)',
              background: section === n.id ? 'rgba(238,63,44,0.07)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 15 }}>{n.icon}</span>
            <span>{n.label}</span>
            {n.id !== 'overview' && <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{counts[n.id]}</span>}
          </button>
        ))}

        <div className="mt-auto px-6 pb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
          <div className="text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.name}</div>
          <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--red)', letterSpacing: '0.1em' }}>Administrator</div>
          <button className="btn-clip btn-clip-sm btn-outline w-full justify-center" style={{ width: '100%', fontFamily: 'Rubik, sans-serif' }}
            onClick={() => navigate('/')}>
            ← Exit Admin
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240, padding: '48px 48px 80px', minHeight: '100vh' }}>

        {/* ── Overview ── */}
        {section === 'overview' && (
          <div>
            <h1 className="font-black uppercase text-4xl mb-2" style={{ letterSpacing: '-0.03em' }}>Admin Overview</h1>
            <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>Manage all F1 Insight data. Start by adding teams, then drivers, then races and results.</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
              {NAV.filter(n => n.id !== 'overview').map(n => (
                <div key={n.id} className="surface-card p-5 cursor-pointer" onClick={() => setSection(n.id)}>
                  <div className="text-2xl mb-2">{n.icon}</div>
                  <div className="font-black text-2xl mb-1" style={{ color: 'var(--red)', letterSpacing: '-0.04em' }}>{counts[n.id]}</div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{n.label}</div>
                </div>
              ))}
            </div>

            <div className="surface-card p-7">
              <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>Quick Add</div>
              <div className="flex flex-wrap gap-3">
                {['driver', 'team', 'race', 'result', 'pitstop'].map(type => (
                  <button key={type} className="btn-clip btn-clip-sm btn-primary" onClick={() => openModal(type)}>
                    + Add {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 surface-card p-7">
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Getting Started</div>
              {[
                { n: 1, t: 'Add Teams', s: 'Create constructor entries with team colors' },
                { n: 2, t: 'Add Drivers', s: 'Register drivers and assign them to teams' },
                { n: 3, t: 'Add Races', s: 'Create race events for the season calendar' },
                { n: 4, t: 'Add Results', s: 'Enter finishing positions — points auto-calculated' },
                { n: 5, t: 'Add Pit Stops', s: 'Log pit stop durations to enable efficiency analysis' },
              ].map(step => (
                <div key={step.n} className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-black rounded-sm"
                    style={{ background: 'var(--red)', color: '#fff' }}>{step.n}</div>
                  <div>
                    <div className="font-bold text-sm">{step.t}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{step.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Drivers ── */}
        {section === 'drivers' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black uppercase text-3xl" style={{ letterSpacing: '-0.03em' }}>Drivers</h2>
              <button className="btn-clip btn-primary" onClick={() => openModal('driver')}>+ Add Driver</button>
            </div>
            {loading ? <Spinner /> : drivers.length === 0 ? <EmptyState icon="🏎️" title="No Drivers" sub="Add your first driver." /> : (
              <table className="f1-table w-full">
                <thead><tr><th>Name</th><th>#</th><th>Nationality</th><th>Team</th><th>Actions</th></tr></thead>
                <tbody>
                  {drivers.map(d => (
                    <tr key={d._id}>
                      <td className="font-bold">{d.name}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)' }}>{d.number || '—'}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)' }}>{d.nationality || '—'}</td>
                      <td>
                        {d.team ? <div className="flex items-center"><TeamDot color={d.team.color} /><span className="text-sm">{d.team.name}</span></div> : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-clip btn-clip-sm btn-outline" onClick={() => openModal('driver', d)}>Edit</button>
                          <DelBtn onClick={() => del('drivers', d._id, 'driver')} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Teams ── */}
        {section === 'teams' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black uppercase text-3xl" style={{ letterSpacing: '-0.03em' }}>Teams</h2>
              <button className="btn-clip btn-primary" onClick={() => openModal('team')}>+ Add Team</button>
            </div>
            {loading ? <Spinner /> : teams.length === 0 ? <EmptyState icon="🏭" title="No Teams" /> : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teams.map(t => (
                  <div key={t._id} className="surface-card p-6">
                    <div className="h-1 mb-5 rounded-sm" style={{ background: t.color || 'var(--red)' }} />
                    <div className="font-black text-lg mb-1">{t.name}</div>
                    {t.shortName && <div className="text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.shortName}</div>}
                    <div className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.nationality || 'International'}</div>
                    <div className="flex gap-2">
                      <button className="btn-clip btn-clip-sm btn-outline" onClick={() => openModal('team', t)}>Edit</button>
                      <DelBtn onClick={() => del('teams', t._id, 'team')} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Races ── */}
        {section === 'races' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black uppercase text-3xl" style={{ letterSpacing: '-0.03em' }}>Races</h2>
              <button className="btn-clip btn-primary" onClick={() => openModal('race')}>+ Add Race</button>
            </div>
            {loading ? <Spinner /> : races.length === 0 ? <EmptyState icon="🏁" title="No Races" /> : (
              <table className="f1-table w-full">
                <thead><tr><th>Name</th><th>Circuit</th><th>Date</th><th>Season</th><th>Round</th><th>Actions</th></tr></thead>
                <tbody>
                  {races.map(r => (
                    <tr key={r._id}>
                      <td className="font-bold">{r.name}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)' }}>{r.circuit || '—'}</td>
                      <td>{new Date(r.date).toLocaleDateString('en-GB')}</td>
                      <td>{r.season}</td>
                      <td>{r.round || '—'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-clip btn-clip-sm btn-outline" onClick={() => openModal('race', r)}>Edit</button>
                          <DelBtn onClick={() => del('races', r._id, 'race')} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {section === 'results' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black uppercase text-3xl" style={{ letterSpacing: '-0.03em' }}>Results</h2>
              <button className="btn-clip btn-primary" onClick={() => openModal('result')}>+ Add Result</button>
            </div>
            {loading ? <Spinner /> : results.length === 0 ? <EmptyState icon="📊" title="No Results" sub="Add race results to populate standings and analytics." /> : (
              <table className="f1-table w-full">
                <thead><tr><th>Driver</th><th>Race</th><th>Pos</th><th>Grid</th><th>Points</th><th>Actions</th></tr></thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r._id}>
                      <td className="font-bold">{r.driver?.name || '—'}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{r.race?.name || '—'}</td>
                      <td><PosBadge pos={String(r.position)} /></td>
                      <td style={{ color: 'rgba(255,255,255,0.5)' }}>{r.gridPosition || '—'}</td>
                      <td className="font-black">{r.points}</td>
                      <td><DelBtn onClick={() => del('results', r._id, 'result')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Pit Stops ── */}
        {section === 'pitstops' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black uppercase text-3xl" style={{ letterSpacing: '-0.03em' }}>Pit Stops</h2>
              <button className="btn-clip btn-primary" onClick={() => openModal('pitstop')}>+ Add Pit Stop</button>
            </div>
            {loading ? <Spinner /> : pitStops.length === 0 ? <EmptyState icon="⏱️" title="No Pit Stops" sub="Add pit stop records to enable efficiency analysis." /> : (
              <table className="f1-table w-full">
                <thead><tr><th>Team</th><th>Driver</th><th>Race</th><th>Lap</th><th>Stop</th><th>Duration</th><th>Actions</th></tr></thead>
                <tbody>
                  {pitStops.map(ps => (
                    <tr key={ps._id}>
                      <td>
                        {ps.team ? <div className="flex items-center"><TeamDot color={ps.team.color} /><span className="font-bold">{ps.team.name}</span></div> : '—'}
                      </td>
                      <td>{ps.driver?.name || '—'}</td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{ps.race?.name || '—'}</td>
                      <td>{ps.lap}</td>
                      <td>{ps.stopNumber}</td>
                      <td className="font-black" style={{ color: '#22c55e' }}>{ps.duration}s</td>
                      <td><DelBtn onClick={() => del('pitstops', ps._id, 'pit stop')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {modal === 'driver' && (
        <Modal title={editTarget ? 'Edit Driver' : 'Add Driver'} onClose={closeModal}>
          <DriverForm teams={teams} initial={editTarget} onDone={closeModal} />
        </Modal>
      )}
      {modal === 'team' && (
        <Modal title={editTarget ? 'Edit Team' : 'Add Team'} onClose={closeModal}>
          <TeamForm initial={editTarget} onDone={closeModal} />
        </Modal>
      )}
      {modal === 'race' && (
        <Modal title={editTarget ? 'Edit Race' : 'Add Race'} onClose={closeModal}>
          <RaceForm initial={editTarget} onDone={closeModal} />
        </Modal>
      )}
      {modal === 'result' && (
        <Modal title="Add Result" onClose={closeModal}>
          <ResultForm drivers={drivers} teams={teams} races={races} onDone={closeModal} />
        </Modal>
      )}
      {modal === 'pitstop' && (
        <Modal title="Add Pit Stop" onClose={closeModal}>
          <PitStopForm drivers={drivers} teams={teams} races={races} onDone={closeModal} />
        </Modal>
      )}
    </div>
  )
}
