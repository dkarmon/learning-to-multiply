// ABOUTME: Renders a list of actionable insight cards for parents.
// ABOUTME: Each card shows a plain-language message with a colored priority indicator.

import { useTranslation } from 'react-i18next';
import type { Insight } from '../../hooks/dashboard/useInsights';

interface InsightCardsProps {
  insights: Insight[];
}

const typeColors: Record<Insight['type'], { bg: string; border: string }> = {
  struggling_cluster: { bg: 'bg-red-50', border: 'border-struggling' },
  short_sessions: { bg: 'bg-yellow-50', border: 'border-learning' },
  hint_dependency: { bg: 'bg-yellow-50', border: 'border-learning' },
  plateau: { bg: 'bg-orange-50', border: 'border-warm-orange' },
  celebration: { bg: 'bg-green-50', border: 'border-correct' },
  error_pattern: { bg: 'bg-red-50', border: 'border-struggling' },
};

export function InsightCards({ insights }: InsightCardsProps) {
  const { t } = useTranslation();

  if (insights.length === 0) {
    return (
      <p className="text-gray-400 text-sm italic">
        {t('insights.noInsights')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight) => {
        const colors = typeColors[insight.type];
        const params = { ...insight.i18nParams };
        if (insight.type === 'error_pattern' && typeof params.errorDescription === 'string') {
          params.errorDescription = t(params.errorDescription as string);
        }

        return (
          <div
            key={insight.id}
            className={`${colors.bg} ${colors.border} border-l-4 rtl:border-l-0 rtl:border-r-4 rounded-lg p-4`}
          >
            <p className="text-sm text-gray-700">
              {t(insight.i18nKey, params)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
