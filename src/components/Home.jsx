import React, { useState, useEffect, useRef } from 'react';
import { getEntries, getTodayEntry, getSettingsWithDefaults } from '../utils/storage';
import {
  analyzeState, getStreak, calculateImprovement, getDailyTip,
  getWeeklySummary, MOOD_OPTIONS, ENERGY_OPTIONS,
} from '../utils/analysis';
import { getAIAdvice } from '../utils/aiAdvice';

export default function Home({ onNavigate }) {
  const [entries, setEntries]       = useState([]);
  const [todayEntry, setTodayEntry] = useState(null);
  const [settings, setSettings]     = useState({ name: '', apiKey: '' });
  const [breathing, setBreathing]   = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathRound, setBreathRound] = useState(0);
  const cancelRef = useRef(false);
  const [aiAdvice, setAiAdvice]     = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError, setAiError]       = useState('');

  useEffect(() => {
    const all = getEntries();
    setEntries(all);
    setTodayEntry(getTodayEntry());
    setSettings(getSettingsWithDefaults());
  }, []);

  // 通知チェック（アプリ起動時）
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const s = getSettingsWithDefaults();
    if (!s.notificationEnabled) return;
    const today = getTodayEntry();
    if (today) return;
    const [h, m] = s.notificationTime.split(':').map(Number);
    const now = new Date();
    if (now.getHours() >= h && now.getMinutes() >= m) {
      new Notification('こころの記録 🌱', {
        body: '今日の記録がまだです。1分で完了します！',
      });
    }
  }, []);

  const state         = analyzeState(entries);
  const streak        = getStreak(entries);
  const improve       = calculateImprovement(entries);
  const tip           = getDailyTip();
  const weeklySummary = getWeeklySummary(entries);
  const now        = new Date();
  const hour       = now.getHours();
  const greeting   = hour < 12 ? 'おはようございます' : hour < 17 ? 'こんにちは' : 'こんばんは';
  const dateLabel  = now.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });

  // 4-7-8 呼吸ガイド
  const startBreathing = async () => {
    cancelRef.current = false;
    setBreathing(true);
    setBreathRound(0);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i < 3; i++) {
      if (cancelRef.current) break;
      setBreathPhase('inhale');
      await sleep(4000);
      if (cancelRef.current) break;
      setBreathPhase('hold');
      await sleep(7000);
      if (cancelRef.current) break;
      setBreathPhase('exhale');
      await sleep(8000);
      if (!cancelRef.current) setBreathRound(i + 1);
    }
    if (!cancelRef.current) setBreathing(false);
  };

  const stopBreathing = () => {
    cancelRef.current = true;
    setBreathing(false);
    setBreathRound(0);
  };

  const handleAIAdvice = async () => {
    setAiLoading(true);
    setAiError('');
    setAiAdvice('');
    try {
      const advice = await getAIAdvice(entries, state);
      setAiAdvice(advice);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const breathLabel = { inhale: '吸う (4秒)', hold: '止める (7秒)', exhale: '吐く (8秒)' }[breathPhase];

  return (
    <div className="screen home-screen">
      {/* ヘッダー */}
      <div className="home-header" style={{ background: state.gradient }}>
        <div>
          <p className="greeting">{greeting}{settings.name ? `、${settings.name}さん` : ''}</p>
          <p className="date-str">{dateLabel}</p>
        </div>
        <div className="header-state-emoji">{state.emoji}</div>
      </div>

      {/* 状態カード */}
      <div className="card state-card" style={{ borderLeftColor: state.borderColor }}>
        <h2 className="state-title">{state.title}</h2>
        <p className="state-message">{state.message}</p>
        <div className="divider" />
        <p className="state-advice">💡 {state.advice}</p>

        {(
          <div className="ai-advice-section">
            <div className="divider" />
            <div className="ai-advice-header">
              <span className="ai-advice-label">✨ AIパーソナルアドバイス</span>
              <button
                className={`chip-btn primary${aiLoading ? ' loading' : ''}`}
                onClick={handleAIAdvice}
                disabled={aiLoading}
              >
                {aiLoading ? '生成中…' : aiAdvice ? '再生成' : '聞いてみる'}
              </button>
            </div>
            {aiLoading && (
              <div className="ai-loading">
                <span className="ai-spinner" />
                <span>AIがアドバイスを考えています…</span>
              </div>
            )}
            {aiAdvice && !aiLoading && (
              <p className="ai-advice-result">🤖 {aiAdvice}</p>
            )}
            {aiError && !aiLoading && (
              <p className="ai-advice-error">⚠️ {aiError}</p>
            )}
          </div>
        )}
      </div>

      {/* 記録ボタン or 完了表示 */}
      {!todayEntry ? (
        <button className="cta-btn" onClick={() => onNavigate('checkin')}>
          <span className="cta-icon">✏️</span>
          <div className="cta-text">
            <div className="cta-main">今日の記録をする</div>
            <div className="cta-sub">1分以内で完了します</div>
          </div>
          <span className="cta-arrow">›</span>
        </button>
      ) : (
        <div className="done-banner">
          <span>✅</span>
          <div>
            <div className="done-main">今日の記録は完了しています！</div>
            <div className="done-emojis">
              気分 {MOOD_OPTIONS[todayEntry.mood - 1]?.emoji}
              {'　'}体調 {ENERGY_OPTIONS[todayEntry.energy - 1]?.emoji}
            </div>
          </div>
          <button className="edit-link" onClick={() => onNavigate('checkin')}>修正</button>
        </div>
      )}

      {/* 連続記録 / 改善度 */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-num">{streak}<span className="stat-unit">日</span></div>
          <div className="stat-label">連続記録</div>
        </div>
        <div className="stat-card">
          {improve !== null ? (
            <>
              <div className="stat-icon">{improve >= 0 ? '📈' : '📉'}</div>
              <div className="stat-num" style={{ color: improve >= 0 ? '#64B6AC' : '#E07B7B' }}>
                {improve >= 0 ? '+' : ''}{improve}<span className="stat-unit">%</span>
              </div>
              <div className="stat-label">前週比で改善</div>
            </>
          ) : (
            <>
              <div className="stat-icon">📊</div>
              <div className="stat-num" style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>記録が増えると表示</div>
              <div className="stat-label">改善度</div>
            </>
          )}
        </div>
      </div>

      {/* 週次ふりかえりカード */}
      {weeklySummary && (
        <div className="card summary-card">
          <div className="summary-header">
            <span className="summary-title">📊 今週のふりかえり</span>
            <span className="summary-badge">自動生成</span>
          </div>
          <ul className="summary-list">
            {weeklySummary.map((m, i) => (
              <li key={i} className="summary-item">
                <span className="summary-icon">{m.icon}</span>
                <span className="summary-text">{m.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 深呼吸エクササイズ */}
      <div className="card">
        <div className="card-header-row">
          <span className="card-title">🫁 深呼吸エクササイズ（4-7-8）</span>
          {!breathing ? (
            <button className="chip-btn primary" onClick={startBreathing}>始める</button>
          ) : (
            <button className="chip-btn danger" onClick={stopBreathing}>終了</button>
          )}
        </div>
        {!breathing && (
          <p className="card-desc">ストレスを感じたら試してみましょう。吸う4秒→止める7秒→吐く8秒を3回繰り返します。</p>
        )}
        {breathing && (
          <div className="breathing-area">
            <div className={`breath-circle breath-${breathPhase}`}>
              <span className="breath-text">{breathLabel}</span>
            </div>
            <p className="breath-progress">{breathRound + 1} / 3 回目</p>
          </div>
        )}
      </div>

      {/* 今日のひとこと */}
      <div className="card tip-card">
        <div className="tip-label">✨ 今日のひとこと</div>
        <p className="tip-body">「{tip}」</p>
      </div>
    </div>
  );
}
