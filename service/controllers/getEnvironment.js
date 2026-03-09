const pool = require("../db/db");

async function getEnvironments(req, res) {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT environment FROM reports WHERE environment IS NOT NULL`);

    const result = rows.map((row, index) => ({
      [index + 1]: row.environment,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get environments" });
  }
}

module.exports = { getEnvironments };
