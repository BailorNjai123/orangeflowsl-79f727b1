import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'planning_team' | 'procurement_team' | 'project_team'>;
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const redirectMap = {
      planning_team: '/planning',
      procurement_team: '/procurement',
      project_team: '/admin',
    };
    return <Navigate to={redirectMap[role] || '/'} replace />;
  }

  return <>{children}</>;
}
