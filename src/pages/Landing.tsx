import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, FileCheck, BarChart3, Bell, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '98%', label: 'Faster Approvals', icon: Zap },
  { value: '15', label: 'Days Saved', icon: Clock },
  { value: '100%', label: 'Digital Tracking', icon: Shield },
  { value: 'Real-time', label: 'Notifications', icon: Bell },
];

const features = [
  { icon: Radio, title: 'Site Submission', desc: 'Submit BTS site proposals with full technical specifications and supporting documents.' },
  { icon: FileCheck, title: 'Approval Workflow', desc: 'Three-stage approval pipeline across Planning, Procurement, and Project teams.' },
  { icon: BarChart3, title: 'Real-time Tracking', desc: 'Monitor every submission through the pipeline with live status updates and notifications.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-orange">
              <Radio className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">OrangeFlow <span className="text-primary">SL</span></span>
          </div>
          <Link to="/login">
            <Button size="sm" className="gradient-orange border-0 text-primary-foreground hover:opacity-90">
              Sign In <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="container px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Zap className="h-3 w-3" /> Orange Sierra Leone
            </span>
          </motion.div>
          <motion.h1
            className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            BTS Site Approval{' '}
            <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">
              Made Digital
            </span>
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Streamline your entire BTS site approval workflow — from planning submissions to procurement handover — in one powerful platform.
          </motion.p>
          <motion.div className="mt-8 flex justify-center gap-4" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Link to="/login">
              <Button size="lg" className="gradient-orange border-0 text-primary-foreground hover:opacity-90 h-12 px-8 text-base">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/50">
        <div className="container px-4">
          <h2 className="text-center text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:gradient-orange group-hover:text-primary-foreground transition-colors">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="rounded-xl border bg-card p-6 text-center"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <s.icon className="mx-auto mb-3 h-6 w-6 text-primary" />
                <div className="text-2xl font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Orange Sierra Leone. All rights reserved. Powered by OrangeFlow SL.
        </div>
      </footer>
    </div>
  );
}
