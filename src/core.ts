import {
  delHash,
  delHashKey,
  delKey,
  delListKey,
  fetchList,
  getHashKeys,
  getKey,
  getKeys,
  getKeysLength,
  getListKeys,
  getListKeysLength,
  hgetAll,
  removeFromList,
  setKey,
} from "./db";
import { checkArgslength, decode, encode, toDate } from "./helper";
import { loggers } from "./logger";

const commandsHandler = {
  GET: async (args: string[]) => {
    const [key] = args;
    checkArgslength(1, args);
    if (!key) return;
    const r = await getKey(key);

    return r ? decode(r) : false;
  },
  DEL: async (args: string[]) => {
    const [key] = args;
    checkArgslength(1, args);
    if (!key) return;

    return !!(await delKey(key));
  },
  SET: (args: string[]) => {
    const [key, value, ttl] = args;
    checkArgslength(2, args);
    if (!key || !value) return;
    return setKey(key, encode(value), "", toDate(ttl));
  },
  HSET: (args: string[]) => {
    const [hkey, name, value, ttl] = args;
    checkArgslength(3, args);
    if (!hkey || !name || !value) return;

    return setKey(hkey, encode(value), name, toDate(ttl), "hash");
  },
  HGET: async (args: string[]) => {
    const [hkey, name] = args;
    checkArgslength(2, args);
    if (!hkey || !name) return;

    const r = await getKey(hkey, name, "hash");

    return r ? decode(r) : false;
  },
  HDEL: async (args: string[]) => {
    const [hkey, name] = args;
    checkArgslength(2, args);
    if (!hkey || !name) return;

    return !!(await delHash(hkey, name));
  },
  HDELALL: async (args: string[]) => {
    const [hkey] = args;
    checkArgslength(1, args);
    if (!hkey) return;

    return !!(await delHashKey(hkey));
  },
  HGETALL: async (args: string[]) => {
    const [hkey] = args;
    checkArgslength(1, args);
    if (!hkey) return;

    return await hgetAll(hkey);
  },
  KEYS: getKeys,
  HKEYS: getHashKeys,
  FETCH: async (args: string[]) => {
    const [lkey] = args;
    checkArgslength(1, args);
    if (!lkey) return;
    return await fetchList(lkey);
  },
  APPEND: (args: string[]) => {
    const [lkey, member, ttl] = args;
    checkArgslength(2, args);
    if (!lkey || !member) return;
    return setKey(lkey, undefined, encode(member), toDate(ttl), "set");
  },
  REMOVE: async (args: string[]) => {
    const [lkey, member] = args;
    checkArgslength(2, args);
    if (!lkey || !member) return;

    return !!(await removeFromList(lkey, encode(member)));
  },
  LDEL: async (args: string[]) => {
    const [lkey] = args;
    checkArgslength(1, args);
    if (!lkey) return;

    return !!(await delListKey(lkey));
  },
  LKEYS: getListKeys,
  LEN: async (args: string[]) => {
    const [lkey] = args;
    checkArgslength(1, args);
    if (!lkey) return;
    return await getListKeysLength(lkey);
  },
  COUNT: getKeysLength,
};

export const executeCommand = (
  command: keyof typeof commandsHandler,
  args: string[],
) => {
  loggers.core.log(`Recieved ${command}|${args}`);
  const handler = commandsHandler[command];
  if (!handler) throw new Error("Invalid command");

  return handler(args);
};

export function tokenize(data: string | Buffer): {
  command?: string;
  args: string[];
} {
  const text = data.toString().trim();
  const tokens: string[] = [];

  let current = "";
  let quote: string | null = null;
  let isEscaped = false;

  for (const char of text) {
    if (isEscaped) {
      current += char;
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  const command = tokens.shift()?.toUpperCase();

  return { command, args: tokens };
}
