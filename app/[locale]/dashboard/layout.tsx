export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
      <header>admin header</header>
      {children}
      <footer>footer</footer>
      </div>
  );
}