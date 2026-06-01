export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AIアドバイス機能は現在利用できません。' });
  }

  const { stateTitle, recentSummary } = req.body;
  if (!stateTitle) {
    return res.status(400).json({ error: '状態データが不足しています。' });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: 'あなたは心身の健康を支える温かみのあるアシスタントです。ユーザーの最近の状態を踏まえ、今日すぐ実践できる具体的なアドバイスを1つだけ、50文字以内の日本語で返してください。説明や前置きは不要です。',
          }],
        },
        contents: [{
          role: 'user',
          parts: [{
            text: `現在の状態：「${stateTitle}」\n最近のデータ：${recentSummary ?? 'まだ記録がありません'}`,
          }],
        }],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.8,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(response.status).json({
      error: err.error?.message || 'AIエラーが発生しました。',
    });
  }

  const data = await response.json();
  const advice = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!advice) {
    return res.status(500).json({ error: 'アドバイスの生成に失敗しました。' });
  }
  return res.status(200).json({ advice });
}
