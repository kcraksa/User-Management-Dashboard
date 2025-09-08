'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, Switch, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getMenu, updateMenu, listMenus } from '@/lib/menuApi';
import useSWR, { mutate } from 'swr';

export default function MenuEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: menus } = useSWR(['listMenus'], listMenus);
  const {
    data: menu,
    error,
    isLoading,
  } = useSWR(['getMenu', params.id], ([, id]) => getMenu(Number(id)));

  useEffect(() => {
    if (menu) {
      form.setFieldsValue(menu);
    }
  }, [menu, form]);

  useEffect(() => {
    if (error) {
      message.error(error?.response?.data?.message || 'Failed to fetch menu');
    }
  }, [error]);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      await updateMenu(Number(params.id), vals);
      message.success('Updated');
      // Invalidate and update cache
      mutate(['getMenu', params.id], vals, false);
      router.push('/settings/menu-management');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Failed');
    }
  };

  const onCancel = () => router.push('/settings/menu-management');

  return (
    <GenericFormLayout
      title="Edit Menu"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Spin spinning={isLoading}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input />
            </Form.Item>
            <Form.Item name="url_view" label="URL View">
              <Input />
            </Form.Item>
            <Form.Item name="url_create" label="URL Create">
              <Input />
            </Form.Item>
            <Form.Item name="url_detail" label="URL Detail">
              <Input />
            </Form.Item>
            <Form.Item name="url_update" label="URL Update">
              <Input />
            </Form.Item>
            <Form.Item name="url_delete" label="URL Delete">
              <Input />
            </Form.Item>
            <Form.Item name="url_approval" label="URL Approval">
              <Input />
            </Form.Item>
            <Form.Item name="url_activation" label="URL Activation">
              <Input />
            </Form.Item>
            <Form.Item name="fk_parent_id" label="Parent">
              <Select allowClear placeholder="Select parent">
                {menus?.map((d) => (
                  <Select.Option key={d.pk_module_id} value={d.pk_module_id}>
                    {d.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="ordering" label="Ordering">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Spin>
      }
    />
  );
}
