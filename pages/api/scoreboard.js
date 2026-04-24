// pages/api/scoreboard.js
// Returns live nomination and application counts from Airtable
// Vercel CDN caches this for 3 minutes, revalidates in background

const BASE_URL = 'https://api.airtable.com/v0';

async function countTableRecords(baseId, tableName, pat) {
  let count = 0;
  let offset = null;

  do {
    const url = new URL(`${BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`);
    // Fetch minimal data — just need the count, not the values
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${pat}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Airtable error on "${tableName}": ${err.error?.message || res.status}`);
    }

    const data = await res.json();
    count += (data.records || []).length;
    offset = data.offset;
  } while (offset);

  return count;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !pat) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const tableNominateSomeone = process.env.AIRTABLE_TABLE_NOMINATE_SOMEONE || 'Nominate someone';
  const tableNominateSelf = process.env.AIRTABLE_TABLE_NOMINATE_SELF || 'Nominate yourself';
  const tableApplications = process.env.AIRTABLE_TABLE_APPLICATIONS || 'Applications';

  try {
    const [nominateSomeoneCount, nominateSelfCount, applicationsCount] = await Promise.all([
      countTableRecords(baseId, tableNominateSomeone, pat),
      countTableRecords(baseId, tableNominateSelf, pat),
      countTableRecords(baseId, tableApplications, pat),
    ]);

    const nominations = nominateSomeoneCount + nominateSelfCount;
    const applications = applicationsCount;

    // CDN cache: serve fresh for 3 minutes, then revalidate in background
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=60');

    return res.status(200).json({ nominations, applications });
  } catch (err) {
    console.error('Scoreboard error:', err.message);
    // Return zeros on error — don't crash the page
    return res.status(200).json({ nominations: 0, applications: 0, error: err.message });
  }
}
