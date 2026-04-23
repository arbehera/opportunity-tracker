import { Button, Select, DatePicker, Space, Card, Row, Col } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMasterData } from '@/hooks/useMasterData';
import type { AnalyticsFilters } from '@/api/analytics';

interface Props {
  filters: AnalyticsFilters;
  onChange: (f: AnalyticsFilters) => void;
}

const { RangePicker } = DatePicker;

export default function AnalyticsFiltersPanel({ filters, onChange }: Props) {
  const { customers, businessUnits, dealStages, confidenceLevels, salesUsers } = useMasterData();

  const dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null =
    filters.fromDate && filters.toDate
      ? [dayjs(filters.fromDate), dayjs(filters.toDate)]
      : null;

  const reset = () =>
    onChange({ customerIds: [], businessUnitIds: [], dealStageIds: [], confidenceLevelIds: [], salesIds: [], fromDate: null, toDate: null });

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[12, 8]} align="middle">
        <Col>
          <FilterOutlined style={{ color: '#1677ff' }} />
        </Col>
        <Col flex={1}>
          <Space wrap>
            <RangePicker
              size="small"
              value={dateRange}
              onChange={(dates) =>
                onChange({
                  ...filters,
                  fromDate: dates?.[0]?.format('YYYY-MM-DD') || null,
                  toDate: dates?.[1]?.format('YYYY-MM-DD') || null,
                })
              }
              placeholder={['From Date', 'To Date']}
            />
            <Select
              mode="multiple"
              size="small"
              placeholder="Customer"
              style={{ minWidth: 160 }}
              value={filters.customerIds || []}
              onChange={(v) => onChange({ ...filters, customerIds: v })}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              maxTagCount="responsive"
              allowClear
            />
            <Select
              mode="multiple"
              size="small"
              placeholder="Business Unit"
              style={{ minWidth: 140 }}
              value={filters.businessUnitIds || []}
              onChange={(v) => onChange({ ...filters, businessUnitIds: v })}
              options={businessUnits.map((b) => ({ value: b.id, label: b.name }))}
              maxTagCount="responsive"
              allowClear
            />
            <Select
              mode="multiple"
              size="small"
              placeholder="Stage"
              style={{ minWidth: 120 }}
              value={filters.dealStageIds || []}
              onChange={(v) => onChange({ ...filters, dealStageIds: v })}
              options={dealStages.map((s) => ({ value: s.id, label: s.code }))}
              maxTagCount="responsive"
              allowClear
            />
            <Select
              mode="multiple"
              size="small"
              placeholder="Confidence"
              style={{ minWidth: 130 }}
              value={filters.confidenceLevelIds || []}
              onChange={(v) => onChange({ ...filters, confidenceLevelIds: v })}
              options={confidenceLevels.map((c) => ({ value: c.id, label: c.name }))}
              maxTagCount="responsive"
              allowClear
            />
            <Select
              mode="multiple"
              size="small"
              placeholder="Sales Person"
              style={{ minWidth: 150 }}
              value={filters.salesIds || []}
              onChange={(v) => onChange({ ...filters, salesIds: v })}
              options={salesUsers.map((u) => ({ value: u.id, label: u.fullName }))}
              maxTagCount="responsive"
              allowClear
            />
            <Button size="small" icon={<ClearOutlined />} onClick={reset}>
              Clear
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
