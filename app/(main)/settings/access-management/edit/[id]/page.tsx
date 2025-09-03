'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Select, Switch, Space, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getAccess, updateAccess } from '@/lib/accessApi';
import { listMenus } from '@/lib/menuApi';
import { listRoles } from '@/lib/roleApi';
import useSWR, { mutate } from 'swr';

export default function AccessEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: modules } = useSWR(['listMenus'], listMenus);
  const { data: roles } = useSWR(['listRoles'], listRoles);
  const {
    data: access,
    error,
    isLoading,
  } = useSWR(['getAccess', params.id], ([, id]) => getAccess(Number(id)));

  useEffect(() => {
    if (access) {
      form.setFieldsValue(access as any);
    }
  }, [access, form]);

  useEffect(() => {
    if (error) {
      message.error(error?.response?.data?.message || 'Failed to fetch access');
    }
  }, [error]);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      await updateAccess(Number(params.id), vals);
      message.success('Updated');
      // Invalidate and update cache
      mutate(['getAccess', params.id], vals, false);
      router.push('/settings/access-management');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Failed');
    }
  };

  const onCancel = () => router.push('/settings/access-management');

  return (
    <GenericFormLayout
      title="Edit Access"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="fk_module_id"
              label="Module"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select module">
                {Array.isArray(modules)
                  ? modules.map((m: any) => (
                      <Select.Option
                        key={m.pk_module_id}
                        value={m.pk_module_id}
                      >
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
                    <Switch /> View
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
                  <Form.Item
                    name="is_activation"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch /> Activation
                  </Form.Item>
                </Space>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      }
    />
  );
}
