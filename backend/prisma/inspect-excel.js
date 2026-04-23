// Run with: node prisma/inspect-excel.js /path/to/file.xlsx
const ExcelJS = require('exceljs');
const filePath = process.argv[2] || '/tmp/data.xlsx';

const wb = new ExcelJS.Workbook();
wb.xlsx.readFile(filePath).then(() => {
  wb.eachSheet((ws) => {
    console.log(`\n=== Sheet: "${ws.name}"  (${ws.rowCount} rows) ===`);
    // Print headers (row 1)
    const headerRow = ws.getRow(1);
    console.log('HEADERS:', JSON.stringify(headerRow.values));
    // Print first 3 data rows
    for (let i = 2; i <= Math.min(4, ws.rowCount); i++) {
      const row = ws.getRow(i);
      console.log(`Row ${i}:`, JSON.stringify(row.values));
    }
  });
}).catch(e => { console.error(e.message); process.exit(1); });
