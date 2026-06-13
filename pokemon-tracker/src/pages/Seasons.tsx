import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight, Star, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPercent, formatNumber } from '../utils/metrics';
import type { Season } from '../types';

function SeasonCard({ season, matchCount, onClick }: {
  season: Season;
  matchCount: number;
  onClick: () => void;
}) {
  const winRate = season.totalBattles > 0 ? season.wins / season.totalBattles : 0;
  const isActive = season.isActive;

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-2xl p-4 cursor-pointer hover:bg-gray-750 transition-all border ${
        isActive ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-gray-700/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-lg">Temporada {season.number}</h3>
            {isActive && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Atual</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">{season.period}</p>
        </div>
        <ChevronRight size={20} className="text-gray-500 mt-1" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-gray-700/50 rounded-xl p-2 text-center">
          <div className="text-white font-bold">{season.totalBattles || matchCount}</div>
          <div className="text-gray-400 text-xs">Batalhas</div>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-2 text-center">
          <div className={`font-bold ${winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercent(winRate)}
          </div>
          <div className="text-gray-400 text-xs">Vitórias</div>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-2 text-center">
          <div className="text-yellow-400 font-bold">{season.bestStreak || 0}</div>
          <div className="text-gray-400 text-xs">Streak</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        {season.finalScore && (
          <span className="flex items-center gap-1">
            <Trophy size={12} className="text-yellow-500" />
            Rating final: {season.finalScore}
          </span>
        )}
        {season.maxScore && (
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400" />
            Máx: {season.maxScore}
          </span>
        )}
        {season.stardust > 0 && (
          <span>💫 {formatNumber(season.stardust)}</span>
        )}
      </div>
    </div>
  );
}

export function Seasons() {
  const navigate = useNavigate();
  const { seasons, matches } = useStore();
  const seasonStats = useMemo(() => {
    return seasons.map((s) => ({
      matchCount: matches.filter((m) => m.seasonId === s.id).length,
      setCount: 0,
    }));
  }, [seasons, matches]);

  const sortedSeasons = useMemo(() => [...seasons].sort((a, b) => b.number - a.number), [seasons]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Temporadas</h1>
        <button
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Overall stats bar */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl p-4 border border-purple-500/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{formatNumber(matches.length)}</div>
            <div className="text-gray-400 text-xs">Total Batalhas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {matches.length > 0 ? formatPercent(matches.filter((m) => m.result === 'VITÓRIA').length / matches.length) : '—'}
            </div>
            <div className="text-gray-400 text-xs">Taxa Global</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{seasons.length}</div>
            <div className="text-gray-400 text-xs">Temporadas</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedSeasons.map((season) => (
          <SeasonCard
            key={season.id}
            season={season}
            matchCount={seasonStats[seasons.indexOf(season)]?.matchCount || 0}
            onClick={() => navigate(`/temporadas/${season.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
