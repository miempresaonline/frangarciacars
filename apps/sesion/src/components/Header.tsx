export default function Header() {
  return (
    <header className="w-full py-3 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 fade-in bg-white">
      <nav className="container mx-auto max-w-7xl flex items-center justify-center">
        <a href="https://frangarciacars.com" target="_blank" rel="noopener noreferrer" className="flex items-center transition-opacity hover:opacity-80">
          <img
            src="/sesion-estrategica/logo_transparente_v2.png"
            alt="FranGarciaCars Logo"
            className="h-8 sm:h-12 lg:h-14 w-auto"
          />
        </a>
      </nav>
    </header>
  );
}
