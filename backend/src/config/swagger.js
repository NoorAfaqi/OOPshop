const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OOPshop API Documentation",
      version: "1.0.0",
      description: "A comprehensive e-commerce API for OOPshop with product management, invoicing, and payment processing",
      contact: {
        name: "Muhammad Noor Afaqi",
        email: "support@oopshop.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: "Development server",
      },
      {
        url: "https://api.oopshop.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Validation errors",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Product ID",
            },
            name: {
              type: "string",
              description: "Product name",
            },
            price: {
              type: "number",
              format: "decimal",
              description: "Product price",
            },
            brand: {
              type: "string",
              description: "Product brand",
            },
            image_url: {
              type: "string",
              description: "Product image URL",
            },
            category: {
              type: "string",
              description: "Product category",
            },
            nutritional_info: {
              type: "object",
              description: "Nutritional information (JSON)",
            },
            stock_quantity: {
              type: "integer",
              description: "Available stock quantity",
            },
            open_food_facts_barcode: {
              type: "string",
              description: "Open Food Facts barcode",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
          },
        },
        Customer: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Customer ID",
            },
            first_name: {
              type: "string",
              description: "First name",
            },
            last_name: {
              type: "string",
              description: "Last name",
            },
            phone: {
              type: "string",
              description: "Phone number",
            },
            billing_street: {
              type: "string",
              description: "Billing street address",
            },
            billing_zip: {
              type: "string",
              description: "Billing ZIP code",
            },
            billing_city: {
              type: "string",
              description: "Billing city",
            },
            billing_country: {
              type: "string",
              description: "Billing country",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
          },
        },
        Invoice: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Invoice ID",
            },
            customer_id: {
              type: "integer",
              description: "Customer ID",
            },
            total_amount: {
              type: "number",
              format: "decimal",
              description: "Total invoice amount",
            },
            status: {
              type: "string",
              enum: ["pending", "paid", "cancelled"],
              description: "Invoice status",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
          },
        },
        Manager: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Manager ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "Manager email",
            },
            first_name: {
              type: "string",
              description: "First name",
            },
            last_name: {
              type: "string",
              description: "Last name",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Authentication endpoints",
      },
      {
        name: "Products",
        description: "Product management endpoints",
      },
      {
        name: "Invoices",
        description: "Invoice management endpoints",
      },
      {
        name: "Payments",
        description: "Payment processing endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Reports",
        description: "Reporting endpoints",
      },
      {
        name: "Health",
        description: "Health check endpoints",
      },
    ],
  },
  apis: [
    "./src/routes/*.js",
    "./src/controllers/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

