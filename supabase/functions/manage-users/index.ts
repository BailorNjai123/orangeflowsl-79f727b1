import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const validRoles = ['planning_team', 'procurement_team', 'project_team'] as const;

const createUserSchema = z.object({
  action: z.literal('create_user'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/\d/, 'Password must contain a number'),
  full_name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(validRoles, { errorMap: () => ({ message: 'Invalid role' }) }),
  department: z.string().max(100, 'Department too long').optional().default(''),
  phone: z.string().max(20, 'Phone too long').optional().default(''),
});

const updateUserSchema = z.object({
  action: z.literal('update_user'),
  user_id: z.string().uuid('Invalid user_id'),
  full_name: z.string().trim().min(1).max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(validRoles).optional(),
});

const toggleActiveSchema = z.object({
  action: z.literal('toggle_active'),
  user_id: z.string().uuid('Invalid user_id'),
  is_active: z.boolean(),
});

const resetPasswordSchema = z.object({
  action: z.literal('reset_password'),
  user_id: z.string().uuid('Invalid user_id'),
  new_password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/\d/, 'Password must contain a number'),
});

const deleteUserSchema = z.object({
  action: z.literal('delete_user'),
  user_id: z.string().uuid('Invalid user_id'),
  reason: z.string().max(500).optional().default(''),
  deleted_by_name: z.string().max(100).optional().default(''),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) throw new Error('Invalid token');

    // Check caller role
    const { data: callerRole } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', caller.id).single();
    if (!callerRole || callerRole.role !== 'project_team') throw new Error('Unauthorized: Admin only');

    const body = await req.json();
    const { action } = body;

    if (action === 'create_user') {
      const validated = createUserSchema.parse(body);

      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: validated.email,
        password: validated.password,
        email_confirm: true,
        user_metadata: { full_name: validated.full_name },
      });
      if (createError) throw createError;

      // Small delay to let the handle_new_user trigger complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Upsert profile to handle race condition with trigger
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        user_id: authData.user.id,
        email: validated.email,
        full_name: validated.full_name,
        department: validated.department,
        phone: validated.phone,
      }, { onConflict: 'user_id' });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
      }

      // Assign role
      await supabaseAdmin.from('user_roles').upsert({
        user_id: authData.user.id,
        role: validated.role,
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ success: true, user_id: authData.user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update_user') {
      const validated = updateUserSchema.parse(body);

      const updates: Record<string, any> = {};
      if (validated.full_name) updates.full_name = validated.full_name;
      if (validated.department !== undefined) updates.department = validated.department;
      if (validated.phone !== undefined) updates.phone = validated.phone;

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from('profiles').update(updates).eq('user_id', validated.user_id);
      }

      if (validated.role) {
        await supabaseAdmin.from('user_roles').delete().eq('user_id', validated.user_id);
        await supabaseAdmin.from('user_roles').insert({ user_id: validated.user_id, role: validated.role });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'toggle_active') {
      const validated = toggleActiveSchema.parse(body);

      await supabaseAdmin.from('profiles').update({ is_active: validated.is_active }).eq('user_id', validated.user_id);
      
      if (validated.is_active) {
        await supabaseAdmin.auth.admin.updateUserById(validated.user_id, { ban_duration: 'none' });
      } else {
        await supabaseAdmin.auth.admin.updateUserById(validated.user_id, { ban_duration: '876600h' });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reset_password') {
      const validated = resetPasswordSchema.parse(body);

      await supabaseAdmin.auth.admin.updateUserById(validated.user_id, { password: validated.new_password });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete_user') {
      const validated = deleteUserSchema.parse(body);

      // Prevent self-deletion
      if (validated.user_id === caller.id) throw new Error('Cannot delete your own account');

      // Fetch user profile and role for archiving
      const [profileRes, roleRes] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('user_id', validated.user_id).single(),
        supabaseAdmin.from('user_roles').select('role').eq('user_id', validated.user_id).single(),
      ]);

      const userProfile = profileRes.data;
      const userRole = roleRes.data;

      if (!userProfile) throw new Error('User profile not found');

      // Archive user data
      await supabaseAdmin.from('deleted_users_archive').insert({
        original_user_id: validated.user_id,
        email: userProfile.email || '',
        full_name: userProfile.full_name || '',
        department: userProfile.department || '',
        phone: userProfile.phone || '',
        role: userRole?.role || '',
        was_active: userProfile.is_active,
        deleted_by: caller.id,
        deleted_by_name: validated.deleted_by_name,
        reason: validated.reason,
      });

      // Delete profile and role (these don't cascade from auth)
      await Promise.all([
        supabaseAdmin.from('profiles').delete().eq('user_id', validated.user_id),
        supabaseAdmin.from('user_roles').delete().eq('user_id', validated.user_id),
      ]);

      // Delete the auth user (this is permanent)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(validated.user_id);
      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true, archived: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Unknown action');
  } catch (error) {
    const status = error instanceof z.ZodError ? 422 : 400;
    const message = error instanceof z.ZodError
      ? error.errors.map(e => e.message).join(', ')
      : error.message;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
