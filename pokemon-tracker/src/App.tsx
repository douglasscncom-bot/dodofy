import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SideNav, BottomNav, AddMatchFAB } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Seasons } from './pages/Seasons';
import { SeasonDetail } from './pages/SeasonDetail';
import { Metrics } from './pages/Metrics';
import { TeamBuilder } from './pages/TeamBuilder';
import { AIAnalysis } from './pages/AIAnalysis';
import { NewMatchModal } from './pages/NewMatch';
import { useStore } from './store/useStore';
import type { Season, BattleSet, Match } from './types';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto animate-pulse">
          <span className="text-3xl">⚡</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">PokeTracker GO</h1>
          <p className="text-gray-400 text-sm mt-1">Carregando dados...</p>
        </div>
        <div className="w-48 h-1.5 bg-gray-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-[slideRight_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [showNewMatch, setShowNewMatch] = useState(false);

  return (
    <div className="min-h-dvh bg-gray-950">
      <SideNav />
      <div className="md:ml-56 min-h-dvh">
        <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/temporadas" element={<Seasons />} />
            <Route path="/temporadas/:seasonId" element={<SeasonDetail />} />
            <Route path="/metricas" element={<Metrics />} />
            <Route path="/times" element={<TeamBuilder />} />
            <Route path="/ia" element={<AIAnalysis />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
      <AddMatchFAB onClick={() => setShowNewMatch(true)} />
      {showNewMatch && <NewMatchModal onClose={() => setShowNewMatch(false)} />}
    </div>
  );
}

export default function App() {
  const { seeded, seedData } = useStore();
  const [loading, setLoading] = useState(!seeded);

  useEffect(() => {
    if (seeded) {
      setLoading(false);
      return;
    }

    fetch('/pokemon-tracker/seed_data.json')
      .then((r) => r.json())
      .then((data: { seasons: Season[]; sets: BattleSet[]; matches: Match[] }) => {
        seedData(data.seasons, data.sets, data.matches);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load seed data:', e);
        setLoading(false);
      });
  }, [seeded, seedData]);

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter basename="/pokemon-tracker">
      <AppContent />
    </BrowserRouter>
  );
}
