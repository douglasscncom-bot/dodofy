import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPercent } from '../utils/metrics';
import { NewMatchModal } from './NewMatch';

function MatchRow({ match }: { match: any }) {
  const win = match.result === 'VITÓRIA';
  return (
    <div className={`flex items-center gap-2 py-2 border-b border-gray-700/40 last:border-0`}>
      <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${win ? 'bg-green-500' : 'bg-red-500'}`} />
      <div className="flex-1 min-w-0 text-xs">
        <div className="text-gray-300 font-medium truncate">
          {[match.myLead, match.mySwitch, match.myCloser].filter(Boolean).join(' · ')}
        </div>
        <div className="text-gray-500 truncate">
          vs {[match.oppLead, match.oppSwitch, match.oppCloser].filter(Boolean).join(' · ') || '—'}
        </div>
      </div>
      <span className={`text-xs font-bold flex-shrink-0 ${win ? 'text-green-400' : 'text-red-400'}`}>
        {win ? 'V' : 'D'}
      </span>
    </div>
  );
}

function SetRow({ battleSet, matches }: { battleSet: any; matches: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const setMatches = matches.filter((m) => m.setId === battleSet.id);
  const positive = battleSet.wins > battleSet.losses;

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-gray-750 transition-colors"
      >
        <div className={`w-2 h-10 rounded-full flex-shrink-0 ${positive ? 'bg-green-500' : 'bg-red-500'}`} />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">Set {battleSet.setNumber}</span>
            <span className="text-gray-500 text-xs">{battleSet.league}</span>
          </div>
          <div className="text-xs text-gray-400 truncate">
            {[battleSet.myLead, battleSet.mySwitch, battleSet.myCloser].filter(Boolean).join(' / ')}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-bold text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {battleSet.wins}V / {battleSet.losses}D
          </div>
          <div className="text-gray-500 text-xs">
            {formatPercent((battleSet.wins + battleSet.losses) > 0 ? battleSet.wins / (battleSet.wins + battleSet.losses) : 0)}
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {expanded && setMatches.length > 0 && (
        <div className="px-4 pb-3 border-t border-gray-700/50">
          {setMatches.map((m) => (
            <MatchRow key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SeasonDetail() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const navigate = useNavigate();
  const { seasons, sets, matches } = useStore();
  const [showNewMatch, setShowNewMatch] = useState(false);

  const season = useMemo(() => seasons.find((s) => s.id === seasonId), [seasons, seasonId]);
  const seasonSets = useMemo(() => sets.filter((s) => s.seasonId === seasonId).sort((a, b) => a.setNumber - b.setNumber), [sets, seasonId]);
  const seasonMatches = useMemo(() => matches.filter((m) => m.seasonId === seasonId), [matches, seasonId]);

  const wins = seasonMatches.filter((m) => m.result === 'VITÓRIA').length;
  const winRate = seasonMatches.length > 0 ? wins / seasonMatches.length : 0;

  if (!season) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Temporada não encontrada</p>
        <Link to="/temporadas" className="text-blue-400 mt-4 block">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Temporada {season.number}</h1>
          <p className="text-gray-400 text-sm">{season.period}</p>
        </div>
        <button
          onClick={() => setShowNewMatch(true)}
          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-medium"
        >
          <Plus size={16} /> Partida
        </button>
      </div>

      {/* Season stats */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-4 border border-blue-500/20 grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-white">{seasonMatches.length}</div>
          <div className="text-gray-400 text-xs">Batalhas</div>
        </div>
        <div>
          <div className={`text-xl font-bold ${winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercent(winRate)}
          </div>
          <div className="text-gray-400 text-xs">Taxa</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-400">{seasonSets.length}</div>
          <div className="text-gray-400 text-xs">Sets</div>
        </div>
        {season.finalScore && (
          <div>
            <div className="text-xl font-bold text-yellow-400">{season.finalScore}</div>
            <div className="text-gray-400 text-xs">Rating</div>
          </div>
        )}
      </div>

      {/* Sets */}
      <div className="space-y-2">
        {seasonSets.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Nenhum set registrado nesta temporada.</p>
            <button onClick={() => setShowNewMatch(true)} className="text-blue-400 mt-2">
              Adicionar primeira partida
            </button>
          </div>
        ) : (
          seasonSets.map((s) => (
            <SetRow key={s.id} battleSet={s} matches={seasonMatches} />
          ))
        )}
      </div>

      {showNewMatch && (
        <NewMatchModal
          defaultSeasonId={seasonId}
          onClose={() => setShowNewMatch(false)}
        />
      )}
    </div>
  );
}
