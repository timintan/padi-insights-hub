const API_URL = "https://script.google.com/macros/s/AKfycbz5mA_cLvAEiCV2zile4fio9EkCa4nZy9aahc0wO4xAeJw5UqJGj1ctKC9ouVhBcHgkZQ/exec";
const API_URL_MAP = "https://script.google.com/macros/s/AKfycbw1yAeI0KFwBQIjJEa8Ft0V9CAghFfN1p5jO9oH_0wn0RLn4kaEQdMjChHdcox9-LAN/exec";
const API_URL_HASIL = "https://script.google.com/macros/s/AKfycbx7Ixf5o_k27WexiCN-8B2rGurGPxUWBkw8ro2VsGEXOHPSNONKobyWtNmN_nv3o6D6KQ/exec";
const API_URL_PETANI = "https://script.google.com/macros/s/AKfycbyFbft8MN_uIlwPeL2K_N_HJw-ijDcoWyvYd3tkmo7ojUhiCi2YdAtA_QIxmqgfh-c1/exec";

export interface SheetData {
  header: string[];
  data: (string | number | null)[][];
}

export interface PetaniRow {
  kode_subsegmen?: string;
  "Nama Kepala Keluarga"?: string;
  "NIK Kepala Keluarga"?: string;
  Alamat?: string;
  "Nama Pengelola UTP"?: string;
  "NIK Nama Pengelola UTP"?: string;
  "No HP"?: string;
}

export async function fetchSheetList(): Promise<string[]> {
  const response = await fetch(`${API_URL}?action=sheets`);
  const result = await response.json();
  if (Array.isArray(result)) return result;
  if (result.data && Array.isArray(result.data)) return result.data;
  return [];
}

export async function fetchSheetData(sheet: string): Promise<SheetData> {
  const response = await fetch(`${API_URL}?action=data&sheet=${encodeURIComponent(sheet)}`);
  const result = await response.json();
  if (result.header && result.data) return result;
  if (result.data?.header) return result.data;
  throw new Error("Format data tidak dikenali.");
}

export async function fetchMapData(sheet: string): Promise<SheetData> {
  const response = await fetch(`${API_URL_MAP}?action=data&sheet=${encodeURIComponent(sheet)}`);
  const result = await response.json();
  if (result.header && result.data) return result;
  if (result.data?.header) return result.data;
  throw new Error("Format data tidak dikenali.");
}

export async function fetchUbinanData(sheet: string): Promise<SheetData> {
  const response = await fetch(`${API_URL_HASIL}?action=data&sheet=${encodeURIComponent(sheet)}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const result = await response.json();
  if (!result.data || result.data.length === 0) throw new Error("Data tidak ditemukan di Sheet atau sheet kosong");
  return result;
}

export async function fetchDatabasePetani(): Promise<PetaniRow[]> {
  const response = await fetch(API_URL_PETANI);
  const data = await response.json();
  return data;
}

export function formatNIK(nik: string | number | null | undefined): string {
  if (!nik) return "";
  const strNik = String(nik).trim();
  if (strNik.length < 6) return strNik;
  return strNik.slice(0, -6) + "******";
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const warningText: Record<string, string> = {
  r108: "berisi '2. Ubinan Prakarsa/Daerah' atau '3. Ubinan Lainnya'",
  r111: "berisi '2. Padi Ladang'",
  r111_r702: "r111 '1. Padi Sawah' tapi r702 '5. Bukan Sawah atau r111 '2. Padi Ladang' tapi r702 '1. Sawah Irigasi'",
  r205_r206: "r205<17 tahun, tapi r206 '5. Akademi/D1/D2/D3 atau r205<20 tahun tapi r206 '6. Perguruan Tinggi/D4/S1/S2/S3'",
  r601_bulanmaster: "selisih pelaksanaan ubinan dan perkiraan bulan panen lebih dari 1 bulan",
  r602: "r602<70 hari atau r602>130 hari",
  r604a: "r604a>=0.2kg",
  r604c: "r604c<1 kg atau r604c>7.5kg",
  r701b: "r701b berisi 'Lainnya' namun sebenarnya masih bisa dimasukkan ke pilihan yang tersedia",
  r701c: "r701c berisi '5. Beras Lainnya'",
  r706: "berisi kurang dari 100 m2",
  r707b: "penggunaan benih per hektar di luar rentang 10-86 kg/ha",
  r708b: "penggunaan pupuk per hektar di luar rentang 150-1.000 kg/ha",
  r709: "r709a berisi '2. Tidak' atau r709c berisi '4. Lainnya'",
  r710: "r710b berisi lebih dari 3 kali",
  r801b: "r801b berisi '5. Lainnya'",
  r802b: "r802b berisi '5. Lainnya'",
  r803c: "r803c berisi 'Lainnya' namun sebenarnya masih bisa dimasukkan ke pilihan yang tersedia",
  r804c: "jika besarnya dampak lebih dari 50 persen",
  r805b: "r805b berisi '4. Lainnya' namun sebenarnya masih bisa dimasukkan ke pilihan yang tersedia",
  r805c: "jika besarnya dampak lebih dari 50 persen",
  r901: "r901 berisi '2. Ubinan Dinas' atau r901 berisi '3. Ubinan Bersama'",
};

export function colLetterToIndex(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
}
