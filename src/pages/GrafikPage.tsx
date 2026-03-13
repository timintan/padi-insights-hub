import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import PageHeader from "@/components/PageHeader";
import SheetSelect from "@/components/SheetSelect";
import { fetchSheetList, fetchSheetData } from "@/lib/api";

export default function GrafikPage() {
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [rawData, setRawData] = useState<{ header: string[]; data: (string | number | null)[][] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSheetList().then(setSheets).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSheet) { setRawData(null); return; }
    setLoading(true);
    setError("");
    fetchSheetData(selectedSheet)
      .then(setRawData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedSheet]);

  const chartData = useMemo(() => {
    if (!rawData) return [];
    const kabIndex = rawData.header.findIndex((h) => String(h).toLowerCase().includes("kab") || String(h).toLowerCase().includes("kota"));
    const flagIndex = rawData.header.findIndex((h) => String(h).toLowerCase() === "flag_1");
    let rows = rawData.data;
    if (flagIndex !== -1) rows = rows.filter((row) => row[flagIndex] == 1);
    const counts: Record<string, number> = {};
    rows.forEach((row) => {
      const kab = kabIndex !== -1 ? String(row[kabIndex] || "Unknown") : "Unknown";
      counts[kab] = (counts[kab] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }));
  }, [rawData]);

  const sheetOptions = useMemo(
    () => sheets.filter((s) => /^R\d+/i.test(s)).map((s) => ({ value: s, label: s })),
    [sheets]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Grafik" description="Halaman untuk menampilkan grafik data berdasarkan Kabupaten/Kota." />

      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <SheetSelect label="Pilih Sheet:" value={selectedSheet} onChange={setSelectedSheet} options={sheetOptions} />

        {loading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-sm">Memuat data grafik...</span>
          </div>
        )}

        {error && <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">{error}</div>}

        {!loading && chartData.length > 0 && (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Jumlah Anomali">
                  {chartData.map((_, index) => (
                    <Cell key={index} fill="hsl(142, 71%, 45%)" fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
