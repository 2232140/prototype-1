import React from 'react';

export default function PageHeader({ title, subtitle, emoji }) {
  return (
    <div className="page-header">
      <div>
        {subtitle && <p className="page-header-sub">{subtitle}</p>}
        <p className="page-header-title">{title}</p>
      </div>
      {emoji && <span className="page-header-emoji">{emoji}</span>}
    </div>
  );
}
