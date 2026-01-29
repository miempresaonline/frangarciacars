export default function Header() {
  return (
    <header className="w-full py-3 sm:py-4 px-4 sm:px-6 lg:px-8 fade-in backdrop-blur-sm bg-black/50 border-b border-white/5">
      <nav className="container mx-auto max-w-7xl flex items-center justify-between">
        <a href="https://frangarciacars.com" target="_blank" rel="noopener noreferrer" className="flex items-center transition-opacity hover:opacity-80">
          <img
            src="/logo_para_fondos_oscuros.png"
            alt="FranGarciaCars Logo"
            className="h-8 sm:h-10 lg:h-12 w-auto"
          />
        </a>

        <div className="flex items-center gap-6 sm:gap-8">
          <a
            href="https://frangarciacars.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base font-medium text-white/90 hover:text-white transition-all duration-200 relative group"
          >
            Web
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1F59E7] group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="https://frangarciacars.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base font-medium text-white/90 hover:text-white transition-all duration-200 relative group"
          >
            Testimonios
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1F59E7] group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>
      </nav>
    </header>
  );
}
