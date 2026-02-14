import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const users = [
  { email: 'admin@orangeflow.sl', password: 'admin123', full_name: 'Admin User', role: 'project_team', department: 'Project Management' },
  { email: 'admin2@orangeflow.sl', password: 'admin123', full_name: 'Sarah Johnson', role: 'project_team', department: 'Project Management' },
  { email: 'planning@orangeflow.sl', password: 'planning123', full_name: 'James Kamara', role: 'planning_team', department: 'Network Planning' },
  { email: 'planning2@orangeflow.sl', password: 'planning123', full_name: 'Fatmata Sesay', role: 'planning_team', department: 'Network Planning' },
  { email: 'procurement@orangeflow.sl', password: 'procurement123', full_name: 'Mohamed Bangura', role: 'procurement_team', department: 'Procurement' },
  { email: 'procurement2@orangeflow.sl', password: 'procurement123', full_name: 'Aminata Koroma', role: 'procurement_team', department: 'Procurement' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Require admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: callerRole } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', caller.id).single();
    if (!callerRole || callerRole.role !== 'project_team') {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const u of users) {
      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const exists = existingUsers?.users?.find((eu: any) => eu.email === u.email);
      
      if (exists) {
        results.push({ email: u.email, status: 'already_exists' });
        continue;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });

      if (authError) {
        results.push({ email: u.email, status: 'error', error: authError.message });
        continue;
      }

      // Update profile
      await supabaseAdmin.from('profiles').update({
        full_name: u.full_name,
        department: u.department,
      }).eq('user_id', authData.user.id);

      // Assign role
      await supabaseAdmin.from('user_roles').insert({
        user_id: authData.user.id,
        role: u.role,
      });

      results.push({ email: u.email, status: 'created' });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
