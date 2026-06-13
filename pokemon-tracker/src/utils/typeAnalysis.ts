import type { PokemonType } from '../types';
import { getPokemonTypes } from '../data/pokemonTypes';
import { getDefensiveMultiplier, getTeamTypeVulnerabilities } from '../data/typeChart';
import { ALL_TYPES, TYPE_LABELS_PT } from '../data/typeColors';

export interface TeamWeaknessInfo {
  type: PokemonType;
  labelPt: string;
  maxMultiplier: number;
  multipliers: number[];
  threatLevel: 'critical' | 'high' | 'medium' | 'low' | 'resist' | 'immune';
}

export function analyzeTeam(pokemonNames: string[]): TeamWeaknessInfo[] {
  const typedPokemon = pokemonNames
    .map((name) => {
      const types = getPokemonTypes(name);
      if (!types) return null;
      return { type1: types[0], type2: types[1] ?? null };
    })
    .filter(Boolean) as Array<{ type1: PokemonType; type2: PokemonType | null }>;

  if (typedPokemon.length === 0) return [];

  const vulns = getTeamTypeVulnerabilities(typedPokemon);
  const results: TeamWeaknessInfo[] = [];

  for (const t of ALL_TYPES) {
    const mults = vulns[t];
    const maxMult = Math.max(...mults);
    const countHigh = mults.filter((m) => m >= 1.6).length;

    let threatLevel: TeamWeaknessInfo['threatLevel'];
    if (maxMult >= 2.56) {
      threatLevel = 'critical';
    } else if (maxMult >= 1.6 && countHigh >= 2) {
      threatLevel = 'critical';
    } else if (maxMult >= 1.6) {
      threatLevel = 'high';
    } else if (maxMult >= 1.0) {
      threatLevel = 'medium';
    } else if (maxMult <= 0.39) {
      threatLevel = 'immune';
    } else {
      threatLevel = 'resist';
    }

    results.push({
      type: t,
      labelPt: TYPE_LABELS_PT[t],
      maxMultiplier: maxMult,
      multipliers: mults,
      threatLevel,
    });
  }

  return results.sort((a, b) => b.maxMultiplier - a.maxMultiplier);
}

export function getOffensiveCoverage(pokemonNames: string[]): PokemonType[] {
  // Determine what types the team's Pokemon are super effective against
  // This is a simplified version based on the team's types (not move sets)
  const types = pokemonNames.flatMap((name) => {
    const t = getPokemonTypes(name);
    return t ? t.filter(Boolean) : [];
  }) as PokemonType[];

  const covered = new Set<PokemonType>();

  for (const attackType of types) {
    for (const defType of ALL_TYPES) {
      const mult = getDefensiveMultiplier(attackType, defType);
      if (mult >= 1.6) covered.add(defType);
    }
  }

  return Array.from(covered);
}

export function threatLevelColor(level: TeamWeaknessInfo['threatLevel']): string {
  switch (level) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    case 'resist': return '#3b82f6';
    case 'immune': return '#8b5cf6';
    default: return '#9ca3af';
  }
}

export function threatLevelLabel(level: TeamWeaknessInfo['threatLevel']): string {
  switch (level) {
    case 'critical': return '2× Fraqueza';
    case 'high': return 'Fraqueza';
    case 'medium': return 'Neutro';
    case 'low': return 'Parcial';
    case 'resist': return 'Resistência';
    case 'immune': return 'Imunidade';
    default: return '';
  }
}
