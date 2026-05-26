import React from 'react';

const NAV = [
  { id: 'home',     emoji: '🏠', label: 'ホーム' },
  { id: 'checkin',  emoji: '✏️', label: '記録'   },
  { id: 'history',  emoji: '📊', label: '履歴'   },
  { id: 'settings', emoji: '⚙️', label: '設定'   },
];

export default function BottomNav({ current, onChange }) {
  return (
    <nav className="bottom-nav">
      {NAV.map(({ id, emoji, label }) => (
        <button
          key={id}
          className={`nav-item ${current === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
        >
          <span className="nav-emoji">{emoji}</span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
