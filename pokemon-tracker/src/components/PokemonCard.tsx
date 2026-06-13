import { getPokemonTypes } from '../data/pokemonTypes';
import { TYPE_COLORS, TYPE_LABELS_PT } from '../data/typeColors';

interface Props {
  name: string;
  role?: 'LEAD' | 'SWITCH' | 'CLOSER';
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  faded?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  SWITCH: 'Switch',
  CLOSER: 'Closer',
};

export function PokemonCard({ name, role, showRole = false, size = 'md', onClick, faded = false }: Props) {
  const types = name ? getPokemonTypes(name) : null;
  const type1 = types?.[0];
  const type2 = types?.[1];

  const color1 = type1 ? TYPE_COLORS[type1] : '#374151';
  const color2 = type2 ? TYPE_COLORS[type2] : '#ffffff22';

  const gradient = type2
    ? `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`
    : `linear-gradient(135deg, ${color1} 60%, #ffffff22 100%)`;

  const sizeStyles = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }[size];

  const nameFontSize = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  }[size];

  if (!name) {
    return (
      <div
        className={`${sizeStyles} rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors`}
        onClick={onClick}
      >
        <span className="text-gray-500 text-xs">Selecionar</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeStyles} rounded-xl overflow-hidden relative cursor-pointer transition-transform hover:scale-105 ${faded ? 'opacity-50' : ''}`}
      style={{ background: gradient }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
        {showRole && role && (
          <span className="text-white/80 text-xs font-medium bg-black/30 px-1.5 rounded mb-1">
            {ROLE_LABELS[role]}
          </span>
        )}
        <span className={`text-white font-bold text-center leading-tight drop-shadow-md ${nameFontSize} break-words px-1 w-full text-center`}>
          {name}
        </span>
        {type1 && (
          <div className="flex gap-1 mt-1 flex-wrap justify-center">
            <span className="text-white/90 text-xs bg-black/30 px-1.5 py-0.5 rounded-full">
              {TYPE_LABELS_PT[type1]}
            </span>
            {type2 && (
              <span className="text-white/90 text-xs bg-black/30 px-1.5 py-0.5 rounded-full">
                {TYPE_LABELS_PT[type2]}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
