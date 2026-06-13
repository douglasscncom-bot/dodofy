import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, ReferenceLine,
} from 'recharts';
import { useStore } from '../store/useStore';
import { computeMyPokemonStats, computeOppPokemonStats, computeWinRateTrend, formatPercent } from '../utils/metrics';
import { getPokemonTypes } from '../data/pokemonTypes';
import { TYPE_COLORS, TYPE_LABELS_PT } from '../data/typeColors';
import type { PokemonType } from '../types';

const TABS = ['Pokémons', 'Tipagens', 'Temporadas', 'Sets'] as const;
type Tab = typeof TABS[number];

function PokemonTable({ stats, title }: { stats: ReturnType<typeof computeMyPokemonStats>; title: string }) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {stats.slice(0, 20).map((p, i) => {
          const types = getPokemonTypes(p.name);
          const t1 = types?.[0];
          const t2 = types?.[1];
          const c1 = t1 ? TYPE_COLORS[t1] : '#374151';
          const c2 = t2 ? TYPE_COLORS[t2] : null;

          return (
            <div key={p.name} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
              <span className="text-gray-500 text-sm w-6 text-right flex-shrink-0">{i + 1}</span>
              <div
                className="w-2 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: c1 }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm truncate">{p.name}</span>
                  {t1 && (
                    <span className="text-white text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ backgroundColor: c1 }}>
                      {TYPE_LABELS_PT[t1]}
                    </span>
                  )}
                  {t2 && c2 && (
                    <span className="text-white text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ backgroundColor: c2 }}>
                      {TYPE_LABELS_PT[t2]}
                    </span>
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  L:{p.asLead} · S:{p.asSwitch} · C:{p.asCloser}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white font-bold text-sm">{p.appearances}×</div>
                <div className={`text-xs font-semibold ${p.winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(p.winRate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypeDistribution({ matches }: { matches: any[] }) {
  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const wins: Record<string, number> = {};

    for (const m of matches) {
      const pokemons = [m.myLead, m.mySwitch, m.myCloser].filter(Boolean);
      for (const p of pokemons) {
        const types = getPokemonTypes(p);
        if (!types) continue;
        for (const t of types.filter(Boolean) as PokemonType[]) {
          const label = TYPE_LABELS_PT[t];
          counts[label] = (counts[label] || 0) + 1;
          if (m.result === 'VITÓRIA') wins[label] = (wins[label] || 0) + 1;
        }
      }
    }

    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        winRate: wins[type] ? wins[type] / count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [matches]);

  const oppTypeStats = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const m of matches) {
      const pokemons = [m.oppLead, m.oppSwitch, m.oppCloser].filter(Boolean);
      for (const p of pokemons) {
        const types = getPokemonTypes(p);
        if (!types) continue;
        for (const t of types.filter(Boolean) as PokemonType[]) {
          const label = TYPE_LABELS_PT[t];
          counts[label] = (counts[label] || 0) + 1;
        }
      }
    }

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [matches]);

  const getTypeColor = (typePt: string) => {
    const entry = Object.entries(TYPE_LABELS_PT).find(([, v]) => v === typePt);
    return entry ? TYPE_COLORS[entry[0] as PokemonType] : '#6b7280';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-3">Meus Tipos Mais Usados</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={typeStats} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="type"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(v, name) => [v, name === 'count' ? 'Usos' : 'Taxa']}
            />
            <Bar dataKey="count" name="Usos">
              {typeStats.map((entry) => (
                <Cell key={entry.type} fill={getTypeColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Tipos Mais Enfrentados</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={oppTypeStats} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="type"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            />
            <Bar dataKey="count" name="Aparições">
              {oppTypeStats.map((entry) => (
                <Cell key={entry.type} fill={getTypeColor(entry.type)} opacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SeasonsChart({ seasons, matches }: { seasons: any[]; sets?: any[]; matches: any[] }) {
  const data = useMemo(() => {
    return seasons
      .filter((s) => s.totalBattles > 0 || matches.filter((m) => m.seasonId === s.id).length > 0)
      .map((s) => {
        const sm = matches.filter((m) => m.seasonId === s.id);
        const wins = sm.filter((m) => m.result === 'VITÓRIA').length;
        const total = sm.length || s.totalBattles;
        return {
          name: `T${s.number}`,
          taxa: total > 0 ? +(wins / total * 100).toFixed(1) : 0,
          batalhas: total,
          rating: s.finalScore || 0,
        };
      });
  }, [seasons, matches]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-3">Taxa de Vitória por Temporada</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} stroke="#6b7280" />
            <YAxis domain={[40, 60]} tickFormatter={(v) => v + '%'} tick={{ fill: '#9ca3af', fontSize: 11 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(v) => [`${v}%`, 'Taxa de Vitória']}
            />
            <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="4 4" />
            <Bar dataKey="taxa" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.some((d) => d.rating > 0) && (
        <div>
          <h3 className="text-white font-semibold mb-3">Rating Final por Temporada</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.filter((d) => d.rating > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} stroke="#6b7280" />
              <YAxis domain={[1800, 2600]} tick={{ fill: '#9ca3af', fontSize: 11 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="rating" stroke="#FAC000" strokeWidth={2} dot={{ fill: '#FAC000', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function Metrics() {
  const { seasons, sets: allSets, matches } = useStore();
  const [tab, setTab] = useState<Tab>('Pokémons');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');

  const filteredMatches = useMemo(
    () => seasonFilter === 'all' ? matches : matches.filter((m) => m.seasonId === seasonFilter),
    [matches, seasonFilter],
  );

  const myStats = useMemo(() => computeMyPokemonStats(filteredMatches), [filteredMatches]);
  const oppStats = useMemo(() => computeOppPokemonStats(filteredMatches), [filteredMatches]);

  const wins = filteredMatches.filter((m) => m.result === 'VITÓRIA').length;
  const winRate = filteredMatches.length > 0 ? wins / filteredMatches.length : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Métricas</h1>
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="bg-gray-700 text-white rounded-xl px-3 py-1.5 text-sm border border-gray-600 focus:outline-none"
        >
          <option value="all">Todas as temporadas</option>
          {[...seasons].reverse().map((s) => (
            <option key={s.id} value={s.id}>T{s.number} — {s.period}</option>
          ))}
        </select>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-white">{filteredMatches.length}</div>
          <div className="text-gray-400 text-xs">Batalhas</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className={`text-xl font-bold ${winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercent(winRate)}
          </div>
          <div className="text-gray-400 text-xs">Taxa</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{myStats.length}</div>
          <div className="text-gray-400 text-xs">Pokémons</div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'Pokémons' && (
          <div className="space-y-6">
            <PokemonTable stats={myStats} title="Meus Pokémons (por aparições)" />
            <PokemonTable stats={oppStats} title="Pokémons Adversários (por aparições)" />
          </div>
        )}
        {tab === 'Tipagens' && <TypeDistribution matches={filteredMatches} />}
        {tab === 'Temporadas' && <SeasonsChart seasons={seasons} sets={allSets} matches={matches} />}
        {tab === 'Sets' && (
          <div>
            <h3 className="text-white font-semibold mb-3">Tendência por Set (últimos 30)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={computeWinRateTrend(
                  allSets.filter((s) => seasonFilter === 'all' || s.seasonId === seasonFilter),
                ).map((d) => ({ ...d, taxa: +(d.winRate * 100).toFixed(1) }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" tick={false} stroke="#6b7280" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => v + '%'} tick={{ fill: '#9ca3af', fontSize: 11 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(v) => [`${v}%`, 'Taxa']}
                />
                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="taxa" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
