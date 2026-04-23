"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpportunityCount = exports.getTeamMembers = exports.getCustomerByCategory = exports.getCustomerWise = exports.getStageWise = exports.getBUWise = exports.getConfidenceLevel = exports.getSubcategoryByBU = exports.getSubcategoryWise = exports.getCategoryWise = exports.getDashboardSummary = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const buildWhere = (filters) => {
    const conds = ['o.is_active = true'];
    const params = [];
    let idx = 1;
    const arr = (v) => (Array.isArray(v) ? v : v ? [v] : null);
    const customerIds = arr(filters.customerIds);
    const businessUnitIds = arr(filters.businessUnitIds);
    const productCategoryIds = arr(filters.productCategoryIds);
    const dealStageIds = arr(filters.dealStageIds);
    const confidenceLevelIds = arr(filters.confidenceLevelIds);
    const salesIds = arr(filters.salesIds);
    if (customerIds?.length) {
        conds.push(`o.customer_id = ANY($${idx}::uuid[])`);
        params.push(customerIds);
        idx++;
    }
    if (businessUnitIds?.length) {
        conds.push(`o.business_unit_id = ANY($${idx}::uuid[])`);
        params.push(businessUnitIds);
        idx++;
    }
    if (productCategoryIds?.length) {
        conds.push(`o.product_category_id = ANY($${idx}::uuid[])`);
        params.push(productCategoryIds);
        idx++;
    }
    if (dealStageIds?.length) {
        conds.push(`o.deal_stage_id = ANY($${idx}::uuid[])`);
        params.push(dealStageIds);
        idx++;
    }
    if (confidenceLevelIds?.length) {
        conds.push(`o.confidence_level_id = ANY($${idx}::uuid[])`);
        params.push(confidenceLevelIds);
        idx++;
    }
    if (salesIds?.length) {
        conds.push(`o.pin_sales_id = ANY($${idx}::uuid[])`);
        params.push(salesIds);
        idx++;
    }
    if (filters.fromDate) {
        conds.push(`o.estimated_closure_date >= $${idx}`);
        params.push(new Date(filters.fromDate));
        idx++;
    }
    if (filters.toDate) {
        conds.push(`o.estimated_closure_date <= $${idx}`);
        params.push(new Date(filters.toDate));
        idx++;
    }
    return { clause: conds.join(' AND '), params };
};
const raw = (sql, params) => prisma.$queryRawUnsafe(sql, ...params);
const getDashboardSummary = async (filters) => {
    const { clause, params } = buildWhere(filters);
    const now = new Date();
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const qEnd = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 0);
    const rows = await raw(`
    SELECT
      COUNT(*)::int                                                              AS total_count,
      COALESCE(SUM(o.tcv_usd_million), 0)::float                               AS total_tcv,
      COALESCE(SUM(CASE WHEN ds.code = 'SECURED' THEN o.tcv_usd_million ELSE 0 END), 0)::float AS secured_tcv,
      COALESCE(SUM(CASE WHEN cl.name = 'High'    THEN o.tcv_usd_million ELSE 0 END), 0)::float AS high_confidence_tcv,
      COUNT(CASE WHEN o.estimated_closure_date BETWEEN '${qStart.toISOString()}' AND '${qEnd.toISOString()}' THEN 1 END)::int AS closing_this_quarter,
      CASE
        WHEN (SUM(CASE WHEN ds.code = 'SECURED' THEN 1 ELSE 0 END) + SUM(CASE WHEN ds.code = 'O(L)' THEN 1 ELSE 0 END)) > 0
        THEN ROUND(
          SUM(CASE WHEN ds.code = 'SECURED' THEN 1 ELSE 0 END)::numeric /
          (SUM(CASE WHEN ds.code = 'SECURED' THEN 1 ELSE 0 END) + SUM(CASE WHEN ds.code = 'O(L)' THEN 1 ELSE 0 END)) * 100, 1
        )
        ELSE 0
      END::float AS win_rate
    FROM opportunities o
    JOIN deal_stages       ds ON o.deal_stage_id       = ds.id
    JOIN confidence_levels cl ON o.confidence_level_id = cl.id
    WHERE ${clause}
  `, params);
    const r = rows[0];
    return {
        totalOpportunities: r.total_count,
        totalPipelineTcv: r.total_tcv,
        securedTcv: r.secured_tcv,
        highConfidenceTcv: r.high_confidence_tcv,
        closingThisQuarter: r.closing_this_quarter,
        winRate: r.win_rate,
    };
};
exports.getDashboardSummary = getDashboardSummary;
const getCategoryWise = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT c.name AS customer, pc.name AS product_category,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN customers          c  ON o.customer_id          = c.id
    JOIN product_categories pc ON o.product_category_id  = pc.id
    WHERE ${clause}
    GROUP BY c.name, pc.name ORDER BY c.name, pc.name
  `, params);
};
exports.getCategoryWise = getCategoryWise;
const getSubcategoryWise = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT c.name AS customer, ps.name AS subcategory,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN customers             c  ON o.customer_id             = c.id
    JOIN product_subcategories ps ON o.product_subcategory_id  = ps.id
    WHERE ${clause}
    GROUP BY c.name, ps.name ORDER BY c.name, ps.name
  `, params);
};
exports.getSubcategoryWise = getSubcategoryWise;
const getSubcategoryByBU = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT c.name AS customer, bu.name AS business_unit,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN customers      c  ON o.customer_id      = c.id
    JOIN business_units bu ON o.business_unit_id = bu.id
    WHERE ${clause}
    GROUP BY c.name, bu.name ORDER BY c.name, bu.name
  `, params);
};
exports.getSubcategoryByBU = getSubcategoryByBU;
const getConfidenceLevel = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT ps.name AS subcategory, cl.name AS confidence_level,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN product_subcategories ps ON o.product_subcategory_id  = ps.id
    JOIN confidence_levels     cl ON o.confidence_level_id     = cl.id
    WHERE ${clause}
    GROUP BY ps.name, cl.name ORDER BY ps.name, cl.name
  `, params);
};
exports.getConfidenceLevel = getConfidenceLevel;
const getBUWise = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT bu.name AS business_unit, cl.name AS confidence_level,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN business_units    bu ON o.business_unit_id    = bu.id
    JOIN confidence_levels cl ON o.confidence_level_id = cl.id
    WHERE ${clause}
    GROUP BY bu.name, cl.name ORDER BY bu.name, cl.name
  `, params);
};
exports.getBUWise = getBUWise;
const getStageWise = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT ds.code AS stage, ds.sort_order, cl.name AS confidence_level,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN deal_stages       ds ON o.deal_stage_id       = ds.id
    JOIN confidence_levels cl ON o.confidence_level_id = cl.id
    WHERE ${clause}
    GROUP BY ds.code, ds.sort_order, cl.name ORDER BY ds.sort_order, cl.name
  `, params);
};
exports.getStageWise = getStageWise;
const getCustomerWise = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT c.name AS customer, ds.code AS stage,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN customers   c  ON o.customer_id   = c.id
    JOIN deal_stages ds ON o.deal_stage_id = ds.id
    WHERE ${clause}
    GROUP BY c.name, ds.code ORDER BY c.name, ds.code
  `, params);
};
exports.getCustomerWise = getCustomerWise;
const getCustomerByCategory = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT pc.name AS product_category, ds.code AS stage,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN product_categories pc ON o.product_category_id = pc.id
    JOIN deal_stages        ds ON o.deal_stage_id        = ds.id
    WHERE ${clause}
    GROUP BY pc.name, ds.code ORDER BY pc.name, ds.code
  `, params);
};
exports.getCustomerByCategory = getCustomerByCategory;
const getTeamMembers = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT u.full_name AS sales_person, ds.code AS stage,
           ROUND(COALESCE(SUM(o.tcv_usd_million),0)::numeric,2)::float AS tcv
    FROM opportunities o
    JOIN users       u  ON o.pin_sales_id  = u.id
    JOIN deal_stages ds ON o.deal_stage_id = ds.id
    WHERE ${clause}
    GROUP BY u.full_name, ds.code ORDER BY u.full_name, ds.code
  `, params);
};
exports.getTeamMembers = getTeamMembers;
const getOpportunityCount = async (filters) => {
    const { clause, params } = buildWhere(filters);
    return raw(`
    SELECT c.name AS customer, ds.code AS stage, COUNT(*)::int AS count
    FROM opportunities o
    JOIN customers   c  ON o.customer_id   = c.id
    JOIN deal_stages ds ON o.deal_stage_id = ds.id
    WHERE ${clause}
    GROUP BY c.name, ds.code ORDER BY c.name, ds.code
  `, params);
};
exports.getOpportunityCount = getOpportunityCount;
