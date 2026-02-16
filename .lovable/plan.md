
# Fix: User Creation and Login Flow

## Problem
When the admin creates a new user through the User Management panel, the created user cannot log in with the credentials they were given. This is caused by multiple issues working together.

## Root Causes Identified

1. **Incomplete CORS Headers**: The backend function is missing required headers (`x-supabase-client-platform`, etc.) that the app's client sends. This can cause the request to silently fail on some browsers.

2. **Profile Creation Race Condition**: The backend function tries to UPDATE a profile row, but the automatic profile creation trigger may not have completed yet, causing 0 rows to be updated and the user ending up without proper profile data.

3. **Misleading Password Requirements**: The form says "Min 6 characters" but the backend requires at least 8 characters PLUS an uppercase letter, a lowercase letter, and a number. This mismatch causes validation errors that may not be clearly shown.

4. **Poor Error Handling**: When the backend function returns an error, the app may not properly extract and display the error message, making it seem like creation succeeded when it actually failed.

## Plan

### 1. Fix Backend Function (`supabase/functions/manage-users/index.ts`)
- Update CORS headers to include all required Supabase client headers
- Change profile handling from UPDATE to UPSERT to handle timing issues
- Add a small delay or retry logic for profile creation
- Add better error responses with clear messages

### 2. Fix Frontend User Creation UI (`src/pages/AdminDashboard.tsx`)
- Update password placeholder to show real requirements: "Min 8 chars, uppercase, lowercase, number"
- Improve error handling in `callManageUsers` to properly extract error messages from failed responses
- Add password visibility toggle for the create user and reset password forms
- Show password requirements as helper text below the input

### 3. Fix Frontend Error Handling
- Update `callManageUsers` to handle `FunctionsHttpError` properly by reading the response body
- Show clear, user-friendly error messages when creation fails

## Technical Details

**Edge Function Changes:**
- CORS: Add `x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version` to allowed headers
- Profile: Use `upsert` instead of `update` with `onConflict: 'user_id'` to guarantee the profile row exists
- Add email to profile upsert data since the trigger might set it to empty string

**Frontend Changes:**
- Extract error body from `FunctionsHttpError` using `res.error.context` or by checking `res.data` for error messages
- Add helper text showing password requirements
- Update placeholder text to accurately reflect validation rules
