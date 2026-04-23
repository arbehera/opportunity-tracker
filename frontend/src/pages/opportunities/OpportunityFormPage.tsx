import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form, Input, Select, DatePicker, InputNumber, Button, Card, Row, Col,
  Typography, Space, Spin, message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getOpportunity, createOpportunity, updateOpportunity } from '@/api/opportunities';
import { useMasterData } from '@/hooks/useMasterData';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;
const { TextArea } = Input;

export default function OpportunityFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const user = useAuthStore((s) => s.user);

  const {
    customers, productCategories, productSubcategories, businessCategories,
    businessUnits, dealStages, confidenceLevels, salesUsers, presalesUsers, isLoading: masterLoading,
  } = useMasterData();

  const selectedCatId = Form.useWatch('productCategoryId', form);
  const filteredSubcats = productSubcategories.filter(
    (s) => !selectedCatId || s.categoryId === selectedCatId
  );

  const { data: oppRes, isLoading: oppLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => getOpportunity(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (oppRes?.data?.data) {
      const opp = oppRes.data.data as any;
      form.setFieldsValue({
        ...opp,
        estimatedClosureDate: opp.estimatedClosureDate ? dayjs(opp.estimatedClosureDate) : null,
        lifetimeVolume: Number(opp.lifetimeVolume),
        unitPriceInr: Number(opp.unitPriceInr),
        unitPriceUsd: Number(opp.unitPriceUsd),
        tcvUsdMillion: Number(opp.tcvUsdMillion),
      });
    } else if (!isEdit) {
      // Pre-fill pinSalesId if current user is SALES
      if (user?.role === 'SALES') {
        const salesUser = salesUsers.find((u) => u.email === user.email);
        if (salesUser) form.setFieldsValue({ pinSalesId: salesUser.id });
      }
    }
  }, [oppRes, isEdit, user, salesUsers]);

  const createMut = useMutation({
    mutationFn: (data: any) => createOpportunity(data),
    onSuccess: () => {
      message.success('Opportunity created');
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      navigate('/opportunities');
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => updateOpportunity(id!, data),
    onSuccess: () => {
      message.success('Opportunity updated');
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      navigate(`/opportunities/${id}`);
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Failed to update'),
  });

  const onFinish = (values: any) => {
    const payload = {
      ...values,
      estimatedClosureDate: values.estimatedClosureDate
        ? values.estimatedClosureDate.format('YYYY-MM-DD')
        : null,
    };
    if (isEdit) updateMut.mutate(payload);
    else createMut.mutate(payload);
  };

  if (isEdit && oppLoading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(isEdit ? `/opportunities/${id}` : '/opportunities')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {isEdit ? 'Edit Opportunity' : 'New Opportunity'}
          </Title>
        </Space>
      </Row>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="Basic Information" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Customer" name="customerId" rules={[{ required: true }]}>
                    <Select
                      showSearch
                      placeholder="Select customer"
                      options={customers.map((c) => ({ value: c.id, label: c.name }))}
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Business Unit" name="businessUnitId" rules={[{ required: true }]}>
                    <Select
                      placeholder="Select BU"
                      options={businessUnits.map((b) => ({ value: b.id, label: b.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Description" name="description" rules={[{ required: true }]}>
                    <TextArea rows={3} placeholder="Opportunity description" maxLength={1000} showCount />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Product Category" name="productCategoryId" rules={[{ required: true }]}>
                    <Select
                      placeholder="Select category"
                      options={productCategories.map((c) => ({ value: c.id, label: c.name }))}
                      onChange={() => form.setFieldValue('productSubcategoryId', null)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Product Subcategory" name="productSubcategoryId" rules={[{ required: true }]}>
                    <Select
                      placeholder="Select subcategory"
                      disabled={!selectedCatId}
                      options={filteredSubcats.map((s) => ({ value: s.id, label: s.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Business Category" name="businessCategoryId" rules={[{ required: true }]}>
                    <Select
                      placeholder="Select business category"
                      options={businessCategories.map((c) => ({ value: c.id, label: c.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="PMS" name="pms">
                    <Input placeholder="PMS reference" maxLength={200} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Comments" name="comments">
                    <TextArea rows={2} placeholder="Comments" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Remarks" name="remarks">
                    <TextArea rows={2} placeholder="Internal remarks" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Team" size="small">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="PIN Sales" name="pinSalesId" rules={[{ required: true }]}>
                    <Select
                      showSearch
                      placeholder="Select sales person"
                      options={salesUsers.map((u) => ({ value: u.id, label: `${u.fullName} (${u.businessUnit || '-'})` }))}
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="PIN Pre-Sales" name="pinPresalesId">
                    <Select
                      showSearch
                      placeholder="Select presales (optional)"
                      options={presalesUsers.map((u) => ({ value: u.id, label: u.fullName }))}
                      allowClear
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Stage & Status" size="small" style={{ marginBottom: 16 }}>
              <Form.Item label="Deal Stage" name="dealStageId" rules={[{ required: true }]}>
                <Select
                  placeholder="Select stage"
                  options={dealStages.map((s) => ({
                    value: s.id,
                    label: `${s.code} — ${s.status}`,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Confidence Level" name="confidenceLevelId" rules={[{ required: true }]}>
                <Select
                  placeholder="Select confidence"
                  options={confidenceLevels.map((c) => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
              <Form.Item label="Estimated Closure Date" name="estimatedClosureDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            <Card title="Financials" size="small">
              <Form.Item label="Lifetime Volume (units)" name="lifetimeVolume" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 50000" />
              </Form.Item>
              <Form.Item label="Unit Price INR (₹)" name="unitPriceInr" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Unit Price USD ($)" name="unitPriceUsd" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.0001} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="TCV USD Million" name="tcvUsdMillion" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.001} style={{ width: '100%' }} addonBefore="$M" />
              </Form.Item>
            </Card>

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                block
                size="large"
                icon={<SaveOutlined />}
              >
                {isEdit ? 'Save Changes' : 'Create Opportunity'}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
