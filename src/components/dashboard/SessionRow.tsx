// ABOUTME: Expandable row component showing a single game session summary.
// ABOUTME: Expands to reveal individual question attempts when clicked.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SessionSummary, SessionAttempt } from '../../hooks/dashboard/useSessions';

interface SessionRowProps {
  session: SessionSummary;
  onLoadAttempts: (sessionId: string) => Promise<SessionAttempt[]>;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SessionRow({ session, onLoadAttempts }: SessionRowProps) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [attempts, setAttempts] = useState<SessionAttempt[] | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && !attempts) {
      setLoadingAttempts(true);
      const data = await onLoadAttempts(session.id);
      setAttempts(data);
      setLoadingAttempts(false);
    }
    setExpanded(!expanded);
  };

  const accuracyColor =
    session.accuracy >= 80 ? 'text-correct' :
    session.accuracy >= 50 ? 'text-learning' :
    'text-struggling';

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <button
        onClick={toggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600">
            {formatDate(session.startedAt, i18n.language)}
          </span>
          <span className="text-sm text-gray-500">
            {formatDuration(session.durationSeconds)}
          </span>
          <span className="text-sm text-gray-500">
            {session.totalQuestions} {t('dashboard.questions')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${accuracyColor}`}>
            {session.accuracy}%
          </span>
          <span className="text-gray-400 text-xs">
            {expanded ? '\u25B2' : '\u25BC'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50">
          {loadingAttempts ? (
            <p className="text-sm text-gray-400 py-2">{t('common.loading')}</p>
          ) : attempts && attempts.length > 0 ? (
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-start pb-1">{t('dashboard.question')}</th>
                  <th className="text-start pb-1">{t('dashboard.answer')}</th>
                  <th className="text-start pb-1">{t('dashboard.correct')}</th>
                  <th className="text-start pb-1">{t('dashboard.time')}</th>
                  <th className="text-start pb-1">{t('dashboard.hintUsed')}</th>
                  <th className="text-start pb-1">{t('dashboard.errorType')}</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-t border-gray-50">
                    <td className="py-1 font-mono">{a.factorA} x {a.factorB}</td>
                    <td className="py-1">{a.givenAnswer ?? '--'}</td>
                    <td className="py-1">
                      {a.isCorrect
                        ? <span className="text-correct font-bold">{'\u2713'}</span>
                        : <span className="text-struggling font-bold">{'\u2717'}</span>}
                    </td>
                    <td className="py-1 text-gray-500">
                      {(a.responseTimeMs / 1000).toFixed(1)}{t('common.seconds')}
                    </td>
                    <td className="py-1 text-gray-500">
                      {a.hintLevel > 0 ? `L${a.hintLevel}` : '--'}
                    </td>
                    <td className="py-1 text-gray-400 text-xs">
                      {a.errorType ? t(`errors.${a.errorType}`) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 py-2">{t('dashboard.noData')}</p>
          )}
        </div>
      )}
    </div>
  );
}
