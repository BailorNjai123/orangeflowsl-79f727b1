import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, LogOut, Menu, X, Bell, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  label: string;
  icon: React.ElementType;
  value: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardLayout({ children, title, navItems, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, role, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
    navigate('/login');
  };

  const roleBadge: Record<string, string> = {
    project_team: 'Project Team',
    planning_team: 'Planning Team',
    procurement_team: 'Procurement Team',
    power_team: 'Power Team',
    rollout_team: 'Rollout Team',
  };

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-orange">
                <Radio className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">OrangeFlow <span className="text-primary">SL</span></span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            <span className="mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {roleBadge[role || ''] || role}
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => { onTabChange(item.value); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t space-y-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b bg-card/80 backdrop-blur-lg flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
