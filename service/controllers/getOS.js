const pool = require("../db/db");

async function getOS(req, res) {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT os_name FROM reports WHERE os_name IS NOT NULL`);

    const result = rows.map((row, index) => ({
      [index + 1]: row.os_name,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get OS" });
  }
}

module.exports = { getOS };
