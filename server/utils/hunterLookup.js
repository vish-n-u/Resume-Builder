import fetch from 'node-fetch';

/**
 * Looks up a likely contact email for a company using Hunter.io's domain search API.
 * Prioritizes HR/recruitment-related emails, falls back to highest confidence result.
 *
 * @param {string} companyName - The company name to look up.
 * @returns {Promise<string>} A contact email address, or '' if none found.
 */
export const lookupCompanyEmail = async (companyName) => {
  try {
    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey) return '';

    // Convert company name to a likely domain
    const domain =
      companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') + '.com';

    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${encodeURIComponent(apiKey)}&limit=5`;

    const response = await fetch(url);
    if (!response.ok) return '';

    const json = await response.json();
    const emails = json?.data?.emails;
    console.log("Hunter API response for", companyName, ":", emails);

    if (!Array.isArray(emails) || emails.length === 0) return '';

    // Keywords that indicate HR / recruitment contacts
    const hrKeywords = [
      'hr',
      'human resources',
      'recruitment',
      'recruiter',
      'talent',
      'hiring',
      'people',
    ];

    // Try to find an HR/recruitment email first
    const hrEmail = emails.find((entry) => {
      const position = (entry.position || '').toLowerCase();
      const department = (entry.department || '').toLowerCase();
      return hrKeywords.some(
        (kw) => position.includes(kw) || department.includes(kw),
      );
    });

    if (hrEmail?.value) return hrEmail.value;

    // Fall back to the email with the highest confidence score
    const bestByConfidence = emails.reduce((best, entry) =>
      (entry.confidence ?? 0) > (best.confidence ?? 0) ? entry : best,
    );

    return bestByConfidence?.value || '';
  } catch {
    return '';
  }
};
