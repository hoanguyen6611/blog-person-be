import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Blog Person Project",
      version: "1.0.0",
      description: "API documentation for the Web Blog Person Project",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Clerk session token (Authorization: Bearer <token>)",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"], // đường dẫn tới các file chứa Swagger comment
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
