import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env file in development
if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
