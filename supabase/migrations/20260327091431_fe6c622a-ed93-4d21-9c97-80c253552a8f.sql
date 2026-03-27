
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

create policy "Anyone can view review images"
on storage.objects for select
using (bucket_id = 'review-images');

create policy "Authenticated users can upload review images"
on storage.objects for insert
with check (bucket_id = 'review-images');

create policy "Authenticated users can delete review images"
on storage.objects for delete
using (bucket_id = 'review-images');
