import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, Database, HeartPulse, Brain } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SqlQueryCard } from "@/components/SqlQueryCard";
import { sqlQueries } from "@/lib/sql-queries";
import { patients, ecgRecords, predictions, ecgDataset } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — CardioPredict" }] }),
  component: AdminPage,
});

function AdminPage() {
  const tables = [
    { name: "patients", icon: Users, count: patients.length, color: "text-primary" },
    { name: "ecg_records", icon: HeartPulse, count: ecgRecords.length, color: "text-accent" },
    { name: "predictions", icon: Brain, count: predictions.length, color: "text-warning" },
    { name: "users", icon: ShieldCheck, count: 1, color: "text-success" },
    { name: "ecg_dataset", icon: Database, count: ecgDataset.length, color: "text-primary-glow" },
  ];
  return (
    <AppLayout title="Admin Panel" subtitle="Schema · users · system">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tables.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-4">
              <t.icon className={`h-5 w-5 ${t.color}`} />
              <div className="mt-3 text-xs text-muted-foreground font-mono">{t.name}</div>
              <div className="text-2xl font-bold text-foreground mt-1">{t.count}</div>
              <div className="text-[10px] text-muted-foreground">rows</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-foreground">Users (Auth)</h3>
          <p className="text-xs font-mono text-muted-foreground">SELECT * FROM users;</p>
          <table className="w-full text-sm mt-3">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr><th className="text-left py-2">user_id</th><th className="text-left py-2">username</th><th className="text-left py-2">role</th></tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-2 font-mono">1</td><td className="py-2 text-foreground">admin</td><td className="py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">Admin</span></td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">Schema & Auth SQL</h3>
          <div className="grid lg:grid-cols-2 gap-4">
            {["create-db", "create-patients", "create-ecg", "create-predictions", "create-users", "insert-admin", "login-query", "create-dataset", "create-view"].map((id) => (
              <SqlQueryCard key={id} query={sqlQueries.find((q) => q.id === id)!} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}