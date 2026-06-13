import { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getPokemonTypes } from '../data/pokemonTypes';
import { TYPE_COLORS, TYPE_LABELS_PT } from '../data/typeColors';
import type { Match, BattleSet } from '../types';

interface Props {
  defaultSeasonId?: string;
  onClose: () => void;
}

function PokemonInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const types = value ? getPokemonTypes(value) : null;
  const t1 = types?.[0];
  const t2 = types?.[1];
  const c1 = t1 ? TYPE_COLORS[t1] : '#374151';
  const c2 = t2 ? TYPE_COLORS[t2] : null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-400 text-xs font-medium">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Nome do Pokémon"
          className="w-full bg-gray-700 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
        />
        {t1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <span
              className="text-white text-xs px-1.5 py-0.5 rounded font-bold"
              style={{ backgroundColor: c1 }}
            >
              {TYPE_LABELS_PT[t1]}
            </span>
            {t2 && c2 && (
              <span
                className="text-white text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ backgroundColor: c2 }}
              >
                {TYPE_LABELS_PT[t2]}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function NewMatchModal({ defaultSeasonId, onClose }: Props) {
  const { seasons, sets, addMatch, addSet } = useStore();

  const activeSeason = useMemo(
    () => seasons.find((s) => s.id === defaultSeasonId) || seasons.find((s) => s.isActive) || seasons[seasons.length - 1],
    [seasons, defaultSeasonId],
  );

  const seasonSets = useMemo(
    () => sets.filter((s) => s.seasonId === activeSeason?.id).sort((a, b) => a.setNumber - b.setNumber),
    [sets, activeSeason],
  );

  const lastSet = seasonSets[seasonSets.length - 1];

  const [seasonId, setSeasonId] = useState(activeSeason?.id || '');
  const [league, setLeague] = useState(lastSet?.league || 'GRANDE');
  const [myLead, setMyLead] = useState(lastSet?.myLead || '');
  const [mySwitch, setMySwitch] = useState(lastSet?.mySwitch || '');
  const [myCloser, setMyCloser] = useState(lastSet?.myCloser || '');
  const [oppLead, setOppLead] = useState('');
  const [oppSwitch, setOppSwitch] = useState('');
  const [oppCloser, setOppCloser] = useState('');
  const [result, setResult] = useState<'VITÓRIA' | 'DERROTA'>('VITÓRIA');
  const [newSet, setNewSet] = useState(false);

  const handleSave = () => {
    const sid = seasonId;
    const season = seasons.find((s) => s.id === sid);
    if (!season) return;

    let targetSet = lastSet;
    if (newSet || !lastSet) {
      const setNum = (lastSet?.setNumber || 0) + 1;
      const newSetData: BattleSet = {
        id: `s${Date.now()}`,
        seasonId: sid,
        setNumber: setNum,
        league,
        myLead: myLead.trim().toUpperCase(),
        mySwitch: mySwitch.trim().toUpperCase(),
        myCloser: myCloser.trim().toUpperCase(),
        wins: 0,
        losses: 0,
        score: null,
      };
      addSet(newSetData);
      targetSet = newSetData;
    }

    if (!targetSet) return;

    const setMatches = sets.find((s) => s.id === targetSet!.id);
    const matchNum = (setMatches?.wins || 0) + (setMatches?.losses || 0) + 1;

    const match: Match = {
      id: `m${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      setId: targetSet.id,
      seasonId: sid,
      matchNumber: matchNum,
      cup: league,
      myLead: myLead.trim().toUpperCase() || null,
      mySwitch: mySwitch.trim().toUpperCase() || null,
      myCloser: myCloser.trim().toUpperCase() || null,
      oppLead: oppLead.trim().toUpperCase() || null,
      oppSwitch: oppSwitch.trim().toUpperCase() || null,
      oppCloser: oppCloser.trim().toUpperCase() || null,
      result,
      createdAt: new Date().toISOString(),
    };

    addMatch(match);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-white font-bold text-lg">Nova Partida</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Season */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1">Temporada</label>
            <select
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-xl px-3 py-2.5 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  T{s.number} — {s.period}
                </option>
              ))}
            </select>
          </div>

          {/* New set toggle */}
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <span className="text-white text-sm font-medium">Novo Set</span>
            <button
              onClick={() => setNewSet(!newSet)}
              className={`w-12 h-6 rounded-full transition-colors ${newSet ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${newSet ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* League */}
          {(newSet || !lastSet) && (
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Liga</label>
              <div className="flex gap-2">
                {['GRANDE', 'ULTRA', 'MASTER'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLeague(l)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      league === l ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* My team */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Meu Time</h3>
            <div className="space-y-2">
              <PokemonInput label="Lead (1°)" value={myLead} onChange={setMyLead} />
              <PokemonInput label="Switch (2°)" value={mySwitch} onChange={setMySwitch} />
              <PokemonInput label="Closer (3°)" value={myCloser} onChange={setMyCloser} />
            </div>
          </div>

          {/* Opponent team */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Time Adversário</h3>
            <div className="space-y-2">
              <PokemonInput label="Lead adversário" value={oppLead} onChange={setOppLead} />
              <PokemonInput label="Switch adversário" value={oppSwitch} onChange={setOppSwitch} />
              <PokemonInput label="Closer adversário" value={oppCloser} onChange={setOppCloser} />
            </div>
          </div>

          {/* Result */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Resultado</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setResult('VITÓRIA')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                  result === 'VITÓRIA' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                ✓ Vitória
              </button>
              <button
                onClick={() => setResult('DERROTA')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                  result === 'DERROTA' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                ✗ Derrota
              </button>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
          >
            <Check size={20} /> Salvar Partida
          </button>
        </div>
      </div>
    </div>
  );
}
