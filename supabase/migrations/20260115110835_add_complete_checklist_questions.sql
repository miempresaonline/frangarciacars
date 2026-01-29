/*
  # Checklist Completo de 80 Preguntas

  1. Eliminación
    - Eliminar todas las preguntas existentes para insertar el checklist completo

  2. Inserción Masiva
    - 21 preguntas de Exterior
    - 14 preguntas de Interior
    - 20 preguntas de Motor y Mecánica
    - 9 preguntas de Diagnosis OBD
    - 7 preguntas de Prueba de Conducción
    - 9 preguntas de Documentación y Extras

  Total: 80 preguntas con 79 fotos mínimas y 5 videos obligatorios
*/

-- Eliminar preguntas existentes
DELETE FROM checklist_templates;

-- =================
-- EXTERIOR (21)
-- =================

INSERT INTO checklist_templates (category, item_key, item_label, value_type, is_mandatory, requires_photo, requires_video, min_photos, order_index)
VALUES
('exterior', 'estado_chapa', 'Estado de la Chapa', 'select', true, true, false, 3, 1),
('exterior', 'espesimetro', 'Espesímetro', 'select', true, true, false, 4, 2),
('exterior', 'estado_faros', 'Estado de Faros', 'select', true, true, false, 2, 3),
('exterior', 'fecha_faros', 'Fecha de Faros', 'select', true, true, false, 2, 4),
('exterior', 'desgaste_neumaticos', 'Desgaste de Neumáticos', 'select', true, true, false, 4, 5),
('exterior', 'dot_neumaticos_delanteros', 'DOT Neumáticos Delanteros', 'text', true, true, false, 1, 6),
('exterior', 'dot_neumaticos_traseros', 'DOT Neumáticos Traseros', 'text', true, true, false, 1, 7),
('exterior', 'estado_llantas', 'Estado de Llantas', 'select', true, true, false, 4, 8),
('exterior', 'nivel_neumatico_delantero_derecho', 'Nivel Neumático Delantero Derecho (mm)', 'number', true, true, false, 1, 9),
('exterior', 'nivel_neumatico_delantero_izquierdo', 'Nivel Neumático Delantero Izquierdo (mm)', 'number', true, true, false, 1, 10),
('exterior', 'nivel_neumatico_trasero_derecho', 'Nivel Neumático Trasero Derecho (mm)', 'number', true, true, false, 1, 11),
('exterior', 'nivel_neumatico_trasero_izquierdo', 'Nivel Neumático Trasero Izquierdo (mm)', 'number', true, true, false, 1, 12),
('exterior', 'frenos_pastillas_discos', 'Frenos (Pastillas/Discos)', 'select', true, true, false, 2, 13),
('exterior', 'luna_delantera', 'Luna Delantera', 'select', true, true, false, 1, 14),
('exterior', 'originalidad_lunas', 'Originalidad de Lunas', 'select', true, true, false, 2, 15),
('exterior', 'alineacion_paneles', 'Alineación de Paneles', 'select', true, true, false, 3, 16),
('exterior', 'tornilleria', 'Tornillería (Capó/Puertas/Aletas)', 'select', true, true, false, 3, 17),
('exterior', 'tapa_combustible', 'Tapa Combustible/Carga', 'select', true, false, true, 0, 18),
('exterior', 'bola_remolque', 'Bola de Remolque', 'select', true, true, false, 1, 19),
('exterior', 'antirrobo_llantas', 'Antirrobo de Llantas', 'select', true, true, false, 1, 20),
('exterior', 'numero_llaves', 'Número de Llaves', 'select', true, true, false, 1, 21);

-- =================
-- INTERIOR (14)
-- =================

INSERT INTO checklist_templates (category, item_key, item_label, value_type, is_mandatory, requires_photo, requires_video, min_photos, order_index)
VALUES
('interior', 'desgaste_volante_pomo_pedales', 'Desgaste (Volante/Pomo/Pedales)', 'select', true, true, false, 3, 1),
('interior', 'cuadro_instrumentos', 'Cuadro de Instrumentos', 'select', true, true, false, 1, 2),
('interior', 'retrovisores_ventanas', 'Retrovisores/Ventanas Eléctricas', 'select', true, false, false, 0, 3),
('interior', 'cinturones_fecha', 'Cinturones (Fecha)', 'select', true, true, false, 2, 4),
('interior', 'cinturones_mecanismo', 'Cinturones (Mecanismo)', 'select', true, false, false, 0, 5),
('interior', 'pantallas_multimedia', 'Pantallas/Multimedia', 'select', true, true, false, 1, 6),
('interior', 'climatizador', 'Climatizador', 'select', true, false, false, 0, 7),
('interior', 'manuales_vehiculo', 'Manuales del Vehículo', 'select', true, true, false, 1, 8),
('interior', 'luces_interiores_exteriores', 'Luces Interiores/Exteriores', 'select', true, false, false, 0, 9),
('interior', 'extras_techo_hud_keyless', 'Extras (Techo, HUD, Keyless)', 'select', false, false, false, 0, 10),
('interior', 'bandeja_maletero', 'Bandeja de Maletero', 'select', true, true, false, 1, 11),
('interior', 'kit_emergencia', 'Kit de Emergencia', 'select', true, true, false, 1, 12),
('interior', 'sistema_electrico', 'Sistema Eléctrico (Sensores/Asistentes)', 'select', true, false, false, 0, 13),
('interior', 'altavoces', 'Altavoces', 'select', true, false, false, 0, 14);

-- =================
-- MOTOR Y MECÁNICA (20)
-- =================

INSERT INTO checklist_templates (category, item_key, item_label, value_type, is_mandatory, requires_photo, requires_video, min_photos, order_index)
VALUES
('motor', 'fugas_visuales', 'Fugas Visuales', 'select', true, true, false, 3, 1),
('motor', 'color_aceite', 'Color del Aceite', 'select', true, true, false, 1, 2),
('motor', 'espesor_aceite', 'Espesor del Aceite', 'select', true, true, false, 1, 3),
('motor', 'virutas_tapon', 'Virutas en Tapón', 'select', true, true, false, 1, 4),
('motor', 'arranque_frio', 'Arranque en Frío', 'select', true, false, true, 0, 5),
('motor', 'ralenti_estabilidad', 'Ralentí (Estabilidad)', 'select', true, false, false, 0, 6),
('motor', 'ralenti_ruidos', 'Ralentí (Ruidos)', 'select', true, false, false, 0, 7),
('motor', 'acelerones_motor_caliente', 'Acelerones (Motor Caliente)', 'select', true, false, true, 0, 8),
('motor', 'refrigerante', 'Refrigerante', 'select', true, true, false, 1, 9),
('motor', 'originalidad_piezas', 'Originalidad de Piezas', 'select', true, true, false, 2, 10),
('motor', 'direccion_asistida', 'Dirección Asistida', 'select', true, false, false, 0, 11),
('motor', 'suspension_silentblocks', 'Suspensión/Silentblocks', 'select', true, true, false, 2, 12),
('motor', 'oxidos', 'Óxidos', 'select', true, true, false, 2, 13),
('motor', 'humedades_moquetas', 'Humedades (Moquetas)', 'select', true, true, false, 1, 14),
('motor', 'escape', 'Escape', 'select', true, true, false, 1, 15),
('motor', 'gases_escape', 'Gases de Escape', 'select', true, false, true, 0, 16),
('motor', 'limpiaparabrisas', 'Limpiaparabrisas', 'select', true, false, false, 0, 17),
('motor', 'embrague', 'Embrague', 'select', true, false, false, 0, 18),
('motor', 'nivel_aceite_motor_caliente', 'Nivel de Aceite (Motor Caliente)', 'select', true, true, false, 1, 19),
('motor', 'correas', 'Correas', 'select', true, true, false, 1, 20);

-- =================
-- DIAGNOSIS OBD (9)
-- =================

INSERT INTO checklist_templates (category, item_key, item_label, value_type, is_mandatory, requires_photo, requires_video, min_photos, order_index)
VALUES
('obd', 'diagnosis_inicial', 'Diagnosis Inicial', 'text', true, true, false, 1, 1),
('obd', 'diagnosis_post_prueba', 'Diagnosis Post-Prueba', 'text', true, true, false, 1, 2),
('obd', 'km_cuadro_kombi', 'KM Cuadro (Kombi)', 'number', true, true, false, 1, 3),
('obd', 'km_ecu_motor', 'KM ECU Motor', 'number', true, true, false, 1, 4),
('obd', 'km_tcu_caja', 'KM TCU Caja', 'number', true, true, false, 1, 5),
('obd', 'km_abs', 'KM ABS', 'number', true, false, false, 0, 6),
('obd', 'verificacion_fraude_km', 'Verificación Fraude Kilometraje', 'select', true, false, false, 0, 7),
('obd', 'lectura_unidades', 'Lectura Unidades (EPS, SRS, Gateway)', 'text', true, true, false, 1, 8),
('obd', 'analisis_contraste', 'Análisis y Contraste', 'text', true, false, false, 0, 9);

-- =================
-- PRUEBA DE CONDUCCIÓN (7)
-- =================

INSERT INTO checklist_templates (category, item_key, item_label, value_type, is_mandatory, requires_photo, requires_video, min_photos, order_index)
VALUES
('prueba_conduccion', 'direccion', 'Dirección', 'select', true, false, false, 0, 1),
('prueba_conduccion', 'frenada', 'Frenada', 'select', true, false, false, 0, 2),
('prueba_conduccion', 'cambio_marchas', 'Cambio de Marchas', 'select', true, false, false, 0, 3),
('prueba_conduccion', 'entrada_marchas', 'Entrada de Marchas', 'select', true, false, false, 0, 4),
('prueba_conduccion', 'potencia', 'Potencia', 'select', true, false, false, 0, 5),
('prueba_conduccion', 'suspension_dinamica', 'Suspensión Dinámica', 'select', true, false, false, 0, 6),
('prueba_conduccion', 'aislamiento_acustico', 'Aislamiento Acústico', 'select', true, false, false, 0, 7);

-- =================
-- DOCUMENTACIÓN (9)
-- =================

INSERT INTO checklist_templates (category, item_key, item_label, value_type, is_mandatory, requires_photo, requires_video, min_photos, order_index)
VALUES
('documentacion', 'whatsapp_comercial', 'WhatsApp del Comercial', 'text', false, true, false, 1, 1),
('documentacion', 'video_360', 'Vídeo 360°', 'boolean', true, false, true, 0, 2),
('documentacion', 'foto_portada', 'Foto Portada', 'boolean', true, true, false, 1, 3),
('documentacion', 'papeles_teil_1', 'Papeles Teil 1', 'boolean', true, true, false, 1, 4),
('documentacion', 'papeles_teil_2', 'Papeles Teil 2', 'boolean', true, true, false, 1, 5),
('documentacion', 'historial_mantenimiento', 'Historial de Mantenimiento', 'select', true, true, false, 1, 6),
('documentacion', 'verificacion_vin', 'Verificación VIN', 'boolean', true, true, false, 1, 7),
('documentacion', 'placa_fabricante', 'Placa del Fabricante', 'boolean', true, true, false, 1, 8),
('documentacion', 'coc', 'COC (Certificado de Conformidad)', 'boolean', false, true, false, 1, 9);