import express from "express";
import cors from "cors";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { pool } from "./db/pool.js";
import { judgingQueue } from "./queue.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

const submissionSchema = z.object({
  candidateId: z.string().trim().min(1).max(100),
  language: z.enum(["python", "javascript"]),
  sourceCode: z.string().min(1).max(50_000),
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/submissions", async (req, res, next) => {
  try {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const id = randomUUID();
    const { candidateId, language, sourceCode } = parsed.data;
    await pool.query(
      "INSERT INTO submissions (id, candidate_id, language, source_code) VALUES ($1, $2, $3, $4)",
      [id, candidateId, language, sourceCode],
    );
    await judgingQueue.add("judge", { submissionId: id }, {
      attempts: 3, backoff: { type: "exponential", delay: 500 }, removeOnComplete: 1000,
    });
    return res.status(202).json({ id, status: "queued" });
  } catch (error) { return next(error); }
});

app.get("/api/submissions/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, candidate_id AS \"candidateId\", language, status, result, created_at AS \"createdAt\" FROM submissions WHERE id = $1",
      [req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ error: "Submission not found" });
    return res.json(result.rows[0]);
  } catch (error) { return next(error); }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});
