import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { SqlQueryCard } from "@/components/SqlQueryCard";
import { sqlQueries } from "@/lib/sql-queries";
import { patients, predictions } from "@/lib/mock-data";
import { RiskBadge } from "@/routes/dashboard";

export const Route = createFileRoute("/predictions")({
  head: () => ({ meta: [{ title: "AI Predictions — CardioPredict" }] }),
  component: PredictionsPage,
});

const diseases = ["Normal Sinus Rhythm", "Possible Arrhythmia", "Atrial Fibrillation", "Tachycardia", "Bradycardia Risk"];

function PredictionsPage() {
  const [selected, setSelected] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ disease: string; conf: number; risk: "Low" | "Medium" | "High" } | null>(null);

  const run = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const disease = diseases[Math.floor(Math.random() * diseases.length)];
      const conf = +(70 + Math.random() * 28).toFixed(1);
      const risk = disease === "Normal Sinus Rhythm" ? "Low" : conf > 88 ? "High" : "Medium";
      setResult({ disease, conf, risk });
      setLoading(false);
      toast.success("ML inference complete · result inserted into predictions");
    }, 1400);
  };

  const queryIds = ["create-predictions", "insert-prediction", "view-predictions", "high-risk", "update-prediction", "recent-predictions"];

  return (
    <AppLayout title="AI Predictions" subtitle="ML model · disease classification">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Run Prediction</h3>
          <p className="text-xs text-muted-foreground mt-1">Calls the ML API placeholder.</p>
          <div className="mt-4 space-y-3">
            <select value={selected} onChange={(e) => setSelected(+e.target.value)} className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm">
              {patients.map((p) => <option key={p.patient_id} value={p.patient_id}>#{p.patient_id} · {p.full_name}</option>)}
            </select>
            <button onClick={run} disabled={loading} className="w-full h-10 rounded-lg gradient-primary text-primary-foreground font-medium shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing ECG..." : "Predict Disease"}
            </button>
          </div>
          {result && (
            <div className="mt-5 rounded-xl border border-border p-4 bg-background">
              <div className="text-xs text-muted-foreground">Prediction</div>
              <div className="text-lg font-bold text-foreground mt-0.5">{result.disease}</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <div className="text-base font-mono text-primary">{result.conf}%</div>
                </div>
                <RiskBadge level={result.risk} />
              </div>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary" style={{ width: `${result.conf}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">All Predictions</h3>
            <p className="text-xs font-mono text-muted-foreground">SELECT * FROM predictions;</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border">
                <tr><th className="text-left py-2.5 px-4">ID</th><th className="text-left py-2.5 px-4">Patient</th><th className="text-left py-2.5 px-4">Disease</th><th className="text-left py-2.5 px-4">Confidence</th><th className="text-left py-2.5 px-4">Risk</th></tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.prediction_id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">#{p.prediction_id}</td>
                    <td className="py-2.5 px-4 text-foreground">{patients.find((x) => x.patient_id === p.patient_id)?.full_name}</td>
                    <td className="py-2.5 px-4 text-foreground">{p.disease_prediction}</td>
                    <td className="py-2.5 px-4 font-mono text-primary">{p.confidence_score}%</td>
                    <td className="py-2.5 px-4"><RiskBadge level={p.risk_level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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