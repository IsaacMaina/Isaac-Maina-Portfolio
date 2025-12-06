import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authConfig';
import { createClient } from '@supabase/supabase-js';
import { getDb } from '@/lib/db-connector';
import { users, userProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - adding debug logging for App Router API route
    console.log('Account GET request - checking session...');
    const session = await getServerSession(authOptions);

    console.log('Account GET - Session retrieved:', !!session, 'User:', session?.user?.email);

    if (!session || !session?.user) {
      console.error('Account GET - Authentication failed: No session or user found');
      console.error('Account GET - Session object:', session);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Get user info from both Supabase Auth and the application database
    // First, fetch from the application database
    const dbUser = await db.select().from(users).where(eq(users.id, Number(session.user.id))).limit(1);

    if (dbUser.length === 0) {
      return Response.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Also try to fetch profile information
    let profile = null;
    try {
      const profileResult = await db.select().from(userProfiles).where(eq(userProfiles.userId, Number(session.user.id))).limit(1);
      if (profileResult.length > 0) {
        profile = profileResult[0];
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

    // Combine the information from both sources
    return Response.json({
      user: {
        id: session.user.id,
        name: profile?.name || dbUser[0].name || session.user.name,
        email: dbUser[0].email || session.user.email,
        role: dbUser[0].role,
        createdAt: dbUser[0].createdAt,
        updatedAt: dbUser[0].updatedAt,
        // Include profile fields if they exist
        profile: profile
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Debug logging to understand the auth issue
    console.log('Incoming request headers:', Object.fromEntries(request.headers.entries()));

    // Verify authentication - using NextAuth's approach for App Router API routes
    const session = await getServerSession(authOptions);

    console.log('Session retrieved:', !!session, 'User:', session?.user?.email);

    if (!session || !session?.user) {
      console.error('Authentication failed: No session or user found');
      console.error('Session object:', session);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { field, value, currentPassword } = body;

    // Validate field and value
    if (!field || value === undefined) {
      return Response.json({ error: 'Field and value are required' }, { status: 400 });
    }

    if (!['name', 'email', 'password'].includes(field)) {
      return Response.json({ error: 'Invalid field specified' }, { status: 400 });
    }

    const db = getDb();

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (field === 'password') {
      // For password update, we need to verify the current password first
      if (!currentPassword) {
        return Response.json({ error: 'Current password is required to update password' }, { status: 400 });
      }

      // Verify the current password by attempting to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email || '',
        password: currentPassword
      });

      if (signInError) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Strong password validation
      if (value.length < 8) {
        return Response.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
      }

      // Check for password strength
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return Response.json({ error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }, { status: 400 });
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: value
      });

      if (updateError) {
        // If there was an error, sign the user back in with the old password to restore their session
        await supabase.auth.signInWithPassword({
          email: session.user.email || '',
          password: currentPassword
        });
        return Response.json({ error: updateError.message || 'Failed to update password' }, { status: 500 });
      }

      return Response.json({ message: 'Password updated successfully' });
    } else if (field === 'email') {
      // For email update
      // Strong email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        return Response.json({ error: 'Invalid email format' }, { status: 400 });
      }

      // Check for common disposable email providers
      const disposableDomains = [
        '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'temp-mail.org',
        'sharklasers.com', 'trashmail.com', 'yopmail.com', 'tempmail.com'
      ];

      const domain = value.split('@')[1].toLowerCase();
      if (disposableDomains.includes(domain)) {
        return Response.json({ error: 'Disposable email addresses are not allowed' }, { status: 400 });
      }

      // Update email using Supabase Auth
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({
        email: value
      });

      if (updateError) {
        return Response.json({ error: updateError.message || 'Failed to update email' }, { status: 500 });
      }

      // Update the email in the application database as well
      try {
        await db.update(users).set({ email: value, updatedAt: new Date() }).where(eq(users.id, Number(session.user.id)));
      } catch (dbError) {
        console.error('Error updating email in database:', dbError);
        // Don't fail the request if database update fails, but log the error
      }

      return Response.json({
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.user_metadata?.name
        },
        message: 'Email updated successfully'
      });
    } else if (field === 'name') {
      // For name update, update the user metadata
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({
        data: {
          name: value
        }
      });

      if (updateError) {
        return Response.json({ error: updateError.message || 'Failed to update name' }, { status: 500 });
      }

      // Update the name in both the users and userProfiles tables
      try {
        // Update in users table
        await db.update(users).set({ name: value, updatedAt: new Date() }).where(eq(users.id, Number(session.user.id)));

        // Check if a user profile exists, and update or create accordingly
        const profileExists = await db.select().from(userProfiles).where(eq(userProfiles.userId, Number(session.user.id))).limit(1);
        if (profileExists.length > 0) {
          // Update existing profile
          await db.update(userProfiles).set({ name: value, updatedAt: new Date() }).where(eq(userProfiles.userId, Number(session.user.id)));
        } else {
          // Create new profile if it doesn't exist
          await db.insert(userProfiles).values({
            userId: Number(session.user.id),
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
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.user_metadata?.name
        },
        message: 'Name updated successfully'
      });
    }

    return Response.json({ error: 'Invalid field specified' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user data:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}