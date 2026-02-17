

# Fix: User Creation Failing Silently (Role Not Being Assigned)

## Problem
When the admin creates a new user, the system reports success but the user's **role is never saved**. This is confirmed by the database showing user "pro@orangeflow.sl" with NO role assigned. Without a role, the login flow breaks because the app can't determine where to redirect the user.

## Root Cause
The edge function uses `upsert` with `onConflict: 'user_id'` for the `user_roles` table, but the table's unique constraint is on `(user_id, role)` -- not just `user_id`. PostgreSQL rejects this silently, and the edge function does not check for the error. It returns `{ success: true }` even though the role was never saved.

## Fix

### 1. Edge Function (`supabase/functions/manage-users/index.ts`)

**Role assignment fix (create_user action):**
- Replace the broken `upsert` with a safer pattern: DELETE existing roles for the user, then INSERT the new role
- Add proper error checking on BOTH the profile upsert AND the role insert -- if either fails, throw an error so the admin sees it
- Add console logging for every step so failures are visible in logs

**Same fix for update_user action:**
- The update_user action already uses delete-then-insert, which is correct -- no change needed there

### 2. Fix the Orphaned User
- The user "pro@orangeflow.sl" exists with no role. The edge function fix will prevent this from happening again
- The admin can use the Edit User feature to assign a role to this user, or delete and recreate them

### 3. Improved Error Handling
- Wrap all database operations in proper error checks
- Return detailed error messages so the admin sees exactly what went wrong
- If profile or role creation fails after auth user is created, include the user_id in the error so the admin knows the auth account exists but needs manual role assignment

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/manage-users/index.ts` | Fix role assignment from broken upsert to delete+insert with error checking |

## What This Fixes
- New users will have their roles properly assigned
- Admins will see clear error messages if anything fails
- New users will be able to log in with the credentials the admin gives them
- The login redirect will work correctly because the role will exist

