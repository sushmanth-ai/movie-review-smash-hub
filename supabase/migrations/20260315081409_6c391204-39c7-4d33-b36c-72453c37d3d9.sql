
-- Create storage bucket for movie update media
INSERT INTO storage.buckets (id, name, public) VALUES ('movie-updates', 'movie-updates', true);

-- Allow anyone to read from movie-updates bucket
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'movie-updates');

-- Allow anyone to upload to movie-updates bucket (admin-only in practice via UI)
CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'movie-updates');

-- Create lucky_draw_entries table
CREATE TABLE public.lucky_draw_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lucky_draw_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view entries (public feature)
CREATE POLICY "Anyone can view entries" ON public.lucky_draw_entries FOR SELECT USING (true);

-- Anyone can add entries (public feature)
CREATE POLICY "Anyone can add entries" ON public.lucky_draw_entries FOR INSERT WITH CHECK (true);

-- Anyone can delete entries (admin controls via UI)
CREATE POLICY "Anyone can delete entries" ON public.lucky_draw_entries FOR DELETE USING (true);
