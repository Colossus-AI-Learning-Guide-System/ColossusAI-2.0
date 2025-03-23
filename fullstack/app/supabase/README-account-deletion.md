# Account Deletion Functionality

This document explains how to configure the account deletion feature for the application.

## Overview

The account deletion functionality allows users to completely remove their account and all associated data from the system. This process includes:

1. Deleting all user data from storage
2. Removing the user's profile information
3. Deleting the user's authentication record
4. Signing out the user from all devices

## Setup Steps

### 1. Apply SQL Migrations

Run the SQL migration file `20240325_account_deletion.sql` in your Supabase project SQL editor. This adds the necessary Row Level Security (RLS) policies to allow users to delete their own data.

### 2. Configure Supabase Auth Admin API

For the account deletion to work properly, your server needs to have permission to call the Supabase Auth Admin API. Follow these steps:

1. Navigate to your Supabase project dashboard
2. Go to Project Settings > API
3. Under "Auth Settings," make sure "Enable the JWT verification API" is checked
4. Generate a service role key if you don't already have one
5. Add your service role key to your environment variables:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Update Server Action Client Initialization

In the `app/actions/user.ts` file, make sure the Supabase client initialization includes the service role key:

```typescript
const supabase = createServerActionClient({ 
  cookies,
  options: {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  },
})
```

## Important Security Considerations

- Never expose the service role key to the client-side
- Always perform account deletion from server-side code
- Implement a confirmation process to prevent accidental account deletion
- Consider adding a cooldown period or email verification before actual deletion

## Testing

To test the account deletion functionality:

1. Create a test user account
2. Upload some files and add profile information
3. Go to the Security tab in the settings panel
4. Click the "Delete Account" button and confirm
5. Verify that you're redirected to the sign-in page
6. Try to log in with the deleted account credentials (should fail)
7. Check your database to confirm all user data has been removed 