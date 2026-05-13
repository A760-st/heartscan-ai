import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SqlQueryCard } from "@/components/SqlQueryCard";
import { sqlQueries } from "@/lib/sql-queries";
import { patients, ecgRecords, predictions } from "@/lib/mock-data";
import { RiskBadge } from "@/routes/dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — CardioPredict" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const rows = patients
    .map((p) => {
      const e = ecgRecords.find((x) => x.patient_id === p.patient_id);
      const pr = predictions.find((x) => x.patient_id === p.patient_id);
      if (!e || !pr) return null;
      return { ...p, ...e, ...pr };
    })
    .filter(Boolean) as any[];

  const highRisk = rows.filter((r) => r.risk_level === "High");

  return (
    <AppLayout title="Reports & Statistics" subtitle="Multi-table joins · alerts · exports">
      <div className="space-y-6">
        {highRisk.length > 0 && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{highRisk.length} High-Risk Patients Detected</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Immediate clinical follow-up recommended.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {highRisk.map((r) => (
                  <span key={r.patient_id} className="text-xs bg-card px-2.5 py-1 rounded-md border border-border">{r.full_name} · <span className="text-destructive">{r.disease_prediction}</span></span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Complete Patient Report</h3>
              <p className="text-xs font-mono text-muted-foreground">JOIN patients · ecg_records · predictions</p>
            </div>
            <button onClick={() => toast.success("Exported report.csv")} className="inline-flex items-center gap-1.5 text-xs gradient-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-glow font-medium">
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left py-2.5 px-4">ID</th>
                  <th className="text-left py-2.5 px-4">Name</th>
                  <th className="text-left py-2.5 px-4">Age/Gender</th>
                  <th className="text-left py-2.5 px-4">HR</th>
                  <th className="text-left py-2.5 px-4">QRS</th>
                  <th className="text-left py-2.5 px-4">Prediction</th>
                  <th className="text-left py-2.5 px-4">Conf.</th>
                  <th className="text-left py-2.5 px-4">Risk</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.patient_id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">#{r.patient_id}</td>
                    <td className="py-2.5 px-4 text-foreground font-medium">{r.full_name}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{r.age} · {r.gender}</td>
                    <td className={`py-2.5 px-4 font-mono ${r.heart_rate > 100 ? "text-destructive" : "text-foreground"}`}>{r.heart_rate}</td>
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">{r.qrs_duration}</td>
                    <td className="py-2.5 px-4 text-foreground">{r.disease_prediction}</td>
                    <td className="py-2.5 px-4 font-mono text-primary">{r.confidence_score}%</td>
                    <td className="py-2.5 px-4"><RiskBadge level={r.risk_level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">Reporting SQL</h3>
          <div className="grid lg:grid-cols-2 gap-4">
            {["patient-report", "high-risk", "critical-hr", "total-patients", "avg-hr", "create-view", "view-dashboard", "export-dataset"].map(
              (id) => <SqlQueryCard key={id} query={sqlQueries.find((q) => q.id === id)!} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}