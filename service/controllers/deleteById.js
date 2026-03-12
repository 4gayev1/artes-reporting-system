const pool = require("../db/db");
const { minioClient } = require("../minioClient");

async function deleteById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Report not found" });
    }

    const report = result.rows[0];

    const fileUrl = new URL(report.minio_url);
    const pathParts = fileUrl.pathname.split("/").filter(Boolean);

    
    const bucket = pathParts[0];                 
    const objectName = decodeURIComponent(pathParts.slice(1).join("/"));

    await minioClient.removeObject(bucket, objectName);
    await pool.query("DELETE FROM reports WHERE id = $1", [id]);

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete report" });
  }
}

module.exports = { deleteById };
