// ABOUTME: Dropdown component for selecting which kid's data to view.
// ABOUTME: Used in the dashboard header to switch between kid profiles.

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import type { KidProfile } from '../../types';

interface KidSelectorProps {
  onSelect?: (kid: KidProfile) => void;
}

export function KidSelector({ onSelect }: KidSelectorProps) {
  const { t } = useTranslation();
  const { kids, activeKid, setActiveKid } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kid = kids.find((k) => k.id === e.target.value) ?? null;
    if (kid) {
      setActiveKid(kid);
      onSelect?.(kid);
    }
  };

  if (kids.length === 0) {
    return (
      <span className="text-sm text-gray-400">
        {t('dashboard.selectKid')}
      </span>
    );
  }

  return (
    <select
      value={activeKid?.id ?? ''}
      onChange={handleChange}
      className="px-3 py-2 rounded-lg border-2 border-deep-brand bg-white text-deep-brand font-medium text-sm cursor-pointer"
    >
      {!activeKid && (
        <option value="" disabled>
          {t('dashboard.selectKid')}
        </option>
      )}
      {kids.map((kid) => (
        <option key={kid.id} value={kid.id}>
          {kid.avatarUrl ? `${kid.avatarUrl} ` : ''}{kid.name}
        </option>
      ))}
    </select>
  );
}
