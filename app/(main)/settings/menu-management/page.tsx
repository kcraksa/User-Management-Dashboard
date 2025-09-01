'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  message,
} from 'antd';
import {
  listMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  getMenu,
} from '@/lib/menuApi';
import GenericCrudTable from '@/components/GenericCrudTable';
import { MenuItem, MenuCreatePayload } from '@/types/menu';
import { getModuleAccess } from '@/lib/auth';

export default function MenuManagementPage() {
  const [data, setData] = useState<MenuItem[]>([]);
  // loading handled inside GenericCrudTable
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [permissions, setPermissions] = useState<any>({});
  const [form] = Form.useForm<MenuCreatePayload>();

  const fetchData = async () => {
    try {
      const list = await listMenus();
      setData(list?.data ?? list);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to fetch');
    }
  };

  const fetchPermissions = async () => {
    try {
      // backend expects fk_module_id; for menu management module id might be null -> fetch all permissions
      const access = getModuleAccess({ path: window.location.pathname });
      setPermissions(access);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    fetchPermissions();
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

  const openEdit = (row: MenuItem) => {
    setEditing(row);
    setIsViewing(false);
    form.setFieldsValue(row);
    setVisible(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await getMenu(id);
      const itm = res?.data ?? res;
      setEditing(itm);
      setIsViewing(true);
      form.setFieldsValue(itm);
      setVisible(true);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to load detail');
    }
  };

  const onFinish = async (vals: MenuCreatePayload) => {
    try {
      if (editing) {
        await updateMenu(editing.pk_module_id, vals);
        message.success('Updated');
      } else {
        await createMenu(vals);
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
      dataIndex: 'parent_id',
      key: 'parent_id',
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
    <main className="container">
      <div
        className="header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>Menu Management</h2>
        {getModuleAccess({ path: window.location.pathname })?.is_add && (
          <Button type="primary" onClick={openCreate}>
            Create Menu
          </Button>
        )}
      </div>

      <div className="card">
        <GenericCrudTable
          columns={columns}
          api={api}
          permissions={permissions}
          onView={(id: number) => openDetail(id)}
          onEdit={(row: MenuItem) => openEdit(row)}
          rowKey={'pk_module_id'}
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
              ? 'Edit Menu'
              : 'Create Menu'
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
          <Form.Item name="description" label="Description">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="url_view" label="URL View">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="url_create" label="URL Create">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="url_detail" label="URL Detail">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="url_update" label="URL Update">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="url_delete" label="URL Delete">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="url_approval" label="URL Approval">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="url_activation" label="URL Activation">
            <Input disabled={isViewing} />
          </Form.Item>
          <Form.Item name="parent_id" label="Parent">
            <Select disabled={isViewing} allowClear placeholder="Select parent">
              {data?.map((d) => (
                <Select.Option key={d.pk_module_id} value={d.pk_module_id}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="ordering" label="Ordering">
            <Input type="number" disabled={isViewing} />
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
