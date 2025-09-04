import * as XLSX from 'xlsx';

export interface WorksheetSpec {
  name: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

export function downloadXlsx(sheets: WorksheetSpec[], filename: string) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(sheet => {
    const aoa = [sheet.headers, ...sheet.rows.map(r => sheet.headers.map((h, i) => r[i]))];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheet.name));
  });
  const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, safeName);
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[\\\/*?:\[\]]/g, ' ').slice(0, 31) || 'Sheet1';
}

