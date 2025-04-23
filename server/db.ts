import * as schema from "@shared/schema";
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Load environment variables from .env file in development
if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Extract the file path from the DATABASE_URL
const dbPath = process.env.DATABASE_URL.replace('file:', '');

// Create a new SQLite database connection
export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
