import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Business Units
  const buMPC = await prisma.businessUnit.upsert({
    where: { name: 'MPC' },
    update: {},
    create: { name: 'MPC', description: 'MPC Business Unit' },
  });
  const buMAC = await prisma.businessUnit.upsert({
    where: { name: 'MAC' },
    update: {},
    create: { name: 'MAC', description: 'MAC Business Unit' },
  });
  const buMCC = await prisma.businessUnit.upsert({
    where: { name: 'MCC' },
    update: {},
    create: { name: 'MCC', description: 'MCC Business Unit' },
  });
  console.log('Business Units seeded');

  // 2. Product Categories
  const catIVI = await prisma.productCategory.upsert({
    where: { name: 'IVI' },
    update: {},
    create: { name: 'IVI' },
  });
  const catSmartcam = await prisma.productCategory.upsert({
    where: { name: 'Smartcam' },
    update: {},
    create: { name: 'Smartcam' },
  });
  const catSound = await prisma.productCategory.upsert({
    where: { name: 'Sound' },
    update: {},
    create: { name: 'Sound' },
  });
  const catOtherMAC = await prisma.productCategory.upsert({
    where: { name: 'Other MAC' },
    update: {},
    create: { name: 'Other MAC' },
  });
  console.log('Product Categories seeded');

  // 3. Product Subcategories
  const subcatDefs = [
    { name: 'IVI', categoryId: catIVI.id },
    { name: 'USB port', categoryId: catIVI.id },
    { name: 'CDC', categoryId: catSmartcam.id },
    { name: 'Digital mirror', categoryId: catSmartcam.id },
    { name: 'WLC', categoryId: catSmartcam.id },
    { name: 'Dashcam', categoryId: catSmartcam.id },
    { name: '360-deg. camera', categoryId: catSmartcam.id },
    { name: 'RVC with Display', categoryId: catSmartcam.id },
    { name: 'RVC', categoryId: catSmartcam.id },
    { name: 'Spk + Amp', categoryId: catSound.id },
    { name: 'Spks.', categoryId: catSound.id },
    { name: 'Cluster (2W)', categoryId: catOtherMAC.id },
  ];

  const subcats: Record<string, string> = {};
  for (const subcat of subcatDefs) {
    const existing = await prisma.productSubcategory.findFirst({
      where: { name: subcat.name, categoryId: subcat.categoryId },
    });
    if (existing) {
      subcats[subcat.name] = existing.id;
    } else {
      const created = await prisma.productSubcategory.create({ data: subcat });
      subcats[subcat.name] = created.id;
    }
  }
  console.log('Product Subcategories seeded');

  // 4. Business Categories
  const bizCatNames = ['Line-fit', 'End-of-Line', 'POC-Paid', 'DOP'];
  const bizCats: Record<string, string> = {};
  for (const name of bizCatNames) {
    const bc = await prisma.businessCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    bizCats[name] = bc.id;
  }
  console.log('Business Categories seeded');

  // 5. Deal Stages
  const dealStageDefs = [
    { code: 'A',       classification: 'Before Lead',   status: 'Planning',           winningProbability: 0,   sortOrder: 1 },
    { code: 'B',       classification: 'Before Lead',   status: 'Lead Generation',    winningProbability: 35,  sortOrder: 2 },
    { code: 'C',       classification: 'Lead',          status: 'Lead Qualification', winningProbability: 50,  sortOrder: 3 },
    { code: 'D',       classification: 'Qualified Lead',status: 'Proposal',           winningProbability: 65,  sortOrder: 4 },
    { code: 'E',       classification: 'Proposal',      status: 'Negotiation',        winningProbability: 75,  sortOrder: 5 },
    { code: 'F',       classification: 'Negotiation',   status: 'Final Evaluation',   winningProbability: 90,  sortOrder: 6 },
    { code: 'SECURED', classification: 'Won',           status: 'Secured',            winningProbability: 100, sortOrder: 7 },
    { code: 'O(H)',    classification: 'Hold',          status: 'On Hold',            winningProbability: 0,   sortOrder: 8 },
    { code: 'O(L)',    classification: 'Lost',          status: 'Opportunity Lost',   winningProbability: 0,   sortOrder: 9 },
  ];
  const stages: Record<string, string> = {};
  for (const stage of dealStageDefs) {
    const s = await prisma.dealStage.upsert({
      where: { code: stage.code },
      update: {},
      create: stage,
    });
    stages[stage.code] = s.id;
  }
  console.log('Deal Stages seeded');

  // 6. Confidence Levels
  const confDefs = [
    { name: 'High',    sortOrder: 1 },
    { name: 'Mid',     sortOrder: 2 },
    { name: 'Low',     sortOrder: 3 },
    { name: 'Secured', sortOrder: 4 },
    { name: 'Lost',    sortOrder: 5 },
  ];
  const conf: Record<string, string> = {};
  for (const level of confDefs) {
    const cl = await prisma.confidenceLevel.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
    conf[level.name] = cl.id;
  }
  console.log('Confidence Levels seeded');

  // 7. Customers
  const customerDefs = [
    { name: 'MSIL',           segment: '4W',  region: 'North' },
    { name: 'Hyundai/Kia',    segment: '4W',  region: 'South' },
    { name: 'Tata PV',        segment: '4W',  region: 'West'  },
    { name: 'Royal Enfield',  segment: '2W',  region: 'South' },
    { name: 'Ashok Leyland',  segment: 'CV',  region: 'South' },
    { name: 'Honda',          segment: '4W',  region: 'West'  },
    { name: 'Mahindra',       segment: '4W',  region: 'West'  },
    { name: 'Nissan',         segment: '4W',  region: 'South' },
    { name: 'FIAT',           segment: '4W',  region: 'West'  },
    { name: 'Tata CV',        segment: 'CV',  region: 'West'  },
    { name: 'Kia',            segment: '4W',  region: 'South' },
    { name: 'Maruti Suzuki',  segment: '4W',  region: 'North' },
    { name: 'BMW',            segment: '4W',  region: 'West'  },
    { name: 'Mercedes',       segment: '4W',  region: 'West'  },
    { name: 'Volvo',          segment: 'CV',  region: 'West'  },
  ];
  const customers: Record<string, string> = {};
  for (const customer of customerDefs) {
    const c = await prisma.customer.upsert({
      where: { name: customer.name },
      update: {},
      create: customer,
    });
    customers[customer.name] = c.id;
  }
  console.log('Customers seeded');

  // 8. Users
  const userDefs = [
    { email: 'admin@oe.local',   fullName: 'Admin User',   password: 'Admin@123',    role: 'ADMIN'    as const, businessUnit: null  },
    { email: 'gaurav@oe.local',  fullName: 'Gaurav',       password: 'Sales@123',    role: 'SALES'    as const, businessUnit: 'MAC' },
    { email: 'parvez@oe.local',  fullName: 'Parvez',       password: 'Sales@123',    role: 'SALES'    as const, businessUnit: 'MPC' },
    { email: 'ashish@oe.local',  fullName: 'Ashish',       password: 'Sales@123',    role: 'SALES'    as const, businessUnit: 'MCC' },
    { email: 'rachit@oe.local',  fullName: 'Rachit',       password: 'Presales@123', role: 'PRESALES' as const, businessUnit: null  },
    { email: 'haseeb@oe.local',  fullName: 'Haseeb',       password: 'Presales@123', role: 'PRESALES' as const, businessUnit: null  },
    { email: 'manager@oe.local', fullName: 'Manager User', password: 'Manager@123',  role: 'MANAGER'  as const, businessUnit: null  },
  ];
  const users: Record<string, string> = {};
  for (const u of userDefs) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        fullName: u.fullName,
        passwordHash,
        role: u.role,
        businessUnit: u.businessUnit ?? undefined,
      },
    });
    users[u.email] = created.id;
  }
  console.log('Users seeded');

  // 9. Sample Opportunities
  // Skip if any already exist
  const existingCount = await prisma.opportunity.count();
  if (existingCount > 0) {
    console.log(`Skipping sample opportunities — ${existingCount} already exist.`);
  } else {
    const sampleOpportunities = [
      {
        customerId:           customers['MSIL'],
        description:          'MSIL Next-Gen IVI Platform for Baleno / Swift facelift',
        businessUnitId:       buMAC.id,
        productCategoryId:    catIVI.id,
        productSubcategoryId: subcats['IVI'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['D'],
        confidenceLevelId:    conf['High'],
        estimatedClosureDate: new Date('2025-09-30'),
        lifetimeVolume:       BigInt(500000),
        unitPriceInr:         12500,
        unitPriceUsd:         150.00,
        tcvUsdMillion:        75.0,
        comments:             'RFQ received. Tech spec alignment in progress.',
        pms:                  'PMS-001',
        remarks:              'High priority — Q3 closure target',
      },
      {
        customerId:           customers['Hyundai/Kia'],
        description:          'Hyundai Creta EV — CDC Rear View Camera System',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['CDC'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['E'],
        confidenceLevelId:    conf['High'],
        estimatedClosureDate: new Date('2025-06-30'),
        lifetimeVolume:       BigInt(300000),
        unitPriceInr:         8200,
        unitPriceUsd:         98.50,
        tcvUsdMillion:        29.6,
        comments:             'Final pricing under negotiation.',
        pms:                  'PMS-002',
        remarks:              'Customer requested BOM reduction',
      },
      {
        customerId:           customers['Tata PV'],
        description:          'Tata Nexon EV — RVC with Display Module',
        businessUnitId:       buMCC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['RVC with Display'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['ashish@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['C'],
        confidenceLevelId:    conf['Mid'],
        estimatedClosureDate: new Date('2025-12-31'),
        lifetimeVolume:       BigInt(200000),
        unitPriceInr:         6500,
        unitPriceUsd:         78.00,
        tcvUsdMillion:        15.6,
        comments:             'Tech approval pending from customer DRE.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['Royal Enfield'],
        description:          'Royal Enfield Classic 650 — Dashcam Integration',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['Dashcam'],
        businessCategoryId:   bizCats['End-of-Line'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        null,
        dealStageId:          stages['SECURED'],
        confidenceLevelId:    conf['Secured'],
        estimatedClosureDate: new Date('2025-03-31'),
        lifetimeVolume:       BigInt(150000),
        unitPriceInr:         4800,
        unitPriceUsd:         57.60,
        tcvUsdMillion:        8.6,
        comments:             'PO received. SOP April 2025.',
        pms:                  'PMS-003',
        remarks:              'Secured — in production ramp',
      },
      {
        customerId:           customers['Ashok Leyland'],
        description:          'Ashok Leyland AVTR — Premium Speaker + Amplifier System',
        businessUnitId:       buMPC.id,
        productCategoryId:    catSound.id,
        productSubcategoryId: subcats['Spk + Amp'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['parvez@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['E'],
        confidenceLevelId:    conf['Mid'],
        estimatedClosureDate: new Date('2025-08-31'),
        lifetimeVolume:       BigInt(80000),
        unitPriceInr:         15000,
        unitPriceUsd:         180.00,
        tcvUsdMillion:        14.4,
        comments:             'Tuning sign-off pending.',
        pms:                  'PMS-004',
        remarks:              null,
      },
      {
        customerId:           customers['Honda'],
        description:          'Honda City 2026 Facelift — IVI Head Unit',
        businessUnitId:       buMAC.id,
        productCategoryId:    catIVI.id,
        productSubcategoryId: subcats['IVI'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['B'],
        confidenceLevelId:    conf['Low'],
        estimatedClosureDate: new Date('2026-03-31'),
        lifetimeVolume:       BigInt(250000),
        unitPriceInr:         11000,
        unitPriceUsd:         132.00,
        tcvUsdMillion:        33.0,
        comments:             'Initial discussions ongoing. RFQ expected Q3.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['Mahindra'],
        description:          'Mahindra XEV 9e — 360-Degree Surround View Camera',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['360-deg. camera'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['F'],
        confidenceLevelId:    conf['High'],
        estimatedClosureDate: new Date('2025-07-31'),
        lifetimeVolume:       BigInt(180000),
        unitPriceInr:         22000,
        unitPriceUsd:         264.00,
        tcvUsdMillion:        47.5,
        comments:             'Customer final evaluation ongoing. PPAP submitted.',
        pms:                  'PMS-005',
        remarks:              'Critical — direct competition with Bosch',
      },
      {
        customerId:           customers['MSIL'],
        description:          'Maruti Swift/Dzire — USB-C Hub Upgrade',
        businessUnitId:       buMPC.id,
        productCategoryId:    catIVI.id,
        productSubcategoryId: subcats['USB port'],
        businessCategoryId:   bizCats['End-of-Line'],
        pinSalesId:           users['parvez@oe.local'],
        pinPresalesId:        null,
        dealStageId:          stages['C'],
        confidenceLevelId:    conf['Mid'],
        estimatedClosureDate: new Date('2025-10-31'),
        lifetimeVolume:       BigInt(600000),
        unitPriceInr:         1200,
        unitPriceUsd:         14.40,
        tcvUsdMillion:        8.6,
        comments:             'Cost-competitive requirement. Target price < INR 1,100.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['Tata PV'],
        description:          'Tata Harrier Facelift — Wireless Charging (WLC) Pad',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['WLC'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['D'],
        confidenceLevelId:    conf['High'],
        estimatedClosureDate: new Date('2025-11-30'),
        lifetimeVolume:       BigInt(120000),
        unitPriceInr:         3500,
        unitPriceUsd:         42.00,
        tcvUsdMillion:        5.0,
        comments:             'MPI submitted. Awaiting DRE approval.',
        pms:                  'PMS-006',
        remarks:              null,
      },
      {
        customerId:           customers['Hyundai/Kia'],
        description:          'Kia Seltos 2026 — Premium IVI System with ADAS integration',
        businessUnitId:       buMAC.id,
        productCategoryId:    catIVI.id,
        productSubcategoryId: subcats['IVI'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['SECURED'],
        confidenceLevelId:    conf['Secured'],
        estimatedClosureDate: new Date('2025-04-30'),
        lifetimeVolume:       BigInt(400000),
        unitPriceInr:         18500,
        unitPriceUsd:         222.00,
        tcvUsdMillion:        88.8,
        comments:             'LOI signed. Engineering kick-off done.',
        pms:                  'PMS-007',
        remarks:              'SOP June 2025',
      },
      {
        customerId:           customers['Royal Enfield'],
        description:          'Royal Enfield Meteor — RVC Retrofit Kit',
        businessUnitId:       buMCC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['RVC'],
        businessCategoryId:   bizCats['End-of-Line'],
        pinSalesId:           users['ashish@oe.local'],
        pinPresalesId:        null,
        dealStageId:          stages['A'],
        confidenceLevelId:    conf['Low'],
        estimatedClosureDate: new Date('2026-06-30'),
        lifetimeVolume:       BigInt(50000),
        unitPriceInr:         2800,
        unitPriceUsd:         33.60,
        tcvUsdMillion:        1.7,
        comments:             'Early prospecting stage.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['MSIL'],
        description:          'Maruti Grand Vitara — CDC System Upgrade',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['CDC'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['E'],
        confidenceLevelId:    conf['High'],
        estimatedClosureDate: new Date('2025-08-31'),
        lifetimeVolume:       BigInt(350000),
        unitPriceInr:         9200,
        unitPriceUsd:         110.40,
        tcvUsdMillion:        38.6,
        comments:             'Prototype validation completed. Cost target achieved.',
        pms:                  'PMS-008',
        remarks:              null,
      },
      {
        customerId:           customers['Honda'],
        description:          'Honda Amaze — Rear Coaxial Speaker System',
        businessUnitId:       buMPC.id,
        productCategoryId:    catSound.id,
        productSubcategoryId: subcats['Spks.'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['parvez@oe.local'],
        pinPresalesId:        null,
        dealStageId:          stages['B'],
        confidenceLevelId:    conf['Mid'],
        estimatedClosureDate: new Date('2026-01-31'),
        lifetimeVolume:       BigInt(220000),
        unitPriceInr:         2200,
        unitPriceUsd:         26.40,
        tcvUsdMillion:        5.8,
        comments:             'Pre-RFQ discussions with Honda India procurement.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['Tata CV'],
        description:          'Tata LPT 3118 — Digital Instrument Cluster (2W class)',
        businessUnitId:       buMPC.id,
        productCategoryId:    catOtherMAC.id,
        productSubcategoryId: subcats['Cluster (2W)'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['parvez@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['C'],
        confidenceLevelId:    conf['Mid'],
        estimatedClosureDate: new Date('2025-12-31'),
        lifetimeVolume:       BigInt(40000),
        unitPriceInr:         5500,
        unitPriceUsd:         66.00,
        tcvUsdMillion:        2.6,
        comments:             'Awaiting technical feasibility sign-off.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['Mahindra'],
        description:          'Mahindra BE 6e — Dual-Screen IVI Infotainment',
        businessUnitId:       buMAC.id,
        productCategoryId:    catIVI.id,
        productSubcategoryId: subcats['IVI'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['D'],
        confidenceLevelId:    conf['High'],
        estimatedClosureDate: new Date('2025-10-31'),
        lifetimeVolume:       BigInt(280000),
        unitPriceInr:         24000,
        unitPriceUsd:         288.00,
        tcvUsdMillion:        80.6,
        comments:             'Technical proposal submitted. Architecture review scheduled.',
        pms:                  'PMS-009',
        remarks:              'High strategic value — EV platform',
      },
      {
        customerId:           customers['MSIL'],
        description:          'Maruti Fronx — Digital Mirror (IRVM) System',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['Digital mirror'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['F'],
        confidenceLevelId:    conf['High'],
        estimatedClosureDate: new Date('2025-06-30'),
        lifetimeVolume:       BigInt(180000),
        unitPriceInr:         7800,
        unitPriceUsd:         93.60,
        tcvUsdMillion:        16.8,
        comments:             'PPAP approved. Awaiting final sourcing decision.',
        pms:                  'PMS-010',
        remarks:              'Competitor: Gentex',
      },
      {
        customerId:           customers['Hyundai/Kia'],
        description:          'Hyundai Exter — WLC 15W Wireless Charging Pad',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['WLC'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        null,
        dealStageId:          stages['B'],
        confidenceLevelId:    conf['Low'],
        estimatedClosureDate: new Date('2026-04-30'),
        lifetimeVolume:       BigInt(100000),
        unitPriceInr:         2900,
        unitPriceUsd:         34.80,
        tcvUsdMillion:        3.5,
        comments:             'Concept presentation done. Budget approval pending.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['Tata PV'],
        description:          'Tata Punch EV — IVI with OTA Capability',
        businessUnitId:       buMAC.id,
        productCategoryId:    catIVI.id,
        productSubcategoryId: subcats['IVI'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['SECURED'],
        confidenceLevelId:    conf['Secured'],
        estimatedClosureDate: new Date('2025-02-28'),
        lifetimeVolume:       BigInt(320000),
        unitPriceInr:         16500,
        unitPriceUsd:         198.00,
        tcvUsdMillion:        63.4,
        comments:             'In production. Volume ramp-up on track.',
        pms:                  'PMS-011',
        remarks:              'SOP Jan 2025 achieved',
      },
      {
        customerId:           customers['Royal Enfield'],
        description:          'Royal Enfield Himalayan — Speaker + Amp Weather-Resistant Kit',
        businessUnitId:       buMPC.id,
        productCategoryId:    catSound.id,
        productSubcategoryId: subcats['Spk + Amp'],
        businessCategoryId:   bizCats['End-of-Line'],
        pinSalesId:           users['parvez@oe.local'],
        pinPresalesId:        null,
        dealStageId:          stages['O(L)'],
        confidenceLevelId:    conf['Lost'],
        estimatedClosureDate: new Date('2024-12-31'),
        lifetimeVolume:       BigInt(60000),
        unitPriceInr:         3800,
        unitPriceUsd:         45.60,
        tcvUsdMillion:        2.7,
        comments:             'Lost to JBL local supplier on price.',
        pms:                  null,
        remarks:              'Lessons learned: need cost reduction on amplifier BOM',
      },
      {
        customerId:           customers['Honda'],
        description:          'Honda Elevate — Front/Rear Dashcam with Parking Mode',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['Dashcam'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['C'],
        confidenceLevelId:    conf['Mid'],
        estimatedClosureDate: new Date('2025-09-30'),
        lifetimeVolume:       BigInt(90000),
        unitPriceInr:         5200,
        unitPriceUsd:         62.40,
        tcvUsdMillion:        5.6,
        comments:             'POC evaluation in progress at Honda R&D.',
        pms:                  null,
        remarks:              null,
      },
      {
        customerId:           customers['Nissan'],
        description:          'Nissan Magnite Facelift — 10" IVI Upgrade',
        businessUnitId:       buMAC.id,
        productCategoryId:    catIVI.id,
        productSubcategoryId: subcats['IVI'],
        businessCategoryId:   bizCats['Line-fit'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['rachit@oe.local'],
        dealStageId:          stages['O(H)'],
        confidenceLevelId:    conf['Low'],
        estimatedClosureDate: new Date('2025-06-30'),
        lifetimeVolume:       BigInt(70000),
        unitPriceInr:         13500,
        unitPriceUsd:         162.00,
        tcvUsdMillion:        11.3,
        comments:             'On hold — Nissan India volume uncertainty.',
        pms:                  'PMS-012',
        remarks:              'Monitor Nissan India business situation',
      },
      {
        customerId:           customers['Mahindra'],
        description:          'Mahindra Scorpio-N — Surround View Monitor Upgrade',
        businessUnitId:       buMAC.id,
        productCategoryId:    catSmartcam.id,
        productSubcategoryId: subcats['360-deg. camera'],
        businessCategoryId:   bizCats['End-of-Line'],
        pinSalesId:           users['gaurav@oe.local'],
        pinPresalesId:        users['haseeb@oe.local'],
        dealStageId:          stages['B'],
        confidenceLevelId:    conf['Mid'],
        estimatedClosureDate: new Date('2026-01-31'),
        lifetimeVolume:       BigInt(100000),
        unitPriceInr:         19000,
        unitPriceUsd:         228.00,
        tcvUsdMillion:        22.8,
        comments:             'Feasibility study approved. Target: sub-USD 200.',
        pms:                  null,
        remarks:              null,
      },
    ];

    const adminUserId = users['admin@oe.local'];
    for (const opp of sampleOpportunities) {
      await prisma.opportunity.create({
        data: {
          ...opp,
          createdById: adminUserId,
          updatedById: adminUserId,
        },
      });
    }
    console.log(`Sample opportunities seeded: ${sampleOpportunities.length}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
