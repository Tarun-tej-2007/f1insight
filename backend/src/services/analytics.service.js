const Result = require('../models/Result');
const Driver = require('../models/Driver');
const Team = require('../models/Team');
const Race = require('../models/Race');
const PitStop = require('../models/PitStop');

/**
 * Compute dynamic performance rating (0–100) for a driver.
 * Based on: avg position, wins, podiums, points, and improvement trend.
 */
function computeRating(results) {
  if (!results.length) return 0;

  const positions = results.map((r) => r.position);
  const avgPos = positions.reduce((a, b) => a + b, 0) / positions.length;
  const wins = results.filter((r) => r.position === 1).length;
  const podiums = results.filter((r) => r.position <= 3).length;
  const totalPoints = results.reduce((a, r) => a + (r.points || 0), 0);

  // Trend: compare first half vs second half avg position
  const half = Math.floor(results.length / 2);
  let trend = 0;
  if (half > 0) {
    const firstHalf = results.slice(0, half).reduce((a, r) => a + r.position, 0) / half;
    const secondHalf = results.slice(half).reduce((a, r) => a + r.position, 0) / (results.length - half);
    trend = firstHalf - secondHalf; // positive = improving
  }

  const consistency = Math.max(0, 100 - (avgPos - 1) * 5);
  const winBonus = Math.min(25, wins * 5);
  const podiumBonus = Math.min(15, podiums * 2);
  const pointsBonus = Math.min(20, totalPoints / 15);
  const trendBonus = Math.min(10, trend * 2);

  return Math.min(100, Math.round(consistency * 0.4 + winBonus + podiumBonus + pointsBonus + trendBonus));
}

/**
 * Compute consistency score (0–100): lower variance in finishing positions = higher score.
 */
function computeConsistency(results) {
  if (results.length < 2) return results.length === 1 ? 75 : 0;
  const positions = results.map((r) => r.position);
  const mean = positions.reduce((a, b) => a + b, 0) / positions.length;
  const variance = positions.reduce((a, p) => a + Math.pow(p - mean, 2), 0) / positions.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, Math.round(100 - stdDev * 5));
}

/**
 * Build points progression data (cumulative by race date).
 */
async function buildProgression(driverResults, races) {
  const raceMap = new Map(races.map((r) => [r._id.toString(), r]));
  const sorted = [...driverResults].sort(
    (a, b) => new Date(raceMap.get(a.race?.toString())?.date) - new Date(raceMap.get(b.race?.toString())?.date)
  );
  let cumulative = 0;
  return sorted.map((r) => {
    cumulative += r.points || 0;
    const race = raceMap.get(r.race?.toString());
    return {
      race: race?.name || 'Unknown',
      racePoints: r.points || 0,
      cumulativePoints: cumulative,
    };
  });
}

exports.getAnalytics = async () => {
  const [drivers, teams, races, allResults, allPitStops] = await Promise.all([
    Driver.find().populate('team', 'name color shortName'),
    Team.find(),
    Race.find().sort('date'),
    Result.find().populate('race', 'name date season round'),
    PitStop.find().populate('team', 'name color'),
  ]);

  // ── Driver Standings ──────────────────────────────────────
  const driverStandings = await Promise.all(
    drivers.map(async (d) => {
      const dResults = allResults.filter((r) => r.driver?.toString() === d._id.toString());
      const points = dResults.reduce((a, r) => a + (r.points || 0), 0);
      const wins = dResults.filter((r) => r.position === 1).length;
      const podiums = dResults.filter((r) => r.position <= 3).length;
      const rating = computeRating(dResults);
      const consistency = computeConsistency(dResults);
      const progression = await buildProgression(dResults, races);
      const positionGains = dResults
        .filter((r) => r.gridPosition)
        .reduce((a, r) => a + (r.gridPosition - r.position), 0);

      return {
        _id: d._id,
        name: d.name,
        number: d.number,
        nationality: d.nationality,
        team: d.team,
        points,
        wins,
        podiums,
        raceCount: dResults.length,
        rating,
        consistency,
        progression,
        positionGains,
      };
    })
  );
  driverStandings.sort((a, b) => b.points - a.points);

  // ── Team Standings ────────────────────────────────────────
  const teamStandings = teams.map((t) => {
    const tDrivers = drivers.filter((d) => d.team?._id?.toString() === t._id.toString());
    const tDriverIds = new Set(tDrivers.map((d) => d._id.toString()));
    const tResults = allResults.filter((r) => tDriverIds.has(r.driver?.toString()));
    const points = tResults.reduce((a, r) => a + (r.points || 0), 0);
    const wins = tResults.filter((r) => r.position === 1).length;
    const podiums = tResults.filter((r) => r.position <= 3).length;

    // Points per race trend
    const racePoints = {};
    tResults.forEach((r) => {
      const key = r.race?._id?.toString();
      if (key) racePoints[key] = (racePoints[key] || 0) + (r.points || 0);
    });

    return {
      _id: t._id,
      name: t.name,
      shortName: t.shortName,
      color: t.color,
      nationality: t.nationality,
      points,
      wins,
      podiums,
      drivers: tDrivers.map((d) => ({ _id: d._id, name: d.name, number: d.number })),
    };
  });
  teamStandings.sort((a, b) => b.points - a.points);

  // ── Pit Stop Efficiency ───────────────────────────────────
  const teamPitMap = {};
  allPitStops.forEach((ps) => {
    const tid = ps.team?._id?.toString();
    if (!tid) return;
    if (!teamPitMap[tid]) teamPitMap[tid] = { team: ps.team, times: [] };
    teamPitMap[tid].times.push(ps.duration);
  });

  const pitEfficiency = Object.values(teamPitMap).map(({ team, times }) => {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const best = Math.min(...times);
    const worst = Math.max(...times);
    const stdDev = Math.sqrt(times.reduce((a, t) => a + Math.pow(t - avg, 2), 0) / times.length);
    const efficiency = Math.max(0, Math.round(100 - avg * 10 - stdDev * 5));
    return {
      team: { _id: team._id, name: team.name, color: team.color },
      avgTime: Math.round(avg * 100) / 100,
      bestTime: Math.round(best * 100) / 100,
      worstTime: Math.round(worst * 100) / 100,
      stopCount: times.length,
      efficiency,
    };
  });
  pitEfficiency.sort((a, b) => a.avgTime - b.avgTime);

  return { driverStandings, teamStandings, pitEfficiency, totalRaces: races.length };
};
