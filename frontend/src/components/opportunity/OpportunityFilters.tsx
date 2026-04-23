import { Form, Select, DatePicker, InputNumber, Input, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useCustomers, useBusinessUnits, useProductCategories, useProductSubcategories, useDealStages, useConfidenceLevels, useSalesUsers, usePresalesUsers } from '../../hooks/useMaster';
import { OpportunityFilters } from '../../types';

const { RangePicker } = DatePicker;

interface Props {
  filters: OpportunityFilters;
  onChange: (f: Partial<OpportunityFilters>) => void;
  onReset: () => void;
}

export default function OpportunityFiltersPanel({ filters, onChange, onReset }: Props) {
  const { data: customers = [] } = useCustomers();
  const { data: bus = [] } = useBusinessUnits();
  const { data: cats = [] } = useProductCategories();
  const { data: subcats = [] } = useProductSubcategories(filters.productCategoryIds?.[0]);
  const { data: stages = [] } = useDealStages();
  const { data: confidence = [] } = useConfidenceLevels();
  const { data: salesUsers = [] } = useSalesUsers();

  return (
    <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #f0f0f0' }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input prefix={<SearchOutlined />} placeholder="Search description..." value={filters.search} onChange={(e) => onChange({ search: e.target.value })} allowClear />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select mode="multiple" placeholder="Customer" style={{ width: '100%' }} value={filters.customerIds} onChange={(v) => onChange({ customerIds: v })} options={customers.map((c: any) => ({ value: c.id, label: c.name }))} allowClear maxTagCount={2} />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select mode="multiple" placeholder="Business Unit" style={{ width: '100%' }} value={filters.businessUnitIds} onChange={(v) => onChange({ businessUnitIds: v })} options={bus.map((b: any) => ({ value: b.id, label: b.name }))} allowClear />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select mode="multiple" placeholder="Product Category" style={{ width: '100%' }} value={filters.productCategoryIds} onChange={(v) => onChange({ productCategoryIds: v })} options={cats.map((c: any) => ({ value: c.id, label: c.name }))} allowClear />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select mode="multiple" placeholder="Deal Stage" style={{ width: '100%' }} value={filters.dealStageIds} onChange={(v) => onChange({ dealStageIds: v })} options={stages.map((s: any) => ({ value: s.id, label: s.code }))} allowClear />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select mode="multiple" placeholder="Confidence Level" style={{ width: '100%' }} value={filters.confidenceLevelIds} onChange={(v) => onChange({ confidenceLevelIds: v })} options={confidence.map((c: any) => ({ value: c.id, label: c.name }))} allowClear />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select mode="multiple" placeholder="Sales Person" style={{ width: '100%' }} value={filters.pinSalesIds} onChange={(v) => onChange({ pinSalesIds: v })} options={salesUsers.map((u: any) => ({ value: u.id, label: u.fullName }))} allowClear />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <RangePicker style={{ width: '100%' }} placeholder={['From Date', 'To Date']} onChange={(_, s) => onChange({ fromDate: s[0] || undefined, toDate: s[1] || undefined })} />
        </Col>
        <Col xs={24} sm={24} md={24} style={{ textAlign: 'right' }}>
          <Button icon={<ClearOutlined />} onClick={onReset}>Reset Filters</Button>
        </Col>
      </Row>
    </div>
  );
}
