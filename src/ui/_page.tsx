import Sidebar from "./_sidebar";
import Header from "./_header";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen bg-gray-100">
      <Header>
        <Sidebar />
      </Header>

      <section className="container mx-auto p-4">{children}</section>
    </main>
  );
}
