// pages/api/nominate-self.js
// Handles self-nominations → saves to "Nominate yourself" table

const BASE_URL = 'https://api.airtable.com/v0';

async function postToAirtable(baseId, tableName, pat, fields) {
  const response = await fetch(
    `${BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );
  const data = await response.json();
  return { ok: response.ok, data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    fullName,
    email,
    gender,
    phone,
    charges,
    chargesComment,
    howHeard,
  } = req.body;

  const required = { fullName, email, gender, phone, charges };
  for (const [field, value] of Object.entries(required)) {
    if (!value || String(value).trim() === '') {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  const tableName = process.env.AIRTABLE_TABLE_NOMINATE_SELF || 'Nominate yourself';
  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !pat) {
    console.error('Missing Airtable credentials in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const coreFields = {
    "Full Name": fullName.trim(),
    "Email": email.trim().toLowerCase(),
    "Gender": gender,
    "Phone number": phone.trim(),
    "Charges": charges,
  };

  // Optional fields — auto-retries without them if field name is unknown
  // Fix field names here if Airtable returns UNKNOWN_FIELD_NAME
  const COMMENT_FIELD = "Comment on the Charges";
  const HOW_HEARD_FIELD = "How did you hear about us?";

  const optionalFields = {};
  if (chargesComment && chargesComment.trim()) {
    optionalFields[COMMENT_FIELD] = chargesComment.trim();
  }
  if (howHeard && howHeard.length > 0) {
    optionalFields[HOW_HEARD_FIELD] = howHeard;
  }

  try {
    const fullFields = { ...coreFields, ...optionalFields };
    const { ok, data } = await postToAirtable(baseId, tableName, pat, fullFields);

    if (ok) {
      return res.status(200).json({ success: true, id: data.id });
    }

    // If an optional field name is wrong, retry with only core fields
    if (data.error?.type === 'UNKNOWN_FIELD_NAME' && Object.keys(optionalFields).length > 0) {
      console.warn(
        `[nominate-self.js] Unknown optional field. ` +
        `Retrying without optional fields. Check field names: "${COMMENT_FIELD}", "${HOW_HEARD_FIELD}"`
      );
      const { ok: ok2, data: data2 } = await postToAirtable(baseId, tableName, pat, coreFields);
      if (ok2) {
        return res.status(200).json({ success: true, id: data2.id });
      }
      console.error('[nominate-self.js] Retry failed:', data2);
      return res.status(400).json({ error: data2.error?.message || 'Failed to save nomination' });
    }

    console.error('[nominate-self.js] Airtable error:', data);
    return res.status(400).json({ error: data.error?.message || 'Failed to save nomination' });
  } catch (err) {
    console.error('[nominate-self.js] API error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
