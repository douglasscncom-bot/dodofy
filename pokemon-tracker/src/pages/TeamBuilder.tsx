import { useState, useMemo } from 'react';
import { Plus, X, Shield, Zap, Save, Trash2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getPokemonTypes } from '../data/pokemonTypes';
import { TYPE_COLORS, TYPE_LABELS_PT } from '../data/typeColors';
import { analyzeTeam, getOffensiveCoverage, threatLevelColor } from '../utils/typeAnalysis';
import type { TeamConfig, BaseLeague } from '../types';

const BASE_LEAGUES: BaseLeague[] = ['GRANDE', 'ULTRA', 'MASTER'];

function PokemonSlot({
  value, onChange, label, role,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  role: string;
}) {
  const types = value ? getPokemonTypes(value) : null;
  const t1 = types?.[0];
  const t2 = types?.[1];
  const c1 = t1 ? TYPE_COLORS[t1] : null;
  const c2 = t2 ? TYPE_COLORS[t2] : null;

  const gradient = c1
    ? c2
      ? `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`
      : `linear-gradient(135deg, ${c1} 60%, rgba(255,255,255,0.1) 100%)`
    : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</label>
      <div
        className="rounded-2xl p-3 min-h-[80px] flex flex-col justify-between border border-gray-600 transition-all"
        style={gradient ? { background: gradient } : { background: '#1f2937' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-xs bg-black/30 px-2 py-0.5 rounded-full">{role}</span>
          {t1 && (
            <div className="flex gap-1">
              <span className="text-white text-xs font-bold bg-black/30 px-1.5 py-0.5 rounded">
                {TYPE_LABELS_PT[t1]}
              </span>
              {t2 && (
                <span className="text-white text-xs font-bold bg-black/30 px-1.5 py-0.5 rounded">
                  {TYPE_LABELS_PT[t2]}
                </span>
              )}
            </div>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Nome do Pokémon"
          className="bg-black/30 text-white rounded-xl px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/10 mt-2"
        />
      </div>
    </div>
  );
}

function TypeAnalysisGrid({ pokemonNames }: { pokemonNames: string[] }) {
  const analysis = useMemo(() => analyzeTeam(pokemonNames), [pokemonNames]);
  const coverage = useMemo(() => getOffensiveCoverage(pokemonNames), [pokemonNames]);

  const weaknesses = analysis.filter((a) => a.threatLevel === 'critical' || a.threatLevel === 'high');
  const resistances = analysis.filter((a) => a.threatLevel === 'resist' || a.threatLevel === 'immune');

  if (pokemonNames.filter(Boolean).length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 text-center text-gray-500">
        <Shield size={40} className="mx-auto mb-3 opacity-30" />
        <p>Selecione os Pokémons para ver a análise de tipagem</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Weaknesses */}
      <div className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span className="text-red-400">⚠</span> Fraquezas do Time
        </h3>
        {weaknesses.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma fraqueza crítica!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {weaknesses.map((w) => (
              <div key={w.type} className="flex items-center gap-1.5 bg-gray-700 rounded-lg px-2 py-1.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TYPE_COLORS[w.type] }}
                />
                <span className="text-white text-xs font-medium">{w.labelPt}</span>
                <span
                  className="text-xs font-bold px-1 rounded"
                  style={{ color: threatLevelColor(w.threatLevel), backgroundColor: threatLevelColor(w.threatLevel) + '20' }}
                >
                  {w.threatLevel === 'critical' ? '2×' : '1.6×'}
                </span>
                <div className="flex gap-0.5">
                  {w.multipliers.map((m, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full text-[8px] flex items-center justify-center font-bold text-white"
                      style={{
                        backgroundColor: m >= 2.56 ? '#ef4444' : m >= 1.6 ? '#f97316' : m <= 0.39 ? '#8b5cf6' : m < 1 ? '#3b82f6' : '#6b7280',
                      }}
                      title={pokemonNames[i]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resistances */}
      <div className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span className="text-blue-400">🛡</span> Resistências do Time
        </h3>
        {resistances.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma resistência identificada</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {resistances.map((r) => (
              <div key={r.type} className="flex items-center gap-1.5 bg-gray-700 rounded-lg px-2 py-1.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TYPE_COLORS[r.type] }}
                />
                <span className="text-white text-xs font-medium">{r.labelPt}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: r.threatLevel === 'immune' ? '#8b5cf6' : '#3b82f6' }}
                >
                  {r.threatLevel === 'immune' ? 'IMU' : 'RES'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offensive coverage */}
      {coverage.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" /> Cobertura Ofensiva
          </h3>
          <div className="flex flex-wrap gap-2">
            {coverage.map((t) => (
              <span
                key={t}
                className="text-white text-xs font-bold px-2 py-1 rounded-lg"
                style={{ backgroundColor: TYPE_COLORS[t] }}
              >
                {TYPE_LABELS_PT[t]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full type grid */}
      <div className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Análise Completa por Tipo</h3>
        <div className="grid grid-cols-3 gap-2">
          {analysis.map((a) => (
            <div
              key={a.type}
              className="flex items-center gap-2 rounded-lg p-2"
              style={{
                backgroundColor: threatLevelColor(a.threatLevel) + '15',
                borderLeft: `3px solid ${threatLevelColor(a.threatLevel)}`,
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: TYPE_COLORS[a.type] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{a.labelPt}</div>
                <div className="text-xs" style={{ color: threatLevelColor(a.threatLevel) }}>
                  {a.maxMultiplier >= 2.56 ? '2×' : a.maxMultiplier >= 1.6 ? '1.6×' : a.maxMultiplier <= 0.39 ? 'IMU' : a.maxMultiplier < 1 ? 'RES' : 'NEU'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeamBuilder() {
  const { teams, customLeagues, addTeam, updateTeam, deleteTeam, setActiveTeam, addCustomLeague } = useStore();

  const [selectedLeague, setSelectedLeague] = useState<string>('GRANDE');
  const [editingTeam, setEditingTeam] = useState<TeamConfig | null>(null);
  const [newLead, setNewLead] = useState('');
  const [newSwitch, setNewSwitch] = useState('');
  const [newCloser, setNewCloser] = useState('');
  const [teamName, setTeamName] = useState('');
  const [showNewLeague, setShowNewLeague] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueBase, setNewLeagueBase] = useState<BaseLeague>('GRANDE');

  const allLeagues = useMemo(() => [
    ...BASE_LEAGUES,
    ...customLeagues.map((l) => l.name),
  ], [customLeagues]);

  const leagueTeams = useMemo(
    () => teams.filter((t) => t.league === selectedLeague),
    [teams, selectedLeague],
  );

  const activeTeam = useMemo(
    () => leagueTeams.find((t) => t.isActive),
    [leagueTeams],
  );

  const analysisTeam = editingTeam
    ? [editingTeam.lead, editingTeam.switch, editingTeam.closer]
    : activeTeam
    ? [activeTeam.lead, activeTeam.switch, activeTeam.closer]
    : [newLead, newSwitch, newCloser];

  const startNewTeam = () => {
    setEditingTeam({
      id: `t${Date.now()}`,
      name: `Time ${leagueTeams.length + 1}`,
      league: selectedLeague,
      lead: '',
      switch: '',
      closer: '',
      isActive: false,
      createdAt: new Date().toISOString(),
    });
    setNewLead('');
    setNewSwitch('');
    setNewCloser('');
    setTeamName(`Time ${leagueTeams.length + 1}`);
  };

  const saveTeam = () => {
    if (!editingTeam) return;
    const t: TeamConfig = {
      ...editingTeam,
      name: teamName || editingTeam.name,
      lead: newLead || editingTeam.lead,
      switch: newSwitch || editingTeam.switch,
      closer: newCloser || editingTeam.closer,
    };

    if (teams.find((existing) => existing.id === t.id)) {
      updateTeam(t.id, t);
    } else {
      addTeam(t);
    }
    setEditingTeam(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Montagem de Times</h1>
      </div>

      {/* League selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allLeagues.map((l) => (
          <button
            key={l}
            onClick={() => setSelectedLeague(l)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedLeague === l
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={() => setShowNewLeague(true)}
          className="flex-shrink-0 px-3 py-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* New league dialog */}
      {showNewLeague && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-blue-500/30 space-y-3">
          <h3 className="text-white font-semibold">Nova Liga Derivada</h3>
          <input
            type="text"
            placeholder="Nome da liga (ex: Copa Kanto)"
            value={newLeagueName}
            onChange={(e) => setNewLeagueName(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-xl px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {BASE_LEAGUES.map((l) => (
              <button
                key={l}
                onClick={() => setNewLeagueBase(l)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                  newLeagueBase === l ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                Baseada em {l}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!newLeagueName.trim()) return;
                addCustomLeague({
                  id: `cl${Date.now()}`,
                  name: newLeagueName.trim().toUpperCase(),
                  basedOn: newLeagueBase,
                });
                setNewLeagueName('');
                setShowNewLeague(false);
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-sm font-medium"
            >
              Criar Liga
            </button>
            <button
              onClick={() => setShowNewLeague(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Current active team */}
      {activeTeam && !editingTeam && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">{activeTeam.name}</h3>
              <span className="text-green-400 text-xs font-medium">✓ Time Ativo</span>
            </div>
            <button
              onClick={() => {
                setEditingTeam(activeTeam);
                setNewLead(activeTeam.lead);
                setNewSwitch(activeTeam.switch);
                setNewCloser(activeTeam.closer);
                setTeamName(activeTeam.name);
              }}
              className="text-gray-400 hover:text-white text-sm"
            >
              Editar
            </button>
          </div>
          <div className="flex gap-2">
            {[
              { name: activeTeam.lead, role: 'Lead' },
              { name: activeTeam.switch, role: 'Switch' },
              { name: activeTeam.closer, role: 'Closer' },
            ].map(({ name, role }) => {
              const types = name ? getPokemonTypes(name) : null;
              const t1 = types?.[0];
              const t2 = types?.[1];
              const c1 = t1 ? TYPE_COLORS[t1] : '#374151';
              const c2 = t2 ? TYPE_COLORS[t2] : null;
              const bg = c2
                ? `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`
                : `linear-gradient(135deg, ${c1} 60%, rgba(255,255,255,0.05) 100%)`;

              return (
                <div
                  key={role}
                  className="flex-1 rounded-xl p-2 text-center"
                  style={{ background: bg }}
                >
                  <div className="text-white/60 text-xs">{role}</div>
                  <div className="text-white font-bold text-xs mt-1 break-words">{name}</div>
                  {t1 && (
                    <div className="text-white/70 text-xs mt-0.5">{TYPE_LABELS_PT[t1]}{t2 ? `/${TYPE_LABELS_PT[t2]}` : ''}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team editor */}
      {editingTeam && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Editar Time</h3>
            <button onClick={() => setEditingTeam(null)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Nome do time"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-xl px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <PokemonSlot label="Lead (1°)" value={newLead} onChange={setNewLead} role="Lead" />
          <PokemonSlot label="Switch (2°)" value={newSwitch} onChange={setNewSwitch} role="Switch" />
          <PokemonSlot label="Closer (3°)" value={newCloser} onChange={setNewCloser} role="Closer" />
          <div className="flex gap-2">
            <button
              onClick={saveTeam}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Save size={16} /> Salvar
            </button>
            <button
              onClick={() => {
                setActiveTeam(editingTeam.id, selectedLeague);
                saveTeam();
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Check size={16} /> Salvar & Ativar
            </button>
          </div>
        </div>
      )}

      {/* Type analysis */}
      <TypeAnalysisGrid pokemonNames={analysisTeam} />

      {/* Saved teams */}
      {leagueTeams.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Times Salvos — {selectedLeague}</h3>
            <button
              onClick={startNewTeam}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
            >
              <Plus size={14} /> Novo
            </button>
          </div>
          {leagueTeams.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                t.isActive ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700/50 hover:bg-gray-700/50'
              }`}
              onClick={() => {
                setEditingTeam(t);
                setNewLead(t.lead);
                setNewSwitch(t.switch);
                setNewCloser(t.closer);
                setTeamName(t.name);
              }}
            >
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs truncate">
                  {[t.lead, t.switch, t.closer].filter(Boolean).join(' · ')}
                </div>
              </div>
              <div className="flex gap-1">
                {t.isActive && <span className="text-green-400 text-xs">✓ Ativo</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTeam(t.id, selectedLeague); }}
                  className="text-gray-500 hover:text-green-400 px-2"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTeam(t.id); }}
                  className="text-gray-500 hover:text-red-400 px-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {leagueTeams.length === 0 && !editingTeam && (
        <div className="text-center py-10 text-gray-500">
          <Shield size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum time salvo para {selectedLeague}</p>
          <button
            onClick={startNewTeam}
            className="mt-3 text-blue-400 hover:text-blue-300 flex items-center gap-2 mx-auto"
          >
            <Plus size={16} /> Montar novo time
          </button>
        </div>
      )}

      {leagueTeams.length === 0 && !editingTeam && (
        <button
          onClick={startNewTeam}
          className="hidden"
        />
      )}
    </div>
  );
}
