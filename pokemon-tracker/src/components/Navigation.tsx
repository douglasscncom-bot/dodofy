import { NavLink } from 'react-router-dom';
import { Home, Swords, BarChart3, Shield, Cpu, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/temporadas', icon: Swords, label: 'Batalhas' },
  { to: '/times', icon: Shield, label: 'Times' },
  { to: '/metricas', icon: BarChart3, label: 'Métricas' },
  { to: '/ia', icon: Cpu, label: 'IA' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function SideNav() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-700 min-h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">PokeTracker</h1>
        <p className="text-gray-400 text-xs mt-1">Pokemon GO PvP</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function AddMatchFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all active:scale-95 z-40"
    >
      <Plus size={28} />
    </button>
  );
}
