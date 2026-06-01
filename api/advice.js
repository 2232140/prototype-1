export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AIアドバイス機能は現在利用できません。' });
  }

  const { stateTitle, recentSummary } = req.body;
  if (!stateTitle) {
    return res.status(400).json({ error: '状態データが不足しています。' });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: `現在の状態：「${stateTitle}」\n最近のデータ：${recentSummary ?? 'まだ記録がありません'}`,
        },
      ],
      max_tokens: 120,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(response.status).json({ error: err.error?.message || 'AIエラーが発生しました。' });
  }

  const data = await response.json();
  return res.status(200).json({ advice: data.choices[0].message.content.trim() });
}
