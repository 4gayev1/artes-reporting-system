const pool = require("../db/db");

async function getExecutors(req, res) {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT executor FROM reports WHERE executor IS NOT NULL`);

    const result = rows.map((row, index) => ({
      [index + 1]: row.executor,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get executors" });
  }
}

module.exports = { getExecutors };
