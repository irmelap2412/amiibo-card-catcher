import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";

import { auth } from "./lib/auth.js";
import collectionsRouter from "./routes/collections.js";
import usersRouter from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ── Better Auth handler (must come BEFORE express.json) ─────────
app.all("/api/auth/*", toNodeHandler(auth));

// ── Body parsing (after Better Auth) ────────────────────────────
app.use(express.json());

// ── App routes ──────────────────────────────────────────────────
app.use("/api/collections", collectionsRouter);
app.use("/api/users", usersRouter);

// ── Health check ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Amiibo Card Catcher API running on http://localhost:${PORT}`);
});