import { useState } from 'react';
import { signIn } from '../lib/auth';
import { LogIn, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from './ui/MotionWrapper';
import { Button } from './ui/Button';
import { GlassCard } from './ui/Card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError(null);

    if (value && !validateEmail(value)) {
      setEmailError('Email inválido');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión';

      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor confirma tu email';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-automotive-navy-900 via-automotive-navy-800 to-automotive-navy-900 flex items-center justify-center p-4 overflow-hidden relative">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.8) 1px, transparent 1px),
                           radial-gradient(circle at 40% 20%, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px, 90px 90px, 70px 70px',
        }}
      />

      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-automotive-electric-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-automotive-gold-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <GlassCard>
          <StaggerContainer>
            <StaggerItem className="flex justify-center mb-8">
              <motion.img
                src="/frangarcia-logo.png"
                alt="Fran Garcia Cars"
                className="h-20 w-auto"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-3xl font-bold text-automotive-navy-900 text-center mb-2">
                Bienvenido
              </h1>
              <p className="text-automotive-slate-600 text-center mb-8">
                Sistema de Gestión de Revisiones Premium
              </p>
            </StaggerItem>

            <StaggerItem>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-automotive-navy-800 mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail
                        size={20}
                        className={`transition-colors duration-200 ${
                          emailError ? 'text-red-500' : 'text-automotive-slate-400'
                        }`}
                      />
                    </div>
                    <motion.input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      whileFocus={{ scale: 1.01 }}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 bg-white ${
                        emailError
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-automotive-slate-200 focus:ring-automotive-electric-500 focus:border-automotive-electric-500'
                      }`}
                      placeholder="tu@email.com"
                    />
                    <AnimatePresence>
                      {emailError && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          <AlertCircle size={20} className="text-red-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 text-sm text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-automotive-navy-800 mb-2"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={20} className="text-automotive-slate-400" />
                    </div>
                    <motion.input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      required
                      whileFocus={{ scale: 1.01 }}
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-automotive-slate-200 rounded-xl focus:ring-2 focus:ring-automotive-electric-500 focus:border-automotive-electric-500 transition-all duration-200 bg-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-automotive-slate-400 hover:text-automotive-navy-700 transition-colors duration-200"
                    >
                      <AnimatePresence mode="wait">
                        {showPassword ? (
                          <motion.div
                            key="eyeoff"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                          >
                            <EyeOff size={20} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                          >
                            <Eye size={20} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                  {password.length > 0 && password.length < 6 && (
                    <p className="mt-2 text-sm text-automotive-slate-500">
                      Mínimo 6 caracteres
                    </p>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2"
                    >
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={loading || !!emailError}
                  isLoading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {!loading && (
                    <>
                      <LogIn size={20} />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </Button>
              </form>
            </StaggerItem>
          </StaggerContainer>
        </GlassCard>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/90 text-sm mt-6 font-medium"
        >
          Fran Garcia Cars &copy; {new Date().getFullYear()}
        </motion.p>
      </div>
    </div>
  );
}
