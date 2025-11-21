import swaggerJsdoc from "swagger-jsdoc";
import { ConfigService } from "./config";


const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My User API",
      version: "1.0.0",
      description: "A simple Express User API documented with Swagger",
    },
    servers: [
      {
        url: `http://${ConfigService.getInstance().http.bind}:${ConfigService.getInstance().http.port}`,
        description: "Development server",
      },
    ],
  },
  // --- THIS IS THE ONLY CHANGE YOU NEED ---
  // Point to your new YAML files instead of your TypeScript route files
  apis: ["./src/docs/**/*.yaml"], 
};

export const swaggerSpec = swaggerJsdoc(options);