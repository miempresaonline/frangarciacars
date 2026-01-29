const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Helper to serve a Vite app at a specific path
// routePath: URL path (e.g., '/bienvenida')
// appDirName: Folder name in apps/ (e.g., 'bienvenida')
function serveApp(routePath, appDirName) {
  const distPath = path.join(__dirname, 'apps', appDirName, 'dist');
  
  // Serve static files
  app.use(routePath, express.static(distPath));

  // SPA Fallback: Return index.html for non-asset requests within this route
  app.get(routePath + '/*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- MAPPINGS ---

// 1. Landing Page (Root)
// We serve static files for root specially to avoid conflicts
app.use(express.static(path.join(__dirname, 'apps', 'landing', 'dist')));

// 2. Sub-apps
serveApp('/bienvenida', 'bienvenida');
serveApp('/confirmacion-llamada', 'confirmacion');
serveApp('/formulario-completado', 'formulario-exito');
serveApp('/sesion-estrategica', 'sesion');
serveApp('/testimonios', 'testimonios');
serveApp('/revisiones', 'revisiones'); // Mapping App PWA to /revisiones

// 3. Catch-all for Root Landing Page (SPA Fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps', 'landing', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Routes configured:`);
  console.log(`  /                     -> apps/landing`);
  console.log(`  /bienvenida           -> apps/bienvenida`);
  console.log(`  /confirmacion-llamada -> apps/confirmacion`);
  console.log(`  /formulario-completado-> apps/formulario-exito`);
  console.log(`  /sesion-estrategica   -> apps/sesion`);
  console.log(`  /testimonios          -> apps/testimonios`);
  console.log(`  /revisiones           -> apps/revisiones`);
});
