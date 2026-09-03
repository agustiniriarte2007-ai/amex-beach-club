# AMEX Beach Club · versión real

Web Vite + Supabase. Incluye landing pública, reservas guardadas en Supabase y `/admin` con login para editar contenido, menú, actividades y estados de reservas.

## Variables de Vercel
El proyecto ya está preparado para leer:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

También acepta los nombres Vite `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## Importante antes de usar producción
En Supabase debe configurarse Auth para el administrador y RLS/policies para las tablas. El archivo `setup.sql` contiene una base de políticas recomendadas.
Actualización para conectar Vercel con GitHub.
