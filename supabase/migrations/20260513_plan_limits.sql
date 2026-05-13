-- Plan limitleri tablosu
CREATE TABLE IF NOT EXISTS plan_limits (
  plan          TEXT PRIMARY KEY,
  max_applications INTEGER,  -- NULL = sınırsız
  max_users        INTEGER   -- NULL = sınırsız
);

INSERT INTO plan_limits (plan, max_applications, max_users) VALUES
  ('starter',   50,   3),
  ('pro',       NULL, NULL),
  ('kurumsal',  NULL, NULL)
ON CONFLICT (plan) DO UPDATE
  SET max_applications = EXCLUDED.max_applications,
      max_users        = EXCLUDED.max_users;
