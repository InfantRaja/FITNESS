/**
 * Formats an array of objects into a sanitized CSV string.
 * Escapes commas, quotes, and newlines.
 */
function toCsv(rows, headers) {
  if (!rows || !rows.length) {
    return headers.join(',') + '\n';
  }

  const escapeField = (val) => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val);
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return `"${stringVal}"`;
  };

  const headerLine = headers.map(escapeField).join(',');
  const rowLines = rows.map((row) => headers.map((key) => escapeField(row[key])).join(','));

  return [headerLine, ...rowLines].join('\n');
}

module.exports = { toCsv };
