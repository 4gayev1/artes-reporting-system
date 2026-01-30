const pool = require("../db/db");
const axios = require("axios");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");

async function getById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM reports WHERE id = $1", [
      id,
    ]);

    if (!result.rows.length) {
      return res.status(404).send("Report not found");
    }

    const report = result.rows[0];

    const minio_url = new URL(report.minio_url);

    const response = await axios.get(`${req.protocol}://minio:${minio_url.port}${minio_url.pathname}`,{
    responseType: "arraybuffer"
    })

    const buffer = Buffer.from(response.data);
    const filename = report.minio_url.split("/").pop().toLowerCase();

    const reportDir = path.join(__dirname, "../temp", `report-${id}`);

    fs.rmSync(reportDir, { recursive: true, force: true });
    fs.mkdirSync(reportDir, { recursive: true });

    if (filename.endsWith(".zip")) {
      const zip = new AdmZip(buffer);
      zip.extractAllTo(reportDir, true);

      res.redirect(`/api/preview/report-${id}/index.html`);
    }

    if (filename.endsWith(".html")) {
      fs.writeFileSync(path.join(reportDir, "index.html"), buffer);

      res.redirect(`/api/preview/report-${id}/index.html`);
    }

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
}

module.exports = { getById };
