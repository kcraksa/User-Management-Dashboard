'use client';

import { useRouter, useParams } from 'next/navigation';
import { Form, Input, Button, Switch, Select, message } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getUser, updateUser } from '@/lib/userApi';
import { listRoles } from '@/lib/roleApi';
import { User } from '@/types/user';
import useSWR from 'swr';
import { useEffect } from 'react';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const [form] = Form.useForm();

  const {
    data: user,
    error,
    isLoading,
  } = useSWR(['getUser', id], () => getUser(id));
  const { data: roles } = useSWR('roles', () => listRoles());

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        fk_role_id:
          user.roles && user.roles.length > 0
            ? user.roles[0].pk_role_id
            : undefined,
      });
    }
  }, [user, form]);

  const onFinish = async (values: Partial<User>) => {
    try {
      await updateUser(id, values);
      message.success('User updated successfully');
      router.push('/settings/user-management');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update user');
    }
  };

  const onCancel = () => router.push('/settings/user-management');

  // Validate ID after hooks
  if (!id || isNaN(id)) {
    return <div>Invalid user ID</div>;
  }

  if (error) {
    return (
      <div>
        Error loading user: {error?.response?.data?.message || error.message}
      </div>
    );
  }

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <GenericFormLayout
      title="Edit User"
      onCancel={onCancel}
      form={
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="full_name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Role"
            name="fk_role_id"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role" loading={!roles}>
              {roles?.map((role: any) => (
                <Select.Option key={role.pk_role_id} value={role.pk_role_id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
}
