-- ============================================
-- Luxe Commerce Media — Database Schema
-- ============================================

-- 1. PROFILES — Merchant profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION public.generate_profile_slug()
RETURNS trigger AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing dashes
  NEW.slug := trim(both '-' from NEW.slug);
  -- Append short random suffix to avoid collisions
  NEW.slug := NEW.slug || '-' || substring(replace(NEW.id::text, '-', ''), 1, 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profile_slug
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_profile_slug();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);


-- 2. POSTS — Merchant publications
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('promotion', 'event', 'job', 'news')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for feed queries
CREATE INDEX idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX idx_posts_profile_id ON public.posts (profile_id);
CREATE INDEX idx_posts_post_type ON public.posts (post_type);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Published posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can insert their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);


-- 3. CATEGORIES — Business categories reference table
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_lb TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read-only
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);


-- 4. STORAGE BUCKET — For logos and post images
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-assets', 'merchant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view merchant assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'merchant-assets');

CREATE POLICY "Authenticated users can upload merchant assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'merchant-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'merchant-assets' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'merchant-assets' AND auth.uid() = owner);


-- 5. TRIGGER — Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- 6. SEED DATA — Default categories
-- ============================================
INSERT INTO public.categories (name_fr, name_en, name_lb, slug, icon) VALUES
  ('Alimentation', 'Food', 'Liewensmëttel', 'alimentation', '🛒'),
  ('Mode', 'Fashion', 'Moud', 'mode', '👗'),
  ('Santé & Bien-être', 'Health & Wellness', 'Gesondheet & Wellness', 'sante', '💆'),
  ('Maison & Déco', 'Home & Decor', 'Haus & Dekor', 'maison', '🏠'),
  ('Services', 'Services', 'Servicer', 'services', '🔧'),
  ('Loisirs', 'Leisure', 'Fräizäit', 'loisirs', '🎮'),
  ('Technologie', 'Technology', 'Technologie', 'technologie', '💻'),
  ('Autre', 'Other', 'Aner', 'autre', '📦')
ON CONFLICT (slug) DO NOTHING;
