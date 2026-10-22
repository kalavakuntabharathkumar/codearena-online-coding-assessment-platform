import "dotenv/config";
import { pool } from "./pool.js";

await pool.query(`
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('python', 'javascript')),
  source_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'failed')),
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS submissions_candidate_created_idx
ON submissions(candidate_id, created_at DESC);
`);
console.log("Database schema is ready.");
await pool.end();
