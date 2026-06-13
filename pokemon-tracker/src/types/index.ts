export type PokemonType =
  | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy';

export type BaseLeague = 'GRANDE' | 'ULTRA' | 'MASTER';
export type League = BaseLeague | string;

export interface Season {
  id: string;
  number: number;
  period: string;
  isActive: boolean;
  totalBattles: number;
  wins: number;
  bestStreak: number;
  finalScore: number | null;
  maxScore: number | null;
  stardust: number;
}

export interface BattleSet {
  id: string;
  seasonId: string;
  setNumber: number;
  league: League;
  myLead: string;
  mySwitch: string;
  myCloser: string;
  wins: number;
  losses: number;
  score: number | null;
}

export interface Match {
  id: string;
  setId: string;
  seasonId: string;
  matchNumber: number;
  cup: string;
  myLead: string | null;
  mySwitch: string | null;
  myCloser: string | null;
  oppLead: string | null;
  oppSwitch: string | null;
  oppCloser: string | null;
  result: 'VITÓRIA' | 'DERROTA';
  createdAt: string;
}

export interface CustomLeague {
  id: string;
  name: string;
  basedOn: BaseLeague;
  description?: string;
}

export interface TeamConfig {
  id: string;
  name: string;
  league: League;
  lead: string;
  switch: string;
  closer: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  anthropicApiKey: string;
  defaultLeague: League;
}

export interface TypeEffectiveness {
  type: PokemonType;
  multiplier: number;
}

export interface TeamAnalysis {
  weaknesses: TypeEffectiveness[];
  resistances: TypeEffectiveness[];
  immunities: TypeEffectiveness[];
  coverage: PokemonType[];
}
