import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Activity } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { SqlQueryCard } from "@/components/SqlQueryCard";
import { sqlQueries } from "@/lib/sql-queries";
import { ecgRecords, patients } from "@/lib/mock-data";
import { EcgWave } from "@/components/EcgWave";

export const Route = createFileRoute("/ecg")({
  head: () => ({ meta: [{ title: "ECG Upload — CardioPredict" }] }),
  component: EcgPage,
});

function EcgPage() {
  const [form, setForm] = useState({ patient_id: 1, heart_rate: 80, qrs_duration: 0.10, pr_interval: 0.16, qt_interval: 0.40 });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`INSERT INTO ecg_records · 1 row affected (patient_id=${form.patient_id})`);
  };
  const queryIds = ["create-ecg", "insert-ecg", "view-ecg", "avg-hr", "critical-hr"];
  return (
    <AppLayout title="ECG Upload" subtitle="ecg_records · capture & store">
      <div className="grid lg:grid-cols-3 gap-5">
        <form onSubmit={submit} className="glass rounded-2xl p-6 lg:col-span-1 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> New ECG Record</h3>
            <p className="text-xs text-muted-foreground mt-1">Saves into <code className="text-primary">ecg_records</code>.</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Patient</label>
            <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: +e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-input text-sm">
              {patients.map((p) => <option key={p.patient_id} value={p.patient_id}>#{p.patient_id} · {p.full_name}</option>)}
            </select>
          </div>
          {[
            { k: "heart_rate" as const, label: "Heart Rate (BPM)", step: 1 },
            { k: "qrs_duration" as const, label: "QRS Duration (s)", step: 0.01 },
            { k: "pr_interval" as const, label: "PR Interval (s)", step: 0.01 },
            { k: "qt_interval" as const, label: "QT Interval (s)", step: 0.01 },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-xs text-muted-foreground">{f.label}</label>
              <input type="number" step={f.step} value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: +e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-input text-sm" />
            </div>
          ))}
          <button className="w-full h-10 rounded-lg gradient-primary text-primary-foreground font-medium shadow-glow">Save ECG</button>
        </form>

        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Live Preview</h3>
            <span className="text-xs font-mono text-primary">{form.heart_rate} BPM</span>
          </div>
          <EcgWave height={180} hr={form.heart_rate} />
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <Stat label="QRS" value={`${form.qrs_duration}s`} />
            <Stat label="PR" value={`${form.pr_interval}s`} />
            <Stat label="QT" value={`${form.qt_interval}s`} />
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Recorded ECG Signals</h3>
          <p className="text-xs font-mono text-muted-foreground">SELECT * FROM ecg_records;</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left py-2.5 px-4">ECG ID</th>
                <th className="text-left py-2.5 px-4">Patient</th>
                <th className="text-left py-2.5 px-4">HR</th>
                <th className="text-left py-2.5 px-4">QRS</th>
                <th className="text-left py-2.5 px-4">PR</th>
                <th className="text-left py-2.5 px-4">QT</th>
                <th className="text-left py-2.5 px-4">Recorded</th>
              </tr>
            </thead>
            <tbody>
              {ecgRecords.map((r) => (
                <tr key={r.ecg_id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-4 font-mono text-muted-foreground">#{r.ecg_id}</td>
                  <td className="py-2.5 px-4 text-foreground">{patients.find((p) => p.patient_id === r.patient_id)?.full_name}</td>
                  <td className={`py-2.5 px-4 font-semibold ${r.heart_rate > 100 ? "text-destructive" : "text-foreground"}`}>{r.heart_rate}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{r.qrs_duration}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{r.pr_interval}</td>
                  <td className="py-2.5 px-4 text-muted-foreground">{r.qt_interval}</td>
                  <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{r.recorded_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-foreground mb-3">Related SQL Operations</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          {queryIds.map((id) => <SqlQueryCard key={id} query={sqlQueries.find((q) => q.id === id)!} />)}
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-bold text-foreground font-mono">{value}</div>
    </div>
  );
}