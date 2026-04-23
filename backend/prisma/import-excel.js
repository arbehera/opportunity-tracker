// Run inside container: node prisma/import-excel.js /tmp/data.xlsx
const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const FILE = process.argv[2] || '/tmp/data.xlsx';

// Extract value from a plain cell, rich-text cell, or formula cell
function cv(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') {
    if ('result' in v) return v.result;
    if ('richText' in v) return v.richText.map(r => r.text || '').join('').trim() || null;
    if ('text' in v) return v.text;
    if (v instanceof Date) return v;
  }
  return v;
}

function str(v) {
  const s = cv(v);
  if (s === null || s === undefined) return null;
  const t = s.toString().trim();
  return t === '' || t === 'N' || t === 'NA' || t === 'N/A' || t === '-' ? null : t;
}

function num(v) {
  const n = cv(v);
  if (n === null || n === undefined) return null;
  const f = parseFloat(n);
  return isNaN(f) ? null : f;
}

function toDate(v) {
  const val = cv(v);
  if (!val || val === 'TBC' || val === 'N/A' || val === '-' || val === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    // Excel serial date
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// "O (H)" → "O(H)",  "O (L)" → "O(L)"
function normalizeStage(s) {
  if (!s) return null;
  return s.toString().trim().replace(/\s/g, '');
}

async function upsertUser(name, role) {
  if (!name) return null;
  const existing = await prisma.user.findFirst({
    where: { fullName: { equals: name, mode: 'insensitive' } },
  });
  if (existing) return existing.id;
  // Create placeholder user
  const email = name.toLowerCase().replace(/\s+/g, '.') + '@oe.local';
  const passwordHash = await bcrypt.hash('Welcome@123', 12);
  const u = await prisma.user.create({
    data: { fullName: name, email, passwordHash, role },
  });
  console.log(`  Created user: ${name} <${email}>`);
  return u.id;
}

async function getOrCreate(model, where, data) {
  const existing = await model.findFirst({ where });
  if (existing) return existing.id;
  const created = await model.create({ data });
  return created.id;
}

async function main() {
  console.log('Reading:', FILE);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);

  const ws = wb.getWorksheet('OE Opportunities');
  if (!ws) throw new Error('Sheet "OE Opportunities" not found');

  // Collect data rows (row 3 = headers, data from row 4)
  const rows = [];
  ws.eachRow((row, rn) => {
    if (rn < 4) return;
    const v = row.values; // 1-indexed
    const srNo = cv(v[1]);
    if (!srNo && !str(v[2])) return; // skip blank rows
    rows.push({
      srNo:               srNo,
      customer:           str(v[2]),
      description:        str(v[3]),
      businessUnit:       str(v[4]),
      productCategory:    str(v[5]),
      productSubcategory: str(v[6]),
      businessCategory:   str(v[7]),
      pinSales:           str(v[8]),
      pinPresales:        str(v[9]),
      dealStage:          normalizeStage(str(v[10])),
      estimatedClosure:   toDate(v[14]),
      confidenceLevel:    str(v[15]),
      lifetimeVolume:     num(v[16]),
      unitPriceInr:       num(v[17]),
      unitPriceUsd:       num(v[18]),
      tcvUsdMillion:      num(v[19]),
      comments:           str(v[20]),
      pms:                str(v[21]),
      remarks:            str(v[22]),
    });
  });

  console.log(`Found ${rows.length} rows to import\n`);

  // ── Collect unique master values ──────────────────────────────────────────
  const uniqueCustomers   = [...new Set(rows.map(r => r.customer).filter(Boolean))];
  const uniqueBUs         = [...new Set(rows.map(r => r.businessUnit).filter(Boolean))];
  const uniqueCats        = [...new Set(rows.map(r => r.productCategory).filter(Boolean))];
  const uniqueBizCats     = [...new Set(rows.map(r => r.businessCategory).filter(Boolean))];
  const uniqueStages      = [...new Set(rows.map(r => r.dealStage).filter(Boolean))];
  const uniqueConf        = [...new Set(rows.map(r => r.confidenceLevel).filter(Boolean))];
  const uniqueSales       = [...new Set(rows.map(r => r.pinSales).filter(Boolean))];
  const uniquePresales    = [...new Set(rows.map(r => r.pinPresales).filter(Boolean))];

  // Subcategories keyed as "name|||category"
  const subcatPairs = [...new Set(
    rows
      .filter(r => r.productSubcategory && r.productCategory)
      .map(r => `${r.productSubcategory}|||${r.productCategory}`)
  )];

  // ── Upsert customers ──────────────────────────────────────────────────────
  console.log('Upserting customers...');
  const customerMap = {};
  for (const name of uniqueCustomers) {
    const c = await prisma.customer.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    customerMap[name] = c.id;
  }

  // ── Upsert business units ─────────────────────────────────────────────────
  console.log('Upserting business units...');
  const buMap = {};
  for (const name of uniqueBUs) {
    const bu = await prisma.businessUnit.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    buMap[name] = bu.id;
  }

  // ── Upsert product categories ─────────────────────────────────────────────
  console.log('Upserting product categories...');
  const catMap = {};
  for (const name of uniqueCats) {
    const c = await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    catMap[name] = c.id;
  }

  // ── Upsert product subcategories ──────────────────────────────────────────
  console.log('Upserting product subcategories...');
  const subcatMap = {};
  for (const pair of subcatPairs) {
    const [subcatName, catName] = pair.split('|||');
    const categoryId = catMap[catName];
    if (!categoryId) { console.warn(`  Skipping subcat ${subcatName} — category "${catName}" not found`); continue; }
    const existing = await prisma.productSubcategory.findFirst({
      where: { name: subcatName, categoryId },
    });
    if (existing) {
      subcatMap[pair] = existing.id;
    } else {
      const s = await prisma.productSubcategory.create({ data: { name: subcatName, categoryId } });
      subcatMap[pair] = s.id;
      console.log(`  Created subcategory: ${subcatName} (${catName})`);
    }
  }

  // ── Upsert business categories ────────────────────────────────────────────
  console.log('Upserting business categories...');
  const bizCatMap = {};
  for (const name of uniqueBizCats) {
    const bc = await prisma.businessCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    bizCatMap[name] = bc.id;
  }

  // ── Upsert deal stages ────────────────────────────────────────────────────
  console.log('Upserting deal stages...');
  const stageDefaults = {
    'A':       { classification: 'Before Lead',    status: 'Planning',           winningProbability: 0,   sortOrder: 1 },
    'B':       { classification: 'Before Lead',    status: 'Lead Generation',    winningProbability: 35,  sortOrder: 2 },
    'C':       { classification: 'Lead',           status: 'Lead Qualification', winningProbability: 50,  sortOrder: 3 },
    'D':       { classification: 'Qualified Lead', status: 'Proposal',           winningProbability: 65,  sortOrder: 4 },
    'E':       { classification: 'Proposal',       status: 'Negotiation',        winningProbability: 75,  sortOrder: 5 },
    'F':       { classification: 'Negotiation',    status: 'Final Evaluation',   winningProbability: 90,  sortOrder: 6 },
    'SECURED': { classification: 'Won',            status: 'Secured',            winningProbability: 100, sortOrder: 7 },
    'O(H)':    { classification: 'Hold',           status: 'On Hold',            winningProbability: 0,   sortOrder: 8 },
    'O(L)':    { classification: 'Lost',           status: 'Opportunity Lost',   winningProbability: 0,   sortOrder: 9 },
  };
  const stageMap = {};
  for (const code of uniqueStages) {
    const defaults = stageDefaults[code] || { classification: code, status: code, winningProbability: 0, sortOrder: 99 };
    const s = await prisma.dealStage.upsert({
      where: { code },
      update: {},
      create: { code, ...defaults },
    });
    stageMap[code] = s.id;
  }

  // ── Upsert confidence levels ──────────────────────────────────────────────
  console.log('Upserting confidence levels...');
  const confOrder = ['High', 'Mid', 'Low', 'Secured', 'Lost'];
  const confMap = {};
  for (const name of uniqueConf) {
    const sortOrder = confOrder.indexOf(name) >= 0 ? confOrder.indexOf(name) + 1 : 99;
    const c = await prisma.confidenceLevel.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder },
    });
    confMap[name] = c.id;
  }

  // ── Upsert users ──────────────────────────────────────────────────────────
  console.log('Upserting users...');
  const userMap = {};
  for (const name of uniqueSales) {
    userMap[name] = await upsertUser(name, 'SALES');
  }
  for (const name of uniquePresales) {
    if (!userMap[name]) userMap[name] = await upsertUser(name, 'PRESALES');
  }

  // Need a system user for createdById
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    adminUser = await prisma.user.create({
      data: { fullName: 'Admin User', email: 'admin@oe.local', passwordHash, role: 'ADMIN' },
    });
  }
  const adminId = adminUser.id;

  // ── Import opportunities ──────────────────────────────────────────────────
  console.log('\nImporting opportunities...');
  let created = 0, skipped = 0;

  for (const row of rows) {
    const customerId    = customerMap[row.customer];
    const buId          = buMap[row.businessUnit];
    const catId         = catMap[row.productCategory];
    const subcatKey     = `${row.productSubcategory}|||${row.productCategory}`;
    const subcatId      = subcatMap[subcatKey];
    const bizCatId      = bizCatMap[row.businessCategory];
    const stageId       = stageMap[row.dealStage];
    const confId        = confMap[row.confidenceLevel];
    const salesId       = userMap[row.pinSales];
    const presalesId    = row.pinPresales ? (userMap[row.pinPresales] || null) : null;

    // Validate required fields
    const missing = [];
    if (!customerId)  missing.push(`customer="${row.customer}"`);
    if (!buId)        missing.push(`BU="${row.businessUnit}"`);
    if (!catId)       missing.push(`category="${row.productCategory}"`);
    if (!subcatId)    missing.push(`subcat="${row.productSubcategory}"`);
    if (!bizCatId)    missing.push(`bizCat="${row.businessCategory}"`);
    if (!stageId)     missing.push(`stage="${row.dealStage}"`);
    if (!confId)      missing.push(`conf="${row.confidenceLevel}"`);
    if (!salesId)     missing.push(`sales="${row.pinSales}"`);
    if (!row.description) missing.push('description');

    if (missing.length) {
      console.warn(`  SKIP row ${row.srNo} (${row.description}): missing ${missing.join(', ')}`);
      skipped++;
      continue;
    }

    const lifetimeVolume  = BigInt(Math.round(row.lifetimeVolume || 0));
    const unitPriceInr    = parseFloat((row.unitPriceInr || 0).toFixed(2));
    const unitPriceUsd    = parseFloat((row.unitPriceUsd || 0).toFixed(4));
    const tcvUsdMillion   = parseFloat((row.tcvUsdMillion || 0).toFixed(4));

    await prisma.opportunity.create({
      data: {
        customerId,
        description:        row.description,
        businessUnitId:     buId,
        productCategoryId:  catId,
        productSubcategoryId: subcatId,
        businessCategoryId: bizCatId,
        pinSalesId:         salesId,
        pinPresalesId:      presalesId,
        dealStageId:        stageId,
        confidenceLevelId:  confId,
        estimatedClosureDate: row.estimatedClosure,
        lifetimeVolume,
        unitPriceInr,
        unitPriceUsd,
        tcvUsdMillion,
        comments:           row.comments,
        pms:                row.pms,
        remarks:            row.remarks,
        createdById:        adminId,
        updatedById:        adminId,
      },
    });
    created++;
    process.stdout.write(`\r  Imported ${created}...`);
  }

  console.log(`\n\nDone! Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
