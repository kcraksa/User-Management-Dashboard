'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Switch, Space, message } from 'antd';
import GenericCrudTable from '@/components/GenericCrudTable';
import {
  listApps,
  createApp,
  updateApp,
  deleteApp,
  getApp,
} from '@/lib/appApi';
import { AppItem, AppCreatePayload } from '@/types/app';
import { getModuleAccess } from '@/lib/auth';

export default function AppManagementPage() {
  const [data, setData] = useState<AppItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<AppItem | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [form] = Form.useForm<AppCreatePayload>();

  const fetchData = async () => {
    try {
      const list = await listApps();
      setData(list?.data ?? list);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to fetch');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    const access = getModuleAccess({ path: window.location.pathname });
    if (!access?.is_add) {
      message.error('No permission to add');
      return;
    }
    setEditing(null);
    setIsViewing(false);
    form.resetFields();
    setVisible(true);
  };

  const openEdit = (row: AppItem) => {
    setEditing(row);
    setIsViewing(false);
    form.setFieldsValue(row as any);
    setVisible(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await getApp(id);
      const itm = res?.data ?? res;
      setEditing(itm);
      setIsViewing(true);
      form.setFieldsValue(itm as any);
      setVisible(true);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to load detail');
    }
  };

  const onFinish = async (vals: AppCreatePayload) => {
    try {
      if (editing) {
        await updateApp(editing.pk_app_id, vals);
        message.success('Updated');
      } else {
        await createApp(vals);
        message.success('Created');
      }
      setVisible(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
    { title: 'Key', dataIndex: 'key', key: 'key', width: 200 },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
  ];

  const api = { list: listApps, remove: deleteApp };

  return (
    <main className="container">
      <div
        className="header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>App Management</h2>
        {getModuleAccess({ path: window.location.pathname })?.is_add && (
          <Button type="primary" onClick={openCreate}>
            Create App
          </Button>
        )}
      </div>

      <div className="card">
        <GenericCrudTable
          columns={columns}
          api={api}
          permissions={
            getModuleAccess({ path: window.location.pathname }) || {}
          }
          onView={(id: number) => openDetail(id)}
          onEdit={(row: AppItem) => openEdit(row)}
          rowKey={'pk_app_id'}
          pageSize={15}
          refreshKey={data?.length}
        />
      </div>

      <Modal
        open={visible}
        title={
          isViewing
            ? `Detail: ${editing?.name ?? ''}`
            : editing
              ? 'Edit App'
              : 'Create App'
        }
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ active: true }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch disabled={isViewing} />
          </Form.Item>
          <Form.Item>
            <Space>
              {!isViewing && (
                <Button htmlType="submit" type="primary">
                  Save
                </Button>
              )}
              <Button onClick={() => setVisible(false)}>
                {isViewing ? 'Close' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
