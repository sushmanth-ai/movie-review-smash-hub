
-- Table to store VAPID keys (generated once)
CREATE TABLE public.push_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_key text NOT NULL,
  private_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.push_settings ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only accessed via service role from edge functions

-- Table to store push subscriptions from users
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  device_hash text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can subscribe to notifications)
CREATE POLICY "Anyone can subscribe to push" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

-- Allow anonymous deletes by endpoint (for unsubscribe)
CREATE POLICY "Anyone can unsubscribe" ON public.push_subscriptions
  FOR DELETE USING (true);
