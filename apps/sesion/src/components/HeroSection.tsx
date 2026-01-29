export default function HeroSection() {
  return (
    <section className="text-center space-y-3 sm:space-y-6 lg:space-y-8 fade-in px-4 py-0 sm:py-2 lg:py-4 relative">
      <div className="space-y-2 sm:space-y-4">
        <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.15] tracking-tight uppercase" style={{fontFamily: "'Outfit', sans-serif"}}>
          <span className="text-gray-800"> ME PERMITIÓ</span>
          <span className="text-[#1F59E7]"> AHORRAR</span>
          <span className="text-gray-800"> MILES DE EUROS</span> 
          <span className="text-[#1F59E7]"> SIN RIESGO</span>
        </h1>
      </div>

      <div className="hidden sm:block space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm lg:text-base">
          <div className="flex items-center gap-2.5 group transition-transform hover:scale-105">
            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#1F59E7] to-[#4A7FFF] text-white font-bold text-sm sm:text-base shadow-lg">1</span>
            <span className="font-semibold text-gray-700 group-hover:text-[#1F59E7] transition-colors"> ELEGIMOS TU COCHE MÁS RENTABLE</span>
          </div>
          <div className="flex items-center gap-2.5 group transition-transform hover:scale-105">
            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#1F59E7] to-[#4A7FFF] text-white font-bold text-sm sm:text-base shadow-lg">2</span>
            <span className="font-semibold text-gray-700 group-hover:text-[#1F59E7] transition-colors">REVISIÓN PRESENCIAL A FONDO</span>
          </div>
          <div className="flex items-center gap-2.5 group transition-transform hover:scale-105">
            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#1F59E7] to-[#4A7FFF] text-white font-bold text-sm sm:text-base shadow-lg">3</span>
            <span className="font-semibold text-gray-700 group-hover:text-[#1F59E7] transition-colors">LO MATRICULAMOS EN ESPAÑA</span>
          </div>
        </div>
      </div>

      <div className="pt-1 sm:pt-3">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
          
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-semibold tracking-wide">VIDEO DE 4 MINUTOS</p>
          
        </div>
      </div>
    </section>
  );
}
