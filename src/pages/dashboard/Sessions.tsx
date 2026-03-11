// ABOUTME: Session history page with date filtering and expandable session details.
// ABOUTME: Shows a list of all game sessions with accuracy, duration, and drill-down.

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useSessions, type DateFilter } from '../../hooks/dashboard/useSessions';
import { SessionRow } from '../../components/dashboard/SessionRow';

const DATE_FILTER_OPTIONS: { value: DateFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'dashboard.allTime' },
  { value: 'week', labelKey: 'dashboard.lastWeek' },
  { value: 'month', labelKey: 'dashboard.lastMonth' },
  { value: 'three_months', labelKey: 'dashboard.lastThreeMonths' },
];

export function Sessions() {
  const { t } = useTranslation();
  const { activeKid } = useAuthStore();
  const {
    sessions, loading, error, dateFilter, setDateFilter,
    refresh, fetchSessionAttempts, totalPlayTimeMinutes,
  } = useSessions(activeKid?.id ?? null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!activeKid) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg">{t('dashboard.selectKid')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-deep-brand">
          {t('dashboard.sessions')}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('dashboard.filterByDate')}:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm cursor-pointer bg-white"
          >
            {DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>{sessions.length} {t('dashboard.sessions').toLowerCase()}</span>
        <span>{totalPlayTimeMinutes} {t('dashboard.minutes')} {t('dashboard.totalPlayTime').toLowerCase()}</span>
      </div>

      {error && <p className="text-struggling text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-400 text-center py-12">{t('dashboard.noData')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onLoadAttempts={fetchSessionAttempts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
