import { Header } from "@/components/dashboard-layout/dashboard-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div>
      <Header />
      <div className="mx-auto min-h-[calc(100vh-6rem)] max-w-screen-2xl border-x border-dashed border-border p-4">
        {children}
      </div>
    </div>
  );
}
