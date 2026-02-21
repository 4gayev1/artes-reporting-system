const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Artes Reports API",
      version: "1.0.0",
      description: "API for managing test reports",
    },
    servers: [], 
  },
  apis: [path.join(__dirname, "../routes/*.js")]
};

module.exports = swaggerJsdoc(options);