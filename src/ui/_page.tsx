import Sidebar from "./_sidebar";
import Header from "./_header";
import { Toast } from "@heroui/react";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-100">
      <Toast.Provider />

      <Header>
        <Sidebar />
      </Header>

      <section className="container mx-auto p-4">{children}</section>
    </main>
  );
}
