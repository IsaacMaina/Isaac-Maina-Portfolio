import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { getDb } from '@/lib/db-connector';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { hash } from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching users - Authentication check starting');

    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('Authentication failed: No session or user');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session user ID:', session.user.id, 'Type:', typeof session.user.id);

    // Check if user has admin privileges
    const db = getDb();
    console.log('Database connection established');

    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, parseInt(session.user.id as string)))
      .limit(1);

    console.log('Current user query result:', currentUser);

    if (currentUser.length === 0) {
      console.log('User not found in database');
      return Response.json({ error: 'Forbidden: User not found' }, { status: 403 });
    }

    if (currentUser[0].role !== 'admin' && currentUser[0].role !== 'manager') {
      console.log('User does not have admin/manager role:', currentUser[0].role);
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Admin check passed, fetching all users');

    // Fetch all users (excluding password for security)
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .orderBy(desc(users.id));

    console.log('Users fetched successfully:', allUsers.length);

    return Response.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Updating user - Authentication check starting');

    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('Authentication failed: No session or user');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session user ID:', session.user.id, 'Type:', typeof session.user.id);

    // Check if user has admin privileges
    const db = getDb();
    console.log('Database connection established');

    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, parseInt(session.user.id as string)))
      .limit(1);

    console.log('Current user query result:', currentUser);

    if (currentUser.length === 0) {
      console.log('User not found in database');
      return Response.json({ error: 'Forbidden: User not found' }, { status: 403 });
    }

    if (currentUser[0].role !== 'admin' && currentUser[0].role !== 'manager') {
      console.log('User does not have admin/manager role:', currentUser[0].role);
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Extract user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('id');

    console.log('User ID from query params:', userIdParam);

    if (!userIdParam) {
      return Response.json({ error: 'User ID parameter is missing' }, { status: 400 });
    }

    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      return Response.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Verify that the user being updated exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Prepare the update data
    const updateData: {
      email?: string;
      password?: string;
      role?: string;
      updatedAt?: Date;
    } = {
      updatedAt: new Date()
    };

    // Only update email if provided
    if (body.email) {
      updateData.email = body.email;
    }

    // Only update password if provided (and hash it)
    if (body.password) {
      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await hash(body.password, saltRounds);
      updateData.password = hashedPassword;
    }

    // Only update role if provided
    if (body.role) {
      updateData.role = body.role;
    }

    // Update the user
    const updatedUsers = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    if (updatedUsers.length === 0) {
      return Response.json({ error: 'Failed to update user' }, { status: 500 });
    }

    console.log('User updated successfully:', updatedUsers[0]);

    return Response.json({
      message: 'User updated successfully',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}