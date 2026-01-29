/*
  # Crear tabla de marcas de vehículos y autocomplete

  1. Nueva Tabla
    - `vehicle_makes`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Nombre oficial de la marca
      - `name_normalized` (text) - Nombre normalizado para búsquedas (lowercase, sin espacios)
      - `logo_url` (text, opcional) - URL del logo de la marca
      - `active` (boolean) - Si la marca está activa
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Modificaciones
    - Agregar columna `vehicle_make_id` a tabla `reviews`
    - Mantener `vehicle_make` para compatibilidad pero marcarlo como deprecado

  3. Datos
    - Insertar marcas comunes de vehículos

  4. Funciones
    - Función de búsqueda de marcas con ranking por relevancia

  5. Seguridad
    - RLS en vehicle_makes (lectura pública)
*/

-- Crear tabla de marcas
CREATE TABLE IF NOT EXISTS vehicle_makes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  name_normalized text NOT NULL,
  logo_url text,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_name_normalized ON vehicle_makes(name_normalized);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_active ON vehicle_makes(active) WHERE active = true;

-- Agregar columna de relación a reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'vehicle_make_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN vehicle_make_id uuid REFERENCES vehicle_makes(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_vehicle_make_id ON reviews(vehicle_make_id);

-- Insertar marcas comunes (alfabéticamente)
INSERT INTO vehicle_makes (name, name_normalized) VALUES
  ('Abarth', 'abarth'),
  ('Alfa Romeo', 'alfaromeo'),
  ('Aston Martin', 'astonmartin'),
  ('Audi', 'audi'),
  ('Bentley', 'bentley'),
  ('BMW', 'bmw'),
  ('Bugatti', 'bugatti'),
  ('BYD', 'byd'),
  ('Cadillac', 'cadillac'),
  ('Chevrolet', 'chevrolet'),
  ('Chrysler', 'chrysler'),
  ('Citroën', 'citroen'),
  ('Cupra', 'cupra'),
  ('Dacia', 'dacia'),
  ('Daewoo', 'daewoo'),
  ('Daihatsu', 'daihatsu'),
  ('Dodge', 'dodge'),
  ('DS Automobiles', 'dsautomobiles'),
  ('Ferrari', 'ferrari'),
  ('Fiat', 'fiat'),
  ('Ford', 'ford'),
  ('Genesis', 'genesis'),
  ('GMC', 'gmc'),
  ('Honda', 'honda'),
  ('Hummer', 'hummer'),
  ('Hyundai', 'hyundai'),
  ('Infiniti', 'infiniti'),
  ('Isuzu', 'isuzu'),
  ('Jaguar', 'jaguar'),
  ('Jeep', 'jeep'),
  ('Kia', 'kia'),
  ('Lada', 'lada'),
  ('Lamborghini', 'lamborghini'),
  ('Lancia', 'lancia'),
  ('Land Rover', 'landrover'),
  ('Lexus', 'lexus'),
  ('Lincoln', 'lincoln'),
  ('Lotus', 'lotus'),
  ('Maserati', 'maserati'),
  ('Maybach', 'maybach'),
  ('Mazda', 'mazda'),
  ('McLaren', 'mclaren'),
  ('Mercedes-Benz', 'mercedesbenz'),
  ('MG', 'mg'),
  ('Mini', 'mini'),
  ('Mitsubishi', 'mitsubishi'),
  ('Nissan', 'nissan'),
  ('Opel', 'opel'),
  ('Peugeot', 'peugeot'),
  ('Polestar', 'polestar'),
  ('Porsche', 'porsche'),
  ('Ram', 'ram'),
  ('Renault', 'renault'),
  ('Rolls-Royce', 'rollsroyce'),
  ('Rover', 'rover'),
  ('Saab', 'saab'),
  ('Seat', 'seat'),
  ('Skoda', 'skoda'),
  ('Smart', 'smart'),
  ('SsangYong', 'ssangyong'),
  ('Subaru', 'subaru'),
  ('Suzuki', 'suzuki'),
  ('Tesla', 'tesla'),
  ('Toyota', 'toyota'),
  ('Volkswagen', 'volkswagen'),
  ('Volvo', 'volvo')
ON CONFLICT (name) DO NOTHING;

-- Función para buscar marcas con ranking
CREATE OR REPLACE FUNCTION search_vehicle_makes(search_query text, result_limit int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  name_normalized text,
  logo_url text,
  relevance int
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vm.id,
    vm.name,
    vm.name_normalized,
    vm.logo_url,
    CASE
      -- Coincidencia exacta (más relevante)
      WHEN LOWER(vm.name) = LOWER(search_query) THEN 100
      -- Comienza con el query (muy relevante)
      WHEN LOWER(vm.name) LIKE LOWER(search_query) || '%' THEN 90
      WHEN vm.name_normalized LIKE LOWER(REPLACE(search_query, ' ', '')) || '%' THEN 85
      -- Contiene el query (relevante)
      WHEN LOWER(vm.name) LIKE '%' || LOWER(search_query) || '%' THEN 70
      WHEN vm.name_normalized LIKE '%' || LOWER(REPLACE(search_query, ' ', '')) || '%' THEN 65
      -- Por defecto
      ELSE 50
    END as relevance
  FROM vehicle_makes vm
  WHERE 
    vm.active = true
    AND (
      LOWER(vm.name) LIKE '%' || LOWER(search_query) || '%'
      OR vm.name_normalized LIKE '%' || LOWER(REPLACE(search_query, ' ', '')) || '%'
    )
  ORDER BY relevance DESC, vm.name ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_vehicle_makes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vehicle_makes_updated_at_trigger ON vehicle_makes;
CREATE TRIGGER update_vehicle_makes_updated_at_trigger
  BEFORE UPDATE ON vehicle_makes
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_makes_updated_at();

-- RLS Policies
ALTER TABLE vehicle_makes ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer marcas activas (necesario para el autocomplete)
CREATE POLICY "Anyone can read active vehicle makes"
  ON vehicle_makes FOR SELECT
  USING (active = true);

-- Solo admins pueden crear/modificar marcas
CREATE POLICY "Admins can insert vehicle makes"
  ON vehicle_makes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update vehicle makes"
  ON vehicle_makes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete vehicle makes"
  ON vehicle_makes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );