import type { Match, BattleSet } from '../types';

export interface PokemonStat {
  name: string;
  appearances: number;
  wins: number;
  losses: number;
  winRate: number;
  asLead: number;
  asSwitch: number;
  asCloser: number;
}

export interface TypeStat {
  type: string;
  count: number;
  percentage: number;
}

export interface SeasonMetrics {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  sets: number;
  positiveSets: number;
  setWinRate: number;
}

function normalize(name: string | null | undefined): string {
  if (!name) return '';
  return name.trim().toUpperCase();
}

export function computeMyPokemonStats(matches: Match[]): PokemonStat[] {
  const stats: Record<string, PokemonStat> = {};

  for (const m of matches) {
    const positions = [
      { name: normalize(m.myLead), pos: 'lead' },
      { name: normalize(m.mySwitch), pos: 'switch' },
      { name: normalize(m.myCloser), pos: 'closer' },
    ];
    const win = m.result === 'VITÓRIA';
    for (const { name, pos } of positions) {
      if (!name) continue;
      if (!stats[name]) {
        stats[name] = { name, appearances: 0, wins: 0, losses: 0, winRate: 0, asLead: 0, asSwitch: 0, asCloser: 0 };
      }
      stats[name].appearances++;
      if (win) stats[name].wins++; else stats[name].losses++;
      if (pos === 'lead') stats[name].asLead++;
      if (pos === 'switch') stats[name].asSwitch++;
      if (pos === 'closer') stats[name].asCloser++;
    }
  }

  return Object.values(stats)
    .map((s) => ({ ...s, winRate: s.appearances > 0 ? s.wins / s.appearances : 0 }))
    .sort((a, b) => b.appearances - a.appearances);
}

export function computeOppPokemonStats(matches: Match[]): PokemonStat[] {
  const stats: Record<string, PokemonStat> = {};

  for (const m of matches) {
    const positions = [
      { name: normalize(m.oppLead), pos: 'lead' },
      { name: normalize(m.oppSwitch), pos: 'switch' },
      { name: normalize(m.oppCloser), pos: 'closer' },
    ];
    const myWin = m.result === 'VITÓRIA';
    for (const { name, pos } of positions) {
      if (!name) continue;
      if (!stats[name]) {
        stats[name] = { name, appearances: 0, wins: 0, losses: 0, winRate: 0, asLead: 0, asSwitch: 0, asCloser: 0 };
      }
      stats[name].appearances++;
      // wins/losses from MY perspective facing this pokemon
      if (!myWin) stats[name].wins++; else stats[name].losses++;
      if (pos === 'lead') stats[name].asLead++;
      if (pos === 'switch') stats[name].asSwitch++;
      if (pos === 'closer') stats[name].asCloser++;
    }
  }

  return Object.values(stats)
    .map((s) => ({ ...s, winRate: s.appearances > 0 ? s.wins / s.appearances : 0 }))
    .sort((a, b) => b.appearances - a.appearances);
}

export function computeWinRateTrend(
  sets: BattleSet[],
  seasonId?: string,
): Array<{ label: string; winRate: number; wins: number; losses: number }> {
  const filtered = seasonId ? sets.filter((s) => s.seasonId === seasonId) : sets;
  return filtered.slice(-30).map((s) => ({
    label: `Set ${s.setNumber}`,
    winRate: s.wins + s.losses > 0 ? s.wins / (s.wins + s.losses) : 0,
    wins: s.wins,
    losses: s.losses,
  }));
}

export function computeSeasonMetrics(
  seasonId: string,
  sets: BattleSet[],
  matches: Match[],
): SeasonMetrics {
  const seasonSets = sets.filter((s) => s.seasonId === seasonId);
  const seasonMatches = matches.filter((m) => m.seasonId === seasonId);
  const wins = seasonMatches.filter((m) => m.result === 'VITÓRIA').length;
  const positiveSets = seasonSets.filter((s) => s.wins > s.losses).length;

  return {
    totalBattles: seasonMatches.length,
    wins,
    losses: seasonMatches.length - wins,
    winRate: seasonMatches.length > 0 ? wins / seasonMatches.length : 0,
    sets: seasonSets.length,
    positiveSets,
    setWinRate: seasonSets.length > 0 ? positiveSets / seasonSets.length : 0,
  };
}

export function computeCurrentStreak(matches: Match[]): number {
  if (!matches.length) return 0;
  const sorted = [...matches].sort((a, b) => a.id.localeCompare(b.id));
  let streak = 0;
  const last = sorted[sorted.length - 1].result;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].result === last) streak++;
    else break;
  }
  return last === 'VITÓRIA' ? streak : -streak;
}

export function computeLeagueStats(
  matches: Match[],
  sets: BattleSet[],
): Record<string, { matches: number; wins: number; winRate: number }> {
  const result: Record<string, { matches: number; wins: number; winRate: number }> = {};

  for (const m of matches) {
    const s = sets.find((bs) => bs.id === m.setId);
    const league = s?.league || m.cup || 'GRANDE';
    if (!result[league]) result[league] = { matches: 0, wins: 0, winRate: 0 };
    result[league].matches++;
    if (m.result === 'VITÓRIA') result[league].wins++;
  }

  for (const key of Object.keys(result)) {
    result[key].winRate = result[key].matches > 0 ? result[key].wins / result[key].matches : 0;
  }

  return result;
}

export function formatPercent(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

export function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}
