"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunitiesToExcel = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const opportunitiesToExcel = async (opportunities) => {
    const wb = new exceljs_1.default.Workbook();
    const ws = wb.addWorksheet('OE Opportunities');
    ws.columns = [
        { header: 'Sr. No.', key: 'serialNumber', width: 8 },
        { header: 'Customer', key: 'customer', width: 22 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Business Unit', key: 'businessUnit', width: 14 },
        { header: 'Product Category', key: 'productCategory', width: 18 },
        { header: 'Subcategory', key: 'subcategory', width: 20 },
        { header: 'Business Category', key: 'businessCategory', width: 18 },
        { header: 'PIN Sales', key: 'pinSales', width: 16 },
        { header: 'PIN Presales', key: 'pinPresales', width: 16 },
        { header: 'Deal Stage', key: 'dealStage', width: 12 },
        { header: 'Classification', key: 'classification', width: 18 },
        { header: 'Status', key: 'status', width: 22 },
        { header: 'Win %', key: 'winPct', width: 8 },
        { header: 'Confidence Level', key: 'confidenceLevel', width: 16 },
        { header: 'Est. Closure Date', key: 'closureDate', width: 18 },
        { header: 'Lifetime Volume', key: 'lifetimeVolume', width: 16 },
        { header: 'Unit Price (INR)', key: 'unitPriceInr', width: 16 },
        { header: 'Unit Price (USD)', key: 'unitPriceUsd', width: 16 },
        { header: 'TCV (USD M)', key: 'tcvUsdMillion', width: 14 },
        { header: 'Comments', key: 'comments', width: 30 },
        { header: 'PMS', key: 'pms', width: 16 },
        { header: 'Remarks', key: 'remarks', width: 30 },
    ];
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1677FF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };
    });
    opportunities.forEach((o) => {
        ws.addRow({
            serialNumber: o.serialNumber,
            customer: o.customer?.name ?? '',
            description: o.description,
            businessUnit: o.businessUnit?.name ?? '',
            productCategory: o.productCategory?.name ?? '',
            subcategory: o.productSubcategory?.name ?? '',
            businessCategory: o.businessCategory?.name ?? '',
            pinSales: o.pinSales?.fullName ?? '',
            pinPresales: o.pinPresales?.fullName ?? '',
            dealStage: o.dealStage?.code ?? '',
            classification: o.dealStage?.classification ?? '',
            status: o.dealStage?.status ?? '',
            winPct: `${o.dealStage?.winningProbability ?? 0}%`,
            confidenceLevel: o.confidenceLevel?.name ?? '',
            closureDate: o.estimatedClosureDate
                ? new Date(o.estimatedClosureDate).toLocaleDateString('en-IN')
                : '',
            lifetimeVolume: Number(o.lifetimeVolume),
            unitPriceInr: Number(o.unitPriceInr),
            unitPriceUsd: Number(o.unitPriceUsd),
            tcvUsdMillion: Number(o.tcvUsdMillion),
            comments: o.comments ?? '',
            pms: o.pms ?? '',
            remarks: o.remarks ?? '',
        });
    });
    ws.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'hair', color: { argb: 'FFE8E8E8' } },
                    bottom: { style: 'hair', color: { argb: 'FFE8E8E8' } },
                };
            });
        }
    });
    return wb.xlsx.writeBuffer();
};
exports.opportunitiesToExcel = opportunitiesToExcel;
