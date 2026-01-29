import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ReviewerApp } from './components/reviewer/ReviewerApp';
import { ClientView } from './components/client/ClientView';
import { InstallPWA } from './components/ui/InstallPWA';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0029D4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'reviewer':
      return <ReviewerApp />;
    case 'client':
      return <ClientView />;
    default:
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Rol de usuario no reconocido</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#0029D4] text-white rounded-lg"
            >
              Recargar
            </button>
          </div>
        </div>
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <InstallPWA />
    </AuthProvider>
  );
}

export default App;
