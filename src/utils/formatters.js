/**
 * Currency, Date and Number formatting helpers
 */

export const formatCurrency = (amount, currency = 'INR') => {
  const num = Number(amount) || 0;
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(Number(num) || 0);
};

export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    };
    return d.toLocaleDateString('en-IN', options);
  } catch {
    return dateString;
  }
};

export const generateSKU = (category = 'GEN', name = '') => {
  const catCode = (category || 'GEN')
    .trim()
    .replace(/[^A-Za-z]/g, '')
    .substring(0, 4)
    .toUpperCase() || 'PROD';
  
  const namePart = (name || 'ITEM')
    .trim()
    .replace(/[^A-Za-z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase() || 'ITM';
    
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${catCode}-${namePart}-${randomSuffix}`;
};
