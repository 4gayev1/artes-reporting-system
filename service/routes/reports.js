const express = require("express");
const multer = require("multer");

const { checkHealth } = require("../controllers/healthChecker");
const { getById } = require("../controllers/getById");
const { getAll } = require("../controllers/getAll");
const { getLogoURL } = require("../controllers/getLogoURL");
const { getLogo } = require("../controllers/getLogo");
const { getTypes } = require("../controllers/getTypes");
const { getProjects } = require("../controllers/getProjects");
const { getBrowsers } = require("../controllers/getBrowsers");
const { getOS } = require("../controllers/getOS");
const { getExecutors } = require("../controllers/getExecutor");
const { getEnvironments } = require("../controllers/getEnvironment");

const { uploadLogo } = require("../controllers/uploadLogo");
const { uploadReport } = require("../controllers/uploadReport");

const { changeReportName } = require("../controllers/changeReportName");

const { deleteById } = require("../controllers/deleteById");
const { deleteAll } = require("../controllers/deleteAll");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", checkHealth);

router.get("/logo", getLogo);
router.get("/logo-url", getLogoURL);
router.get("/reports", getAll);
router.get("/preview/:id", getById);
router.get("/types", getTypes);
router.get("/projects", getProjects);
router.get("/browsers", getBrowsers);
router.get("/os", getOS);
router.get("/executors", getExecutors);
router.get("/environments", getEnvironments);

router.post("/report", upload.single("file"), uploadReport);
router.post("/logo", upload.single("file"), uploadLogo);

router.patch("/report/:id", changeReportName);

router.delete("/report/:id", deleteById);
router.delete("/reports", deleteAll);

module.exports = router;
