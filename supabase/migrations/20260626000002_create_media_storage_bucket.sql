-- Create a public storage bucket for large media files that exceed Cloudinary's 10 MB free-plan limit.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, null)
on conflict (id) do nothing;

-- RLS: authenticated users can upload to the media bucket
create policy "Authenticated users can upload to media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'media');

-- RLS: anyone can read files from the media bucket
create policy "Anyone can read from media"
on storage.objects
for select
to public
using (bucket_id = 'media');

-- RLS: users can update their own files
create policy "Users can update own media files"
on storage.objects
for update
to authenticated
using (bucket_id = 'media' and owner = auth.uid());

-- RLS: users can delete their own files
create policy "Users can delete own media files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'media' and owner = auth.uid());
