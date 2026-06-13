import { useState, useMemo } from 'react';
import { Cpu, Key, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import { computeMyPokemonStats, computeOppPokemonStats } from '../utils/metrics';
import { getPokemonTypes } from '../data/pokemonTypes';
import { TYPE_COLORS, TYPE_LABELS_PT } from '../data/typeColors';
import type { PokemonType } from '../types';

const PVPOKE_META: Record<string, { score: number; pokemon: string[] }> = {
  GRANDE: {
    score: 1500,
    pokemon: [
      'MEDICHAM', 'AZUMARILL', 'ALTARIA', 'SWAMPERT', 'REGISTEEL', 'BASTIODON',
      'DEWGONG', 'UMBREON', 'GALVANTULA', 'MANDIBUZZ', 'TOXAPEX', 'HAUNTER',
      'TREVENANT', 'SABLEYE', 'VIGOROTH', 'WALREIN', 'LANTURN', 'SHADOW WALREIN',
    ],
  },
  ULTRA: {
    score: 2500,
    pokemon: [
      'GIRATINA', 'OBSTAGOON', 'VENUSAUR', 'SWAMPERT', 'TENTACRUEL', 'GALVANTULA',
      'TAPU FINI', 'COBALION', 'STEELIX', 'REGIROCK', 'CHARIZARD', 'EMPOLEON',
      'LAPRAS', 'DRIFBLIM', 'TREVENANT', 'NIDOQUEEN', 'PIDGEOT', 'UMBREON',
    ],
  },
  MASTER: {
    score: 9999,
    pokemon: [
      'ZACIAN', 'DIALGA', 'GARCHOMP', 'DRAGONITE', 'TOGEKISS', 'MEWTWO',
      'KYOGRE', 'GROUDON', 'LUGIA', 'LANDORUS', 'EXCADRILL', 'ZARUDE',
      'SYLVEON', 'MACHAMP', 'MAGNEZONE', 'GIRATINA O', 'PALKIA', 'YVELTAL',
    ],
  },
};

export function AIAnalysis() {
  const { settings, updateSettings, seasons, matches } = useStore();
  const [apiKey, setApiKey] = useState(settings.anthropicApiKey || '');
  const [selectedLeague, setSelectedLeague] = useState<string>('GRANDE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const activeSeason = useMemo(
    () => seasons.find((s) => s.isActive) || seasons[seasons.length - 1],
    [seasons],
  );

  const activeMatches = useMemo(
    () => (activeSeason ? matches.filter((m) => m.seasonId === activeSeason.id) : matches.slice(-200)),
    [matches, activeSeason],
  );

  const myTopPokemon = useMemo(
    () => computeMyPokemonStats(activeMatches).slice(0, 10),
    [activeMatches],
  );

  const oppTopPokemon = useMemo(
    () => computeOppPokemonStats(activeMatches).slice(0, 10),
    [activeMatches],
  );

  const wins = activeMatches.filter((m) => m.result === 'VITÓRIA').length;
  const winRate = activeMatches.length > 0 ? wins / activeMatches.length : 0;

  const saveApiKey = () => {
    updateSettings({ anthropicApiKey: apiKey.trim() });
  };

  const buildPrompt = () => {
    const leagueMeta = PVPOKE_META[selectedLeague] || PVPOKE_META.GRANDE;
    const myPokeList = myTopPokemon
      .map((p) => {
        const types = getPokemonTypes(p.name);
        const typeStr = types ? types.filter(Boolean).map((t) => TYPE_LABELS_PT[t as PokemonType]).join('/') : '?';
        return `${p.name} (${typeStr}, ${p.appearances} usos, ${(p.winRate * 100).toFixed(0)}% vitória)`;
      })
      .join('\n');

    const oppPokeList = oppTopPokemon
      .map((p) => {
        const types = getPokemonTypes(p.name);
        const typeStr = types ? types.filter(Boolean).map((t) => TYPE_LABELS_PT[t as PokemonType]).join('/') : '?';
        return `${p.name} (${typeStr}, ${p.appearances} aparições)`;
      })
      .join('\n');

    return `Você é um especialista em Pokemon GO PvP (Liga ${selectedLeague}).
Analise os dados e sugira o melhor time para a liga ${selectedLeague}.

**META ATUAL (PvPoke - Liga ${selectedLeague} CP ${leagueMeta.score}):**
${leagueMeta.pokemon.join(', ')}

**MEUS POKÉMONS MAIS USADOS (última temporada, ${activeMatches.length} batalhas, ${(winRate * 100).toFixed(1)}% de vitória):**
${myPokeList}

**POKÉMONS QUE MAIS ENFRENTO:**
${oppPokeList}

Por favor:
1. Sugira 3 times completos (Lead / Switch / Closer) para a Liga ${selectedLeague}
2. Explique por que cada time funciona contra o meta atual
3. Analise pontos fortes e fracos de cobertura de tipos
4. Destaque qual time você recomenda como prioridade
5. Indique quais dos MEUS pokémons se encaixam melhor no meta

Seja direto e prático, focando em estratégia de batalha PvP.`;
  };

  const analyze = async () => {
    const key = apiKey.trim();
    if (!key) {
      setError('Insira sua chave da API Anthropic primeiro.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.content?.[0]?.text || 'Nenhuma resposta recebida.');
      updateSettings({ anthropicApiKey: key });
    } catch (e: any) {
      setError(e.message || 'Erro ao chamar a API. Verifique sua chave e conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 rounded-2xl p-5 border border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Cpu size={28} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Análise de IA</h1>
            <p className="text-gray-400 text-sm">Meta PvPoke + seu histórico + sugestão de time</p>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-yellow-400" />
          <h3 className="text-white font-semibold text-sm">Chave API Anthropic</h3>
        </div>
        <p className="text-gray-400 text-xs">
          Necessária para a análise de IA. Obtenha em{' '}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            console.anthropic.com <ExternalLink size={10} />
          </a>
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 bg-gray-700 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 font-mono"
          />
          <button
            onClick={saveApiKey}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Salvar
          </button>
        </div>
        {settings.anthropicApiKey && (
          <p className="text-green-400 text-xs flex items-center gap-1">
            ✓ Chave salva
          </p>
        )}
      </div>

      {/* League selector */}
      <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-white font-semibold text-sm">Liga para Analisar</h3>
        <div className="flex gap-2">
          {['GRANDE', 'ULTRA', 'MASTER'].map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLeague(l)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                selectedLeague === l ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Data preview */}
      <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-white font-semibold text-sm">Dados que serão analisados</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-700/50 rounded-xl p-2.5 text-center">
            <div className="text-white font-bold">{activeMatches.length}</div>
            <div className="text-gray-400 text-xs">Batalhas</div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-2.5 text-center">
            <div className="text-white font-bold">{myTopPokemon.length}</div>
            <div className="text-gray-400 text-xs">Meus Pokémons</div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-2.5 text-center">
            <div className="text-white font-bold">{oppTopPokemon.length}</div>
            <div className="text-gray-400 text-xs">Adversários</div>
          </div>
        </div>
        <div className="text-gray-500 text-xs">
          Inclui meta atual do PvPoke para a Liga {selectedLeague}
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={analyze}
        disabled={loading || !apiKey.trim()}
        className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
          loading || !apiKey.trim()
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 active:scale-98'
        }`}
      >
        {loading ? (
          <>
            <RefreshCw size={22} className="animate-spin" />
            Analisando com IA...
          </>
        ) : (
          <>
            <Cpu size={22} />
            Analisar Meta e Sugerir Time
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-gray-800 rounded-2xl p-5 border border-purple-500/20 space-y-3">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Cpu size={18} className="text-purple-400" />
            Análise da IA
          </h3>
          <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {result}
          </div>
        </div>
      )}

      {/* Meta preview */}
      {!result && !loading && (
        <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <ExternalLink size={14} className="text-blue-400" />
            Meta Atual ({selectedLeague})
          </h3>
          <div className="flex flex-wrap gap-2">
            {(PVPOKE_META[selectedLeague]?.pokemon || []).map((p) => {
              const types = getPokemonTypes(p);
              const t1 = types?.[0];
              const color = t1 ? TYPE_COLORS[t1] : '#374151';
              return (
                <span
                  key={p}
                  className="text-white text-xs font-medium px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: color + 'cc' }}
                >
                  {p}
                </span>
              );
            })}
          </div>
          <p className="text-gray-500 text-xs">
            Dados do PvPoke. Para dados mais recentes, consulte{' '}
            <a href="https://pvpoke.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              pvpoke.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
