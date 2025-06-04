-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Give public access to post images" ON storage.objects FOR SELECT
USING (bucket_id = 'post-images-f423yiufg348ygv3rhfvbf34yibv34gb');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (
  bucket_id = 'post-images-f423yiufg348ygv3rhfvbf34yibv34gb'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files" ON storage.objects FOR UPDATE
TO authenticated USING (
  bucket_id = 'post-images-f423yiufg348ygv3rhfvbf34yibv34gb'
  AND owner = auth.uid()
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files" ON storage.objects FOR DELETE
TO authenticated USING (
  bucket_id = 'post-images-f423yiufg348ygv3rhfvbf34yibv34gb'
  AND owner = auth.uid()
); 