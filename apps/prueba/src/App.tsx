import { useEffect, useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import { ChevronDown } from 'lucide-react';

function App() {
  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      await fetch('https://n8n.miempresa.online/webhook-test/c8e0a4cc-3b31-4eae-86e1-e70c41e67090', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      // We assume success if the request completes, as webhooks might not always return 200/JSON
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Error submitting email:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative flex-grow">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          <div className="flex justify-center reveal">
            <img
              src="/formulario-completado/logo_transparente_v2.png"
              alt="Fran Cars Logo"
              className="w-32 sm:w-36 md:w-44 lg:w-48 h-auto hover:scale-105 transition-all duration-500"
            />
          </div>


          <div className="text-center space-y-6 reveal">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 leading-[1.1] pb-2 drop-shadow-sm">
              ¡Bienvenido a bordo! <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">Tu coche ideal ya está en marcha</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed tracking-wide">
              Vamos a encargarnos personalmente de que tu importación sea impecable.
            </p>
          </div>

          <div className="reveal">
            <VideoPlayer />
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={() => {
                  document.getElementById('steps-section')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="group flex flex-col items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 focus:outline-none"
                aria-label="Ir a los pasos"
              >
                <div className="p-3 rounded-full border border-blue-100/50 bg-white/50 backdrop-blur-sm shadow-sm animate-float">
                  <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" strokeWidth={1.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Steps Section */}
          <div id="steps-section" className="space-y-16 py-12 scroll-mt-24">
            <div className="text-center reveal">
              <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-sm font-bold tracking-widest uppercase mb-6 shadow-sm">La Hoja de Ruta</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Los 3 pasos esenciales</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 flex flex-col items-center text-center group reveal h-full" style={{ transitionDelay: '0.1s' }}>
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">1</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Requisitos</h3>
                <p className="text-gray-500 mb-8 leading-relaxed flex-grow">
                  Rellena punto por punto todos los detalles para encontrar tu unidad perfecta.
                </p>
                <a
                  href="https://form.jotform.com/252583432663056"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 transform active:scale-95"
                >
                  Rellenar formulario
                </a>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 flex flex-col items-center text-center group reveal h-full" style={{ transitionDelay: '0.2s' }}>
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">2</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Whatsapp</h3>
                <p className="text-gray-500 mb-8 leading-relaxed flex-grow">
                  Confírmanos tu identidad y guarda nuestro contacto prioritario.
                </p>
                <a
                  href="https://wa.me/34693366330?text=Hola,%20mi%20nombre%20es%20[%20]:%0AVuelvo%20a%20la%20web%20a%20terminar%20el%20paso%203:%20frangarciacars.com/bienvenida"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform active:scale-95"
                >
                  Confirmar por Whatsapp
                </a>
              </div>

              {/* Step 3 */}
              <div className="bg-blue-600 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 flex flex-col items-center text-center text-white relative overflow-hidden group reveal h-full border border-blue-500" style={{ transitionDelay: '0.3s' }}>

                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-50"></div>
                <div className="relative z-10 w-full flex flex-col h-full">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-6 mx-auto group-hover:scale-110 transition-transform">3</div>
                  <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">Comunidad</h3>
                  <p className="text-blue-100 mb-8 leading-relaxed flex-grow">
                    Únete a nuestro grupo privado con otros importadores
                  </p>

                  <form onSubmit={handleSubmit} className="w-full space-y-3">
                    <input
                      type="email"
                      placeholder="Tu correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all bg-white/90 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading' || status === 'success'}
                      className="w-full py-3 px-6 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg"
                    >
                      {status === 'loading' ? 'Enviando...' :
                        status === 'success' ? '¡Invitación enviada!' :
                          'Entrar a la comunidad'}
                    </button>
                    {status === 'success' && (
                      <p className="text-sm text-blue-200 mt-2 animate-pulse">
                        Revisa tu correo para acceder
                      </p>
                    )}
                    {status === 'error' && (
                      <p className="text-sm text-red-300 mt-2">
                        Hubo un error. Inténtalo de nuevo.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-500 font-medium text-sm md:text-base max-w-2xl mx-auto italic reveal">
              "Confía en el proceso. Asegúrate de completar los 3 pasos para poder continuar el proceso"
            </p>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-12 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} FranGarciaCars. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
