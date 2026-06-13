import type { PokemonType } from '../types';
import { TYPE_COLORS, TYPE_LABELS_PT } from '../data/typeColors';

interface Props {
  type: PokemonType;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}

export function TypeBadge({ type, size = 'sm', showLabel = true }: Props) {
  const color = TYPE_COLORS[type];
  const label = TYPE_LABELS_PT[type];

  const sizeClass = {
    xs: 'px-1.5 py-0.5 text-xs rounded',
    sm: 'px-2 py-0.5 text-xs rounded-md',
    md: 'px-3 py-1 text-sm rounded-lg',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold text-white shadow-sm ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      {showLabel ? label : ''}
    </span>
  );
}
