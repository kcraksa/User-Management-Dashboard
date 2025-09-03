'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Select, Switch, message, Spin } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { createMenu } from '@/lib/menuApi';
import { mutate } from 'swr';
import useSWR from 'swr';

export default function MenuAddPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: menus, isLoading } = useSWR(['listMenus']);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      const created = await createMenu(vals);
      message.success('Created');
      // Add to cache
      mutate(
        ['listMenus'],
        (current: any) => [...(current || []), created],
        false,
      );
      router.push('/settings/menu-management');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e?.message || 'Failed');
    }
  };

  const onCancel = () => router.push('/settings/menu-management');

  if (isLoading) return <Spin />;

  return (
    <GenericFormLayout
      title="Create Menu"
      onSave={onSave}
      onCancel={onCancel}
      form={
        <Form form={form} layout="vertical" initialValues={{ active: true }}>
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
          <Form.Item name="parent_id" label="Parent">
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
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      }
    />
  );
}
