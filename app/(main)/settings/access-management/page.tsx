'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, Form, Select, Switch, Space, message } from 'antd';
import GenericCrudTable from '@/components/GenericCrudTable';
import {
  listAccess,
  createAccess,
  updateAccess,
  deleteAccess,
  getAccess,
} from '@/lib/accessApi';
import { AccessItem, AccessCreatePayload } from '@/types/access';
import { listMenus } from '@/lib/menuApi';
import { listRoles } from '@/lib/roleApi';
import { getModuleAccess } from '@/lib/auth';

export default function AccessManagementPage() {
  const [data, setData] = useState<AccessItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<AccessItem | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [form] = Form.useForm<AccessCreatePayload>();

  const fetchData = async () => {
    try {
      const list = await listAccess();
      setData(list?.data ?? list);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to fetch');
    }
  };

  const fetchMeta = async () => {
    try {
      const m = await listMenus();
      setModules(m?.data ?? m);
      const r = await listRoles();
      setRoles(r?.data ?? r);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    fetchMeta();
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

  const openEdit = (row: AccessItem) => {
    setEditing(row);
    setIsViewing(false);
    form.setFieldsValue(row as any);
    setVisible(true);
  };
  const openDetail = async (id: number) => {
    try {
      const res = await getAccess(id);
      const itm = res?.data ?? res;
      setEditing(itm);
      setIsViewing(true);
      form.setFieldsValue(itm as any);
      setVisible(true);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load detail');
    }
  };

  const onFinish = async (vals: AccessCreatePayload) => {
    try {
      if (editing) {
        await updateAccess((editing as any).pk_access_id, vals);
        message.success('Updated');
      } else {
        await createAccess(vals);
        message.success('Created');
      }
      setVisible(false);
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    {
      title: 'Module',
      dataIndex: ['module', 'name'],
      key: 'module',
      width: 250,
      render: (_: any, r: any) => r.module?.name ?? '-',
    },
    {
      title: 'Role',
      dataIndex: 'fk_role_id',
      key: 'fk_role_id',
      width: 200,
      render: (v: any) => roles.find((x: any) => x.pk_role_id === v)?.name ?? v,
    },
    {
      title: 'View',
      dataIndex: 'is_view',
      key: 'is_view',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Add',
      dataIndex: 'is_add',
      key: 'is_add',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Detail',
      dataIndex: 'is_detail',
      key: 'is_detail',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Update',
      dataIndex: 'is_update',
      key: 'is_update',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Delete',
      dataIndex: 'is_delete',
      key: 'is_delete',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Approval',
      dataIndex: 'is_approval',
      key: 'is_approval',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
    {
      title: 'Activation',
      dataIndex: 'is_activation',
      key: 'is_activation',
      render: (v: any) => (v ? 'Yes' : 'No'),
    },
  ];

  const api = { list: listAccess, remove: deleteAccess };

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
        <h2>Access Management</h2>
        {getModuleAccess({ path: window.location.pathname })?.is_add && (
          <Button type="primary" onClick={openCreate}>
            Create Access
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
          onEdit={(row: AccessItem) => openEdit(row)}
          rowKey={'pk_access_id'}
          pageSize={20}
          refreshKey={data?.length}
        />
      </div>

      <Modal
        open={visible}
        title={
          isViewing
            ? `Detail Access`
            : editing
              ? 'Edit Access'
              : 'Create Access'
        }
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ is_view: true, is_add: false }}
        >
          <Form.Item
            name="fk_module_id"
            label="Module"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select module" disabled={isViewing}>
              {modules?.map((m: any) => (
                <Select.Option key={m.pk_module_id} value={m.pk_module_id}>
                  {m.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="fk_role_id"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select role" disabled={isViewing}>
              {roles?.map((r: any) => (
                <Select.Option key={r.pk_role_id} value={r.pk_role_id}>
                  {r.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Permissions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Form.Item name="is_view" valuePropName="checked" noStyle>
                  <Switch disabled={isViewing} /> View
                </Form.Item>
                <Form.Item name="is_add" valuePropName="checked" noStyle>
                  <Switch disabled={isViewing} /> Add
                </Form.Item>
                <Form.Item name="is_detail" valuePropName="checked" noStyle>
                  <Switch disabled={isViewing} /> Detail
                </Form.Item>
                <Form.Item name="is_update" valuePropName="checked" noStyle>
                  <Switch disabled={isViewing} /> Update
                </Form.Item>
                <Form.Item name="is_delete" valuePropName="checked" noStyle>
                  <Switch disabled={isViewing} /> Delete
                </Form.Item>
                <Form.Item name="is_approval" valuePropName="checked" noStyle>
                  <Switch disabled={isViewing} /> Approval
                </Form.Item>
                <Form.Item name="is_activation" valuePropName="checked" noStyle>
                  <Switch disabled={isViewing} /> Activation
                </Form.Item>
              </Space>
            </Space>
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
