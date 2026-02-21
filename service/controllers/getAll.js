const pool = require("../db/db");

async function getAll(req, res) {
  try {
    const { project, name, type, date, fromDate, toDate } = req.query;

    const page = Number(req.query.page) || 1;
    const size = Number(req.query.size) || 10;
    const offset = (page - 1) * size;

    let baseQuery = `
      FROM reports r
      LEFT JOIN status s ON r.id = s.id
      WHERE 1=1
    `;
    const values = [];
    let i = 1;

    if (project) {
      baseQuery += ` AND r.project ILIKE $${i++}`;
      values.push(`%${project}%`);
    }

    if (name) {
      baseQuery += ` AND r.name ILIKE $${i++}`;
      values.push(`%${name}%`);
    }

    if (type) {
      baseQuery += ` AND r.type = $${i++}`;
      values.push(type);
    }

    if (date) {
      baseQuery += ` AND DATE(r.upload_date) = $${i++}`;
      values.push(date);
    }

    if (fromDate) {
      baseQuery += ` AND r.upload_date >= $${i++}`;
      values.push(fromDate);
    }

    if (toDate) {
      baseQuery += ` AND r.upload_date <= $${i++}`;
      values.push(toDate);
    }

    const count = await pool.query(`SELECT COUNT(*) ${baseQuery}`, values);
    const total = Number(count.rows[0].count);

    const data = await pool.query(
      `
      SELECT
        r.*,
        s.failed,
        s.broken,
        s.passed,
        s.skipped,
        s.unknown,
        s.pipeline_status,
        s.pipeline_url,
        s.pipeline_name,
        s.pipeline_build_order
      ${baseQuery}
      ORDER BY r.upload_date DESC
      LIMIT $${i} OFFSET $${i + 1}
      `,
      [...values, size, offset],
    );

    const reports = data.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      project: row.project,
      upload_date: row.upload_date,
      report: row.report_url,
      minio: row.minio_url,
      status: {
        failed: row.failed,
        broken: row.broken,
        passed: row.passed,
        skipped: row.skipped,
        unknown: row.unknown,
        pipeline_status: row.pipeline_status,
        pipeline_url: row.pipeline_url,
        pipeline_name: row.pipeline_name,
        pipeline_build_order: row.pipeline_build_order,
      },
    }));

    res.json({
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      reports,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
}

module.exports = { getAll };
