import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EcgWave } from "@/components/EcgWave";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — CardioPredict" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("ecg-auth", "1");
        toast.success("Welcome back, Admin");
        nav({ to: "/dashboard" });
      } else {
        toast.error("Invalid credentials. Try admin / admin123");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex relative gradient-hero p-10 flex-col justify-between text-primary-foreground overflow-hidden">
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-bold">CardioPredict</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight">AI Cardiology<br />at your fingertips.</h2>
          <p className="mt-3 text-white/80 max-w-sm">Login to access the ECG analytics dashboard, manage patients and run live SQL queries.</p>
        </div>
        <div className="relative z-10 opacity-80">
          <EcgWave height={100} hr={88} />
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <form onSubmit={submit} className="w-full max-w-md glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">Use the seeded admin from the <code className="text-primary">users</code> table.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button disabled={loading} className="w-full h-11 rounded-lg gradient-primary text-primary-foreground font-medium shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
          </div>
          <div className="mt-5 text-xs font-mono bg-foreground/95 dark:bg-black/40 text-background dark:text-foreground rounded-lg p-3">
            <div className="text-background/60 dark:text-muted-foreground">-- Auth query</div>
            SELECT * FROM users<br />WHERE username='admin' AND password='admin123';
          </div>
          <Link to="/" className="mt-5 block text-center text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
        </form>
      </div>
    </div>
  );
}