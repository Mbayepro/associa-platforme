-- ==============================================================================
-- MIGRATION: 0008_organizations_bucket
-- DESCRIPTION: Create the organizations storage bucket for logos and setup RLS.
-- ==============================================================================

-- 1. Create the 'organizations' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'organizations', 
    'organizations', 
    true, 
    2097152, -- 2MB
    '{image/jpeg,image/png,image/webp}'
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = '{image/jpeg,image/png,image/webp}';

-- 2. Setup RLS for the organizations bucket
-- Anyone can view logos
CREATE POLICY "Logos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'organizations');

-- Only organization admins can upload their own org logo
-- The path will be organizations/{org_id}/logo...
CREATE POLICY "Admins can upload org logos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'organizations' 
        AND auth.uid() IN (
            SELECT user_id 
            FROM public.organization_members 
            WHERE organization_id = (string_to_array(name, '/'))[1]::uuid
            AND role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Admins can update org logos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'organizations' 
        AND auth.uid() IN (
            SELECT user_id 
            FROM public.organization_members 
            WHERE organization_id = (string_to_array(name, '/'))[1]::uuid
            AND role IN ('OWNER', 'ADMIN')
        )
    );
