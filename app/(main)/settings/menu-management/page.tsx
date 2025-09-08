'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button, message, Select, Row, Col } from 'antd';
import GenericCrudTable from '@/components/GenericCrudTable';
import GenericListLayout from '@/components/GenericListLayout';
import { listMenus, deleteMenu } from '@/lib/menuApi';
import { MenuItem } from '@/types/menu';
import { getModuleAccess } from '@/lib/auth';
import { preload } from 'swr';
import { useEffect } from 'react';

export default function MenuManagementPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    preload(['listMenus'], listMenus);
  }, []);

  // navigation handlers: use route pages instead of modal
  const goToAdd = () => router.push('/settings/menu-management/add');
  const goToEdit = (id: number) =>
    router.push(`/settings/menu-management/edit/${id}`);
  const goToDetail = (id: number) =>
    router.push(`/settings/menu-management/detail/${id}`);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
    { title: 'URL View', dataIndex: 'url_view', key: 'url_view', width: 200 },
    {
      title: 'URL Create',
      dataIndex: 'url_create',
      key: 'url_create',
      width: 200,
    },
    {
      title: 'URL Detail',
      dataIndex: 'url_detail',
      key: 'url_detail',
      width: 200,
    },
    {
      title: 'Parent',
      dataIndex: 'fk_parent_id',
      key: 'fk_parent_id',
      width: 200,
      render: (v: any) => v ?? '-',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
  ];

  const api = {
    list: listMenus,
    remove: deleteMenu,
  };

  return (
    <GenericListLayout
      title="Menu Management"
      left={
        <div>
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <label style={{ fontWeight: 600 }}>Status</label>
              <Select placeholder="Select status" style={{ width: '100%' }} />
            </Col>

            <Col span={24}>
              <label style={{ fontWeight: 600 }}>Other Component</label>
              <Select placeholder="Select" style={{ width: '100%' }} />
            </Col>

            <Col
              span={24}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                marginTop: 8,
              }}
            >
              <Button type="primary">Search</Button>
              <Button
                onClick={() => {
                  // basic export placeholder: re-use current list fetch and trigger download later
                  // implement server-side export or CSV generation as needed
                  message.info('Export triggered');
                }}
              >
                Export
              </Button>
            </Col>
          </Row>
        </div>
      }
      right={
        <GenericCrudTable
          columns={columns}
          api={api}
          permissions={(getModuleAccess({ path: pathname }) || {}) as any}
          onView={(id: number) => goToDetail(id)}
          onEdit={(row: MenuItem) => goToEdit(row.pk_module_id)}
          rowKey={'pk_module_id'}
          pageSize={15}
        />
      }
      onAdd={getModuleAccess({ path: pathname })?.is_add ? goToAdd : undefined}
      addLabel="Create Menu"
    />
  );
}
