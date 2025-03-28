# Settings Panel - Profiles Integration

This document explains how the settings panel connects to the Supabase profiles table.

## Features

- Displays the current logged-in user's profile data (full name and email)
- Allows users to edit their profile data
- Provides avatar upload functionality with Supabase storage integration
- Loading states for better UX

## Implementation Details

### Database Schema

The profiles table in Supabase has the following schema:

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text NULL,
  email text NULL,
  avatar_url text NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id)
) TABLESPACE pg_default;
```

### Hooks

1. **useProfile Hook**
   - Located at: `app/hooks/use-profile.ts`
   - Purpose: Fetches and updates user profile data
   - Methods:
     - `fetchProfile()`: Gets the current user's profile data
     - `updateProfile()`: Updates profile data

2. **useImageUpload Hook**
   - Located at: `app/hooks/use-image-upload.ts`
   - Purpose: Handles avatar image uploads and updates
   - Methods:
     - `handleFileChange()`: Processes file uploads and updates profile
     - `handleThumbnailClick()`: Handles UI interaction

### Settings Panel Component

The settings panel in `app/components/settings-panel.tsx` integrates these hooks to:
- Fetch the current user's profile when the panel is opened
- Display the user's full name and email
- Allow editing and saving of profile information
- Handle avatar uploads and display

### Authentication Flow

1. User signs in through the authentication system
2. When the settings panel is opened, it fetches the profile data based on the authenticated user's ID
3. The user can view and edit their profile information
4. Changes are saved to the profiles table in Supabase

## Usage Example

```tsx
// In the parent component that uses the settings panel
import { SettingsPanel } from "@/app/components/settings-panel";

export default function MyPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsSettingsOpen(true)}>
        Open Settings
      </button>
      
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
``` 