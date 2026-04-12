import { Router } from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All collection routes require authentication
router.use(requireAuth);

// ── GET /api/collections ────────────────────────────────────────
// Returns all collection items for the logged-in user.
// Optional query param: ?category=favorite|owned|wanted
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT id, amiibo_id, amiibo_name, amiibo_image, amiibo_series,
             amiibo_type, category, created_at
      FROM collection
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (category && ["favorite", "owned", "wanted"].includes(category)) {
      query += ` AND category = $2`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /collections error:", err);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

// ── GET /api/collections/status/:amiiboId ───────────────────────
// Returns which categories a specific amiibo belongs to for the user.
router.get("/status/:amiiboId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT category FROM collection
       WHERE user_id = $1 AND amiibo_id = $2`,
      [req.user.id, req.params.amiiboId]
    );

    const status = {
      favorite: false,
      owned: false,
      wanted: false,
    };

    rows.forEach((row) => {
      status[row.category] = true;
    });

    res.json(status);
  } catch (err) {
    console.error("GET /collections/status error:", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

// ── POST /api/collections ───────────────────────────────────────
// Add an amiibo to a collection category.
// Body: { amiiboId, amiiboName, amiiboImage, amiiboSeries, amiiboType, category }
router.post("/", async (req, res) => {
  try {
    const { amiiboId, amiiboName, amiiboImage, amiiboSeries, amiiboType, category } = req.body;

    if (!amiiboId || !amiiboName || !category) {
      return res.status(400).json({ error: "amiiboId, amiiboName, and category are required" });
    }

    if (!["favorite", "owned", "wanted"].includes(category)) {
      return res.status(400).json({ error: "category must be favorite, owned, or wanted" });
    }

    // Owned and wanted are mutually exclusive
    if (category === "owned" || category === "wanted") {
      const opposite = category === "owned" ? "wanted" : "owned";
      await pool.query(
        `DELETE FROM collection
         WHERE user_id = $1 AND amiibo_id = $2 AND category = $3`,
        [req.user.id, amiiboId, opposite]
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO collection (user_id, amiibo_id, amiibo_name, amiibo_image, amiibo_series, amiibo_type, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, amiibo_id, category) DO NOTHING
       RETURNING *`,
      [req.user.id, amiiboId, amiiboName, amiiboImage || null, amiiboSeries || null, amiiboType || null, category]
    );

    if (rows.length === 0) {
      return res.status(409).json({ error: "Amiibo already in this collection" });
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /collections error:", err);
    res.status(500).json({ error: "Failed to add to collection" });
  }
});


// ── DELETE /api/collections ─────────────────────────────────────
// Remove an amiibo from a collection category.
// Body: { amiiboId, category }
router.delete("/", async (req, res) => {
  try {
    const { amiiboId, category } = req.body;

    if (!amiiboId || !category) {
      return res.status(400).json({ error: "amiiboId and category are required" });
    }

    const { rowCount } = await pool.query(
      `DELETE FROM collection
       WHERE user_id = $1 AND amiibo_id = $2 AND category = $3`,
      [req.user.id, amiiboId, category]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Collection entry not found" });
    }

    res.json({ message: "Removed from collection" });
  } catch (err) {
    console.error("DELETE /collections error:", err);
    res.status(500).json({ error: "Failed to remove from collection" });
  }
});

export default router;