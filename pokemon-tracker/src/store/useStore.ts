import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Season, BattleSet, Match, TeamConfig, CustomLeague, AppSettings } from '../types';

interface StoreState {
  seasons: Season[];
  sets: BattleSet[];
  matches: Match[];
  teams: TeamConfig[];
  customLeagues: CustomLeague[];
  settings: AppSettings;
  seeded: boolean;

  // Actions
  seedData: (seasons: Season[], sets: BattleSet[], matches: Match[]) => void;
  addSeason: (s: Season) => void;
  updateSeason: (id: string, s: Partial<Season>) => void;
  addSet: (s: BattleSet) => void;
  addMatch: (m: Match) => void;
  updateMatch: (id: string, m: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  addTeam: (t: TeamConfig) => void;
  updateTeam: (id: string, t: Partial<TeamConfig>) => void;
  deleteTeam: (id: string) => void;
  setActiveTeam: (id: string, league: string) => void;
  addCustomLeague: (l: CustomLeague) => void;
  deleteCustomLeague: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  importMatches: (seasons: Season[], sets: BattleSet[], matches: Match[]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      seasons: [],
      sets: [],
      matches: [],
      teams: [],
      customLeagues: [],
      settings: { anthropicApiKey: '', defaultLeague: 'GRANDE' },
      seeded: false,

      seedData: (seasons, sets, matches) =>
        set({ seasons, sets, matches, seeded: true }),

      addSeason: (s) => set((state) => ({ seasons: [...state.seasons, s] })),

      updateSeason: (id, updates) =>
        set((state) => ({
          seasons: state.seasons.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      addSet: (s) => set((state) => ({ sets: [...state.sets, s] })),

      addMatch: (m) =>
        set((state) => {
          const newMatches = [...state.matches, m];
          // Update set wins/losses
          const s = state.sets.find((s) => s.id === m.setId);
          if (!s) return { matches: newMatches };
          const updatedSets = state.sets.map((bs) =>
            bs.id === m.setId
              ? {
                  ...bs,
                  wins: bs.wins + (m.result === 'VITÓRIA' ? 1 : 0),
                  losses: bs.losses + (m.result === 'DERROTA' ? 1 : 0),
                }
              : bs,
          );
          // Update season totals
          const updatedSeasons = state.seasons.map((ss) =>
            ss.id === m.seasonId
              ? {
                  ...ss,
                  totalBattles: ss.totalBattles + 1,
                  wins: ss.wins + (m.result === 'VITÓRIA' ? 1 : 0),
                }
              : ss,
          );
          return { matches: newMatches, sets: updatedSets, seasons: updatedSeasons };
        }),

      updateMatch: (id, updates) =>
        set((state) => ({
          matches: state.matches.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteMatch: (id) =>
        set((state) => ({ matches: state.matches.filter((m) => m.id !== id) })),

      addTeam: (t) => set((state) => ({ teams: [...state.teams, t] })),

      updateTeam: (id, updates) =>
        set((state) => ({
          teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTeam: (id) =>
        set((state) => ({ teams: state.teams.filter((t) => t.id !== id) })),

      setActiveTeam: (id, league) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.league === league ? { ...t, isActive: t.id === id } : t,
          ),
        })),

      addCustomLeague: (l) =>
        set((state) => ({ customLeagues: [...state.customLeagues, l] })),

      deleteCustomLeague: (id) =>
        set((state) => ({ customLeagues: state.customLeagues.filter((l) => l.id !== id) })),

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      importMatches: (seasons, sets, matches) =>
        set((state) => ({
          seasons: [...seasons],
          sets: [...state.sets, ...sets.filter((s) => !state.sets.find((e) => e.id === s.id))],
          matches: [...state.matches, ...matches.filter((m) => !state.matches.find((e) => e.id === m.id))],
        })),
    }),
    {
      name: 'poketracker-storage',
      version: 1,
    },
  ),
);
