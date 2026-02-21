const express = require("express");
const cors = require("cors");
const path = require("path");

const reportsRouter = require("./routes/reports");

const { apiReference } = require("@scalar/express-api-reference");
const { generateSpec } = require("./docs/openapi");

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(express.json());

require("./controllers/tempCleaner");

app.get("/openapi.yaml", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json(generateSpec(baseUrl));
});

app.use(
  "/docs",
  apiReference({
    url: "/api/openapi.yaml",
    theme: "bluePlanet",
  }),
);

app.use("/", reportsRouter);
app.use("/preview", express.static(path.join(__dirname, "temp")));

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
