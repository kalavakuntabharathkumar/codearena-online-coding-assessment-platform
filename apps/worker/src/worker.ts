import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import pg from "pg";

const { Pool } = pg;
const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });
const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/codearena" });

/**
 * SAFE DEMO ONLY: does not execute candidate code.
 * Replace with a dedicated, hardened sandbox service before handling real submissions.
 */
async function demoJudge(submissionId: string) {
  await pool.query("UPDATE submissions SET status = 'running', updated_at = NOW() WHERE id = $1", [submissionId]);
  const row = await pool.query("SELECT source_code FROM submissions WHERE id = $1", [submissionId]);
  if (!row.rowCount) return;
  const source: string = row.rows[0].source_code;
  const result = {
    verdict: "demo_only",
    message: "Queue processing succeeded. Candidate code was not executed.",
    sourceLength: source.length,
  };
  await pool.query(
    "UPDATE submissions SET status = 'accepted', result = $2, updated_at = NOW() WHERE id = $1",
    [submissionId, JSON.stringify(result)],
  );
}

const worker = new Worker("judging", async (job) => {
  await demoJudge(String(job.data.submissionId));
}, { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 8) });

worker.on("completed", (job) => console.log(`Processed job ${job.id}`));
worker.on("failed", (job, error) => console.error(`Job ${job?.id} failed`, error.message));
console.log("CodeArena demo worker is listening.");
