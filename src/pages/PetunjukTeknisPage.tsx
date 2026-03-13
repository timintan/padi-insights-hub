import PageHeader from "@/components/PageHeader";

export default function PetunjukTeknisPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Petunjuk Teknis" description="Petunjuk teknis penggunaan sistem." />
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-display font-semibold text-foreground text-lg">Cara Menggunakan Dashboard:</h3>
        <ol className="space-y-3 text-sm text-foreground list-decimal list-inside">
          <li className="leading-relaxed">Klik menu di sidebar untuk navigasi antar halaman.</li>
          <li className="leading-relaxed">Lihat data di setiap bagian dengan memilih sheet yang tersedia.</li>
          <li className="leading-relaxed">Gunakan filter untuk mempersempit data yang ditampilkan.</li>
          <li className="leading-relaxed">Pada halaman Anomali, centang checkbox untuk menandai status data.</li>
          <li className="leading-relaxed">Pada halaman Peta, gunakan filter dan tipe peta untuk eksplorasi lokasi.</li>
          <li className="leading-relaxed">Pada halaman Grafik, pilih sheet untuk melihat visualisasi data anomali.</li>
        </ol>
      </div>
    </div>
  );
}
