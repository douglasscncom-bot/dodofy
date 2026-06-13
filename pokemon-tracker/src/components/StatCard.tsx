import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
  trend?: number;
}

export function StatCard({ title, value, subtitle, icon, color = '#2980EF', trend }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 flex flex-col gap-1 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start justify-between">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">{title}</span>
        {icon && <span style={{ color }} className="opacity-80">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend !== undefined && (
          <span className={`text-sm font-semibold mb-0.5 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      {subtitle && <span className="text-gray-500 text-xs">{subtitle}</span>}
    </div>
  );
}
