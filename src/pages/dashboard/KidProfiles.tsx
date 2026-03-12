// ABOUTME: Kid profile management page with create, edit, delete, and avatar selection.
// ABOUTME: Shows kid cards with avatars and actions to manage profiles or start playing.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { useKids } from '../../hooks/dashboard/useKids';
import type { KidProfile } from '../../types';

const AVATAR_OPTIONS = [
  '\uD83E\uDDA6', '\uD83D\uDC36', '\uD83D\uDC31', '\uD83D\uDC3B', '\uD83D\uDC3C',
  '\uD83D\uDC28', '\uD83E\uDD81', '\uD83D\uDC2F', '\uD83D\uDC35', '\uD83D\uDC37',
  '\uD83D\uDC38', '\uD83E\uDD8B', '\uD83D\uDC1D', '\uD83D\uDC22', '\uD83D\uDC19',
  '\uD83E\uDD84', '\uD83D\uDC3F\uFE0F', '\uD83E\uDD89', '\uD83D\uDC27', '\uD83E\uDD9A',
];

interface KidFormState {
  name: string;
  avatar: string | null;
}

export function KidProfiles() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setActiveKid } = useAuthStore();
  const { kids, loading, error, refresh, addKid, updateKid, deleteKid } = useKids();

  const [showForm, setShowForm] = useState(false);
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null);
  const [form, setForm] = useState<KidFormState>({ name: '', avatar: null });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreateForm = () => {
    setEditingKid(null);
    setForm({ name: '', avatar: null });
    setShowForm(true);
  };

  const openEditForm = (kid: KidProfile) => {
    setEditingKid(kid);
    setForm({ name: kid.name, avatar: kid.avatarUrl });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || saving) return;
    setSaving(true);

    if (editingKid) {
      await updateKid(editingKid.id, {
        name: form.name.trim(),
        avatarUrl: form.avatar,
      });
    } else {
      await addKid(form.name.trim(), form.avatar);
    }

    setSaving(false);
    setShowForm(false);
    setEditingKid(null);
  };

  const handleDelete = async (id: string) => {
    await deleteKid(id);
    setConfirmDeleteId(null);
  };

  const handleViewProgress = (kid: KidProfile) => {
    setActiveKid(kid);
    navigate('/dashboard/progress');
  };

  const handleStartPlaying = (kid: KidProfile) => {
    setActiveKid(kid);
    navigate('/play/game');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-deep-brand">
          {t('kids.manageProfiles')}
        </h1>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-deep-brand text-white rounded-lg text-sm font-medium hover:bg-sky-brand transition-colors cursor-pointer"
        >
          + {t('kids.addKid')}
        </button>
      </div>

      {error && <p className="text-struggling text-sm mb-4">{error}</p>}

      {loading && kids.length === 0 ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : kids.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">{t('kids.noKids')}</p>
          <button
            onClick={openCreateForm}
            className="px-6 py-3 border-2 border-dashed border-deep-brand text-deep-brand rounded-xl hover:bg-deep-brand/5 transition-colors cursor-pointer"
          >
            + {t('kids.addKid')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kids.map((kid) => (
            <div key={kid.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{kid.avatarUrl || '\uD83D\uDC64'}</span>
                <h3 className="font-bold text-lg text-deep-brand">{kid.name}</h3>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleViewProgress(kid)}
                  className="flex-1 px-3 py-2 bg-sky-brand/10 text-sky-brand rounded-lg text-sm font-medium hover:bg-sky-brand/20 transition-colors cursor-pointer"
                >
                  {t('kids.viewProgress')}
                </button>
                <button
                  onClick={() => handleStartPlaying(kid)}
                  className="flex-1 px-3 py-2 bg-correct/10 text-correct rounded-lg text-sm font-medium hover:bg-correct/20 transition-colors cursor-pointer"
                >
                  {t('kids.startPlaying')}
                </button>
              </div>

              <div className="flex gap-2 border-t border-gray-50 pt-2">
                <button onClick={() => openEditForm(kid)} className="text-xs text-gray-400 hover:text-deep-brand transition-colors cursor-pointer">
                  {t('kids.edit')}
                </button>
                {confirmDeleteId === kid.id ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-struggling">{t('kids.confirmDelete', { name: kid.name })}</span>
                    <button onClick={() => handleDelete(kid.id)} className="text-xs text-white bg-struggling px-2 py-1 rounded cursor-pointer">{t('kids.delete')}</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-400 cursor-pointer">{t('kids.cancel')}</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(kid.id)} className="text-xs text-gray-400 hover:text-struggling transition-colors cursor-pointer">
                    {t('kids.delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-deep-brand mb-4">
              {editingKid ? t('kids.edit') : t('kids.addKid')}
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('kids.enterName')}
                autoFocus
                className="px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:border-deep-brand focus:outline-none"
              />

              <div>
                <p className="text-sm text-gray-500 mb-2">{t('kids.pickAvatar')}</p>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm({ ...form, avatar: emoji })}
                      className={`text-3xl p-2 rounded-lg transition-colors cursor-pointer ${
                        form.avatar === emoji ? 'bg-sky-brand/20 ring-2 ring-sky-brand' : 'hover:bg-gray-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim() || saving}
                  className="flex-1 px-4 py-3 bg-deep-brand text-white rounded-xl font-medium hover:bg-sky-brand transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {t('kids.save')}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingKid(null); }}
                  className="px-4 py-3 border-2 border-gray-200 text-gray-500 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {t('kids.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
