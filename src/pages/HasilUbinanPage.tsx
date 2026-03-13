import { useState, useEffect, useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SheetSelect from "@/components/SheetSelect";
import { fetchUbinanData } from "@/lib/api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agst", "Sept", "Okt", "Nov", "Des"];
const SHEET_OPTIONS = [
  { value: "Tab SR", label: "Tab SR (Subround)" },
  { value: "Tab Bulan", label: "Tab Bulan (Bulanan)" },
];
const YEARS = [
  { label: "2023", bg: "bg-[#3f2a8c]" },
  { label: "2024", bg: "bg-[#c79800]" },
  { label: "2025", bg: "bg-[#2f6f1c]" },
  { label: "2026", bg: "bg-[#1e56b7]" },
];

export default function HasilUbinanPage() {
  const [selectedSheet, setSelectedSheet] = useState("");
  const [rawData, setRawData] = useState<(string | number | null)[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!selectedSheet) { setRawData(null); return; }
    setLoading(true);
    setError("");
    fetchUbinanData(selectedSheet)
      .then((result) => setRawData(result.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedSheet]);

  const isTabBulan = selectedSheet === "Tab Bulan";

  // Process rows (skip first 3 header rows from API)
  const rows = useMemo(() => {
    if (!rawData) return [];
    const dataRows = rawData.slice(3);
    return dataRows.filter((row) => {
      const key = isTabBulan ? row[1] : row[3];
      if (!key) return false;
      if (search) return String(key).toLowerCase().includes(search.toLowerCase());
      return true;
    });
  }, [rawData, search, isTabBulan]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hasil Ubinan" description="Halaman untuk menampilkan hasil ubinan." />
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <SheetSelect label="Pilih Sheet:" value={selectedSheet} onChange={setSelectedSheet} options={SHEET_OPTIONS} />
          {rawData && (
            <div className="flex items-center gap-2 ml-auto">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari Kode Subsegmen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-150 w-52"
              />
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-sm">Memuat data...</span>
          </div>
        )}
        {error && <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">{error}</div>}

        {!loading && rawData && (
          <div className="overflow-auto max-h-[500px] rounded-lg border border-border">
            <table className="w-full text-xs border-collapse" style={{ tableLayout: "fixed" }}>
              <thead className="sticky top-0 z-10">
                {isTabBulan ? (
                  <>
                    <tr>
                      <th rowSpan={2} className="px-2 py-2 text-primary-foreground font-semibold whitespace-nowrap bg-[#4f7f2b]" style={{ width: 150 }}>Kode_Subsegmen</th>
                      {YEARS.map((y) => (
                        <th key={y.label} colSpan={12} className={`px-2 py-2 text-center font-semibold text-primary-foreground ${y.bg}`}>{y.label}</th>
                      ))}
                      <th rowSpan={2} className="px-2 py-2 text-center font-semibold text-primary-foreground bg-[#6c757d]" style={{ width: 100 }}>Analisis</th>
                      <th rowSpan={2} className="px-2 py-2 text-center font-semibold text-primary-foreground bg-[#6c757d]" style={{ width: 100 }}>Justifikasi</th>
                    </tr>
                    <tr>
                      {YEARS.map((y) =>
                        MONTHS.map((m) => (
                          <th key={`${y.label}-${m}`} className="px-1 py-1.5 text-center font-medium text-primary-foreground bg-foreground/90" style={{ width: 50, fontSize: 10 }}>{m}</th>
                        ))
                      )}
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <th rowSpan={2} className="px-2 py-2 text-primary-foreground font-semibold whitespace-nowrap bg-[#4f7f2b]" style={{ width: 150 }}>Kode_Subsegmen</th>
                      {YEARS.map((y) => (
                        <th key={y.label} colSpan={3} className={`px-2 py-2 text-center font-semibold text-primary-foreground ${y.bg}`}>{y.label}</th>
                      ))}
                      <th rowSpan={2} className="px-2 py-2 text-center font-semibold text-primary-foreground bg-[#6c757d]" style={{ width: 100 }}>Analisis</th>
                      <th rowSpan={2} className="px-2 py-2 text-center font-semibold text-primary-foreground bg-[#6c757d]" style={{ width: 100 }}>Justifikasi</th>
                    </tr>
                    <tr>
                      {YEARS.map((y) =>
                        ["SR1", "SR2", "SR3"].map((sr) => (
                          <th key={`${y.label}-${sr}`} className="px-1 py-1.5 text-center font-medium text-primary-foreground bg-foreground/90" style={{ width: 60, fontSize: 10 }}>{sr}</th>
                        ))
                      )}
                    </tr>
                  </>
                )}
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={100} className="text-center py-8 text-muted-foreground">Tidak ada data</td>
                  </tr>
                ) : (
                  rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-border hover:bg-muted/50 transition-colors duration-150">
                      {isTabBulan ? (
                        <>
                          <td className="px-2 py-1.5 font-semibold text-foreground whitespace-nowrap">{row[1] ?? ""}</td>
                          {Array.from({ length: 48 }, (_, i) => (
                            <td key={i} className="px-1 py-1.5 text-center text-foreground" style={row[i + 2] ? { background: "hsl(var(--muted))" } : {}}>
                              {row[i + 2] ?? ""}
                            </td>
                          ))}
                          <td className="px-2 py-1.5 text-center" contentEditable suppressContentEditableWarning style={{ background: "hsl(var(--muted))" }} />
                          <td className="px-2 py-1.5 text-center" contentEditable suppressContentEditableWarning style={{ background: "hsl(var(--muted))" }} />
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-1.5 font-semibold text-foreground whitespace-nowrap">{row[3] ?? ""}</td>
                          {Array.from({ length: 12 }, (_, i) => (
                            <td key={i} className="px-1 py-1.5 text-center text-foreground">{row[i + 4] ?? ""}</td>
                          ))}
                          <td className="px-2 py-1.5 text-center" contentEditable suppressContentEditableWarning style={{ background: "hsl(var(--muted))" }}>
                            {row[16] ?? ""}
                          </td>
                          <td className="px-2 py-1.5 text-center" contentEditable suppressContentEditableWarning style={{ background: "hsl(var(--muted))" }}>
                            {row[17] ?? ""}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
