/**
 * Data Export Utilities
 * Export database tables to CSV/Excel
 */

import ExcelJS from 'exceljs';

/**
 * Convert data array to CSV string
 */
export function arrayToCSV(data: any[], headers: string[]): string {
  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = getNestedValue(row, header);
      // Escape quotes and wrap in quotes
      return `"${String(value || '').replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Export data to Excel file
 */
export async function exportToExcel(
  data: any[],
  headers: { header: string; key: string; width?: number }[],
  filename: string = 'export.xlsx'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Set column headers
  worksheet.columns = headers.map(h => ({
    header: h.header,
    key: h.key,
    width: h.width || 20,
  }));

  // Add data rows
  data.forEach(row => {
    worksheet.addRow(row);
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0a192f' },
  };
  worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFD700' } };

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Export Users to CSV/Excel
 */
export async function exportUsers(format: 'csv' | 'excel' = 'excel'): Promise<{ data: string | Buffer; filename: string; contentType: string }> {
  // This will be called from an API route with Prisma access
  // For now, return the structure
  return {
    data: '',
    filename: `users-export-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`,
    contentType: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

/**
 * Export Applications to CSV/Excel
 */
export async function exportApplications(format: 'csv' | 'excel' = 'excel'): Promise<{ data: string | Buffer; filename: string; contentType: string }> {
  return {
    data: '',
    filename: `applications-export-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`,
    contentType: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

/**
 * Export Event Registrations to CSV/Excel
 */
export async function exportEventRegistrations(
  eventId: string,
  format: 'csv' | 'excel' = 'excel'
): Promise<{ data: string | Buffer; filename: string; contentType: string }> {
  return {
    data: '',
    filename: `event-${eventId}-registrations-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`,
    contentType: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

