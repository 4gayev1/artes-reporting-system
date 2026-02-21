const { v4: uuidv4 } = require("uuid");
const pool = require("../db/db");
const { minioClient, MinioConf } = require("../minioClient");
const AdmZip = require("adm-zip");

function parsePrometheusData(content) {
  const fields = ["failed", "broken", "passed", "skipped", "unknown"];
  const result = {};
  for (const field of fields) {
    const match = content.match(new RegExp(`launch_status_${field}\\s+(\\d+)`));
    result[field] = match ? parseInt(match[1], 10) : 0;
  }
  return result;
}

function extractStatusFromZip(buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const prometheusEntry = entries.find((e) =>
    e.entryName.match(/[^/]+\/export\/prometheusData\.txt$/)
  );

  const executorEntry = entries.find((e) =>
    e.entryName.match(/[^/]+\/widgets\/executors\.json$/)
  );

  let statusFields = null;
  let executor = null;

  if (prometheusEntry) {
    statusFields = parsePrometheusData(prometheusEntry.getData().toString("utf8"));
  }

  if (executorEntry) {
    try {
      const json = JSON.parse(executorEntry.getData().toString("utf8"));
      const first = Array.isArray(json) ? json[0] : json;
      executor = {
        buildName:  first.buildName  ?? null,
        buildUrl:   first.buildUrl   ?? null,
        buildOrder: first.buildOrder ?? null,
      };
    } catch {
      executor = null;
    }
  }

  return { statusFields, executor };
}

async function uploadReport(req, res) {
  try {
    const {
      type, name, project,

      failed, broken, passed, skipped, unknown,

      pipeline_status,
      pipeline_url,
      pipeline_name,
      pipeline_build_order,
    } = req.body;

    const reportFile = req.file;

    if (!name)       return res.status(400).json({ error: "name is required" });
    if (!reportFile) return res.status(400).json({ error: "file is required" });

    const extension = reportFile.originalname.split(".").pop();
    const id   = uuidv4();
    const date = new Date().toISOString();
    const t    = type    || "unknown";
    const proj = project || "unknown";


    let statusFields = {
      failed:  Number(failed)  || 0,
      broken:  Number(broken)  || 0,
      passed:  Number(passed)  || 0,
      skipped: Number(skipped) || 0,
      unknown: Number(unknown) || 0,
    };

    let executor = {
      buildName:  pipeline_name         ?? null,
      buildUrl:   pipeline_url          ?? null,
      buildOrder: pipeline_build_order  ?? null,
    };


    if (extension === "zip") {
      const extracted = extractStatusFromZip(reportFile.buffer);

      if (extracted.statusFields) {
        statusFields = extracted.statusFields;
      }

      if (extracted.executor) {
        executor = extracted.executor;
      }
    }


    const objectName = `${t}/${proj}/${name}-${date}.${extension}`;
    await minioClient.putObject("artes-reports", objectName, reportFile.buffer);

    const minioUrl  = `${req.protocol}://${req.get("host")}:${MinioConf.port}/artes-reports/${objectName}`;
    const reportUrl = `${req.protocol}://${req.get("host")}/api/preview/${id}`;


    const reportResult = await pool.query(
      `INSERT INTO reports (id, type, name, minio_url, report_url, project)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [id, t, name, minioUrl, reportUrl, proj]
    );


    const statusResult = await pool.query(
      `INSERT INTO status
         (id, failed, broken, passed, skipped, unknown,
          pipeline_status, pipeline_url, pipeline_name, pipeline_build_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;`,
      [
        id,
        statusFields.failed,
        statusFields.broken,
        statusFields.passed,
        statusFields.skipped,
        statusFields.unknown,
        pipeline_status ?? 0,
        executor.buildUrl,
        executor.buildName,
        executor.buildOrder,
      ]
    );

    res.json({
      message: "Report uploaded successfully",
      report:  reportResult.rows[0],
      status:  statusResult.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
}

module.exports = { uploadReport };