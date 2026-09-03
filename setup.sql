-- Ejecutar en Supabase SQL Editor cuando quieras cerrar el acceso público de escritura.
-- Primero crea el usuario administrador desde Authentication > Users.

alter table public.contenido enable row level security;
alter table public.menu enable row level security;
alter table public.actividades enable row level security;
alter table public.reservas enable row level security;

create policy "contenido publico lectura" on public.contenido for select to anon, authenticated using (true);
create policy "contenido admin escritura" on public.contenido for all to authenticated using (true) with check (true);

create policy "menu publico lectura" on public.menu for select to anon, authenticated using (true);
create policy "menu admin escritura" on public.menu for all to authenticated using (true) with check (true);

create policy "actividades publico lectura" on public.actividades for select to anon, authenticated using (true);
create policy "actividades admin escritura" on public.actividades for all to authenticated using (true) with check (true);

create policy "reservas publico alta" on public.reservas for insert to anon, authenticated with check (true);
create policy "reservas admin lectura" on public.reservas for select to authenticated using (true);
create policy "reservas admin cambio" on public.reservas for update to authenticated using (true) with check (true);
