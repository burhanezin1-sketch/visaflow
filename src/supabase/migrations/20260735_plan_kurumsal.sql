ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_plan_check;
ALTER TABLE companies ADD CONSTRAINT companies_plan_check
  CHECK (plan IN ('basic', 'pro', 'kurumsal'));
