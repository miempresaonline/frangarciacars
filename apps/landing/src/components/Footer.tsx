import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-royal-blue">Fran García Cars</h3>
              <p className="text-gray-400 text-sm">
                Especialistas en importación de vehículos alemanes premium.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowLegal(true)}
                  className="block text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Aviso Legal
                </button>
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="block text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Política de Privacidad
                </button>
                <button
                  onClick={() => setShowCookies(true)}
                  className="block text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Política de Cookies
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Fran García Cars. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {showLegal && (
        <LegalModal onClose={() => setShowLegal(false)} />
      )}

      {showPrivacy && (
        <PrivacyModal onClose={() => setShowPrivacy(false)} />
      )}

      {showCookies && (
        <CookiesModal onClose={() => setShowCookies(false)} />
      )}
    </>
  );
};

interface ModalProps {
  onClose: () => void;
}

const LegalModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Aviso Legal (LSSI)</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 text-gray-700">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Identificación del Titular</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Titular:</strong> Francisco García [Apellidos]</p>
              <p><strong>NIF/CIF:</strong> [Número de identificación]</p>
              <p><strong>Domicilio:</strong> [Dirección completa]</p>
              <p><strong>Email:</strong> info@frangarciacars.com</p>
              <p><strong>Teléfono:</strong> +34 XXX XXX XXX</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Objeto del Sitio Web</h3>
            <p className="text-sm">
              Este sitio web tiene como finalidad la presentación de servicios de importación de vehículos alemanes
              y la captación de clientes potenciales interesados en dichos servicios.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Condiciones de Uso</h3>
            <p className="text-sm mb-2">
              El acceso y uso de este sitio web implica la aceptación expresa de las presentes condiciones.
              El usuario se compromete a:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Hacer un uso correcto del sitio web conforme a la legislación vigente</li>
              <li>No utilizar el sitio con fines ilícitos o lesivos</li>
              <li>No introducir virus informáticos o códigos maliciosos</li>
              <li>No intentar acceder a áreas restringidas del sistema</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Propiedad Intelectual e Industrial</h3>
            <p className="text-sm">
              Todos los contenidos del sitio web (textos, fotografías, gráficos, imágenes, tecnología, software,
              diseño gráfico, código fuente, etc.) son propiedad de Fran García Cars o de terceros que han
              autorizado su uso, y están protegidos por derechos de propiedad intelectual e industrial.
              Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Enlaces a Terceros</h3>
            <p className="text-sm">
              Este sitio web puede contener enlaces a sitios de terceros. Fran García Cars no se responsabiliza
              del contenido de dichos sitios ni de las condiciones de uso de los mismos.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Limitación de Responsabilidad</h3>
            <p className="text-sm">
              Fran García Cars no garantiza la disponibilidad y continuidad del funcionamiento del sitio web,
              ni se responsabiliza de los daños que puedan derivarse de fallos técnicos, interrupciones del
              servicio o errores en el contenido, salvo que concurra dolo o negligencia grave.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Legislación Aplicable y Jurisdicción</h3>
            <p className="text-sm">
              Las presentes condiciones se rigen por la legislación española. Para cualquier controversia
              derivada del uso de este sitio web, las partes se someten a los Juzgados y Tribunales del
              domicilio del titular del sitio web, renunciando expresamente a cualquier otro fuero que pudiera
              corresponderles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

const PrivacyModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Política de Privacidad</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 text-gray-700">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Responsable del Tratamiento</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Identidad:</strong> Francisco García [Apellidos]</p>
              <p><strong>NIF/CIF:</strong> [Número de identificación]</p>
              <p><strong>Dirección:</strong> [Dirección completa]</p>
              <p><strong>Email de contacto:</strong> info@frangarciacars.com</p>
              <p><strong>Teléfono:</strong> +34 XXX XXX XXX</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Finalidades del Tratamiento</h3>
            <p className="text-sm mb-2">Los datos personales recogidos serán tratados con las siguientes finalidades:</p>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4">
              <li><strong>Gestión de contacto:</strong> Responder a consultas y solicitudes de información sobre nuestros servicios de importación de vehículos</li>
              <li><strong>Elaboración de presupuestos:</strong> Preparar y enviar presupuestos personalizados</li>
              <li><strong>Prestación del servicio:</strong> Gestionar la importación del vehículo solicitado</li>
              <li><strong>Comunicaciones comerciales:</strong> Enviar información sobre servicios similares (solo con consentimiento expreso)</li>
              <li><strong>Analítica web:</strong> Análisis estadístico del uso del sitio web para mejorar la experiencia del usuario</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Base Jurídica del Tratamiento</h3>
            <ul className="list-disc list-inside space-y-2 text-sm ml-4">
              <li><strong>Consentimiento:</strong> Para comunicaciones comerciales y cookies no técnicas</li>
              <li><strong>Ejecución de contrato:</strong> Para la prestación del servicio de importación solicitado</li>
              <li><strong>Interés legítimo:</strong> Para la gestión de consultas y mejora de nuestros servicios</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Datos Tratados y Plazos de Conservación</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Datos de contacto (nombre, email, teléfono):</p>
                <p>Conservados durante la relación comercial y posteriormente durante el plazo de prescripción de responsabilidades legales (5-10 años según el caso).</p>
              </div>
              <div>
                <p className="font-semibold">Datos de navegación y cookies:</p>
                <p>Según se especifica en la Política de Cookies (máximo 2 años para analítica).</p>
              </div>
              <div>
                <p className="font-semibold">Datos contractuales:</p>
                <p>Durante la vigencia del contrato y posteriormente durante los plazos legales de conservación (mínimo 6 años por obligaciones fiscales).</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Destinatarios de los Datos</h3>
            <p className="text-sm mb-2">Sus datos podrán ser comunicados a los siguientes encargados del tratamiento:</p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong>Proveedor de hosting:</strong> Para el alojamiento del sitio web y almacenamiento de datos</li>
              <li><strong>Servicio de email:</strong> Para la gestión de comunicaciones electrónicas</li>
              <li><strong>Herramientas de analítica web:</strong> Google Analytics u otras (anonimizadas)</li>
              <li><strong>Gestorías y asesorías:</strong> Para trámites administrativos relacionados con la importación</li>
              <li><strong>Entidades financieras:</strong> Para la gestión de pagos</li>
            </ul>
            <p className="text-sm mt-2">
              No se realizan transferencias internacionales de datos fuera del Espacio Económico Europeo,
              salvo que los servicios utilizados (como Google Analytics) cuenten con garantías adecuadas
              (cláusulas contractuales tipo aprobadas por la Comisión Europea).
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Derechos de los Usuarios</h3>
            <p className="text-sm mb-2">
              En cumplimiento del RGPD y la LOPDGDD, puede ejercer los siguientes derechos:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong>Acceso:</strong> Obtener confirmación sobre si estamos tratando sus datos y acceder a ellos</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos por motivos relacionados con su situación particular</li>
              <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento en determinados casos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado y transmitirlos a otro responsable</li>
              <li><strong>Retirada del consentimiento:</strong> En cualquier momento, sin que ello afecte a la licitud del tratamiento anterior</li>
            </ul>
            <p className="text-sm mt-3">
              Para ejercer estos derechos, puede dirigirse a: <strong>info@frangarciacars.com</strong> adjuntando
              copia de su DNI o documento identificativo equivalente.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Derecho de Reclamación</h3>
            <p className="text-sm">
              Si considera que sus derechos no han sido atendidos correctamente, puede presentar una reclamación
              ante la Agencia Española de Protección de Datos (AEPD):
            </p>
            <div className="mt-2 text-sm space-y-1">
              <p><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</p>
              <p><strong>Web:</strong> www.aepd.es</p>
              <p><strong>Sede electrónica:</strong> https://sedeagpd.gob.es</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Seguridad de los Datos</h3>
            <p className="text-sm">
              Fran García Cars ha adoptado medidas de seguridad técnicas y organizativas apropiadas para proteger
              sus datos personales contra el acceso no autorizado, la pérdida, destrucción o alteración accidental.
              Estas medidas se revisan y actualizan periódicamente conforme evoluciona la tecnología.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Actualización de la Política</h3>
            <p className="text-sm">
              Esta Política de Privacidad puede ser modificada. Le recomendamos revisarla periódicamente.
              La fecha de última actualización se indica en la parte superior del documento.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

const CookiesModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Política de Cookies</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 text-gray-700">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">¿Qué son las cookies?</h3>
            <p className="text-sm">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un
              sitio web. Permiten que el sitio web recuerde sus acciones y preferencias durante un período de
              tiempo, para que no tenga que volver a configurarlas cada vez que regrese al sitio o navegue de
              una página a otra.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tipos de Cookies que Utilizamos</h3>

            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">1. Cookies Técnicas (Necesarias)</h4>
                <p className="mb-2">
                  Estas cookies son estrictamente necesarias para el funcionamiento del sitio web y no pueden
                  ser desactivadas. Suelen establecerse en respuesta a acciones realizadas por usted, como el
                  establecimiento de preferencias de privacidad o el relleno de formularios.
                </p>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Titular:</strong> Fran García Cars</p>
                  <p><strong>Duración:</strong> Sesión</p>
                  <p><strong>Finalidad:</strong> Garantizar el funcionamiento básico del sitio web</p>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">2. Cookies de Preferencias</h4>
                <p className="mb-2">
                  Estas cookies permiten que el sitio web recuerde las elecciones que hace (como su idioma,
                  región o configuración de cookies) y proporcionan características mejoradas y más personales.
                </p>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Titular:</strong> Fran García Cars</p>
                  <p><strong>Duración:</strong> 1 año</p>
                  <p><strong>Finalidad:</strong> Recordar preferencias del usuario</p>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">3. Cookies Analíticas</h4>
                <p className="mb-2">
                  Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web,
                  recopilando información de forma anónima. Esta información nos ayuda a mejorar el funcionamiento
                  del sitio web.
                </p>
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <div>
                    <p><strong>Cookie:</strong> _ga (Google Analytics)</p>
                    <p><strong>Titular:</strong> Google LLC</p>
                    <p><strong>Duración:</strong> 2 años</p>
                    <p><strong>Finalidad:</strong> Distinguir usuarios únicos mediante un ID generado aleatoriamente</p>
                  </div>
                  <div>
                    <p><strong>Cookie:</strong> _gid (Google Analytics)</p>
                    <p><strong>Titular:</strong> Google LLC</p>
                    <p><strong>Duración:</strong> 24 horas</p>
                    <p><strong>Finalidad:</strong> Distinguir usuarios</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">4. Cookies de Marketing</h4>
                <p className="mb-2">
                  Estas cookies pueden ser establecidas a través de nuestro sitio por nuestros socios publicitarios.
                  Pueden ser utilizadas para crear un perfil de sus intereses y mostrarle anuncios relevantes en
                  otros sitios.
                </p>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Titular:</strong> Terceros (según configuración)</p>
                  <p><strong>Duración:</strong> Variable (hasta 2 años)</p>
                  <p><strong>Finalidad:</strong> Publicidad personalizada y remarketing</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestión y Configuración de Cookies</h3>
            <p className="text-sm mb-3">
              Puede aceptar, rechazar o configurar las cookies a través del banner de cookies que aparece en su
              primera visita. También puede modificar sus preferencias en cualquier momento:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Haciendo clic en "Configurar cookies" en el pie de página</li>
              <li>Configurando su navegador para bloquear o eliminar cookies</li>
            </ul>
            <p className="text-sm mt-3">
              Tenga en cuenta que si bloquea o elimina las cookies, es posible que algunas funciones del sitio
              web no funcionen correctamente.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cómo Configurar Cookies en su Navegador</h3>
            <div className="text-sm space-y-2">
              <p><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</p>
              <p><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</p>
              <p><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web</p>
              <p><strong>Edge:</strong> Configuración → Cookies y permisos del sitio → Cookies</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Transferencias Internacionales</h3>
            <p className="text-sm">
              Algunas cookies (como las de Google Analytics) implican transferencias de datos a Estados Unidos.
              Google LLC participa en el Marco de Privacidad de Datos UE-EE.UU. (EU-U.S. Data Privacy Framework)
              y proporciona garantías adecuadas para la protección de datos personales.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Actualización de la Política de Cookies</h3>
            <p className="text-sm">
              Esta política puede actualizarse periódicamente. Le recomendamos revisarla regularmente para estar
              informado sobre cómo utilizamos las cookies.
            </p>
            <p className="text-sm mt-2">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Contacto</h3>
            <p className="text-sm">
              Para cualquier duda sobre nuestra política de cookies, puede contactarnos en:
            </p>
            <p className="text-sm mt-2">
              <strong>Email:</strong> info@frangarciacars.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
