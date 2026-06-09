export const getTodayEvents = async (providerToken) => {
  if (!providerToken) return null;

  const today = new Date();
  const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
  const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
    `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    `&singleEvents=true&orderBy=startTime&maxResults=10`,
    { headers: { Authorization: `Bearer ${providerToken}` } }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const events = (data.items || []).filter(e => e.status !== 'cancelled');

  if (events.length === 0) return null;

  const summary = events.map(e => {
    const start = e.start?.dateTime
      ? new Date(e.start.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      : '終日';
    return `${start} ${e.summary || '予定'}`;
  }).join('、');

  return { count: events.length, summary };
};
