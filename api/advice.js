export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return res.status(503).json({ error: 'AIアドバイス機能は現在利用できません。' });
  }

  const { stateTitle, recentSummary } = req.body;
  if (!stateTitle) {
    return res.status(400).json({ error: '状態データが不足しています。' });
  }

  const prompt =
    `あなたは心身の健康を支える温かみのあるアシスタントです。` +
    `ユーザーの最近の状態を踏まえ、今日すぐ実践できる具体的なアドバイスを1つだけ、50文字以内の日本語で返してください。説明や前置きは不要です。\n\n` +
    `現在の状態：「${stateTitle}」\n` +
    `最近のデータ：${recentSummary ?? 'まだ記録がありません'}`;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(response.status).json({
      error: err.errors?.[0]?.message || 'AIエラーが発生しました。',
    });
  }

  const data = await response.json();
  const advice = data.result?.response?.trim();
  if (!advice) {
    return res.status(500).json({ error: 'アドバイスの生成に失敗しました。' });
  }
  return res.status(200).json({ advice });
}
