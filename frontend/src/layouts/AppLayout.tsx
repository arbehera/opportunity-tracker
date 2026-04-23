import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout, Menu, Badge, Dropdown, Avatar, Typography, Space, Button, theme,
} from 'antd';
import {
  DashboardOutlined, FundOutlined, FileTextOutlined, UserOutlined,
  SettingOutlined, BellOutlined, LogoutOutlined, BarChartOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getNotifications, markAllNotificationsRead } from '@/api/notifications';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/opportunities', icon: <FundOutlined />, label: 'Opportunities' },
  {
    key: 'analytics',
    icon: <BarChartOutlined />,
    label: 'Analytics',
    children: [
      { key: '/analytics/category', label: 'Category' },
      { key: '/analytics/subcategory', label: 'Subcategory' },
      { key: '/analytics/bu', label: 'Business Unit' },
      { key: '/analytics/stage', label: 'Stage' },
      { key: '/analytics/customer', label: 'Customer' },
      { key: '/analytics/team', label: 'Team' },
      { key: '/analytics/confidence', label: 'Confidence' },
      { key: '/analytics/count', label: 'Count' },
    ],
  },
  { key: '/documents', icon: <FileTextOutlined />, label: 'Documents' },
  {
    key: 'admin',
    icon: <SettingOutlined />,
    label: 'Admin',
    children: [
      { key: '/admin/users', label: 'Users' },
      { key: '/admin/master', label: 'Master Data' },
    ],
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer } } = theme.useToken();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data: notificationsRes } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
    refetchInterval: 30000,
  });
  const notifications = notificationsRes?.data?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleMenuClick = ({ key }: { key: string }) => navigate(key);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600 }}>{user?.fullName}</div>
          <div style={{ color: '#666', fontSize: 12 }}>{user?.role}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
  ];

  const notifMenu = [
    {
      key: 'header',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 280 }}>
          <Text strong>Notifications</Text>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => markAllNotificationsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    ...(notifications.length === 0
      ? [{ key: 'empty', label: <Text type="secondary">No notifications</Text>, disabled: true }]
      : notifications.slice(0, 8).map((n: any) => ({
          key: n.id,
          label: (
            <div style={{ maxWidth: 280 }}>
              <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 13 }}>{n.message}</div>
              <div style={{ color: '#999', fontSize: 11 }}>
                {new Date(n.createdAt).toLocaleDateString()}
              </div>
            </div>
          ),
        }))),
  ];

  const openKeys = location.pathname.startsWith('/analytics')
    ? ['analytics']
    : location.pathname.startsWith('/admin')
    ? ['admin']
    : [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{ position: 'fixed', height: '100vh', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: collapsed ? 0 : '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {!collapsed ? (
            <img
              src="/Pioneer-logo.png"
              alt="Pioneer OEM Pulse"
              style={{ height: 40, filter: 'brightness(0) invert(1)', maxWidth: 180 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <img
              src="/Pioneer-logo.png"
              alt="P"
              style={{ height: 32, width: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = 'P';
                span.style.color = '#e30613';
                span.style.fontWeight = '700';
                span.style.fontSize = '18px';
                el.parentElement?.appendChild(span);
              }}
            />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin 0.2s' }}>
        <Header
          style={{
            background: colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          {/* Left: hamburger */}
          <div style={{ flexShrink: 0 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>

          {/* Center: app name */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Text strong style={{ fontSize: 15, letterSpacing: '-0.2px', color: '#1a1a1a' }}>
              Pioneer OEM Pulse
            </Text>
          </div>

          {/* Right: notifications + user */}
          <div style={{ flexShrink: 0 }}>
            <Space size={16}>
              <Dropdown menu={{ items: notifMenu }} trigger={['click']} placement="bottomRight">
                <Badge count={unreadCount} size="small">
                  <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
                </Badge>
              </Dropdown>

              <Dropdown menu={{ items: userMenu }} trigger={['click']} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar size={32} icon={<UserOutlined />} style={{ background: '#e30613' }} />
                  {!collapsed && <Text>{user?.fullName?.split(' ')[0]}</Text>}
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content style={{ margin: 24, minHeight: 'calc(100vh - 104px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
