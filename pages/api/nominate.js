// pages/api/nominate.js
// Handles nominations of other people → saves to "Nominate someone" table

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
    nominatorTypes,
    nomineeName,
    nomineeEmail,
    nomineeGender,
    nomineePhone,
    nominatorName,
    nominatorPhone,
    nominatorEmail,
    charges,
    chargesComment,
  } = req.body;

  const required = { nomineeName, nomineeEmail, nomineeGender, nominatorName, nominatorPhone, nominatorEmail, charges };
  for (const [field, value] of Object.entries(required)) {
    if (!value || String(value).trim() === '') {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  const tableName = process.env.AIRTABLE_TABLE_NOMINATE_SOMEONE || 'Nominate someone';
  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !pat) {
    console.error('Missing Airtable credentials in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const coreFields = {
    "Nominee's Name .": nomineeName.trim(),
    "Nominee's email": nomineeEmail.trim().toLowerCase(),
    "Nominee's Gender": nomineeGender,
    "Nominator's Name .": nominatorName.trim(),
    "Nominator's Phone": nominatorPhone.trim(),
    "Nominator's email": nominatorEmail.trim().toLowerCase(),
    "Charges": charges,
  };

  if (nomineePhone && nomineePhone.trim()) {
    coreFields["Nominee's Phone number"] = nomineePhone.trim();
  }
  if (nominatorTypes && nominatorTypes.length > 0) {
    coreFields["Which of this best describes you?"] = nominatorTypes;
  }

  // Optional charges comment — auto-retries without it if field name is wrong in Airtable.
  // To fix permanently: open Airtable → right-click the column → copy exact field name → update below.
  const CHARGES_COMMENT_FIELD = "Comment on the charges";
  const optionalComment = chargesComment && chargesComment.trim()
    ? { [CHARGES_COMMENT_FIELD]: chargesComment.trim() }
    : {};

  try {
    const fullFields = { ...coreFields, ...optionalComment };
    const { ok, data } = await postToAirtable(baseId, tableName, pat, fullFields);

    if (ok) {
      return res.status(200).json({ success: true, id: data.id });
    }

    // Unknown field name on an optional field → retry with only core fields
    if (data.error?.type === 'UNKNOWN_FIELD_NAME' && Object.keys(optionalComment).length > 0) {
      console.warn(
        `[nominate.js] Optional field "${CHARGES_COMMENT_FIELD}" not found in Airtable. ` +
        `Retrying without it. Fix: update CHARGES_COMMENT_FIELD in pages/api/nominate.js ` +
        `to match the exact column name in your Airtable base.`
      );
      const { ok: ok2, data: data2 } = await postToAirtable(baseId, tableName, pat, coreFields);
      if (ok2) {
        return res.status(200).json({ success: true, id: data2.id });
      }
      console.error('[nominate.js] Retry also failed:', data2);
      return res.status(400).json({ error: data2.error?.message || 'Failed to save nomination' });
    }

    console.error('[nominate.js] Airtable error:', data);
    return res.status(400).json({ error: data.error?.message || 'Failed to save nomination' });
  } catch (err) {
    console.error('[nominate.js] API error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
