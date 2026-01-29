
export default function CTASection() {
  const handleClick = () => {
    window.open('http://form.typeform.com/to/o2fPnvxI', '_blank');
  };

  return (
    <section className="text-center space-y-4 sm:space-y-6 fade-in relative" style={{ animationDelay: '0.4s' }}>
      <button
        onClick={handleClick}
        className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 lg:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#1F59E7] via-[#3569F0] to-[#4A7FFF] text-white text-sm sm:text-base lg:text-lg font-black rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl active:scale-[1.01] shadow-xl border-2 border-white/20 w-full sm:w-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(31, 89, 231, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(31, 89, 231, 0.3)',
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A7FFF] via-[#3569F0] to-[#1F59E7] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>

        <span className="relative z-10 tracking-wide text-xs sm:text-sm lg:text-lg">
          RELLENAR EL FORMULARIO
        </span>
      </button>
    </section>
  );
}
