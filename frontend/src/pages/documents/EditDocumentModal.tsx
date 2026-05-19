import { useEffect } from 'react';
import {
  Modal, Form, Input, Select, DatePicker, Switch, Row, Col, message,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { updateDocument } from '@/api/documents';
import { customersApi } from '@/api/master';
import { getUsers } from '@/api/users';
import { getOpportunities } from '@/api/opportunities';

const DOC_TYPES = [
  'PROPOSAL', 'QUOTATION', 'CONTRACT', 'SPECIFICATION', 'NDA',
  'MEETING_MINUTES', 'PURCHASE_ORDER', 'INVOICE', 'TECHNICAL_DOCUMENT',
  'CORRESPONDENCE', 'OTHER',
];

interface Props {
  open: boolean;
  document: any;
  onClose: () => void;
}

export default function EditDocumentModal({ open, document, onClose }: Props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: customersData } = useQuery({
    queryKey: ['master', 'customers'],
    queryFn: () => customersApi.list(),
    staleTime: 60000,
  });
  const { data: usersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => getUsers({ limit: 200 }),
    staleTime: 60000,
  });

  const { data: oppsData } = useQuery({
    queryKey: ['opportunities', 'select-list'],
    queryFn: () => getOpportunities({ limit: 200, page: 1 }),
    staleTime: 60000,
  });

  const customers    = (customersData?.data?.data || []) as any[];
  const users        = (usersData?.data?.data || []) as any[];
  const opportunities = (oppsData?.data?.data || []) as any[];

  const mutation = useMutation({
    mutationFn: (values: any) => updateDocument(document?.id, values),
    onSuccess: () => {
      message.success('Document updated');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', document?.id] });
      onClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to update document');
    },
  });

  useEffect(() => {
    if (open && document) {
      form.setFieldsValue({
        title:          document.title,
        documentType:   document.documentType,
        sharepointUrl:  document.sharepointUrl,
        fileName:       document.fileName,
        customerId:     document.customer?.id || null,
        opportunityId:  document.opportunity?.id || null,
        receivedById:   document.receivedBy?.id || null,
        receivedDate:   document.receivedDate ? dayjs(document.receivedDate) : null,
        version:        document.version || '',
        isConfidential: document.isConfidential ?? false,
        tags:           document.tags || [],
        description:    document.description || '',
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, document, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: any = {
        title:          values.title,
        documentType:   values.documentType,
        sharepointUrl:  values.sharepointUrl,
        fileName:       values.fileName,
        customerId:     values.customerId || null,
        opportunityId:  values.opportunityId || null,
        receivedById:   values.receivedById || null,
        receivedDate:   values.receivedDate ? values.receivedDate.utc().toISOString() : null,
        description:    values.description || null,
        version:        values.version || null,
        isConfidential: values.isConfidential ?? false,
        tags:           values.tags || [],
      };
      mutation.mutate(payload);
    });
  };

  return (
    <Modal
      title="Edit Document"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Update Document"
      confirmLoading={mutation.isPending}
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="middle">
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
              <Input placeholder="e.g. MSIL RFQ Proposal 2025" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="documentType" label="Document Type" rules={[{ required: true, message: 'Required' }]}>
              <Select
                placeholder="Select type"
                options={DOC_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="sharepointUrl"
              label="SharePoint / Document URL"
              rules={[{ required: true, message: 'URL is required' }]}
            >
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="fileName" label="File Name" rules={[{ required: true, message: 'Required' }]}>
              <Input placeholder="document.pdf" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="customerId" label="Customer">
              <Select
                showSearch
                allowClear
                placeholder="Select customer"
                optionFilterProp="label"
                options={customers.map((c: any) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="opportunityId" label="Opportunity">
              <Select
                showSearch
                allowClear
                placeholder="Link to opportunity (optional)"
                optionFilterProp="label"
                options={opportunities.map((o: any) => ({
                  value: o.id,
                  label: `#${o.serialNumber} — ${o.description?.substring(0, 40)}${o.description?.length > 40 ? '…' : ''} (${o.customer?.name})`,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="receivedById" label="Received By">
              <Select
                showSearch
                allowClear
                placeholder="Select user"
                optionFilterProp="label"
                options={users.map((u: any) => ({ value: u.id, label: u.fullName }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="receivedDate" label="Received Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="version" label="Version">
              <Input placeholder="v1.0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isConfidential" label="Confidential" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="tags" label="Tags">
          <Select
            mode="tags"
            placeholder="Add tags (press Enter)"
            style={{ width: '100%' }}
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional notes about this document" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
