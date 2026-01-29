import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setIsSticky(scrollPosition > heroBottom - 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setIsMobileMenuOpen(false);
    }
  };

  const menuItems = [
    { label: 'Inicio', sectionId: 'hero' },
    { label: 'Ventajas', sectionId: 'benefits' },
    { label: 'Testimonios', sectionId: 'testimonials' },
    { label: 'Equipo', sectionId: 'about' }
  ];

  return (
    <>
      <header
        className={`${isSticky ? 'lg:fixed lg:top-0' : 'fixed'} lg:left-0 lg:right-0 fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${isSticky ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'lg:bg-transparent bg-white'}`}
      >
        <div className="w-full px-6 lg:px-12 py-3 lg:py-4">
          <div className="border-2 border-gray-200 rounded-2xl px-4 lg:px-8 py-3 lg:py-4 transition-all duration-700 ease-out hover:shadow-md hover:border-gray-300 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/logo_transparente_v2.png"
                  alt="Fran García Cars"
                  className="h-7 lg:h-9 w-auto cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              </div>

              <nav className="hidden lg:flex items-center gap-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSection(item.sectionId)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-[#0029D4] hover:bg-blue-50/80 rounded-xl transition-all duration-500 ease-out transform hover:scale-105"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="hidden lg:flex items-center">
                <button
                  onClick={() => window.open('http://form.typeform.com/to/o2fPnvxI?fbclid=PAZXh0bgNhZW0CMTEAAafp2FWzXRVZGp1EZBq8DCDeiypuGbV3cZPrLkbeZX0c4TH7kM14ru_bJjESyQ_aem_zcoC4ZfCzDT0QgfVvDKFiw&typeform-source=l.instagram.com', '_blank')}
                  className="px-6 py-2.5 bg-[#0029D4] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-xl"
                >
                  Solicita tu coche
                </button>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-gray-800 rounded-full transition-all duration-700 ease-out ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                  <span className={`w-full h-0.5 bg-gray-800 rounded-full transition-all duration-500 ease-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`w-full h-0.5 bg-gray-800 rounded-full transition-all duration-700 ease-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-700 ease-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-700 ease-out"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div className={`absolute top-0 right-0 w-[280px] h-full bg-white shadow-2xl transition-transform duration-700 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 space-y-2">
            <div className="flex justify-between items-center mb-8">
              <img
                src="/logo_transparente_v2.png"
                alt="Fran García Cars"
                className="h-7 w-auto"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.sectionId)}
                className="w-full text-left px-4 py-3.5 text-base font-medium text-gray-800 hover:text-[#0029D4] hover:bg-blue-50 rounded-xl transition-all duration-700 ease-out"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                window.open('http://form.typeform.com/to/o2fPnvxI?fbclid=PAZXh0bgNhZW0CMTEAAafp2FWzXRVZGp1EZBq8DCDeiypuGbV3cZPrLkbeZX0c4TH7kM14ru_bJjESyQ_aem_zcoC4ZfCzDT0QgfVvDKFiw&typeform-source=l.instagram.com', '_blank');
                setIsMobileMenuOpen(false);
              }}
              className="w-full mt-4 px-4 py-3.5 bg-[#0029D4] text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-all duration-700 ease-out"
            >
                  Solicita tu coche
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
        <button
          onClick={() => window.open('http://form.typeform.com/to/o2fPnvxI?fbclid=PAZXh0bgNhZW0CMTEAAafp2FWzXRVZGp1EZBq8DCDeiypuGbV3cZPrLkbeZX0c4TH7kM14ru_bJjESyQ_aem_zcoC4ZfCzDT0QgfVvDKFiw&typeform-source=l.instagram.com', '_blank')}
          className="w-full px-6 py-4 bg-[#0029D4] text-white text-base font-semibold rounded-2xl hover:bg-blue-700 transition-all duration-500 ease-out shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] flex items-center justify-center gap-2 animate-pulse-slow"
        >
          <span>Solicita tu coche</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          }
          50% {
            box-shadow: 0 25px 50px -12px rgb(0 41 212 / 0.25), 0 8px 10px -6px rgb(0 41 212 / 0.15);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Header;
