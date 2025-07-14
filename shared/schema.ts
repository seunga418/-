import { pgTable, text, serial, integer, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique(),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const excuses = pgTable("excuses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  category: text("category").notNull(), // 'health', 'family', 'transport', 'personal'
  tone: text("tone").notNull(), // 'light', 'moderate', 'serious'
  content: text("content").notNull(),
  userInput: text("user_input"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isBookmarked: integer("is_bookmarked").default(0).notNull(), // 0 = false, 1 = true
});

export const usageStats = pgTable("usage_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  week: text("week").notNull(), // YYYY-WW format
  count: integer("count").default(0).notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
});

export const insertExcuseSchema = createInsertSchema(excuses).pick({
  category: true,
  tone: true,
  content: true,
  userInput: true,
  isBookmarked: true,
});

export const insertUsageStatsSchema = createInsertSchema(usageStats).pick({
  week: true,
  count: true,
  lastUsed: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertExcuse = z.infer<typeof insertExcuseSchema>;
export type Excuse = typeof excuses.$inferSelect;
export type InsertUsageStats = z.infer<typeof insertUsageStatsSchema>;
export type UsageStats = typeof usageStats.$inferSelect;

// Request/Response types for API
export const excuseRequestSchema = z.object({
  category: z.enum(['health', 'family', 'transport', 'personal', 'random']),
  tone: z.enum(['light', 'moderate', 'serious']),
  userInput: z.string().optional(),
  subject: z.string().optional(),
  timeframe: z.string().optional(),
});

export type ExcuseRequest = z.infer<typeof excuseRequestSchema>;

export const excuseResponseSchema = z.object({
  excuse: z.string(),
  category: z.string(),
  tone: z.string(),
  id: z.number(),
});

export type ExcuseResponse = z.infer<typeof excuseResponseSchema>;
