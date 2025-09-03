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

    // map to module objects (dedupe by pk_module_id)
    const modules = moduleAccess
      .map((ma: any) => ma.module)
      .filter(Boolean)
      .reduce(
        (acc: Record<number, any>, m: any) => {
          acc[m.pk_module_id] = m;
          return acc;
        },
        {} as Record<number, any>,
      );

    const moduleArray = Object.values(modules) as any[];

    if (moduleArray.length === 0) {
      setDynamicMenuChildren(null);
      return;
    }

    // build parent -> children map
    const byParent: Record<string, any[]> = {};
    for (const m of moduleArray) {
      // normalize parent key as string; treat null/undefined as 'root'
      const parentKey =
        m.fk_parent_id == null ? 'root' : String(m.fk_parent_id);
      if (!byParent[parentKey]) byParent[parentKey] = [];
      byParent[parentKey].push(m);
    }

    // build children entries for Master menu (top-level parents)
    const topLevel = byParent['root'] || [];

    const childrenItems = topLevel.map((m: any) => {
      const childNodes = (byParent[String(m.pk_module_id)] || []).map(
        (c: any) => ({
          key: `mod_${c.pk_module_id}`,
          icon: <TableOutlined />,
          label: c.name,
          onClick: () => router.push(c.url_view || c.url || '/'),
        }),
      );

      // If there are children, render submenu item with children; otherwise direct link
      if (childNodes.length > 0) {
        return {
          key: `mod_${m.pk_module_id}`,
          icon: <TableOutlined />,
          label: m.name,
          children: childNodes,
        };
      }

      return {
        key: `mod_${m.pk_module_id}`,
        icon: <TableOutlined />,
        label: m.name,
        onClick: () => router.push(m.url_view || m.url || '/'),
      };
    });

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
        onClick: () => router.push('/dashboard'),
      },
    ];

    if (dynamicMenuChildren && dynamicMenuChildren.length > 0) {
      base.push(...dynamicMenuChildren);
    }

    base.push(
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        onClick: () => router.push('/profile'),
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    );

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
