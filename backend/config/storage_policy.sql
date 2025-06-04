-- Function to create storage policies
CREATE OR REPLACE FUNCTION create_storage_policy(bucket_name text, policy_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Enable RLS on the storage.objects table
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Create policy for authenticated users to insert their own files
  EXECUTE format(
    'CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated WITH CHECK (
      bucket_id = %L AND auth.uid() IS NOT NULL
    )',
    policy_name || '_insert',
    bucket_name
  );

  -- Create policy for authenticated users to update their own files
  EXECUTE format(
    'CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated USING (
      bucket_id = %L AND owner = auth.uid()
    )',
    policy_name || '_update',
    bucket_name
  );

  -- Create policy for authenticated users to delete their own files
  EXECUTE format(
    'CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated USING (
      bucket_id = %L AND owner = auth.uid()
    )',
    policy_name || '_delete',
    bucket_name
  );

  -- Create policy for everyone to read files
  EXECUTE format(
    'CREATE POLICY %I ON storage.objects FOR SELECT TO authenticated USING (
      bucket_id = %L
    )',
    policy_name || '_select',
    bucket_name
  );
END;
$$; 