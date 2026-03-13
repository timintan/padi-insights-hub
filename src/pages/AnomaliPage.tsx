import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SheetSelect from "@/components/SheetSelect";
import { fetchSheetList, fetchSheetData, warningText, type SheetData } from "@/lib/api";

export default function AnomaliPage() {
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterKab, setFilterKab] = useState("");
  const [filterSubround, setFilterSubround] = useState("");
  const [checkboxState, setCheckboxState] = useState<Record<string, { sesuai?: boolean; perbaikan?: boolean }>>({});

  useEffect(() => {
    fetchSheetList().then(setSheets).catch(() => setError("Gagal memuat daftar sheet"));
  }, []);

  useEffect(() => {
    if (!selectedSheet) { setData(null); return; }
    setLoading(true);
    setError("");
    fetchSheetData(selectedSheet)
      .then((d) => {
        setData(d);
        setFilterKab("");
        setFilterSubround("");
        // Load saved checkboxes
        const saved: Record<string, { sesuai?: boolean; perbaikan?: boolean }> = {};
        d.data.forEach((_, i) => {
          const key = `${selectedSheet}_${i}`;
          const s = localStorage.getItem(key);
          if (s) saved[key] = JSON.parse(s);
        });
        setCheckboxState(saved);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedSheet]);

  const isRSheet = useMemo(() => {
    const match = selectedSheet.match(/^R(\d+)/i);
    return match ? parseInt(match[1]) >= 108 && parseInt(match[1]) <= 901 : false;
  }, [selectedSheet]);

  const flagIndex = useMemo(() => {
    if (!data) return -1;
    return data.header.findIndex((h) => String(h).toLowerCase() === "flag_1");
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    let rows = data.data;
    if (isRSheet && flagIndex !== -1) {
      rows = rows.filter((row) => row[flagIndex] == 1);
    }
    if (filterKab) rows = rows.filter((row) => row[1] === filterKab);
    if (filterSubround) rows = rows.filter((row) => row[6] === filterSubround);
    return rows;
  }, [data, isRSheet, flagIndex, filterKab, filterSubround]);

  const { kabOptions, subroundOptions } = useMemo(() => {
    if (!data) return { kabOptions: [], subroundOptions: [] };
    const kabSet = new Set<string>();
    const srSet = new Set<string>();
    data.data.forEach((row) => {
      if (row[1]) kabSet.add(String(row[1]));
      if (row[6]) srSet.add(String(row[6]));
    });
    return {
      kabOptions: [...kabSet].sort().map((v) => ({ value: v, label: v })),
      subroundOptions: [...srSet].sort().map((v) => ({ value: v, label: v })),
    };
  }, [data]);

  const sheetOptions = useMemo(
    () => sheets.filter((s) => s.toLowerCase() !== "raw data").map((s) => ({ value: s, label: s })),
    [sheets]
  );

  const descKey = selectedSheet.toLowerCase().replace(/\s+/g, "");
  const description = warningText[descKey]
    ? `Keterangan: ${warningText[descKey]}`
    : "Halaman untuk menampilkan data anomali dari Google Sheets.";

  const saveCheckbox = useCallback((rowKey: string, type: "sesuai" | "perbaikan", checked: boolean) => {
    setCheckboxState((prev) => {
      const updated = { ...prev, [rowKey]: { ...prev[rowKey], [type]: checked } };
      localStorage.setItem(rowKey, JSON.stringify(updated[rowKey]));
      return updated;
    });
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Anomali" description={description} />

      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <SheetSelect label="Pilih Sheet:" value={selectedSheet} onChange={setSelectedSheet} options={sheetOptions} />
          {data && (
            <>
              <SheetSelect label="Kabupaten/Kota:" value={filterKab} onChange={setFilterKab} options={kabOptions} placeholder="-- Semua --" />
              <SheetSelect label="Subround:" value={filterSubround} onChange={setFilterSubround} options={subroundOptions} placeholder="-- Semua --" />
            </>
          )}
        </div>

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
                    <th key={i} className="px-3 py-2.5 text-left font-semibold text-foreground text-xs whitespace-nowrap">
                      {h || `Kolom ${i + 1}`}
                    </th>
                  ))}
                  {isRSheet && (
                    <>
                      <th className="px-3 py-2.5 text-center font-semibold text-foreground text-xs">Sesuai Lapangan</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-foreground text-xs">Butuh Perbaikan</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={data.header.length + (isRSheet ? 2 : 0)} className="text-center py-8 text-muted-foreground">
                      {selectedSheet ? "Tidak ada data" : "Pilih sheet untuk menampilkan data"}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, ri) => {
                    const rowKey = `${selectedSheet}_${ri}`;
                    const saved = checkboxState[rowKey] || {};
                    return (
                      <tr key={ri} className="border-b border-border hover:bg-muted/50 transition-colors duration-150">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-foreground text-xs whitespace-nowrap">
                            {cell ?? ""}
                          </td>
                        ))}
                        {isRSheet && (
                          <>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={!!saved.sesuai}
                                onChange={(e) => saveCheckbox(rowKey, "sesuai", e.target.checked)}
                                className="w-4 h-4 accent-accent rounded"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={!!saved.perbaikan}
                                onChange={(e) => saveCheckbox(rowKey, "perbaikan", e.target.checked)}
                                className="w-4 h-4 accent-accent rounded"
                              />
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
