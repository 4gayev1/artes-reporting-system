const express = require("express");
const cors = require("cors");
const path = require("path");

const reportsRouter = require("./routes/reports");

const swaggerSpec = require("./docs/swagger.json");
const { apiReference } = require("@scalar/express-api-reference");

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(express.json());

require("./controllers/tempCleaner");

app.get("/swagger.json", (req, res) => {
  const spec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${req.protocol}://${req.get("host")}`, 
        description: "Dynamic server",
      },
    ],
  };

  
  res.json(spec);
});

app.use(
  "/docs",
  apiReference({
    spec: { url: "/api/swagger.json" },
    theme: "bluePlanet",
  })
);


app.use("/", reportsRouter);
app.use("/preview", express.static(path.join(__dirname, "temp")));

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));