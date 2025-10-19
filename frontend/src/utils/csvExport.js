/**
 * CSV Export Utility
 * 
 * Simple utility functions for exporting data to CSV format
 * and triggering browser downloads.
 */

/**
 * Converts an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Array of column definitions with {key, label}
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => `"${col.label}"`).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      // Handle arrays (like team members, projects)
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      }
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '""';
      }
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
};

/**
 * Triggers a CSV download in the browser
 * @param {string} csvContent - CSV content as string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Exports data to CSV and triggers download
 * @param {Array} data - Data to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Filename for the download
 */
export const exportToCSV = (data, columns, filename) => {
  const csvContent = convertToCSV(data, columns);
  downloadCSV(csvContent, filename);
};

/**
 * Helper function to get current timestamp for filename
 * @returns {string} Formatted timestamp
 */
export const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/:/g, '-');
};
