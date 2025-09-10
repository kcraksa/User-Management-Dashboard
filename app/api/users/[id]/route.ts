import { NextRequest, NextResponse } from 'next/server';

// Mock data for users (same as in route.ts)
let users = [
  {
    pk_user_id: 1,
    username: 'admin',
    email: 'admin@example.com',
    name: 'Administrator',
    role: 'Admin',
    active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    pk_user_id: 2,
    username: 'user1',
    email: 'user1@example.com',
    name: 'User One',
    role: 'User',
    active: true,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const user = users.find((u) => u.pk_user_id === id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await request.json();
  const index = users.findIndex((u) => u.pk_user_id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  users[index] = { ...users[index], ...body, updated_at: new Date().toISOString() };
  return NextResponse.json(users[index]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const index = users.findIndex((u) => u.pk_user_id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const deletedUser = users.splice(index, 1)[0];
  return NextResponse.json(deletedUser);
}
