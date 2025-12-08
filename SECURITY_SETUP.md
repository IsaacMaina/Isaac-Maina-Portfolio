# Security Setup for Isaac Maina Portfolio

## Important Security Information

This document explains the security measures implemented in the Isaac Maina Portfolio application and how to properly set up admin access.

## Authentication Security Measures

1. **No Default Passwords**: The application no longer uses default passwords like "123456" or "admin123"
2. **Environment-Based Passwords**: Admin passwords are generated from environment variables
3. **Password Encryption**: All passwords are hashed with bcrypt using 12 rounds
4. **Secure Form Handling**: Login form prevents browser auto-fill of credentials
5. **Role-Based Access**: Users are assigned appropriate roles (admin, user, manager, viewer)

## Setting Up Admin Access

### Method 1: Environment Variables (Recommended)

Set the following environment variables in your `.env.local` file:

```bash
ADMIN_PASSWORD="your-secure-password-here"
ADMIN_EMAIL="your-admin-email@example.com"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### Method 2: Using the Creation Script

Run the admin creation script which will generate a secure password:

```bash
# If you have NEXTAUTH_SECRET set, it will use the first 12 characters
# Otherwise, it will generate a random secure password
npm run create:admin  # or whatever command runs the create-admin-user.ts script
```

### Method 3: Database Seeding

If you're seeding the database, you can set:

```bash
ADMIN_DEFAULT_PASSWORD="your-secure-password"
# or
DEFAULT_ADMIN_PASSWORD="your-secure-password"
```

## Security Best Practices

1. **Use Strong Passwords**: Always use passwords with:
   - At least 12 characters
   - Mix of uppercase, lowercase, numbers and special characters
   - No common words or patterns

2. **Protect Environment Variables**: 
   - Never commit `.env.local` to version control
   - Use different passwords for development and production
   - Rotate passwords regularly

3. **Secure Your NEXTAUTH_SECRET**:
   - Generate a secure random secret: `openssl rand -base64 32`
   - Keep it confidential and never expose it

4. **Admin Access Considerations**:
   - Do not share admin credentials
   - Use different credentials for different environments
   - Monitor admin access logs

## Form Security Features

The login form includes the following security measures:
- `autoComplete="off"` on the form element
- `autoComplete="username"` for the email field
- `autoComplete="current-password"` for the password field
- No default values are pre-populated
- Password visibility toggle does not store values in the DOM

## Password Recovery

This application does not currently implement password recovery. 
If you lose access to your admin account, you will need to:
1. Directly update the database with a new password hash, or
2. Run the admin creation script again (if the email doesn't already exist), or
3. Re-seed the database (which will reset all data)

## Additional Security Measures

- CSRF protection is enabled
- SQL injection prevention through parameterized queries
- XSS protection with input sanitization
- Rate limiting for authentication attempts
- Security headers on all responses
- File upload validation and security

## Emergency Access

If you're locked out and need to reset admin access:
1. Access your database directly
2. Update the admin user's password field with a new bcrypt hash
3. Or run the create-admin-user script with new credentials in environment variables