// ส่งออกข้อมูลเป็นไฟล์ Excel (.xlsx) — ทำงานฝั่ง client ทั้งหมด
// แยกออกมาจาก import-export/page.tsx เดิม เพื่อให้ทุกหน้าเรียกใช้ได้

import * as XLSX from 'xlsx';

export interface Sheet {
  /** ชื่อชีต — Excel จำกัด 31 ตัวอักษร */
  name: string;
  /** แต่ละแถวเป็น object โดย key คือหัวคอลัมน์ */
  rows: Record<string, unknown>[];
}

/** คำนวณความกว้างคอลัมน์จากเนื้อหา เพื่อไม่ต้องลากขยายเองตอนเปิดไฟล์ */
function autoWidth(rows: Record<string, unknown>[]) {
  const cols = Object.keys(rows[0] ?? {});
  return cols.map(col => ({
    wch: Math.min(
      Math.max(col.length, ...rows.map(r => String(r[col] ?? '').length)) + 2,
      50
    ),
  }));
}

function buildSheet(rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  if (rows.length > 0) ws['!cols'] = autoWidth(rows);
  return ws;
}

/** ดาวน์โหลด workbook หลายชีต ชื่อไฟล์จะต่อท้ายด้วยวันที่ */
export function exportSheets(sheets: Sheet[], fileBaseName: string) {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    // Excel ตัดชื่อชีตที่เกิน 31 ตัวอักษรและจะพังถ้าชื่อซ้ำ
    XLSX.utils.book_append_sheet(wb, buildSheet(sheet.rows), sheet.name.slice(0, 31));
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileBaseName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

/** ทางลัดสำหรับกรณีชีตเดียว */
export function exportRows(
  rows: Record<string, unknown>[],
  sheetName: string,
  fileBaseName: string
) {
  exportSheets([{ name: sheetName, rows }], fileBaseName);
}

/** ดาวน์โหลดข้อมูลเป็นไฟล์ JSON — ใช้กับการสำรองข้อมูลทั้งฐาน */
export function downloadJson(data: unknown, fileBaseName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileBaseName}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
