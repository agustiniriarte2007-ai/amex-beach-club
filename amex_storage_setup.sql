-- AMEX Beach Club: almacenamiento de fotos
insert into storage.buckets (id, name, public)
values ('amex-images', 'amex-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view AMEX images" on storage.objects;
drop policy if exists "Authenticated can upload AMEX images" on storage.objects;
drop policy if exists "Authenticated can update AMEX images" on storage.objects;
drop policy if exists "Authenticated can delete AMEX images" on storage.objects;

create policy "Public can view AMEX images"
on storage.objects for select
to public
using (bucket_id = 'amex-images');

create policy "Authenticated can upload AMEX images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'amex-images');

create policy "Authenticated can update AMEX images"
on storage.objects for update
to authenticated
using (bucket_id = 'amex-images')
with check (bucket_id = 'amex-images');

create policy "Authenticated can delete AMEX images"
on storage.objects for delete
to authenticated
using (bucket_id = 'amex-images');
