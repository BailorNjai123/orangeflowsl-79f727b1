import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Eye, EyeOff, Loader2, User, Shield, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const demoCredentials = [
  { label: 'Project Team', email: 'admin@orangeflow.sl', password: 'admin123', icon: Shield, color: 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20' },
  { label: 'Planning Team', email: 'planning@orangeflow.sl', password: 'planning123', icon: User, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20' },
  { label: 'Procurement Team', email: 'procurement@orangeflow.sl', password: 'procurement123', icon: ShoppingCart, color: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
      return;
    }

    // Role-based redirect happens via AuthGuard — just go to a neutral route
    // We'll fetch user role and redirect
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: role } = await supabase.rpc('get_user_role', { _user_id: user.id });
      const redirectMap: Record<string, string> = {
        planning_team: '/planning',
        procurement_team: '/procurement',
        project_team: '/admin',
      };
      navigate(redirectMap[role as string] || '/');
    }
  };

  const fillDemo = (cred: typeof demoCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-orange">
              <Radio className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">OrangeFlow <span className="text-primary">SL</span></span>
          </Link>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@orangeflow.sl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-orange border-0 text-primary-foreground" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Demo Accounts</span></div>
              </div>
              <div className="grid gap-2">
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => fillDemo(cred)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${cred.color}`}
                  >
                    <cred.icon className="h-4 w-4" />
                    <span>{cred.label}</span>
                    <span className="ml-auto text-xs opacity-60">{cred.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
