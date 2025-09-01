'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  message,
  Select,
} from 'antd';
import GenericCrudTable from '@/components/GenericCrudTable';
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  getRole,
} from '@/lib/roleApi';
import { listApps } from '@/lib/appApi';
import { RoleItem, RoleCreatePayload } from '@/types/role';
import { getModuleAccess } from '@/lib/auth';

export default function RoleManagementPage() {
  const [data, setData] = useState<RoleItem[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  // permissions not needed locally; module access checked via getModuleAccess() when rendering
  const [form] = Form.useForm<RoleCreatePayload>();

  const fetchData = async () => {
    try {
      const list = await listRoles();
      setData(list?.data ?? list);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to fetch');
    }
  };

  const fetchMeta = async () => {
    try {
      const a = await listApps();
      const items = a?.data ?? a;
      setApps(items);
      return items;
    } catch (e) {
      // ignore
      return [];
    }
  };

  useEffect(() => {
    fetchData();
    fetchMeta();
  }, []);

  // if modal opened for create and only one app exists, auto-select it
  useEffect(() => {
    if (visible && !editing) {
      const current = form.getFieldValue('fk_apps_id');
      if (!current && apps && apps.length === 1) {
        form.setFieldsValue({ fk_apps_id: apps[0].pk_apps_id });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, apps, editing]);

  const openCreate = async () => {
    const access = getModuleAccess({ path: window.location.pathname });
    if (!access?.is_add) {
      message.error('No permission to add');
      return;
    }
    // ensure apps list available
    let availableApps = apps;
    if (!availableApps || availableApps.length === 0) {
      availableApps = await fetchMeta();
    }
    setEditing(null);
    setIsViewing(false);
    form.resetFields();
    // preselect first app if available to avoid required validation confusion
    if (
      availableApps &&
      availableApps.length > 0 &&
      availableApps[0]?.pk_apps_id != null
    ) {
      form.setFieldsValue({ fk_apps_id: availableApps[0].pk_apps_id });
    }
    setVisible(true);
  };

  const openEdit = (row: RoleItem) => {
    setEditing(row);
    setIsViewing(false);
    // coerce fk_apps_id to number if present
    const values = { ...(row as any) };
    // prefer explicit fk_apps_id, otherwise try nested app or first available app
    const fkCandidate =
      values.fk_apps_id ??
      values.app?.pk_apps_id ??
      (apps && apps.length > 0 ? apps[0].pk_apps_id : undefined);
    if (fkCandidate != null) {
      const fkNum = Number.isFinite(Number(fkCandidate))
        ? Number(fkCandidate)
        : parseInt(String(fkCandidate || ''), 10);
      values.fk_apps_id = Number.isNaN(fkNum) ? undefined : fkNum;
    }
    form.setFieldsValue(values as any);
    setVisible(true);
  };

  const openDetail = async (id: number) => {
    try {
      const res = await getRole(id);
      const itm = res?.data ?? res;
      // ensure fk_apps_id present for display
      const fkCandidate =
        itm.fk_apps_id ??
        itm.app?.pk_apps_id ??
        (apps && apps.length > 0 ? apps[0].pk_apps_id : undefined);
      if (fkCandidate != null) {
        const fkNum = Number.isFinite(Number(fkCandidate))
          ? Number(fkCandidate)
          : parseInt(String(fkCandidate || ''), 10);
        itm.fk_apps_id = Number.isNaN(fkNum) ? undefined : fkNum;
      }
      setEditing(itm);
      setIsViewing(true);
      form.setFieldsValue(itm as any);
      setVisible(true);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to load detail');
    }
  };

  const onFinish = async (vals: any) => {
    console.log(vals);
    try {
      // ensure fk_apps_id is numeric before sending; fallback to first app if missing
      const payload: any = { ...(vals as any) };
      if (
        (payload.fk_apps_id == null || payload.fk_apps_id === '') &&
        apps &&
        apps.length > 0 &&
        apps[0]?.pk_apps_id != null
      ) {
        payload.fk_apps_id = apps[0].pk_apps_id;
      }
      if (payload.fk_apps_id != null && payload.fk_apps_id !== '') {
        const fkNum = Number.isFinite(Number(payload.fk_apps_id))
          ? Number(payload.fk_apps_id)
          : parseInt(String(payload.fk_apps_id || ''), 10);
        payload.fk_apps_id = Number.isNaN(fkNum) ? null : fkNum;
      } else {
        payload.fk_apps_id = null;
      }

      if (editing) {
        await updateRole(editing.pk_role_id, payload);
        message.success('Updated');
      } else {
        await createRole(payload);
        message.success('Created');
      }
      setVisible(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const columns = [
    {
      title: 'App',
      dataIndex: ['app', 'name'],
      key: 'app',
      width: 200,
      render: (_: any, r: any) => r.app?.name ?? r.fk_apps_id ?? '-',
    },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 250 },
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

  const api = { list: listRoles, remove: deleteRole };

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
        <h2>Role Management</h2>
        {getModuleAccess({ path: window.location.pathname })?.is_add && (
          <Button type="primary" onClick={openCreate}>
            Create Role
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
          onEdit={(row: RoleItem) => openEdit(row)}
          rowKey={'pk_role_id'}
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
              ? 'Edit Role'
              : 'Create Role'
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
          <Form.Item
            name="fk_apps_id"
            label="App"
            rules={[{ required: true, message: 'Please select an app' }]}
          >
            <Select disabled={isViewing} placeholder="Select app">
              {apps?.map((a) => (
                <Select.Option key={String(a.pk_apps_id)} value={a.pk_apps_id}>
                  {a.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
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
