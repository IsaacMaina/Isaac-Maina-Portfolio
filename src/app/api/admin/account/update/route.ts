import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authConfig';
import { createClient } from '@supabase/supabase-js';
import { getDb } from '@/lib/db-connector';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication - using the same approach as home management
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { field, value, currentPassword } = body;

    // Validate field and value
    if (!field || value === undefined) {
      return Response.json({ error: 'Field and value are required' }, { status: 400 });
    }

    if (!['email', 'password', 'name'].includes(field)) {
      return Response.json({ error: 'Invalid field specified' }, { status: 400 });
    }

    const db = getDb();

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (field === 'password') {
      // For password update, we need to verify the current password first
      if (!currentPassword) {
        return Response.json({ error: 'Current password is required to update password' }, { status: 400 });
      }

      // Verify the current password by attempting to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: currentPassword
      });

      if (signInError) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Update the password
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: value
      });

      if (updateError) {
        return Response.json({ error: updateError.message || 'Failed to update password' }, { status: 500 });
      }

      return Response.json({ message: 'Password updated successfully' });
    } else if (field === 'email') {
      // For email update
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return Response.json({ error: 'Invalid email format' }, { status: 400 });
      }

      // Update email using Supabase Auth
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: value
      });

      if (updateError) {
        return Response.json({ error: updateError.message || 'Failed to update email' }, { status: 500 });
      }

      // Update the email in the application database as well
      try {
        const userId = Number(session.user.id);
        if (isNaN(userId)) {
          return Response.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        await db.update(users).set({ email: value, updatedAt: new Date() }).where(eq(users.id, userId));
      } catch (dbError) {
        console.error('Error updating email in database:', dbError);
        // Don't fail the request if database update fails, but log the error
      }

      return Response.json({
        message: 'Email updated successfully',
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      });
    } else if (field === 'name') {
      // For name update, update the user metadata
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          name: value
        }
      });

      if (updateError) {
        return Response.json({ error: updateError.message || 'Failed to update name' }, { status: 500 });
      }

      // Update the name in both the users and userProfiles tables
      try {
        const userId = Number(session.user.id);
        if (isNaN(userId)) {
          return Response.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // Update in users table
        await db.update(users).set({ name: value, updatedAt: new Date() }).where(eq(users.id, userId));

        // Check if a user profile exists, and update or create accordingly
        const profileExists = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
        if (profileExists.length > 0) {
          // Update existing profile
          await db.update(userProfiles).set({ name: value, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
        } else {
          // Create new profile if it doesn't exist
          await db.insert(userProfiles).values({
            userId: userId,
            name: value,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } catch (dbError) {
        console.error('Error updating name in database:', dbError);
        // Don't fail the request if database update fails, but log the error
      }

      return Response.json({
        message: 'Name updated successfully',
        user: {
          id: data.user?.id,
          name: data.user?.user_metadata?.name
        }
      });
    }

    return Response.json({ error: 'Invalid field specified' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}