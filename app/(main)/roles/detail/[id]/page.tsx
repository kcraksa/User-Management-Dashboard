'use client';

import React from 'react';
import RoleDetailPage from '@/app/(main)/settings/role-management/detail/[id]/page';

export default function RolesDetail({ params }: { params: { id: string } }) {
  return <RoleDetailPage params={params} />;
}
