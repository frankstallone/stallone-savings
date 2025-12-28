CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  cover_image_url text,
  cover_image_source text,
  cover_image_attribution_name text,
  cover_image_attribution_url text,
  cover_image_id text,
  target_amount_cents integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goal_champions (
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (goal_id, user_id)
);

CREATE TABLE IF NOT EXISTS goal_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount_cents integer NOT NULL,
  transacted_on date NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS goal_transactions_goal_id_idx
  ON goal_transactions(goal_id);

CREATE INDEX IF NOT EXISTS goal_champions_goal_id_idx
  ON goal_champions(goal_id);
