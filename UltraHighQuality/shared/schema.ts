import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Obfuscated script storage
export const scripts = pgTable("scripts", {
  id: varchar("id", { length: 32 }).primaryKey(),
  code: text("code").notNull(),
  originalSize: integer("original_size").notNull(),
  obfuscatedSize: integer("obfuscated_size").notNull(),
  level: varchar("level", { length: 20 }).notNull(), // 'simple', 'medium', 'extreme'
  accessCount: integer("access_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
});

export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

// Obfuscation request/response types
export const obfuscateRequestSchema = z.object({
  code: z.string().min(5, "Code must be at least 5 characters"),
  level: z.enum(["simple", "medium", "extreme"]),
});

export type ObfuscateRequest = z.infer<typeof obfuscateRequestSchema>;

export const obfuscateResponseSchema = z.object({
  success: z.boolean(),
  id: z.string(),
  loadstring: z.string(),
  url: z.string(),
  obfuscatedCode: z.string(),
  originalSize: z.number(),
  obfuscatedSize: z.number(),
  level: z.string(),
  compressionRatio: z.number(),
});

export type ObfuscateResponse = z.infer<typeof obfuscateResponseSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Script list item
export const scriptListItemSchema = z.object({
  id: z.string(),
  originalSize: z.number(),
  obfuscatedSize: z.number(),
  level: z.string(),
  accessCount: z.number(),
  createdAt: z.string(),
});

export type ScriptListItem = z.infer<typeof scriptListItemSchema>;
