export const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const formatMoney = (value) => {
  if (value === null || value === undefined) return '฿0.00';
  return `฿${Number(value).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};