#!/bin/bash

# Apply migration script for Supabase
echo "To apply the storage and profiles migration:"
echo ""
echo "1. Go to your Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Navigate to your EzJob project"
echo "3. Go to SQL Editor"
echo "4. Copy and paste the contents of:"
echo "   supabase/migrations/002_create_storage_and_profiles.sql"
echo "5. Click 'RUN' to execute the migration"
echo ""
echo "This will set up:"
echo "- Storage buckets for avatars and documents"
echo "- User profiles table"
echo "- Row Level Security policies"
echo "- Automatic profile creation on user signup"
echo ""
echo "After running the migration, your file upload feature will be ready!"
