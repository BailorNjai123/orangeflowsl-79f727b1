import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (countdown <= 0) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
        >
          <AlertTriangle className="h-10 w-10 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-6xl font-extrabold text-foreground">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            The page <span className="font-mono text-sm text-primary">{location.pathname}</span> doesn't exist.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="16" fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeDasharray={100}
                strokeDashoffset={100 - (countdown / 8) * 100}
                strokeLinecap="round"
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
              {countdown}
            </span>
          </div>
          <span>Redirecting to home…</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
          <Button variant="secondary" onClick={() => navigate("/login")} className="gap-2">
            Sign In
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Orange Sierra Leone
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
