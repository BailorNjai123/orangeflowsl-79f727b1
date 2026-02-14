import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      const { email, password, full_name, role, department, phone } = body;
      if (!email || !password || !full_name || !role) throw new Error('Missing required fields');

      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (createError) throw createError;

      // Update profile
      await supabaseAdmin.from('profiles').update({
        full_name,
        department: department || '',
        phone: phone || '',
      }).eq('user_id', authData.user.id);

      // Assign role
      await supabaseAdmin.from('user_roles').insert({
        user_id: authData.user.id,
        role,
      });

      return new Response(JSON.stringify({ success: true, user_id: authData.user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update_user') {
      const { user_id, full_name, department, phone, role } = body;
      if (!user_id) throw new Error('Missing user_id');

      const updates: Record<string, any> = {};
      if (full_name) updates.full_name = full_name;
      if (department !== undefined) updates.department = department;
      if (phone !== undefined) updates.phone = phone;

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from('profiles').update(updates).eq('user_id', user_id);
      }

      if (role) {
        // Update role - delete old and insert new
        await supabaseAdmin.from('user_roles').delete().eq('user_id', user_id);
        await supabaseAdmin.from('user_roles').insert({ user_id, role });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'toggle_active') {
      const { user_id, is_active } = body;
      if (!user_id) throw new Error('Missing user_id');

      await supabaseAdmin.from('profiles').update({ is_active }).eq('user_id', user_id);
      
      // Also ban/unban in auth
      if (is_active) {
        await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: 'none' });
      } else {
        await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: '876600h' }); // ~100 years
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reset_password') {
      const { user_id, new_password } = body;
      if (!user_id || !new_password) throw new Error('Missing fields');

      await supabaseAdmin.auth.admin.updateUserById(user_id, { password: new_password });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Unknown action');
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
