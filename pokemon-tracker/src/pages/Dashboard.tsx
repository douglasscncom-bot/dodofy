import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Zap, Flame, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/StatCard';
import { PokemonCard } from '../components/PokemonCard';
import {
  computeMyPokemonStats, computeOppPokemonStats, computeCurrentStreak,
  computeWinRateTrend, formatPercent, formatNumber,
} from '../utils/metrics';

export function Dashboard() {
  const { seasons, sets, matches } = useStore();

  const activeSeason = useMemo(() => seasons.find((s) => s.isActive) || seasons[seasons.length - 1], [seasons]);

  const activeMatches = useMemo(
    () => (activeSeason ? matches.filter((m) => m.seasonId === activeSeason.id) : []),
    [matches, activeSeason],
  );

  const activeSets = useMemo(
    () => (activeSeason ? sets.filter((s) => s.seasonId === activeSeason.id) : []),
    [sets, activeSeason],
  );

  const totalWins = useMemo(() => matches.filter((m) => m.result === 'VITÓRIA').length, [matches]);
  const winRate = matches.length > 0 ? totalWins / matches.length : 0;
  const streak = useMemo(() => computeCurrentStreak(activeMatches), [activeMatches]);

  const trend = useMemo(() => computeWinRateTrend(activeSets), [activeSets]);

  const myTopPokemon = useMemo(() => computeMyPokemonStats(activeMatches).slice(0, 6), [activeMatches]);
  const oppTopPokemon = useMemo(() => computeOppPokemonStats(activeMatches).slice(0, 6), [activeMatches]);

  const recentMatches = useMemo(() => [...activeMatches].reverse().slice(0, 10), [activeMatches]);

  const seasonWins = activeMatches.filter((m) => m.result === 'VITÓRIA').length;
  const seasonWinRate = activeMatches.length > 0 ? seasonWins / activeMatches.length : 0;

  const chartData = trend.map((d) => ({
    name: d.label,
    taxa: +(d.winRate * 100).toFixed(1),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Season header */}
      <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-2xl p-5 border border-blue-500/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm">Temporada Atual</p>
            <h2 className="text-2xl font-bold text-white">
              {activeSeason ? `T${activeSeason.number}` : '—'}{' '}
              <span className="text-blue-300 text-lg">{activeSeason?.period}</span>
            </h2>
          </div>
          <Link to="/temporadas" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{activeMatches.length}</div>
            <div className="text-gray-400 text-xs">Batalhas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{formatPercent(seasonWinRate)}</div>
            <div className="text-gray-400 text-xs">Taxa de Vitória</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${streak > 0 ? 'text-yellow-400' : streak < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {streak > 0 ? `+${streak}` : streak < 0 ? `${streak}` : '—'}
            </div>
            <div className="text-gray-400 text-xs">Sequência</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Batalhas"
          value={formatNumber(matches.length)}
          subtitle="Todas as temporadas"
          icon={<Shield size={18} />}
          color="#2980EF"
        />
        <StatCard
          title="Taxa Global"
          value={formatPercent(winRate)}
          subtitle={`${formatNumber(totalWins)} vitórias`}
          icon={<Trophy size={18} />}
          color="#FAC000"
        />
        <StatCard
          title="Melhor Streak"
          value={activeSeason?.bestStreak || 0}
          subtitle="Temporada atual"
          icon={<Flame size={18} />}
          color="#E62829"
        />
        <StatCard
          title="Poeira"
          value={formatNumber(activeSeason?.stardust || 0)}
          subtitle="Poeira Estelar"
          icon={<Zap size={18} />}
          color="#EF70EF"
        />
      </div>

      {/* Win rate trend */}
      {chartData.length > 3 && (
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" />
            Tendência de Vitórias (sets)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={false} stroke="#6b7280" />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => v + '%'}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                stroke="#6b7280"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#d1d5db' }}
                formatter={(v) => [`${v}%`, 'Taxa']}
              />
              <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="taxa" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* My top pokemon */}
      {myTopPokemon.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Meus Pokémons Mais Usados</h3>
          <div className="flex flex-wrap gap-3">
            {myTopPokemon.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1">
                <PokemonCard name={p.name} size="sm" />
                <span className="text-xs text-gray-400">{p.appearances}×</span>
                <span className={`text-xs font-bold ${p.winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(p.winRate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opp top pokemon */}
      {oppTopPokemon.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Pokémons Mais Enfrentados</h3>
          <div className="flex flex-wrap gap-3">
            {oppTopPokemon.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1">
                <PokemonCard name={p.name} size="sm" />
                <span className="text-xs text-gray-400">{p.appearances}×</span>
                <span className={`text-xs font-bold ${p.winRate <= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(1 - p.winRate)} vitórias
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Partidas Recentes</h3>
          <div className="space-y-2">
            {recentMatches.slice(0, 8).map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-700/50 last:border-0">
                <div
                  className={`w-2 h-8 rounded-full flex-shrink-0 ${
                    m.result === 'VITÓRIA' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">{m.cup}</div>
                  <div className="flex gap-1 text-xs text-white font-medium truncate">
                    {[m.myLead, m.mySwitch, m.myCloser].filter(Boolean).join(' / ')}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  vs {[m.oppLead, m.oppSwitch, m.oppCloser].filter(Boolean).slice(0, 2).join(', ')}
                </div>
                <div
                  className={`text-xs font-bold flex-shrink-0 ${
                    m.result === 'VITÓRIA' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {m.result === 'VITÓRIA' ? 'V' : 'D'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

