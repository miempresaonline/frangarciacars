import { MessageCircle, ArrowRight } from 'lucide-react';

export default function CTASection() {
  const handleClick = () => {
    window.open('https://wa.me/', '_blank');
  };

  return (
    <section className="text-center space-y-6 sm:space-y-8 fade-in" style={{ animationDelay: '0.4s' }}>
      <button
        onClick={handleClick}
        className="group inline-flex items-center justify-center gap-3 px-8 sm:px-10 lg:px-12 py-4 sm:py-5 bg-[#1F59E7] text-white text-sm sm:text-base lg:text-lg font-bold rounded-2xl transition-all duration-300 hover:bg-[#1845b8] hover:scale-[1.02] shadow-lg"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />

        <span className="tracking-wide">
          UNIRME AL GRUPO DE WHATSAPP
        </span>

        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
      </button>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 px-4">
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
