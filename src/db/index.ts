import "dotenv/config";

import Database from "bun:sqlite";
import { and, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { decode } from "../helper";
import { baseTable } from "./schema";

const client = new Database(process.env.DB_FILE_NAME ?? "local.db");
client.run("PRAGMA journal_mode = WAL;");
client.run("PRAGMA wal_autocheckpoint = 50;");
const db = drizzle({ client });

const notExpired = () =>
  or(gt(baseTable.expiresAt, new Date()), isNull(baseTable.expiresAt));

export const setKey = async (
  key: string,
  value?: string,
  member?: string,
  expiresAt?: Date,
  type: string = "key",
) =>
  (
    await db
      .insert(baseTable)
      .values({ key, value: value ?? null, type, member, expiresAt })
      .onConflictDoUpdate({
        target: [baseTable.key, baseTable.type, baseTable.member],
        set: {
          key,
          value: value ?? null,
          member,
          expiresAt: expiresAt ?? null,
        },
      })
      .returning()
  ).at(0);

export const getKey = async (
  key: string,
  member?: string,
  type: string = "key",
) =>
  (
    await db
      .select({ value: baseTable.value })
      .from(baseTable)
      .where(
        and(
          notExpired(),
          eq(baseTable.type, type),
          eq(baseTable.key, key),
          ...(member !== undefined ? [eq(baseTable.member, member)] : []),
        ),
      )
      .limit(1)
  ).at(0)?.value;

export const getHashKeys = async () =>
  Array.from(
    new Set(
      (
        await db
          .select({ key: baseTable.key })
          .from(baseTable)
          .where(and(notExpired(), eq(baseTable.type, "hash")))
      ).map((i) => i.key),
    ),
  );

export const getKeys = async () =>
  Array.from(
    new Set(
      (
        await db
          .select({ key: baseTable.key })
          .from(baseTable)
          .where(and(notExpired(), eq(baseTable.type, "key")))
      ).map((i) => i.key),
    ),
  );

export const getListKeys = async () =>
  Array.from(
    new Set(
      (
        await db
          .select({ key: baseTable.key })
          .from(baseTable)
          .where(and(notExpired(), eq(baseTable.type, "set")))
      ).map((i) => i.key),
    ),
  );

export const hgetAll = async (
  key: string,
): Promise<{ name: string; value: string }[]> =>
  (
    await db
      .select({ name: baseTable.member, value: baseTable.value })
      .from(baseTable)
      .where(
        and(
          eq(baseTable.key, key),
          eq(baseTable.type, "hash"),
          notExpired(),
        ),
      )
  ).map(({ name, value }) => {
    return { name, value: decode(value as string) };
  }) as any;

export const fetchList = async (listName: string) =>
  (
    await db
      .select({ member: baseTable.member })
      .from(baseTable)
      .where(
        and(
          notExpired(),
          isNotNull(baseTable.member),
          eq(baseTable.type, "set"),
          eq(baseTable.key, listName),
        ),
      )
  ).map((i) => decode(i.member));

export const removeFromList = async (listName: string, member: string) =>
  (
    await db
      .delete(baseTable)
      .where(
        and(
          eq(baseTable.type, "set"),
          eq(baseTable.key, listName),
          eq(baseTable.member, member),
        ),
      )
      .returning({ key: baseTable.key })
  ).length;

export const delKey = async (key: string) =>
  (
    await db
      .delete(baseTable)
      .where(and(eq(baseTable.key, key), eq(baseTable.type, "key")))
      .returning({ key: baseTable.key })
  ).length;

export const delHash = async (key: string, member: string) =>
  (
    await db
      .delete(baseTable)
      .where(
        and(
          eq(baseTable.key, key),
          eq(baseTable.type, "hash"),
          eq(baseTable.member, member),
        ),
      )
      .returning({ key: baseTable.key })
  ).length;

export const delHashKey = async (key: string) =>
  (
    await db
      .delete(baseTable)
      .where(and(eq(baseTable.key, key), eq(baseTable.type, "hash")))
      .returning({ key: baseTable.key })
  ).length;

export const delListKey = async (key: string) =>
  (
    await db
      .delete(baseTable)
      .where(and(eq(baseTable.key, key), eq(baseTable.type, "set")))
      .returning({ key: baseTable.key })
  ).length;

export const delExpired = async () =>
  (
    await db
      .delete(baseTable)
      .where(lt(baseTable.expiresAt, new Date()))
      .limit(1000)
      .returning({ key: baseTable.key })
  ).length;

export const getKeysLength = async () => await db.$count(baseTable);

export const getListKeysLength = async (listName: string) =>
  (
    await db
      .select({ key: baseTable.key })
      .from(baseTable)
      .where(
        and(
          notExpired(),
          eq(baseTable.key, listName),
          eq(baseTable.type, "set"),
        ),
      )
  ).length;
