import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Ngontolodon API",
        description: "API for managing users and tasks",
        version: "1.0.0",
    },

    servers: [
        { 
            url: "http://localhost:3000/api", 
            description: "Development server"
        },
        {
            url: "http://teskon.vercel.app/api",
            description: "Production server"
        }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            LoginRequest: {
                password: "12341234",
            }
        }
    },

    security: [{ bearerAuth: [] }],
    tags: [{ name: "Users", description: "Operations related to users" }],
    paths: {},
}

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);