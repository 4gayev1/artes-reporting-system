const pool = require("../db/db");
const { minioClient } = require("../minioClient");

async function deleteAll(req, res) {
  try {
    const { project, name, type, date, fromDate, toDate } = req.query;

    let whereClauses = [];
    let values = [];
    let i = 1;

    if (project) {
      whereClauses.push(`project ILIKE $${i++}`);
      values.push(`%${project}%`);
    }

    if (name) {
      whereClauses.push(`name ILIKE $${i++}`);
      values.push(`%${name}%`);
    }

    if (type) {
      whereClauses.push(`type = $${i++}`);
      values.push(type);
    }

    if (date) {
      whereClauses.push(`DATE(upload_date) = $${i++}`);
      values.push(date);
    }

    if (fromDate) {
      whereClauses.push(`upload_date >= $${i++}`);
      values.push(fromDate);
    }

    if (toDate) {
      whereClauses.push(`upload_date <= $${i++}`);
      values.push(toDate);
    }

    const whereSQL = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const selectQuery = `
      SELECT id, report_url
      FROM reports
      ${whereSQL}
    `;

    const { rows } = await pool.query(selectQuery, values);

    if (!rows.length) {
      return res.status(404).json({ message: "No reports found to delete" });
    }

    await Promise.all(
      rows.map((report) => {
        const objectName = report.report_url.split("/").slice(4).join("/");
        return minioClient
          .removeObject("artes-reports", objectName)
          .catch((err) => {
            console.warn(`MinIO delete failed: ${objectName}`, err.message);
          });
      }),
    );

    const ids = rows.map((r) => r.id);

    await pool.query(`DELETE FROM reports WHERE id = ANY($1)`, [ids]);

    res.json({
      message: `Deleted ${rows.length} report(s) successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete reports" });
  }
}

module.exports = { deleteAll };
