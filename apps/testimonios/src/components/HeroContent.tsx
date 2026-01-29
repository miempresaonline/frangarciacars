import React, { useState, useEffect } from 'react';

const HeroContent: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const carImages = [
    'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/111111.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci8xMTExMTEuUE5HIiwiaWF0IjoxNzU5MTU1NTM2LCJleHAiOjQ4ODY1MDQ4NjM3MTUzNn0.bYnF7zNH4zCZbxjOEsE5YhLPhVNA4xSo3G5Gmuj85Rc',
    'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/a-GWjGc1OPgggzHE8gv6BKfdf3BvKXwcEDsNpR87N88.jpeg.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci9hLUdXakdjMU9QZ2dnekhFOGd2NkJLZmRmM0J2S1h3Y0VEc05wUjg3Tjg4LmpwZWcuanBnIiwiaWF0IjoxNzU5MTU3ODkzLCJleHAiOjU2NzI3NDQ4NjM3Mzg5M30.1Gkz5exeIaq2OYQ2woYnhgy9oWJTokZsm3smwTqw8kU',
    'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/car4.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL2NhcjQuUE5HIiwiaWF0IjoxNzU4NTYzOTgwLCJleHAiOjU2NzI2NTg0NTc3OTk4MH0.DgnGEAktd8KKEOo8VfccS9LHdpPfk7vnRe00_4lkoAk',
    'https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/Captura.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci9DYXB0dXJhLlBORyIsImlhdCI6MTc1OTMzMjY5NCwiZXhwIjo0NzkxMjY2NjI0MTU4Mjk0fQ.zwmH214ivWW3WEUpIy3uQ3hYst0fYzh1RMlmTf8Ell4'
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carImages.length);
    }, 800);

    return () => clearInterval(interval);
  }, [carImages.length]);

  return (
    <div className="relative overflow-hidden flex items-center pb-0 pt-24 lg:pt-28">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 -z-10"></div>
      <div className="absolute inset-0 opacity-[0.03] -z-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0, 41, 212) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>
      <div className="w-full px-6 lg:px-12 py-8 lg:py-12 pb-0">
        <div className="relative">
          <div className="lg:grid lg:grid-cols-[1.4fr_420px] xl:grid-cols-[1.5fr_480px] lg:gap-8 xl:gap-10 items-center">
            <div className="space-y-4 lg:space-y-6 lg:max-w-none">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[9rem] font-extrabold leading-[0.9] tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
                <span
                  className={`block transition-all duration-1500 ease-out ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
                  }`}
                  style={{ transitionDelay: '200ms' }}
                >
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">El mismo coche</span>
                </span>
                <span
                  className={`block transition-all duration-1500 ease-out ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
                  }`}
                  style={{ transitionDelay: '400ms' }}
                >
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/2560px-Flag_of_Germany.svg.png"
                      alt="Alemania"
                      className="h-7 sm:h-9 md:h-11 lg:h-[4.5rem] xl:h-[5.5rem] w-auto inline-block mx-2 animate-wave-smooth"
                    />
                    )
                  </span>
                  <span className="ml-2 lg:ml-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">hasta un</span>
                </span>
                <span
                  className={`block relative transition-all duration-1500 ease-out ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{ transitionDelay: '600ms' }}
                >
                  <span className="relative inline-block px-6 py-2 lg:px-10 lg:py-3 bg-gradient-to-r from-blue-600 via-[#0029D4] to-blue-700 text-white rounded-2xl lg:rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                    <span className="relative z-10 font-black" style={{ fontFamily: 'Sora, sans-serif' }}>30% más</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl lg:rounded-3xl blur-xl opacity-50 animate-pulse"></span>
                  </span>
                </span>
                <span
                  className={`block inline-flex items-center flex-wrap transition-all duration-1500 ease-out ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
                  }`}
                  style={{ transitionDelay: '800ms' }}
                >
                  <span className="mr-3 lg:mr-4">barato</span>
                  <div className="flex -space-x-3 lg:-space-x-4 animate-bounce-soft">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-3 lg:border-4 border-white overflow-hidden flex-shrink-0 transform hover:scale-110 transition-all duration-500 ease-out shadow-lg hover:shadow-xl">
                      <img src="https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/FRAN_BIEN.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL0ZSQU5fQklFTi5QTkciLCJpYXQiOjE3NTg4MjA0ODUsImV4cCI6NDcxMjc0NDg2MDQ2MDg1fQ.l6LNtlv6lUCSBiaSO02ltXqybg6cSx3f_wpkkOfaf4E" alt="Team member 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-3 lg:border-4 border-white overflow-hidden flex-shrink-0 transform hover:scale-110 transition-all duration-500 ease-out shadow-lg hover:shadow-xl" style={{ animationDelay: '100ms' }}>
                      <img src="https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/Untitled%20folder/22222.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL1VudGl0bGVkIGZvbGRlci8yMjIyMi5QTkciLCJpYXQiOjE3NTkxNTU3NTEsImV4cCI6NDcxMzY4ODYzODEzNTF9.95I_1XjR_odbFnGOoFtUZfbm43f4iTF6melZ6RbbqiI" alt="Team member 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-3 lg:border-4 border-white overflow-hidden flex-shrink-0 transform hover:scale-110 transition-all duration-500 ease-out shadow-lg hover:shadow-xl" style={{ animationDelay: '200ms' }}>
                      <img src="https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/sign/reports/FRANSESC_BIEN.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YmM0MmQzMy02OTI3LTQ4ZWYtYmY0YS05MzBmYWIwZmMzMDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXBvcnRzL0ZSQU5TRVNDX0JJRU4uUE5HIiwiaWF0IjoxNzU4ODIwNTA2LCJleHAiOjM5Mjc0NDkzOTA4NTA2fQ.TQxaqD5qqALLN1tsjxo8_6zOUbfTz7GyQxyNXjw0_7k" alt="Team member 3" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </span>
              </h1>

              <div
                className={`space-y-3 transition-all duration-1500 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: '1000ms' }}
              >
                <p className="text-sm lg:text-base text-gray-800 font-medium leading-relaxed max-w-[400px] lg:max-w-[500px]">
                  LA AGENCIA PARA LOS QUE NO QUIEREN TRUCOS O ESTRATEGIAS ÚNICAS, SINO{' '}
                  <span className="font-bold text-gray-900">RESULTADOS REALES.</span>
                </p>

                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white text-xs lg:text-sm font-semibold rounded-full inline-flex animate-fade-in-up shadow-lg">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AQUÍ TERMINAN LAS PROMESAS VACÍAS
                </div>
              </div>
            </div>

            <div
              className={`relative mt-8 lg:mt-0 h-[320px] lg:h-[480px] lg:-ml-12 xl:-ml-16 transition-all duration-1800 ease-out ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transitionDelay: '1200ms' }}
            >
              <div className="absolute inset-0 flex items-center justify-center perspective-1000">
                {carImages.map((image, index) => {
                  const rotation = index === 0 ? 18 : index === 1 ? -21 : index === 2 ? 12 : -15;
                  const zIndex = currentImageIndex === index ? 40 : 30 - Math.abs(currentImageIndex - index) * 5;
                  const scale = currentImageIndex === index ? 1 : 0.85;
                  const opacity = currentImageIndex === index ? 1 : 0.3;
                  const translateX = currentImageIndex === index ? 0 : (index - currentImageIndex) * 10;
                  const translateY = currentImageIndex === index ? 0 : (index - currentImageIndex) * 15;

                  return (
                    <div
                      key={index}
                      className="absolute w-[240px] h-[170px] sm:w-[300px] sm:h-[210px] lg:w-[380px] lg:h-[270px] transition-all duration-1000 ease-out"
                      style={{
                        transform: `rotate(${rotation}deg) scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                        zIndex,
                        opacity,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <div className="w-full h-full bg-white rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden border-3 lg:border-6 border-white hover:shadow-3xl transition-shadow duration-300">
                        <img
                          src={image}
                          alt={`Car ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes wave-smooth {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }

        .animate-wave-smooth {
          animation: wave-smooth 3.5s ease-in-out infinite;
        }

        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.7s both;
        }
      `}</style>
    </div>
  );
};

export default HeroContent;
