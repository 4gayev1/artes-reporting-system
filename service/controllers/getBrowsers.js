const pool = require("../db/db");

async function getBrowsers(req, res) {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT browser_name FROM reports WHERE browser_name IS NOT NULL`);

    const result = rows.map((row, index) => ({
      [index + 1]: row.browser_name,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get browsers" });
  }
}

module.exports = { getBrowsers };
