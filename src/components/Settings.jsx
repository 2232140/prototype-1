import React, { useState, useEffect } from 'react';
import { getSettingsWithDefaults, saveSettings } from '../utils/storage';

export default function Settings() {
  const [s, setS]       = useState({ name: '', notificationTime: '21:00', notificationEnabled: false, apiKey: '' });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [perm, setPerm]   = useState('default');

  useEffect(() => {
    setS(getSettingsWithDefaults());
    if ('Notification' in window) setPerm(Notification.permission);
  }, []);

  const set = (key, val) => setS((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const requestNotif = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知に対応していません');
      return;
    }
    const result = await Notification.requestPermission();
    setPerm(result);
    if (result === 'granted') {
      set('notificationEnabled', true);
      new Notification('こころの記録 🌱', {
        body: '通知が設定されました！毎日の記録を続けましょう。',
      });
    }
  };

  return (
    <div className="screen settings-screen">
      <h1 className="screen-title">設定</h1>

      <div className="card">
        <h2 className="card-section-title">プロフィール</h2>
        <label className="form-label">お名前（任意）</label>
        <input
          type="text"
          className="form-input"
          value={s.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="ニックネームでもOK"
          maxLength={20}
        />
      </div>

      <div className="card">
        <h2 className="card-section-title">🔔 リマインダー</h2>
        <label className="form-label">通知時刻</label>
        <input
          type="time"
          className="form-input"
          value={s.notificationTime}
          onChange={(e) => set('notificationTime', e.target.value)}
        />
        <div className="notif-block">
          {perm === 'granted' ? (
            <div className="notif-ok">
              <span>✅</span>
              <span>通知が有効です（毎日 {s.notificationTime} に通知します）</span>
            </div>
          ) : perm === 'denied' ? (
            <div className="notif-denied">
              <span>🔕</span>
              <span>通知がブロックされています。ブラウザの設定から許可してください。</span>
            </div>
          ) : (
            <button className="notif-request-btn" onClick={requestNotif}>
              🔔 通知を許可する
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="card-section-title">🤖 AIアドバイス機能</h2>
        <p className="privacy-text" style={{ marginBottom: 12 }}>
          OpenAIのAPIキーを設定すると、あなたの記録に合わせた<br />
          パーソナライズされたアドバイスが受け取れます。
        </p>
        <label className="form-label">OpenAI APIキー（任意）</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            className="form-input"
            value={s.apiKey}
            onChange={(e) => set('apiKey', e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none',
              fontSize: 16, color: 'var(--sub)', padding: 4,
            }}
          >
            {showKey ? '🙈' : '👁'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--sub)', marginTop: 8 }}>
          キーは platform.openai.com で取得できます。このデバイスにのみ保存されます。
        </p>
      </div>

      <div className="card privacy-card">
        <h2 className="card-section-title">🔒 プライバシー</h2>
        <p className="privacy-text">
          すべてのデータはこのデバイスのみに保存されます。<br />
          {s.apiKey ? 'AIアドバイス機能を使用する場合のみ、OpenAI APIへデータが送信されます。' : '外部サーバーへの送信は一切行いません。'}
        </p>
      </div>

      <div className="card">
        <h2 className="card-section-title">データ管理</h2>
        <button
          className="danger-btn"
          onClick={() => {
            if (window.confirm('すべての記録を削除します。この操作は元に戻せません。')) {
              localStorage.removeItem('kokoro_entries');
              alert('記録を削除しました。');
            }
          }}
        >
          🗑 記録をすべて削除する
        </button>
      </div>

      <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
        {saved ? '✓ 保存しました！' : '設定を保存する'}
      </button>
    </div>
  );
}
