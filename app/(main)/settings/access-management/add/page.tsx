'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Select, Switch, Space, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { createAccess } from '@/lib/accessApi';
import { listMenus } from '@/lib/menuApi';
import { listRoles } from '@/lib/roleApi';
import { mutate } from 'swr';
import useSWR from 'swr';

export default function AccessAddPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: modules, isLoading: loadingModules } = useSWR(
    ['listMenus'],
    listMenus,
  );
  const { data: roles, isLoading: loadingRoles } = useSWR(
    ['listRoles'],
    listRoles,
  );

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      const created = await createAccess(vals);
      message.success('Created');
      // Add to cache
      mutate(
        ['listAccesses'],
        (current: any) => [...(current || []), created],
        false,
      );
      router.push('/settings/access-management');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Failed');
    }
  };

  const onCancel = () => router.push('/settings/access-management');

  if (loadingModules || loadingRoles) return <Spin />;

  return (
    <GenericFormLayout
      title="Create Access"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Form
          form={form}
          layout="vertical"
          initialValues={{ is_view: true, is_add: false }}
        >
          <Form.Item
            name="fk_module_id"
            label="Module"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select module">
              {Array.isArray(modules)
                ? modules.map((m: any) => (
                    <Select.Option key={m.pk_module_id} value={m.pk_module_id}>
                      {m.name}
                    </Select.Option>
                  ))
                : null}
            </Select>
          </Form.Item>
          <Form.Item
            name="fk_role_id"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select role">
              {Array.isArray(roles)
                ? roles.map((r: any) => (
                    <Select.Option key={r.pk_role_id} value={r.pk_role_id}>
                      {r.name}
                    </Select.Option>
                  ))
                : null}
            </Select>
          </Form.Item>

          <Form.Item label="Permissions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Form.Item name="is_view" valuePropName="checked" noStyle>
                  <Switch defaultChecked /> View
                </Form.Item>
                <Form.Item name="is_add" valuePropName="checked" noStyle>
                  <Switch /> Add
                </Form.Item>
                <Form.Item name="is_detail" valuePropName="checked" noStyle>
                  <Switch /> Detail
                </Form.Item>
                <Form.Item name="is_update" valuePropName="checked" noStyle>
                  <Switch /> Update
                </Form.Item>
                <Form.Item name="is_delete" valuePropName="checked" noStyle>
                  <Switch /> Delete
                </Form.Item>
                <Form.Item name="is_approval" valuePropName="checked" noStyle>
                  <Switch /> Approval
                </Form.Item>
                <Form.Item name="is_activation" valuePropName="checked" noStyle>
                  <Switch /> Activation
                </Form.Item>
              </Space>
            </Space>
          </Form.Item>
        </Form>
      }
    />
  );
}
