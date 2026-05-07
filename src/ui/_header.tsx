export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between p-2 shadow-sm">
      <div>{children}</div>

      <div className="text-right">
        <h1 className="font-semibold">Good morning</h1>
        <p className="text-sm">11:00 AM</p>
      </div>
    </header>
  );
}
