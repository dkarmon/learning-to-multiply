// ABOUTME: 11x11 multiplication heat map showing mastery status for every fact.
// ABOUTME: Color-coded cells with hover popups and click-through to fact detail.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useFactMastery, type MasteryCell, type MasteryStatus } from '../../hooks/dashboard/useFactMastery';

const STATUS_COLORS: Record<MasteryStatus, string> = {
  mastered: '#4CAF50',
  learning: '#FFC107',
  struggling: '#EF5350',
  not_introduced: '#E0E0E0',
};

const STATUS_BG_CLASSES: Record<MasteryStatus, string> = {
  mastered: 'bg-correct hover:bg-correct/80',
  learning: 'bg-learning hover:bg-learning/80',
  struggling: 'bg-struggling hover:bg-struggling/80',
  not_introduced: 'bg-not-introduced hover:bg-gray-300',
};

const STATUS_TEXT_CLASSES: Record<MasteryStatus, string> = {
  mastered: 'text-white',
  learning: 'text-gray-800',
  struggling: 'text-white',
  not_introduced: 'text-gray-500',
};

interface PopupData {
  cell: MasteryCell;
  x: number;
  y: number;
}

export function HeatMap() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeKid } = useAuthStore();
  const { grid, stats, loading, error, refresh } = useFactMastery(activeKid?.id ?? null);
  const [popup, setPopup] = useState<PopupData | null>(null);

  if (!activeKid) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg">{t('dashboard.selectKid')}</p>
      </div>
    );
  }

  if (loading) return <p className="text-gray-400">{t('common.loading')}</p>;
  if (error) return <p className="text-struggling">{error}</p>;

  const handleCellHover = (cell: MasteryCell, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ cell, x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleCellClick = (cell: MasteryCell) => {
    setPopup(null);
    if (cell.mastery) {
      navigate(`/dashboard/progress/${cell.factorA}/${cell.factorB}`);
    }
  };

  const formatReviewDate = (iso: string | null) => {
    if (!iso) return '--';
    return new Date(iso).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US', {
      month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-deep-brand">{t('heatMap.title')}</h1>
        <button onClick={refresh} className="px-3 py-1 text-sm text-sky-brand border border-sky-brand rounded-lg hover:bg-sky-brand/10 transition-colors cursor-pointer">
          {t('dashboard.refresh')}
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap text-sm">
        <span className="text-correct font-medium">{stats.mastered} {t('heatMap.mastered')}</span>
        <span className="text-learning font-medium">{stats.learning} {t('heatMap.learning')}</span>
        <span className="text-struggling font-medium">{stats.struggling} {t('heatMap.struggling')}</span>
        <span className="text-gray-400">{stats.notIntroduced} {t('heatMap.notIntroduced')}</span>
      </div>

      {/* The Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Column headers */}
          <div className="flex">
            <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-gray-400">x</div>
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="w-10 h-10 flex items-center justify-center text-xs font-bold text-deep-brand">
                {i}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {/* Row header */}
              <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-deep-brand">
                {rowIdx}
              </div>

              {/* Cells */}
              {row.map((cell, colIdx) => (
                <button
                  key={colIdx}
                  className={`w-10 h-10 flex items-center justify-center text-[10px] font-mono rounded-sm m-[1px] transition-colors cursor-pointer
                    ${STATUS_BG_CLASSES[cell.status]} ${STATUS_TEXT_CLASSES[cell.status]}`}
                  onMouseEnter={(e) => handleCellHover(cell, e)}
                  onMouseLeave={() => setPopup(null)}
                  onClick={() => handleCellClick(cell)}
                  title={`${cell.factorA}x${cell.factorB}`}
                >
                  {cell.factorA * cell.factorB}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs">
        <span className="text-gray-500 font-medium">{t('heatMap.legend')}:</span>
        {([
          ['mastered', t('heatMap.mastered')],
          ['learning', t('heatMap.learning')],
          ['struggling', t('heatMap.struggling')],
          ['not_introduced', t('heatMap.notIntroduced')],
        ] as [MasteryStatus, string][]).map(([status, label]) => (
          <span key={status} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: STATUS_COLORS[status] }} />
            {label}
          </span>
        ))}
      </div>

      {/* Hover popup */}
      {popup && popup.cell.mastery && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-sm pointer-events-none"
          style={{
            left: Math.min(popup.x, window.innerWidth - 200),
            top: Math.max(popup.y - 140, 10),
          }}
        >
          <p className="font-bold text-deep-brand mb-1">
            {popup.cell.factorA} x {popup.cell.factorB} = {popup.cell.factorA * popup.cell.factorB}
          </p>
          <p className="text-gray-600">
            {t('heatMap.accuracy')}: {popup.cell.mastery.totalAttempts > 0
              ? Math.round((popup.cell.mastery.correctAttempts / popup.cell.mastery.totalAttempts) * 100)
              : 0}%
          </p>
          <p className="text-gray-600">
            {t('heatMap.attempts')}: {popup.cell.mastery.totalAttempts}
          </p>
          <p className="text-gray-600">
            {t('heatMap.avgTime')}: {popup.cell.mastery.avgResponseTimeMs
              ? `${(popup.cell.mastery.avgResponseTimeMs / 1000).toFixed(1)}s`
              : '--'}
          </p>
          <p className="text-gray-600">
            {t('heatMap.leitnerBox')}: {popup.cell.mastery.leitnerBox}
          </p>
          <p className="text-gray-600">
            {t('heatMap.nextReview')}: {formatReviewDate(popup.cell.mastery.nextReviewAt)}
          </p>
          <p className="text-xs text-sky-brand mt-1">{t('heatMap.viewDetail')}</p>
        </div>
      )}
    </div>
  );
}
