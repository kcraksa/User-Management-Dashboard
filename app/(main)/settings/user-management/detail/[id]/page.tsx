'use client';

import { Descriptions, Button } from 'antd';
import GenericFormLayout from '@/components/GenericFormLayout';
import { getUser } from '@/lib/userApi';
import useSWR from 'swr';
import { useRouter, useParams } from 'next/navigation';

export default function DetailUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const {
    data: user,
    error,
    isLoading,
  } = useSWR(['getUser', id], () => getUser(id));

  const onEdit = () => router.push(`/settings/user-management/edit/${id}`);
  const onCancel = () => router.push('/settings/user-management');

  // Validate ID
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
      title="User Detail"
      onCancel={onCancel}
      form={
        <div>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Username">
              {user.username}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Name">{user.full_name}</Descriptions.Item>
            <Descriptions.Item label="Role">
              {user.roles && user.roles.length > 0
                ? user.roles.map((role: any) => role.name).join(', ')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Active">
              {user.active ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(user.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(user.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={onEdit}>
              Edit
            </Button>
          </div>
        </div>
      }
    />
  );
}
