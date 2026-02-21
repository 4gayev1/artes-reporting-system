const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

function generateSpec(baseUrl) {
  const spec = yaml.load(
    fs.readFileSync(path.join(__dirname, "../docs/openapi.yaml"), "utf8"),
  );

  spec.servers = [
    { url: baseUrl, description: "Artes Reporting System Server" },
  ];

  return spec;
}

module.exports = { generateSpec };
