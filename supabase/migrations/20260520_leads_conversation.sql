ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversation_history jsonb DEFAULT '[]';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_summary text;
