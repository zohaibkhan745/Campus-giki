import React from 'react';
import { Link } from 'react-router-dom';
import { getSocietyLogo } from '@/lib/utils';
import type { YearlyPlan, PlanStatus } from '@/types/yearly-plan.types';

interface YearlyPlanCardProps {
  plan: YearlyPlan;
  baseUrl: string;
}

export const YearlyPlanCard: React.FC<YearlyPlanCardProps> = ({ plan, baseUrl }) => {
  const society = plan.society || { name: 'Assigned Society', slug: 'society', logoUrl: '' };
  const societyInitials = society.name.substring(0, 3).toLowerCase();

  let statusColorClass = '';
  let statusTextClass = '';
  let statusBgClass = '';
  let statusLabel = plan.status.replace('_', ' ');

  switch (plan.status) {
    case 'PENDING':
    case 'PENDING_ADVISOR':
      statusColorClass = 'bg-yellow-400';
      statusTextClass = 'text-yellow-400';
      statusBgClass = 'bg-yellow-500/15 border-yellow-500/30';
      statusLabel = 'Pending Advisor';
      break;
    case 'PENDING_ADMIN':
      statusColorClass = 'bg-orange-400';
      statusTextClass = 'text-orange-400';
      statusBgClass = 'bg-orange-500/15 border-orange-500/30';
      statusLabel = 'Pending Admin';
      break;
    case 'CHANGES_REQUESTED':
      statusColorClass = 'bg-rose-400';
      statusTextClass = 'text-rose-400';
      statusBgClass = 'bg-rose-500/15 border-rose-500/30';
      statusLabel = 'Changes Requested';
      break;
    case 'APPROVED':
      statusColorClass = 'bg-emerald-400';
      statusTextClass = 'text-emerald-400';
      statusBgClass = 'bg-emerald-500/15 border-emerald-500/30';
      break;
    default:
      statusColorClass = 'bg-text-muted';
      statusTextClass = 'text-text-muted';
      statusBgClass = 'bg-surface-hover border-border-subtle';
  }

  return (
    <div className="relative z-10 w-full max-w-full sm:max-w-sm rounded-3xl overflow-hidden border border-border-medium bg-surface shadow-elevation-1 transition-all duration-300 hover:border-brand-primary/40 hover:shadow-elevation-2">
      <div className="relative w-full aspect-square bg-gradient-to-b from-brand-primary/10 via-surface/40 to-surface-hover/60 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex flex-col gap-1.5 items-start z-30">
          <div className="flex items-baseline gap-1.5">
            <span className="text-text-primary text-lg sm:text-xl font-black tracking-tight">{society.name}</span>
            <span className="text-text-secondary text-xs font-semibold">({plan.year})</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-inner ${statusTextClass} ${statusBgClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusColorClass}`}></span>
            {statusLabel}
          </span>
          {plan.editRequestStatus === 'PENDING' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-inner text-yellow-600 dark:text-yellow-400 bg-yellow-500/15 border-yellow-500/30">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-yellow-400"></span>
              Edit Request Pending
            </span>
          )}
          {plan.editRequestStatus === 'APPROVED' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-inner text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-400"></span>
              Edit Request Approved
            </span>
          )}
          {plan.editRequestStatus === 'REJECTED' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-inner text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-rose-400"></span>
              Edit Request Rejected
            </span>
          )}
        </div>

        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center shadow-elevation-2 border-4 border-border-medium overflow-hidden bg-surface z-20">
          {society.logoUrl ? (
            <img 
              src={getSocietyLogo(society.logoUrl)} 
              alt={society.name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center select-none bg-surface-hover">
              <span className="text-text-primary text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">{societyInitials}</span>
              <span className="text-text-secondary text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-1">Chapter</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface/95 backdrop-blur-lg border-t border-border-subtle p-3.5 sm:p-4 flex items-center justify-between gap-5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-primary flex items-center justify-center border border-border-medium shrink-0 overflow-hidden">
            {society.logoUrl ? (
              <img 
                src={getSocietyLogo(society.logoUrl)} 
                alt={society.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }}
              />
            ) : (
              <span className="text-white text-[9px] font-bold tracking-tighter">{societyInitials}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-text-secondary text-xs font-medium leading-none truncate">@{society.name.toLowerCase().replace(/\s+/g, '')}</span>
            <div className="flex items-baseline gap-1.5 mt-1.5 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-text-primary leading-none shrink-0">{(plan as any).totalPlannedEvents || plan.plannedEvents?.length || 0}</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">Planned Events</span>
            </div>
          </div>
        </div>

        <Link 
          to={`${baseUrl}/${plan.id}`}
          className="flex justify-center items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-text-primary hover:opacity-90 text-text-inverse rounded-xl text-xs sm:text-sm font-bold transition-opacity shrink-0 shadow-sm"
        >
          <span className="whitespace-nowrap">View Details</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
};
