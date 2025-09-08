'use client';
import { Layout, Menu, Typography, Button, Avatar, Dropdown } from 'antd';
import {
  UserOutlined,
  TableOutlined,
  PieChartOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAuthPayload } from '@/lib/auth';

const { Header, Sider, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const [dynamicMenuChildren, setDynamicMenuChildren] = useState<any[] | null>(
    null,
  );

  useEffect(() => {
    // read modules from cookie-based auth payload
    const payload = getAuthPayload();
    const moduleAccess = payload?.user?.module_access ?? [];

    if (!Array.isArray(moduleAccess) || moduleAccess.length === 0) {
      setDynamicMenuChildren(null);
      return;
    }

    // Function to build menu items from tree structure
    const buildMenuItems = (modules: any[]): any[] => {
      return modules.map((module: any) => {
        const hasChildren = module.children && module.children.length > 0;
        const menuItem: any = {
          key: `mod_${module.pk_module_id}`,
          icon: <TableOutlined />,
          label: module.name,
          style: { color: '#fff' },
        };

        if (hasChildren) {
          menuItem.children = buildMenuItems(module.children);
        } else {
          menuItem.onClick = () => router.push(module.url || '/');
        }

        return menuItem;
      });
    };

    const childrenItems = buildMenuItems(moduleAccess);
    setDynamicMenuChildren(childrenItems);
  }, [router]);

  const handleLogout = React.useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  // build final menu items: static entries + dynamic modules
  const menuItems = React.useMemo(() => {
    const base: any[] = [
      {
        key: 'dashboard',
        icon: <PieChartOutlined />,
        label: 'Dashboard',
        style: { color: '#fff' },
        onClick: () => router.push('/dashboard'),
      },
    ];

    if (dynamicMenuChildren && dynamicMenuChildren.length > 0) {
      base.push(...dynamicMenuChildren);
    }

    base.push({
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      style: { color: '#fff' },
      onClick: handleLogout,
    });

    return base;
  }, [dynamicMenuChildren, router, handleLogout]);

  const profileMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Profile',
          onClick: () => router.push('/profile'),
        },
        {
          key: 'signout',
          icon: <LogoutOutlined />,
          label: 'Sign Out',
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: 'linear-gradient(135deg, #1976D2 80%, #FFC107 100%)',
        }}
      >
        <div
          style={{
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingLeft: collapsed ? 0 : 20,
            transition: 'all 0.2s',
            gap: collapsed ? 0 : 16,
          }}
        >
          <Image
            src={'/images/front-trans.png'}
            alt="Logo"
            width={48}
            height={48}
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)',
              background: '#fff',
            }}
          />
          {!collapsed && (
            <div style={{ marginLeft: 8 }}>
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                  color: '#fff',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontSize: 18,
                }}
              >
                Gunanusa
              </Typography.Title>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          // make submenu background transparent so child menu matches Sider gradient
          style={
            {
              background: 'transparent',
              // Ant Design CSS variables for submenu backgrounds
              // Type assertion to allow custom CSS properties
              ['--ant-menu-dark-submenu-bg' as any]: 'transparent',
              ['--ant-menu-submenu-bg' as any]: 'transparent',
            } as React.CSSProperties
          }
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
              style={{ fontSize: 20 }}
            />
            <Typography.Title level={3} style={{ margin: 0, color: '#1976D2' }}>
              Access Management System Dashboard
            </Typography.Title>
          </div>
          <Dropdown
            overlay={profileMenu}
            trigger={['click']}
            placement="bottomRight"
          >
            <Avatar
              style={{
                backgroundColor: '#FFC107',
                color: '#1976D2',
                cursor: 'pointer',
                fontWeight: 700,
              }}
              icon={<UserOutlined />}
              size="large"
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', minHeight: 280 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
