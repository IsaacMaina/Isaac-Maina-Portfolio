# Supabase Image Setup for About Page

This project uses Supabase for image storage. To properly set up profile images:

## Setup Process

### 1. Database Seeding
First, seed the database with the basic information:
```bash
npm run seed
```

### 2. About Page Specific Data
Then, seed the about page specific data:
```bash
npm run seed:about
```

### 3. Upload Profile Image to Supabase
The system expects a profile image to be stored in Supabase. The application is configured to look for `profile-images/img34.png`.

To set up the profile image manually:

1. Go to your Supabase dashboard
2. Navigate to Storage > Images bucket
3. Create a folder called `profile-images`
4. Upload the `img34.png` file from the `public` folder to the `profile-images` folder
5. The file should be accessible at path: `profile-images/img34.png`

### 3 Alternative: Direct Upload Script (if service role key is configured)
If you have the service role key properly configured, you can upload directly using:
```bash
npm run direct-upload:image
```
Note: This requires a valid service role key with storage permissions.

### 4. Images on Home and About Pages
Both the home page (src/app/page.tsx) and about page (src/app/about/page.tsx) now fetch profile images from Supabase storage using the same SupabaseImage component (src/components/SupabaseImage.tsx), ensuring consistent image handling across both pages.

### 5. Update Database with Image Path
Update the database to reference the Supabase-stored image:
```bash
npm run update:profile-path
```

## Running the Application

Once all setup is complete, start the development server:
```bash
npm run dev
```

Visit the about page at `/about` to see the profile information populated from the database and the profile image fetched from Supabase.

## File Structure

- `scripts/seed-about.ts` - Seeds about page specific data (profile, education, experience, certifications)
- `scripts/upload-profile-image.ts` - Updates database with Supabase image path and provides instructions
- `scripts/direct-upload-image.ts` - Direct upload script (requires service role key)
- `src/app/about/page.tsx` - Server component that fetches data and processes Supabase image URLs
- `src/app/about/AboutContentClient.tsx` - Client component that displays the about page content
- `src/lib/image-utils.ts` - Utilities for generating Supabase image URLs
- `src/lib/supabase/storage.ts` - Supabase storage utilities