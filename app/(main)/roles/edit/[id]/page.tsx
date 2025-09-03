'use client';

import React from 'react';
import RoleEditPage from '@/app/(main)/settings/role-management/edit/[id]/page';

export default function RolesEdit({ params }: { params: { id: string } }) {
  return <RoleEditPage params={params} />;
}
