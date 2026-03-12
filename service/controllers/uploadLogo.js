const { minioClient } = require("../minioClient");
const path = require("path");
const fs = require("fs");

const BUCKET_NAME = "logo";
const LOGO_FILE_NAME = "logo";
const LOCAL_LOGO_PATH = path.join(__dirname, "../assets/ars-logo.png");

async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.log(`Bucket "${BUCKET_NAME}" does not exist. Creating...`);
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket "${BUCKET_NAME}" created`);

      const bucketPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(
        BUCKET_NAME,
        JSON.stringify(bucketPolicy),
      );
      console.log(`Bucket policy applied for "${BUCKET_NAME}"`);
    }

    await uploadDefaultLogoIfNeeded();
  } catch (error) {
    console.error("Error in ensureBucket:", error);
  }
}

async function uploadDefaultLogoIfNeeded() {
  try {
    const objectsList = [];
    const stream = minioClient.listObjectsV2(BUCKET_NAME, "", true);

    stream.on("data", (obj) => objectsList.push(obj.name));

    await new Promise((resolve, reject) => {
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    if (objectsList.length === 0) {
      console.log("Uploading default logo...");
      const fileBuffer = fs.readFileSync(LOCAL_LOGO_PATH);
      const fileStat = fs.statSync(LOCAL_LOGO_PATH);

      await minioClient.putObject(
        BUCKET_NAME,
        LOGO_FILE_NAME,
        fileBuffer,
        fileStat.size,
        {
          "Content-Type": "image/png",
        },
      );
      console.log("Default logo uploaded successfully");
    }
  } catch (error) {
    console.error("Error uploading default logo:", error);
  }
}

async function uploadLogo(req, res) {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const allowed = [".png", ".jpg", ".jpeg", ".gif", ".svg"];
    const ext = req.file.originalname
      .slice(req.file.originalname.lastIndexOf("."))
      .toLowerCase();
    if (!allowed.includes(ext)) {
      return res.status(400).send("Only image files are allowed");
    }

    const objectsList = [];
    const stream = minioClient.listObjectsV2(BUCKET_NAME, "", true);
    stream.on("data", (obj) => objectsList.push(obj.name));

    await new Promise((resolve, reject) => {
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    if (objectsList.length > 0) {
      await minioClient.removeObjects(BUCKET_NAME, objectsList);
      console.log("Removed existing logos from bucket");
    }

    await minioClient.putObject(
      BUCKET_NAME,
      LOGO_FILE_NAME,
      req.file.buffer,
      req.file.size,
      {
        "Content-Type": req.file.mimetype,
      },
    );

    res.json({ message: "Logo uploaded successfully" });
  } catch (err) {
    console.error("Error in uploadLogo:", err);
    res.status(500).send("Error uploading logo");
  }
}

ensureBucket().catch(console.error);

module.exports = { uploadLogo };
