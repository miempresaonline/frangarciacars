export default function HeroSection() {
  return (
    <section className="text-center space-y-5 sm:space-y-6 fade-in px-4">
      <div className="space-y-3">
        <div className="inline-block">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#1F59E7] bg-[#1F59E7]/10 px-4 py-1.5 rounded-full border border-[#1F59E7]/20">
            Bienvenido
          </span> 
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
          <span className="text-white/95">¡Gracias por tu </span>
          <span className="bg-gradient-to-r from-[#1F59E7] via-[#4A7FFF] to-[#6B9FFF] bg-clip-text text-transparent animate-gradient">
            Confianza!
          </span>
        </h1>
      </div>

      <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
        Mira el video completo para descubrir todos los recursos exclusivos y únete a nuestra
        <span className="text-white/90 font-medium"> comunidad de expertos automotrices</span>
      </p>

      <div className="flex items-center justify-center gap-8 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#1F59E7] rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">En vivo ahora</span>
        </div>
      </div>
    </section>
  );
}
