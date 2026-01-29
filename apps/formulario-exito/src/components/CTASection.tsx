import { MessageCircle, ArrowRight } from 'lucide-react';

export default function CTASection() {
  const handleClick = () => {
    window.open('https://wa.me/', '_blank');
  };

  return (
    <section className="text-center space-y-6 sm:space-y-8 fade-in" style={{ animationDelay: '0.4s' }}>
      <button
        onClick={handleClick}
        className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 lg:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#1F59E7] to-[#4A7FFF] text-white text-sm sm:text-base lg:text-lg font-bold rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-lg border border-white/10"
        style={{
          boxShadow: '0 25px 50px -12px rgba(31, 89, 231, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A7FFF] to-[#1F59E7] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>

        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />

        <span className="relative z-10 tracking-wide">
          UNIRME AL GRUPO DE WHATSAPP
        </span>

        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
      </button>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 px-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Acceso Instantáneo</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Sin Compromiso</span>
        </div>
      </div>
    </section>
  );
}
