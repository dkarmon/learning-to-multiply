// ABOUTME: Drill-down page showing detailed analytics for a single multiplication fact.
// ABOUTME: Shows accuracy chart, response time trend, error breakdown, and attempt history.

import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useFactDetail } from '../../hooks/dashboard/useFactDetail';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const ERROR_COLORS = ['#EF5350', '#FF7043', '#FFA726', '#FFCA28', '#9E9E9E'];

const TREND_LABELS: Record<string, { key: string; color: string }> = {
  improving: { key: 'factDetail.improving', color: '#4CAF50' },
  plateau: { key: 'factDetail.plateau', color: '#FFC107' },
  declining: { key: 'factDetail.declining', color: '#EF5350' },
};

export function FactDetail() {
  const { factorA: paramA, factorB: paramB } = useParams<{ factorA: string; factorB: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();

  const factorA = Number(paramA ?? 0);
  const factorB = Number(paramB ?? 0);

  const {
    attempts, mastery, accuracyOverTime, responseTimeTrend,
    errorBreakdown, trend, loading, error,
  } = useFactDetail(activeKid?.id ?? null, factorA, factorB);

  if (!activeKid) {
    return <p className="text-gray-400">{t('dashboard.selectKid')}</p>;
  }

  if (loading) return <p className="text-gray-400">{t('common.loading')}</p>;
  if (error) return <p className="text-struggling">{error}</p>;

  const trendInfo = TREND_LABELS[trend];
  const accuracy = mastery && mastery.totalAttempts > 0
    ? Math.round((mastery.correctAttempts / mastery.totalAttempts) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/progress')}
          className="text-sm text-sky-brand hover:underline cursor-pointer"
        >
          {t('common.back')}
        </button>
        <h1 className="text-2xl font-bold text-deep-brand">
          {t('factDetail.title', { a: factorA, b: factorB })} = {factorA * factorB}
        </h1>
      </div>

      {attempts.length === 0 ? (
        <p className="text-gray-400 py-8">{t('factDetail.noAttempts')}</p>
      ) : (
        <>
          {/* Summary cards row */}
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('heatMap.accuracy')}</span>
              <p className="text-2xl font-bold" style={{ color: accuracy >= 70 ? '#4CAF50' : accuracy >= 40 ? '#FFC107' : '#EF5350' }}>
                {accuracy}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('heatMap.attempts')}</span>
              <p className="text-2xl font-bold text-deep-brand">{mastery?.totalAttempts ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('factDetail.currentBox')}</span>
              <p className="text-2xl font-bold text-deep-brand">{mastery?.leitnerBox ?? '--'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <span className="text-xs text-gray-500">{t('factDetail.trend')}</span>
              <p className="text-lg font-bold" style={{ color: trendInfo.color }}>
                {t(trendInfo.key)}
              </p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accuracy over time */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.accuracyOverTime')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={accuracyOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Response time trend */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.responseTimeTrend')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={responseTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`} />
                  <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(1)}s`} />
                  <Line type="monotone" dataKey="avgTimeMs" stroke="#2aa7c9" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error breakdown */}
          {errorBreakdown.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.errorBreakdown')}</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={errorBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(type: string) => t(`errors.${type}`)}
                    width={150}
                  />
                  <Tooltip labelFormatter={(type: string) => t(`errors.${type}`)} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {errorBreakdown.map((_, idx) => (
                      <Cell key={idx} fill={ERROR_COLORS[idx % ERROR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Attempt history table */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-deep-brand mb-3">{t('factDetail.allAttempts')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-gray-100">
                    <th className="text-start pb-2">{t('dashboard.date')}</th>
                    <th className="text-start pb-2">{t('dashboard.answer')}</th>
                    <th className="text-start pb-2">{t('dashboard.correct')}</th>
                    <th className="text-start pb-2">{t('dashboard.time')}</th>
                    <th className="text-start pb-2">{t('dashboard.hintUsed')}</th>
                    <th className="text-start pb-2">{t('dashboard.errorType')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id} className="border-t border-gray-50">
                      <td className="py-1.5 text-gray-600 text-xs">
                        {new Date(a.attemptedAt).toLocaleDateString()}
                      </td>
                      <td className="py-1.5">{a.givenAnswer ?? '--'}</td>
                      <td className="py-1.5">
                        {a.isCorrect
                          ? <span className="text-correct font-bold">{'\u2713'}</span>
                          : <span className="text-struggling font-bold">{'\u2717'}</span>}
                      </td>
                      <td className="py-1.5 text-gray-500">
                        {(a.responseTimeMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-1.5 text-gray-500">
                        {a.hintLevel > 0 ? `L${a.hintLevel}` : '--'}
                      </td>
                      <td className="py-1.5 text-gray-400 text-xs">
                        {a.errorType ? t(`errors.${a.errorType}`) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
