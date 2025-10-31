-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default categories
INSERT INTO public.categories (name) VALUES
  ('Electronics'),
  ('Books'),
  ('Bags'),
  ('Keys'),
  ('Clothing'),
  ('Jewelry'),
  ('ID Cards'),
  ('Water Bottles'),
  ('Accessories'),
  ('Other');

-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  color TEXT,
  location TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('school', 'office', 'public')),
  date_occurred DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'closed')),
  image_url TEXT,
  contact_preference TEXT DEFAULT 'platform',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on items
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Items policies
CREATE POLICY "Anyone can view active items"
  ON public.items FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON public.items FOR DELETE
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true);

-- Storage policies for item images
CREATE POLICY "Anyone can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'item-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own item images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'item-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own item images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'item-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_items
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();