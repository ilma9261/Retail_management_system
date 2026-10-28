import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  trendLabel,
  onClick,
  className = ''
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'hover:border-blue-200'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200'
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-600',
      border: 'hover:border-amber-200'
    },
    rose: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-600',
      border: 'hover:border-rose-200'
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-200'
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-600',
      border: 'hover:border-purple-200'
    },
    cyan: {
      bg: 'bg-cyan-50/70',
      text: 'text-cyan-600',
      border: 'hover:border-cyan-200'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${scheme.border} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.text} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`font-semibold inline-flex items-center px-1.5 py-0.5 rounded ${
                  trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
            {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
            {subtitle && !trendLabel && <span className="text-slate-500 truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
