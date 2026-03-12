// ABOUTME: Kid profile selection screen shown after parent login.
// ABOUTME: Allows selecting an existing kid or adding a new one before gameplay.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';

export function SelectKid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kids, activeKid, fetchKids, setActiveKid, addKid } = useAuthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKidName, setNewKidName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchKids();
  }, [fetchKids]);

  const handleSelectKid = (kid: typeof kids[0]) => {
    setActiveKid(kid);
    navigate('/play/game');
  };

  const handleAddKid = async () => {
    if (!newKidName.trim() || adding) return;
    setAdding(true);
    const kid = await addKid(newKidName.trim());
    setAdding(false);
    if (kid) {
      setNewKidName('');
      setShowAddForm(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#FFF8E1',
      fontFamily: 'Arial, sans-serif',
      gap: '24px',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: '36px', color: '#06628d', margin: 0 }}>
        {t('kids.selectTitle')}
      </h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
      }}>
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => handleSelectKid(kid)}
            style={{
              padding: '24px 32px',
              fontSize: '24px',
              borderRadius: '16px',
              border: activeKid?.id === kid.id
                ? '4px solid #4CAF50'
                : '4px solid #06628d',
              backgroundColor: 'white',
              color: '#06628d',
              cursor: 'pointer',
              minWidth: '150px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {kid.name}
          </button>
        ))}
      </div>

      {kids.length === 0 && (
        <p style={{ fontSize: '18px', color: '#666' }}>
          {t('kids.noKids')}
        </p>
      )}

      {showAddForm ? (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={newKidName}
            onChange={(e) => setNewKidName(e.target.value)}
            placeholder={t('kids.enterName')}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddKid()}
            style={{
              padding: '12px 16px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid #06628d',
              fontFamily: 'Arial, sans-serif',
            }}
          />
          <button
            onClick={handleAddKid}
            disabled={adding}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {t('kids.save')}
          </button>
          <button
            onClick={() => { setShowAddForm(false); setNewKidName(''); }}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid #666',
              backgroundColor: 'white',
              color: '#666',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {t('kids.cancel')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: '16px 32px',
            fontSize: '20px',
            borderRadius: '12px',
            border: '3px dashed #06628d',
            backgroundColor: 'transparent',
            color: '#06628d',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          + {t('kids.addKid')}
        </button>
      )}
    </div>
  );
}
