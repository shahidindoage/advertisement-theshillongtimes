import Sidebar from "./Sidebar";
import ClientLayout from "./ClientLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <ClientLayout>
        {children}
      </ClientLayout>
    </>
  );
}
