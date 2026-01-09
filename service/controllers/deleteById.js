const pool = require("../db/db");
const { minioClient } = require("../minioClient");

async function deleteById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM reports WHERE id = $1", [
      id,
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Report not found" });
    }

    const report = result.rows[0];

    const fileUrlParts = report.report_url.split("/");
    const objectName = fileUrlParts.slice(4).join("/");

    await minioClient.removeObject("artes-reports", objectName);

    await pool.query("DELETE FROM reports WHERE id = $1", [id]);

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete report" });
  }
}

module.exports = { deleteById };
