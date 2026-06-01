const MOOD_LABELS = ['', 'とても悪い', '悪い', '普通', '良い', 'とても良い'];

export const getAIAdvice = async (apiKey, entries, state) => {
  const recent = entries.slice(-7);
  const recentSummary = recent.length > 0
    ? recent.map(e =>
        `${new Date(e.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}: 気分=${MOOD_LABELS[e.mood]}, 体調=${MOOD_LABELS[e.energy]}`
      ).join(' / ')
    : 'まだ記録がありません';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'あなたは心身の健康を支える温かみのあるアシスタントです。ユーザーの最近の状態を踏まえ、今日すぐ実践できる具体的なアドバイスを1つだけ、50文字以内の日本語で返してください。説明や前置きは不要です。',
        },
        {
          role: 'user',
          content: `現在の状態：「${state.title}」\n最近のデータ：${recentSummary}`,
        },
      ],
      max_tokens: 120,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('APIキーが無効です。設定を確認してください。');
    if (res.status === 429) throw new Error('API利用上限に達しました。しばらく待ってください。');
    throw new Error(err.error?.message || 'AIアドバイスの取得に失敗しました。');
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
};
