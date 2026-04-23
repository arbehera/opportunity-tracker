import { Form, Input, Button, Alert, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError('');
    try {
      await forgotPassword(values.email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={4} style={{ margin: '0 0 4px', color: '#1a1a1a' }}>
          Forgot Password
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Enter your email and we'll send you a reset link.
        </Typography.Text>
      </div>

      {sent ? (
        <Alert
          type="success"
          message="If that email exists in our system, a reset link has been sent."
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      <div style={{ textAlign: 'center' }}>
        <Link to="/login">
          <ArrowLeftOutlined /> Back to login
        </Link>
      </div>
    </div>
  );
}
