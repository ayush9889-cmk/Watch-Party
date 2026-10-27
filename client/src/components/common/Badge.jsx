import React from 'react';
import { ROLE_CONFIG } from '../../utils/roles';
import { CrownIcon, ShieldIcon, UsersIcon } from './Icons';

export default function Badge({ role, showIcon = true, size = 'sm' }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;

  const sizeClasses = size === 'xs'
    ? 'text-[11px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${config.badgeClass} ${sizeClasses}`}>
      {showIcon && (
        <>
          {role === 'host' && <CrownIcon className="w-3.5 h-3.5 text-amber-400" />}
          {role === 'moderator' && <ShieldIcon className="w-3.5 h-3.5 text-indigo-400" />}
          {(role === 'participant' || role === 'viewer') && <UsersIcon className="w-3.5 h-3.5 text-emerald-400" />}
        </>
      )}
      <span>{config.label}</span>
    </span>
  );
}
