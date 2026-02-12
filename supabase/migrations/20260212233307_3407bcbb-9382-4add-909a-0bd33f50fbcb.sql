
-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('planning_team', 'procurement_team', 'project_team');

-- 2. Site status enum
CREATE TYPE public.site_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. Procurement feedback status enum
CREATE TYPE public.feedback_status AS ENUM ('pending', 'accepted', 'rejected');

-- 4. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  department TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 6. has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7. get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- 8. Sites table
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  site_name TEXT NOT NULL,
  site_id_code TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  town TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  latitude DECIMAL,
  longitude DECIMAL,
  site_type TEXT DEFAULT '',
  terrain_type TEXT DEFAULT '',
  access_road_condition TEXT DEFAULT '',
  tower_type TEXT DEFAULT '',
  tower_height DECIMAL,
  antenna_type TEXT DEFAULT '',
  number_of_antennas INTEGER DEFAULT 0,
  power_source TEXT DEFAULT '',
  backup_power TEXT DEFAULT '',
  equipment_shelter TEXT DEFAULT '',
  project_name TEXT DEFAULT '',
  vendor_name TEXT DEFAULT '',
  contractor_name TEXT DEFAULT '',
  estimated_cost DECIMAL,
  target_completion_date DATE,
  site_photo_url TEXT DEFAULT '',
  layout_plan_url TEXT DEFAULT '',
  approval_letter_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  review_notes TEXT DEFAULT '',
  status site_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Procurement feedback table
CREATE TABLE public.procurement_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status feedback_status NOT NULL DEFAULT 'pending',
  feedback_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Procurement submissions table
CREATE TABLE public.procurement_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  land_identified BOOLEAN NOT NULL DEFAULT false,
  land_identified_file_url TEXT DEFAULT '',
  ownership_verified BOOLEAN NOT NULL DEFAULT false,
  ownership_verified_file_url TEXT DEFAULT '',
  acquisition_approved BOOLEAN NOT NULL DEFAULT false,
  acquisition_approved_file_url TEXT DEFAULT '',
  lease_negotiation BOOLEAN NOT NULL DEFAULT false,
  lease_negotiation_file_url TEXT DEFAULT '',
  lease_signed BOOLEAN NOT NULL DEFAULT false,
  lease_signed_file_url TEXT DEFAULT '',
  lease_registration BOOLEAN NOT NULL DEFAULT false,
  lease_registration_file_url TEXT DEFAULT '',
  road_access BOOLEAN NOT NULL DEFAULT false,
  road_access_file_url TEXT DEFAULT '',
  vendor_contract BOOLEAN NOT NULL DEFAULT false,
  vendor_contract_file_url TEXT DEFAULT '',
  site_handover BOOLEAN NOT NULL DEFAULT false,
  site_handover_file_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  review_notes TEXT DEFAULT '',
  status site_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Activity log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT DEFAULT '',
  action TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  entity_type TEXT DEFAULT '',
  entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone authenticated can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'project_team'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'project_team'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));

-- Sites policies
CREATE POLICY "Planning team can insert sites" ON public.sites FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'planning_team') AND auth.uid() = submitted_by);
CREATE POLICY "Planning team can update own sites" ON public.sites FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'planning_team') AND auth.uid() = submitted_by);
CREATE POLICY "All authenticated can view sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update any site" ON public.sites FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));
CREATE POLICY "Admins can delete sites" ON public.sites FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));

-- Procurement feedback policies
CREATE POLICY "Procurement can insert feedback" ON public.procurement_feedback FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'procurement_team') AND auth.uid() = user_id);
CREATE POLICY "All authenticated can view feedback" ON public.procurement_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update feedback" ON public.procurement_feedback FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));

-- Procurement submissions policies
CREATE POLICY "Procurement can insert submissions" ON public.procurement_submissions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'procurement_team') AND auth.uid() = submitted_by);
CREATE POLICY "Procurement can update own submissions" ON public.procurement_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'procurement_team') AND auth.uid() = submitted_by);
CREATE POLICY "All authenticated can view submissions" ON public.procurement_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update any submission" ON public.procurement_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'project_team'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Activity log policies
CREATE POLICY "All authenticated can view activity" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert activity" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- Timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_procurement_feedback_updated_at BEFORE UPDATE ON public.procurement_feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_procurement_submissions_updated_at BEFORE UPDATE ON public.procurement_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
