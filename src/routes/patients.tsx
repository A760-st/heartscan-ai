import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { SqlQueryCard } from "@/components/SqlQueryCard";
import { sqlQueries } from "@/lib/sql-queries";
import { patients as seed, type Patient } from "@/lib/mock-data";

export const Route = createFileRoute("/patients")({
  head: () => ({ meta: [{ title: "Patients — CardioPredict" }] }),
  component: PatientsPage,
});

function PatientsPage() {
  const [list, setList] = useState<Patient[]>(seed);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", age: 30, gender: "Male", phone: "", email: "", address: "" });

  const filtered = useMemo(
    () => list.filter((p) => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  const add = () => {
    if (!form.full_name) return toast.error("Name required");
    const p: Patient = { ...form, patient_id: Math.max(...list.map((x) => x.patient_id)) + 1, created_at: new Date().toISOString().slice(0, 16).replace("T", " ") };
    setList([p, ...list]);
    toast.success(`INSERT INTO patients · 1 row affected`);
    setOpen(false);
    setForm({ full_name: "", age: 30, gender: "Male", phone: "", email: "", address: "" });
  };

  const del = (id: number) => {
    setList((l) => l.filter((p) => p.patient_id !== id));
    toast.success(`DELETE FROM patients WHERE patient_id=${id} · 1 row affected`);
  };

  const queryIds = ["create-patients", "insert-patient", "view-patients", "search-patient", "delete-patient"];
  const relatedQueries = queryIds.map((id) => sqlQueries.find((q) => q.id === id)!);

  return (
    <AppLayout title="Patient Management" subtitle="patients table · CRUD operations">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients (LIKE %name%)"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 gradient-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-glow">
            <UserPlus className="h-4 w-4" /> New Patient
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Age</th>
                  <th className="text-left py-3 px-4">Gender</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.patient_id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono text-muted-foreground">#{p.patient_id}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{p.full_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.age}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.gender}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</div>
                      <div className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{p.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{p.address}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => del(p.patient_id)} className="inline-flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">No patients match the search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3">Related SQL Operations</h3>
          <div className="grid lg:grid-cols-2 gap-4">
            {relatedQueries.map((q) => <SqlQueryCard key={q.id} query={q} />)}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-card rounded-2xl p-6 shadow-glow">
            <h3 className="font-bold text-foreground text-lg">New Patient</h3>
            <p className="text-xs text-muted-foreground">INSERT INTO patients (...) VALUES (...);</p>
            <div className="mt-4 space-y-3">
              {(["full_name", "phone", "email", "address"] as const).map((k) => (
                <input key={k} placeholder={k} value={form[k] as string} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm" />
              ))}
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="age" value={form.age} onChange={(e) => setForm({ ...form, age: +e.target.value })} className="h-10 px-3 rounded-lg bg-background border border-input text-sm" />
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="h-10 px-3 rounded-lg bg-background border border-input text-sm">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={add} className="px-4 py-2 rounded-lg text-sm gradient-primary text-primary-foreground font-medium shadow-glow">Insert</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}