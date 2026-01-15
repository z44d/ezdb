import { sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const baseTable = sqliteTable(
  "ezdb",
  {
    key: text().notNull(),
    type: text().notNull().default("key"), // For hashes, members etc
    value: text(),
    member: text().notNull().default(""), // For hashes, members
    expiresAt: int({ mode: "timestamp" }),
    createdAt: int({ mode: "timestamp" }).default(sql`(unixepoch())`),
    updatedAt: int({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.key, t.type, t.member] }),
    index("idx_ezdb_expiresAt")
      .on(t.expiresAt)
      .where(sql`${t.expiresAt} IS NOT NULL`),
  ],
);
