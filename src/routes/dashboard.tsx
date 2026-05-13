import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, HeartPulse, AlertTriangle, Activity, TrendingUp, Brain, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { EcgWave } from "@/components/EcgWave";
import { SqlQueryCard } from "@/components/SqlQueryCard";
import { sqlQueries } from "@/lib/sql-queries";
import { patients, ecgRecords, predictions, heartRateTrend, diseaseDistribution } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CardioPredict" }] }),
  component: Dashboard,
});

function Dashboard() {
  const total = patients.length;
  const highRisk = predictions.filter((p) => p.risk_level === "High").length;
  const avgHr = +(ecgRecords.reduce((s, r) => s + r.heart_rate, 0) / ecgRecords.length).toFixed(1);
  const recent = [...predictions].sort((a, b) => b.prediction_date.localeCompare(a.prediction_date)).slice(0, 5);

  const featured = ["total-patients", "avg-hr", "high-risk", "recent-predictions", "patient-report", "view-dashboard"]
    .map((id) => sqlQueries.find((q) => q.id === id)!)
    .filter(Boolean);

  const stats = [
    { label: "Total Patients", value: total, icon: Users, sql: "SELECT COUNT(*) FROM patients" },
    { label: "High Risk", value: highRisk, icon: AlertTriangle, sql: "WHERE risk_level='High'", accent: true },
    { label: "Avg Heart Rate", value: `${avgHr} BPM`, icon: HeartPulse, sql: "SELECT AVG(heart_rate)" },
    { label: "Predictions Made", value: predictions.length, icon: Brain, sql: "SELECT COUNT(*) FROM predictions" },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Live overview · powered by MySQL">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`glass rounded-2xl p-5 relative overflow-hidden ${s.accent ? "ring-1 ring-destructive/40" : ""}`}>
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl ${s.accent ? "bg-destructive/30" : "bg-primary/20"}`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  <s.icon className={`h-4 w-4 ${s.accent ? "text-destructive" : "text-primary"}`} />
                </div>
                <div className="mt-3 text-3xl font-bold text-foreground">{s.value}</div>
                <div className="mt-2 text-[10px] font-mono text-muted-foreground truncate">{s.sql}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="glass rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Live ECG Stream</h3>
                <p className="text-xs text-muted-foreground">Lead II · Sinus rhythm</p>
              </div>
              <span className="text-xs font-mono text-primary">{avgHr} BPM</span>
            </div>
            <EcgWave height={160} hr={avgHr} />
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> HR Trend (7d)</h3>
            <div className="h-[160px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={heartRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 220 / 0.3)" />
                  <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground text-xs" fontSize={10} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" fontSize={10} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="avg" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-foreground">Disease Distribution</h3>
            <p className="text-xs text-muted-foreground">From predictions table</p>
            <div className="h-[200px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={diseaseDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {diseaseDistribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs mt-1">
              {diseaseDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}</div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 lg:col-span-2">
            <h3 className="font-semibold text-foreground">QRS / PR / QT Intervals (per ECG)</h3>
            <div className="h-[230px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ecgRecords.map((r) => ({ id: `#${r.ecg_id}`, qrs: r.qrs_duration, pr: r.pr_interval, qt: r.qt_interval }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.01 220 / 0.3)" />
                  <XAxis dataKey="id" fontSize={10} className="text-muted-foreground" />
                  <YAxis fontSize={10} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="qrs" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pr" fill="var(--primary-glow)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="qt" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Recent Predictions</h3>
              <p className="text-xs font-mono text-muted-foreground">SELECT * FROM predictions ORDER BY prediction_date DESC LIMIT 5;</p>
            </div>
            <Link to="/predictions" className="text-xs text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 px-2">ID</th>
                  <th className="text-left py-2 px-2">Patient</th>
                  <th className="text-left py-2 px-2">Prediction</th>
                  <th className="text-left py-2 px-2">Confidence</th>
                  <th className="text-left py-2 px-2">Risk</th>
                  <th className="text-left py-2 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => {
                  const pat = patients.find((x) => x.patient_id === p.patient_id);
                  return (
                    <tr key={p.prediction_id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-2 font-mono text-muted-foreground">#{p.prediction_id}</td>
                      <td className="py-2.5 px-2 text-foreground">{pat?.full_name}</td>
                      <td className="py-2.5 px-2 text-foreground">{p.disease_prediction}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                            <div className="h-full gradient-primary" style={{ width: `${p.confidence_score}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{p.confidence_score}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground font-mono">{p.prediction_date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">SQL Operations on the Dashboard</h3>
              <p className="text-xs text-muted-foreground">Click <span className="text-primary">Run</span> to execute against the live data layer.</p>
            </div>
            <Link to="/sql-queries" className="text-xs text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">All 26 queries <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {featured.map((q) => (
              <SqlQueryCard key={q.id} query={q} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const map = {
    Low: "bg-success/15 text-success border-success/30",
    Medium: "bg-warning/15 text-warning border-warning/40",
    High: "bg-destructive/15 text-destructive border-destructive/40",
  };
  return <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${map[level]}`}>{level}</span>;
}