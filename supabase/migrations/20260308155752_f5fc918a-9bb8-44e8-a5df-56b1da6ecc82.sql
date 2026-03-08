
-- Profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  total_points integer NOT NULL DEFAULT 0,
  predictions_count integer NOT NULL DEFAULT 0,
  correct_predictions integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prediction movies (admin creates these)
CREATE TABLE public.prediction_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  release_date date,
  is_active boolean NOT NULL DEFAULT true,
  actual_verdict text, -- set after release: 'hit', 'flop', 'average'
  actual_rating numeric(3,1),
  actual_collection text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.prediction_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prediction movies" ON public.prediction_movies FOR SELECT USING (true);
CREATE POLICY "Admins can manage prediction movies" ON public.prediction_movies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User predictions
CREATE TABLE public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id uuid NOT NULL REFERENCES public.prediction_movies(id) ON DELETE CASCADE,
  verdict_prediction text CHECK (verdict_prediction IN ('hit', 'flop', 'average')),
  rating_prediction numeric(2,1) CHECK (rating_prediction >= 1 AND rating_prediction <= 5),
  collection_prediction text CHECK (collection_prediction IN ('0-50cr', '50-100cr', '100-200cr', '200-500cr', '500cr+')),
  points_earned integer NOT NULL DEFAULT 0,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view predictions" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Users can create own predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unresolved predictions" ON public.predictions FOR UPDATE USING (auth.uid() = user_id AND is_resolved = false);
