import { useState } from "react";
import { AlertTriangle, BarChart3, Map, Wheat, Users, BookOpen, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "anomali" | "grafik" | "peta" | "hasil-ubinan" | "database-petani" | "petunjuk-teknis";

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "anomali", label: "Anomali", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "grafik", label: "Grafik", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "peta", label: "Peta", icon: <Map className="w-4 h-4" /> },
  { id: "hasil-ubinan", label: "Hasil Ubinan Subround", icon: <Wheat className="w-4 h-4" /> },
  { id: "database-petani", label: "Database Petani", icon: <Users className="w-4 h-4" /> },
  { id: "petunjuk-teknis", label: "Petunjuk Teknis", icon: <BookOpen className="w-4 h-4" /> },
];

interface DashboardLayoutProps {
  children: (activeSection: Section) => React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [active, setActive] = useState<Section>("anomali");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-60 h-screen bg-card border-r border-border flex flex-col z-50">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <Leaf className="w-6 h-6 text-accent" />
          <h4 className="font-display font-bold text-primary text-lg">Daun Padi</h4>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-60 flex-1 min-h-screen p-6">
        {children(active)}
      </main>
    </div>
  );
}

export type { Section };
