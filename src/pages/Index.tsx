import DashboardLayout from "@/components/DashboardLayout";
import AnomaliPage from "@/pages/AnomaliPage";
import GrafikPage from "@/pages/GrafikPage";
import PetaPage from "@/pages/PetaPage";
import HasilUbinanPage from "@/pages/HasilUbinanPage";
import DatabasePetaniPage from "@/pages/DatabasePetaniPage";
import PetunjukTeknisPage from "@/pages/PetunjukTeknisPage";

const Index = () => {
  return (
    <DashboardLayout>
      {(section) => {
        switch (section) {
          case "anomali": return <AnomaliPage />;
          case "grafik": return <GrafikPage />;
          case "peta": return <PetaPage />;
          case "hasil-ubinan": return <HasilUbinanPage />;
          case "database-petani": return <DatabasePetaniPage />;
          case "petunjuk-teknis": return <PetunjukTeknisPage />;
          default: return <AnomaliPage />;
        }
      }}
    </DashboardLayout>
  );
};

export default Index;
