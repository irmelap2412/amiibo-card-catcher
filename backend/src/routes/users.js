import { Router } from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// ── GET /api/users/me ───────────────────────────────────────────
// Get current user's profile.
router.get("/me", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, image, created_at, updated_at
       FROM "users"
       WHERE id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ── PUT /api/users/me ───────────────────────────────────────────
// Update current user's profile (name, image).
router.put("/me", async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name && !image) {
      return res.status(400).json({ error: "Provide at least name or image to update" });
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      params.push(name);
    }
    if (image) {
      fields.push(`image = $${idx++}`);
      params.push(image);
    }

    fields.push(`updated_at = NOW()`);
    params.push(req.user.id);

    const { rows } = await pool.query(
      `UPDATE "users"
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING id, name, email, image, created_at, updated_at`,
      params
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /users/me error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ── GET /api/users/me/stats ─────────────────────────────────────
// Get collection counts for the current user.
router.get("/me/stats", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT category, COUNT(*)::int AS count
       FROM collection
       WHERE user_id = $1
       GROUP BY category`,
      [req.user.id]
    );

    const stats = { favorite: 0, owned: 0, wanted: 0 };
    rows.forEach((row) => {
      stats[row.category] = row.count;
    });

    res.json(stats);
  } catch (err) {
    console.error("GET /users/me/stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ── DELETE /api/users/me ────────────────────────────────────────
// Delete current user account and all associated data.
router.delete("/me", async (req, res) => {
  try {
    await pool.query(`DELETE FROM "users" WHERE id = $1`, [req.user.id]);
    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("DELETE /users/me error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;