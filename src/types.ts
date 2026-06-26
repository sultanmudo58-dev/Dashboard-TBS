export interface RowData {
  "NO BA": string;
  "PO NO": string;
  "SITECODE": string;
  "BLOK": string;
  "AFD": string;
  "JOB CODE": string;
  "ITEM KERJA": string;
  "KETERANGAN": string;
  "HA PLAN": number;
  "Σ HA REAL": number;
  "ACV HA": number;
  "ACV TRACKING": number;
  "ACV VIDEO CONTROL": number;
  "periode": string;
  "AFD_COMBINED": string;
}

export interface SheetData {
  spreadsheetId: string;
  spreadsheetUrl?: string;
  sheetName: string;
  updatedAt: string;
  columns: string[];
  rows: RowData[];
}
