const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger.json";
const endpointsFiles = ["../routes/reports.js"]; 

const doc = {
  info: {
    title: "Artes Reports API",
    description: "API for managing test reports",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger JSON generated!");
});