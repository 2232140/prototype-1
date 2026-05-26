import React, { useState, useEffect } from 'react';
import { getEntries } from '../utils/storage';
import { getLast7Days, MOOD_OPTIONS, ENERGY_OPTIONS, calculateImprovement } from '../utils/analysis';

function BarChart({ days, metric }) {
  const color  = metric === 'mood' ? '#7C6FCD' : '#64B6AC';
  const W = 320, H = 130, padL = 16, padR = 16, padT = 8, padB = 28;
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const slot = cW / 7;
  const bW   = slot * 0.55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bar-chart">
      {/* grid lines */}
      {[1, 2, 3, 4, 5].map((v) => {
        const y = padT + cH - (v / 5) * cH;
        return <line key={v} x1={padL} x2={W - padR} y1={y} y2={y} stroke="#F0F4F8" strokeWidth="1" />;
      })}
      {days.map((day, i) => {
        const cx   = padL + (i + 0.5) * slot;
        const val  = day.entry ? day.entry[metric] : 0;
        const bH   = (val / 5) * cH || 3;
        const by   = padT + cH - bH;
        return (
          <g key={i}>
            <rect
              x={cx - bW / 2} y={by} width={bW} height={bH}
              rx={5} fill={day.entry ? color : '#E5E7EB'} opacity={day.entry ? 0.88 : 0.45}
            />
            <text x={cx} y={H - 6} textAnchor="middle" fontSize="10" fill="#9CA3AF">{day.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function History() {
  const [entries, setEntries] = useState([]);
  const [metric, setMetric]   = useState('mood');

  useEffect(() => { setEntries(getEntries()); }, []);

  const days    = getLast7Days(entries);
  const improve = calculateImprovement(entries);

  return (
    <div className="screen history-screen">
      <h1 className="screen-title">履歴</h1>

      {/* グラフカード */}
      <div className="card">
        <div className="tab-row">
          {['mood', 'energy'].map((m) => (
            <button
              key={m}
              className={`tab-btn ${metric === m ? 'active' : ''}`}
              onClick={() => setMetric(m)}
            >
              {m === 'mood' ? '😊 気分' : '⚡ 体調'}
            </button>
          ))}
        </div>
        <BarChart days={days} metric={metric} />
        {improve !== null && (
          <p className="chart-note" style={{ color: improve >= 0 ? '#64B6AC' : '#E07B7B' }}>
            {improve >= 0 ? '📈' : '📉'} 前週比 {improve >= 0 ? '+' : ''}{improve}% 改善しました！
          </p>
        )}
      </div>

      {/* 日別リスト */}
      <div className="card">
        <h2 className="card-section-title">直近7日間の記録</h2>
        <div className="day-list">
          {[...days].reverse().map((day, i) => (
            <div key={i} className={`day-row ${!day.entry ? 'no-entry' : ''}`}>
              <div className="day-date">
                <span className="day-label">{day.label}</span>
                <span className="day-mmdd">
                  {day.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                </span>
              </div>
              {day.entry ? (
                <div className="day-content">
                  <span className="day-score-emoji">
                    {MOOD_OPTIONS[day.entry.mood - 1]?.emoji}
                    {ENERGY_OPTIONS[day.entry.energy - 1]?.emoji}
                  </span>
                  {day.entry.memo && (
                    <p className="day-memo">"{day.entry.memo}"</p>
                  )}
                </div>
              ) : (
                <span className="day-empty">未記録</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
