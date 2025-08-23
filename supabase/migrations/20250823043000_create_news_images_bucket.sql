-- Create bucket for news article images
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true);

-- Allow public read access
create policy "Public read access for news images" on storage.objects
  for select using (bucket_id = 'news-images');

-- Allow authenticated users to upload images
create policy "Authenticated upload for news images" on storage.objects
  for insert with check (bucket_id = 'news-images' and auth.role() = 'authenticated');
