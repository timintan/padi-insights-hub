import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageHeader from "@/components/PageHeader";
import { fetchMapData, colLetterToIndex, type SheetData } from "@/lib/api";

// Fix leaflet default icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

const LEGEND = [
  { color: "#3B82F6", label: "Utama (Alokasi)" },
  { color: "#1E293B", label: "Cadangan (Alokasi)" },
  { color: "#22C55E", label: "Alokasi (Realisasi)" },
  { color: "#EF4444", label: "Tambahan (Realisasi)" },
];

export default function PetaPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataAlokasi, setDataAlokasi] = useState<SheetData | null>(null);
  const [dataRealisasi, setDataRealisasi] = useState<SheetData | null>(null);
  const [filterKab, setFilterKab] = useState("ALL");
  const [filterSubround, setFilterSubround] = useState("ALL");
  const [filterSubsegmen, setFilterSubsegmen] = useState("ALL");
  const [filterBulan, setFilterBulan] = useState("ALL");
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");
  const layersRef = useRef<{ streets: L.TileLayer | null; satellite: L.TileLayer | null }>({ streets: null, satellite: null });

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current).setView([-2.5, 118], 5);
    const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" });
    const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri" });
    streets.addTo(map);
    layersRef.current = { streets, satellite };
    mapInstance.current = map;

    // Load data
    Promise.all([fetchMapData("Alokasi"), fetchMapData("Realisasi")])
      .then(([alokasi, realisasi]) => {
        setDataAlokasi(alokasi);
        setDataRealisasi(realisasi);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Map type switch
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const { streets, satellite } = layersRef.current;
    if (mapType === "satellite") {
      if (streets) map.removeLayer(streets);
      if (satellite) satellite.addTo(map);
    } else {
      if (satellite) map.removeLayer(satellite);
      if (streets) streets.addTo(map);
    }
  }, [mapType]);

  // Filter options
  const filterOptions = useCallback((data: SheetData | null, colName: string) => {
    if (!data) return [];
    const idx = data.header.findIndex((h) => h.toLowerCase() === colName.toLowerCase());
    if (idx === -1) return [];
    const set = new Set<string>();
    data.data.forEach((row) => { if (row[idx]) set.add(String(row[idx])); });
    return [...set].sort();
  }, []);

  const kabOptions = filterOptions(dataAlokasi, "kab");
  const subroundOptions = filterOptions(dataAlokasi, "subround");
  const subsegmenOptions = filterOptions(dataAlokasi, "subsegmen");
  const bulanOptions = filterOptions(dataAlokasi, "bulan");

  // Update markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !dataAlokasi || !dataRealisasi) return;

    // Clear
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const colIdx = (header: string[], name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

    // Helper filter
    const passes = (row: (string | number | null)[], header: string[]) => {
      const kabIdx = colIdx(header, "kab");
      const srIdx = colIdx(header, "subround");
      const ssIdx = colIdx(header, "subsegmen");
      const blIdx = colIdx(header, "bulan");
      if (filterKab !== "ALL" && kabIdx !== -1 && String(row[kabIdx]).replace(/^0+/, "") !== filterKab.replace(/^0+/, "")) return false;
      if (filterSubround !== "ALL" && srIdx !== -1 && row[srIdx] != filterSubround) return false;
      if (filterSubsegmen !== "ALL" && ssIdx !== -1 && row[ssIdx] != filterSubsegmen) return false;
      if (filterBulan !== "ALL" && blIdx !== -1 && row[blIdx] != filterBulan) return false;
      return true;
    };

    // Alokasi markers
    const xIdx = colIdx(dataAlokasi.header, "x");
    const yIdx = colIdx(dataAlokasi.header, "y");
    dataAlokasi.data.forEach((row) => {
      if (!passes(row, dataAlokasi.header)) return;
      const lng = parseFloat(String(row[xIdx]));
      const lat = parseFloat(String(row[yIdx]));
      if (isNaN(lat) || isNaN(lng)) return;
      const bVal = row[1];
      const color = bVal === "U" ? "#3B82F6" : "#1E293B";
      const cols = ["H", "I", "J", "M", "AA"].map(colLetterToIndex);
      const info = cols.map((i) => row[i]).filter(Boolean).join("<br>");
      const marker = L.marker([lat, lng], { icon: makeIcon(color) }).addTo(map);
      marker.bindPopup(`<div style="font-size:12px;font-family:Inter,sans-serif">${info}<hr style="margin:6px 0"><b>Koordinat:</b> ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>`);
      markersRef.current.push(marker);
    });

    // Realisasi markers
    const aqIdx = colIdx(dataRealisasi.header, "aq") !== -1 ? colIdx(dataRealisasi.header, "aq") : 42;
    const arIdx = colIdx(dataRealisasi.header, "ar") !== -1 ? colIdx(dataRealisasi.header, "ar") : 43;
    let fkIdx = colIdx(dataRealisasi.header, "fk");
    if (fkIdx === -1) fkIdx = colIdx(dataRealisasi.header, "realisasi");
    if (fkIdx === -1) fkIdx = colLetterToIndex("FK");

    // Build alokasi lookup
    const alokasiMap: Record<string, { lat: number; lng: number }> = {};
    const aaIdx = colLetterToIndex("AA");
    dataAlokasi.data.forEach((row) => {
      const aa = row[aaIdx];
      if (aa && xIdx !== -1 && yIdx !== -1) {
        const aLng = parseFloat(String(row[xIdx]));
        const aLat = parseFloat(String(row[yIdx]));
        if (!isNaN(aLat) && !isNaN(aLng)) alokasiMap[String(aa)] = { lat: aLat, lng: aLng };
      }
    });

    dataRealisasi.data.forEach((row) => {
      if (!passes(row, dataRealisasi.header)) return;
      const lng = parseFloat(String(row[aqIdx]));
      const lat = parseFloat(String(row[arIdx]));
      if (isNaN(lat) || isNaN(lng)) return;

      const fkVal = row[fkIdx];
      const color = fkVal === "1" || fkVal === 1 ? "#22C55E" : "#EF4444";

      const ffIdx = colIdx(dataRealisasi.header, "ff") !== -1 ? colIdx(dataRealisasi.header, "ff") : colLetterToIndex("FF");
      const fgIdx = colIdx(dataRealisasi.header, "fg") !== -1 ? colIdx(dataRealisasi.header, "fg") : colLetterToIndex("FG");
      const fhIdx = colIdx(dataRealisasi.header, "fh") !== -1 ? colIdx(dataRealisasi.header, "fh") : colLetterToIndex("FH");
      const fjIdx = colIdx(dataRealisasi.header, "fj") !== -1 ? colIdx(dataRealisasi.header, "fj") : colLetterToIndex("FJ");

      const info = [
        row[ffIdx] ? `Kab: ${row[ffIdx]}` : "",
        row[fgIdx] ? `Kec: ${row[fgIdx]}` : "",
        row[fhIdx] ? `Bulan: ${row[fhIdx]}` : "",
        row[fjIdx] ? `Subsegmen: ${row[fjIdx]}` : "",
      ].filter(Boolean).join("<br>");

      const marker = L.marker([lat, lng], { icon: makeIcon(color) }).addTo(map);
      marker.bindPopup(`<div style="font-size:12px;font-family:Inter,sans-serif">${info}<hr style="margin:6px 0"><b>Koordinat:</b> ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>`);
      markersRef.current.push(marker);
    });
  }, [dataAlokasi, dataRealisasi, filterKab, filterSubround, filterSubsegmen, filterBulan]);

  const SelectFilter = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-150">
        <option value="ALL">Semua</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Peta" description="Halaman untuk menampilkan peta interaktif." />

      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <SelectFilter label="Kabupaten" value={filterKab} onChange={setFilterKab} options={kabOptions} />
          <SelectFilter label="Subround" value={filterSubround} onChange={setFilterSubround} options={subroundOptions} />
          <SelectFilter label="Subsegmen" value={filterSubsegmen} onChange={setFilterSubsegmen} options={subsegmenOptions} />
          <SelectFilter label="Bulan" value={filterBulan} onChange={setFilterBulan} options={bulanOptions} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Tipe Peta</label>
            <select value={mapType} onChange={(e) => setMapType(e.target.value as "streets" | "satellite")} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-150">
              <option value="streets">Jalan</option>
              <option value="satellite">Satelit</option>
            </select>
          </div>
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-20 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          )}
          <div ref={mapRef} className="h-[500px] w-full rounded-lg border border-border" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Legend:</span>
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
