import { NextRequest, NextResponse } from 'next/server';

// Mock data for users
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const per_page = parseInt(searchParams.get('per_page') || '10');

  const start = (page - 1) * per_page;
  const end = start + per_page;
  const paginatedUsers = users.slice(start, end);

  return NextResponse.json({
    data: paginatedUsers,
    total: users.length,
    page,
    per_page,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newUser = {
    pk_user_id: users.length + 1,
    ...body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}
