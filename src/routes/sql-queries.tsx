import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Database, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SqlQueryCard } from "@/components/SqlQueryCard";
import { sqlQueries } from "@/lib/sql-queries";

export const Route = createFileRoute("/sql-queries")({
  head: () => ({ meta: [{ title: "SQL Queries — CardioPredict" }] }),
  component: SqlPage,
});

const cats = ["All", "DDL", "DML", "Query", "Auth", "Analytics", "View"] as const;

function SqlPage() {
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const [search, setSearch] = useState("");

  const list = useMemo(
    () =>
      sqlQueries.filter(
        (q) =>
          (cat === "All" || q.category === cat) &&
          (q.title.toLowerCase().includes(search.toLowerCase()) || q.sql.toLowerCase().includes(search.toLowerCase()))
      ),
    [cat, search]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = { All: sqlQueries.length };
    sqlQueries.forEach((q) => (m[q.category] = (m[q.category] || 0) + 1));
    return m;
  }, []);

  return (
    <AppLayout title="SQL Query Playground" subtitle={`${sqlQueries.length} MySQL operations · DBMS mini-project showcase`}>
      <div className="space-y-5">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">MySQL Operations Catalog</h2>
              <p className="text-xs text-muted-foreground">Filter by category or search the SQL. Click <span className="text-primary">Run</span> to execute against in-memory data and inspect the live result set.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or SQL keyword..." className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${cat === c ? "gradient-primary text-primary-foreground border-transparent shadow-glow" : "border-border text-muted-foreground hover:bg-muted"}`}>
                  {c} <span className="opacity-60">({counts[c] || 0})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {list.map((q) => <SqlQueryCard key={q.id} query={q} />)}
        </div>
      </div>
    </AppLayout>
  );
}