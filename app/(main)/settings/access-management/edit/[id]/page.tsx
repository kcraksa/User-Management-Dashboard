'use client';

import React, { useEffect, useState } from 'react';
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
  const [permissions, setPermissions] = useState({
    is_view: false,
    is_add: false,
    is_detail: false,
    is_update: false,
    is_delete: false,
    is_approval: false,
    is_activation: false,
  });

  const { data: modules } = useSWR(['listMenus'], listMenus);
  const { data: roles } = useSWR(['listRoles'], listRoles);
  const {
    data: access,
    error,
    isLoading,
  } = useSWR(['getAccess', params.id], ([, id]) => getAccess(Number(id)));

  useEffect(() => {
    if (access) {
      // Ensure all permission fields are boolean values
      const formData = {
        ...access,
        is_view: access.is_view ?? false,
        is_add: access.is_add ?? false,
        is_detail: access.is_detail ?? false,
        is_update: access.is_update ?? false,
        is_delete: access.is_delete ?? false,
        is_approval: access.is_approval ?? false,
        is_activation: access.is_activation ?? false,
      };
      form.setFieldsValue(formData as any);

      // Update local state
      setPermissions({
        is_view: formData.is_view,
        is_add: formData.is_add,
        is_detail: formData.is_detail,
        is_update: formData.is_update,
        is_delete: formData.is_delete,
        is_approval: formData.is_approval,
        is_activation: formData.is_activation,
      });
    }
  }, [access, form]);

  useEffect(() => {
    form.setFieldsValue(permissions);
  }, [form, permissions]);

  useEffect(() => {
    if (error) {
      message.error(error?.response?.data?.message || 'Failed to fetch access');
    }
  }, [error]);

  const handlePermissionChange = (key: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const onSave = async () => {
    try {
      const allValues = form.getFieldsValue();
      console.log('All form values (including switches):', allValues);
      const vals = await form.validateFields();
      console.log('Validated form values:', vals);

      // Merge form values with current permissions state
      const finalValues = {
        ...vals,
        ...permissions,
      };

      console.log('Final values before API call:', finalValues);
      await updateAccess(Number(params.id), finalValues);
      message.success('Updated');
      // Invalidate and update cache
      mutate(['getAccess', params.id], finalValues, false);
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
                    <Switch
                      checked={permissions.is_view}
                      onChange={(checked) =>
                        handlePermissionChange('is_view', checked)
                      }
                    />{' '}
                    View
                  </Form.Item>
                  <Form.Item name="is_add" valuePropName="checked" noStyle>
                    <Switch
                      checked={permissions.is_add}
                      onChange={(checked) =>
                        handlePermissionChange('is_add', checked)
                      }
                    />{' '}
                    Add
                  </Form.Item>
                  <Form.Item name="is_detail" valuePropName="checked" noStyle>
                    <Switch
                      checked={permissions.is_detail}
                      onChange={(checked) =>
                        handlePermissionChange('is_detail', checked)
                      }
                    />{' '}
                    Detail
                  </Form.Item>
                  <Form.Item name="is_update" valuePropName="checked" noStyle>
                    <Switch
                      checked={permissions.is_update}
                      onChange={(checked) =>
                        handlePermissionChange('is_update', checked)
                      }
                    />{' '}
                    Update
                  </Form.Item>
                  <Form.Item name="is_delete" valuePropName="checked" noStyle>
                    <Switch
                      checked={permissions.is_delete}
                      onChange={(checked) =>
                        handlePermissionChange('is_delete', checked)
                      }
                    />{' '}
                    Delete
                  </Form.Item>
                  <Form.Item name="is_approval" valuePropName="checked" noStyle>
                    <Switch
                      checked={permissions.is_approval}
                      onChange={(checked) =>
                        handlePermissionChange('is_approval', checked)
                      }
                    />{' '}
                    Approval
                  </Form.Item>
                  <Form.Item
                    name="is_activation"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch
                      checked={permissions.is_activation}
                      onChange={(checked) =>
                        handlePermissionChange('is_activation', checked)
                      }
                    />{' '}
                    Activation
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
