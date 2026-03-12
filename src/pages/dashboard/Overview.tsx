// ABOUTME: Dashboard home page showing summary metrics, recent sessions, and insights.
// ABOUTME: Displays key stats as cards with a quick insight panel and start-playing button.

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useFactMastery } from '../../hooks/dashboard/useFactMastery';
import { useSessions } from '../../hooks/dashboard/useSessions';
import { useInsights } from '../../hooks/dashboard/useInsights';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import { InsightCards } from '../../components/dashboard/InsightCards';
import { SessionRow } from '../../components/dashboard/SessionRow';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function Overview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();

  const { stats, masteryMap, loading: masteryLoading } = useFactMastery(activeKid?.id ?? null);
  const { sessions, loading: sessionsLoading, totalPlayTimeMinutes, fetchSessionAttempts } =
    useSessions(activeKid?.id ?? null);

  const [hintRate, setHintRate] = useState<number | null>(null);
  const [dominantError, setDominantError] = useState<string | null>(null);

  const fetchGlobalStats = useCallback(async () => {
    if (!activeKid) return;

    try {
      const attemptsRef = collection(db, 'attempts');
      const q = query(attemptsRef, where('kid_id', '==', activeKid.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docs = snapshot.docs.map((d) => d.data());
        const withHints = docs.filter((a) => a.hint_level > 0).length;
        setHintRate((withHints / docs.length) * 100);

        const errorCounts = new Map<string, number>();
        for (const a of docs) {
          if (a.error_type) {
            errorCounts.set(a.error_type, (errorCounts.get(a.error_type) ?? 0) + 1);
          }
        }
        let maxCount = 0;
        let maxType: string | null = null;
        for (const [type, count] of errorCounts) {
          if (count > maxCount) { maxCount = count; maxType = type; }
        }
        setDominantError(maxType);
      }
    } catch (err) {
      console.error('Failed to fetch global stats:', err);
    }
  }, [activeKid]);

  useEffect(() => { fetchGlobalStats(); }, [fetchGlobalStats]);

  const { insights } = useInsights(
    activeKid?.name ?? '', masteryMap, sessions, hintRate, dominantError
  );

  const currentLevel = sessions.length > 0 ? sessions[0].level : 1;
  const overallAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
    : 0;

  const loading = masteryLoading || sessionsLoading;

  if (!activeKid) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg">{t('dashboard.selectKid')}</p>
      </div>
    );
  }

  if (loading) return <p className="text-gray-400">{t('common.loading')}</p>;

  const hasData = sessions.length > 0 || stats.mastered + stats.learning + stats.struggling > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-deep-brand">
          {activeKid.avatarUrl && <span className="me-2">{activeKid.avatarUrl}</span>}
          {activeKid.name}
        </h1>
        <button
          onClick={() => navigate('/play/game')}
          className="px-5 py-2 bg-correct text-white rounded-xl font-medium hover:bg-correct/90 transition-colors cursor-pointer"
        >
          {t('dashboard.startPlaying')}
        </button>
      </div>

      {!hasData ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-4">{t('dashboard.noData')}</p>
          <button onClick={() => navigate('/play/game')} className="px-6 py-3 bg-deep-brand text-white rounded-xl font-medium cursor-pointer">
            {t('dashboard.startPlaying')}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label={t('dashboard.factsMastered')} value={stats.mastered} sublabel={`${t('common.of')} ${stats.totalFacts}`} color="#4CAF50" />
            <SummaryCard label={t('dashboard.currentLevel')} value={currentLevel} />
            <SummaryCard label={t('dashboard.accuracy')} value={`${overallAccuracy}%`} color={overallAccuracy >= 70 ? '#4CAF50' : overallAccuracy >= 40 ? '#FFC107' : '#EF5350'} />
            <SummaryCard label={t('dashboard.totalPlayTime')} value={`${totalPlayTimeMinutes}`} sublabel={t('dashboard.minutes')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold text-deep-brand mb-3">{t('insights.title')}</h2>
              <InsightCards insights={insights} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-deep-brand mb-3">{t('dashboard.recentSessions')}</h2>
              <div className="flex flex-col gap-2">
                {sessions.slice(0, 5).map((session) => (
                  <SessionRow key={session.id} session={session} onLoadAttempts={fetchSessionAttempts} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
