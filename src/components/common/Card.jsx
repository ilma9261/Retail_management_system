import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  headerIcon: Icon,
  className = '',
  bodyClassName = 'p-5 sm:p-6',
  footer
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] transition-shadow duration-200 overflow-hidden ${className}`}>
      {(title || subtitle || action || Icon) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="truncate">
              {title && <h3 className="font-semibold text-slate-900 text-base tracking-tight truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};
