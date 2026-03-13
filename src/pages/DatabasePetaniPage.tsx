import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { fetchSheetData, type SheetData } from "@/lib/api";

const PETANI_HEADERS = ["Kode Subsegmen", "Nama Kepala Keluarga", "NIK Kepala Keluarga", "Alamat", "Nama Pengelola UTP", "NIK Pengelola", "No HP"];

export default function DatabasePetaniPage() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSheetData("Database Petani")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const headers = data ? data.header : PETANI_HEADERS;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Database Petani" description="Halaman untuk menampilkan data Database Petani." />
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-sm">Memuat data...</span>
          </div>
        )}
        {error && <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">{error}</div>}

        {!loading && (
          <div className="overflow-auto max-h-[500px] rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-card border-b border-border">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left font-semibold text-foreground text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(!data || data.data.length === 0) ? (
                  <tr><td colSpan={headers.length} className="text-center py-8 text-muted-foreground">Tidak ada data</td></tr>
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
