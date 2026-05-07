# Activa Fitness — Torneos

Web de torneos deportivos para **Activa Fitness Agost**. Gestiona clasificaciones, resultados y cuadros de Fútbol Sala y Pádel en tiempo real.

---

## Tecnologías

- **React 19** + **Vite 8**
- **Tailwind CSS 4**
- **Supabase** (base de datos + autenticación)
- **React Router 7**

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd torneos-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver sección siguiente)
cp .env.example .env

# 4. Arrancar en desarrollo
npm run dev

# 5. Compilar para producción
npm run build
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_ANONIMA
```

Encuéntralas en tu proyecto de Supabase: **Settings → API**.

> ⚠️ Nunca subas el archivo `.env` a Git. Ya está en el `.gitignore`.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/          # Header, Footer, Sidebar, ProtectedRoute
│   └── ui/              # MatchNode, StandingsTable, Iconos
├── hooks/
│   ├── useAuth.js        # Sesión de Supabase
│   └── useCalcStats.js   # Cálculo de clasificaciones
├── lib/
│   ├── generadores/      # Generador automático del Torneo 24h
│   └── validarPadel.js   # Validación de resultados de pádel
├── pages/
│   ├── admin/            # Panel de administración (protegido)
│   ├── futsal/           # Páginas públicas de Fútbol Sala
│   ├── padel/            # Páginas públicas de Pádel
│   ├── Home.jsx
│   └── SobreNosotros.jsx
└── supabase.js           # Cliente de Supabase
```

---

## Base de datos (Supabase)

### Tablas necesarias

| Tabla | Descripción |
|---|---|
| `torneos` | id, nombre, deporte, estado |
| `grupos` | id, torneo_id, nombre |
| `participantes` | id, nombre (único) |
| `grupo_participantes` | grupo_id, participante_id |
| `partidos` | id, torneo_id, fase, jornada, hora, ubicacion, estado, local_id, visitante_id, puntuacion_local, puntuacion_visitante, detalle_resultado |

### ⚠️ Row Level Security (RLS) — OBLIGATORIO

Con la clave anónima pública cualquier usuario puede leer los datos. Debes activar RLS y crear políticas en Supabase:

**En Supabase → Table Editor → cada tabla → RLS:**

```sql
-- Lectura pública (todos los usuarios)
CREATE POLICY "Lectura pública" ON torneos FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON grupos FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON participantes FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON grupo_participantes FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON partidos FOR SELECT USING (true);

-- Escritura solo para usuarios autenticados (admin)
CREATE POLICY "Solo admin escribe" ON torneos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admin escribe" ON grupos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admin escribe" ON participantes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admin escribe" ON grupo_participantes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Solo admin escribe" ON partidos FOR ALL USING (auth.role() = 'authenticated');
```

---

## Acceso al panel de administración

La ruta `/admin` está protegida por Supabase Auth. Para crear el usuario administrador:

1. Ve a tu proyecto en Supabase
2. **Authentication → Users → Add user**
3. Introduce el email y contraseña del administrador
4. Accede a `/admin` con esas credenciales

---

## Despliegue en producción

Recomendado: **Vercel** o **Netlify**.

1. Conecta el repositorio de GitHub
2. Añade las variables de entorno en la configuración del proyecto
3. El comando de build es `npm run build` y el directorio de salida es `dist`

Recuerda actualizar la URL canonical en `index.html` con tu dominio real.

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar el build
npm run lint     # Comprobar errores de código
```
