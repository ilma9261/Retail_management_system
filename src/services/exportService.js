/**
 * CSV Export Service
 * Converts structured javascript data into downloadable CSV files
 */

export const exportToCSV = (data, headers, filename = 'retailflow-export.csv') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Generate header row
  const headerKeys = headers.map(h => h.key);
  const headerLabels = headers.map(h => `"${(h.label || h.key).replace(/"/g, '""')}"`);
  
  // Generate data rows
  const rows = data.map(item => {
    return headerKeys.map(key => {
      let val = item[key];
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }
      // Escape quotes
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headerLabels.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
