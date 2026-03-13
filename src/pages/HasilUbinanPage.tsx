import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SheetSelect from "@/components/SheetSelect";
import { fetchSheetData, type SheetData } from "@/lib/api";

const SHEET_OPTIONS = [
  { value: "Tab SR", label: "Tab SR (Subround)" },
  { value: "Tab Bulan", label: "Tab Bulan (Bulanan)" },
];

export default function HasilUbinanPage() {
  const [selectedSheet, setSelectedSheet] = useState("");
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedSheet) { setData(null); return; }
    setLoading(true);
    setError("");
    fetchSheetData(selectedSheet)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedSheet]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hasil Ubinan" description="Halaman untuk menampilkan hasil ubinan." />
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <SheetSelect label="Pilih Sheet:" value={selectedSheet} onChange={setSelectedSheet} options={SHEET_OPTIONS} />

        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-sm">Memuat data...</span>
          </div>
        )}
        {error && <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">{error}</div>}

        {!loading && data && (
          <div className="overflow-auto max-h-[500px] rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-card border-b border-border">
                  {data.header.map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left font-semibold text-foreground text-xs whitespace-nowrap">{h || `Kolom ${i + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 ? (
                  <tr><td colSpan={data.header.length} className="text-center py-8 text-muted-foreground">Tidak ada data</td></tr>
                ) : (
                  data.data.map((row, ri) => (
                    <tr key={ri} className="border-b border-border hover:bg-muted/50 transition-colors duration-150">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{cell ?? ""}</td>
                      ))}
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
