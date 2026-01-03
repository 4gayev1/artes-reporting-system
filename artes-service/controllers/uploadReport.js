const { v4: uuidv4 } = require("uuid");
const pool = require("../db/db");
const { minioClient, MinioConf } = require("../minioClient");

async function uploadReport(req, res) {
  try {
    const { type, name, project } = req.body;
    const reportFile = req.file;

    if (!name) return res.status(400).json({ error: "name is required" });
    if (!reportFile) return res.status(400).json({ error: "file is required" });

    const extension = reportFile.originalname.split(".").pop();
    const id = uuidv4();
    const date = new Date().toISOString();
    const t = type || "unknown";
    const proj = project || "unknown";

    const objectName = `${t}/${proj}/${name}-${date}.${extension}`;

    await minioClient.putObject("artes-reports", objectName, reportFile.buffer);

    const fileUrl = `http://${MinioConf.endPoint}:${MinioConf.port}/${"artes-reports"}/${objectName}`;

    const query = `
      INSERT INTO reports (id, type, name, file_url, project)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await pool.query(query, [id, t, name, fileUrl, proj]);

    res.json({
      message: "Report uploaded successfully",
      report: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
}

module.exports = { uploadReport };
