import { useState, useEffect, useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { fetchDatabasePetani, formatNIK, type PetaniRow } from "@/lib/api";

const HEADERS = ["Kode Subsegmen", "Nama Kepala Keluarga", "NIK Kepala Keluarga", "Alamat", "Nama Pengelola UTP", "NIK Pengelola", "No HP"];

export default function DatabasePetaniPage() {
  const [data, setData] = useState<PetaniRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDatabasePetani()
      .then(setData)
      .catch((e) => setError(e.message || "Gagal mengambil data dari server."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const kw = search.toLowerCase();
    return data.filter(
      (row) =>
        (row.kode_subsegmen || "").toLowerCase().includes(kw) ||
        (row["Nama Kepala Keluarga"] || "").toLowerCase().includes(kw) ||
        (row["Nama Pengelola UTP"] || "").toLowerCase().includes(kw)
    );
  }, [data, search]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Database Petani" description="Halaman untuk menampilkan data Database Petani." />
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari kode subsegmen, nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-150 w-72"
          />
        </div>

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
                  {HEADERS.map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-foreground text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Data tidak ditemukan</td></tr>
                ) : (
                  filtered.map((row, ri) => (
                    <tr key={ri} className="border-b border-border hover:bg-muted/50 transition-colors duration-150">
                      <td className="px-3 py-2 text-foreground text-xs whitespace-nowrap">{row.kode_subsegmen || ""}</td>
                      <td className="px-3 py-2 text-foreground text-xs">{row["Nama Kepala Keluarga"] || ""}</td>
                      <td className="px-3 py-2 text-foreground text-xs">{formatNIK(row["NIK Kepala Keluarga"])}</td>
                      <td className="px-3 py-2 text-foreground text-xs">{row.Alamat || ""}</td>
                      <td className="px-3 py-2 text-foreground text-xs">{row["Nama Pengelola UTP"] || ""}</td>
                      <td className="px-3 py-2 text-foreground text-xs">{formatNIK(row["NIK Nama Pengelola UTP"])}</td>
                      <td className="px-3 py-2 text-foreground text-xs">{row["No HP"] || ""}</td>
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
