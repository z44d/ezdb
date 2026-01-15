import {
  delHash,
  delHashKey,
  delKey,
  delListKey,
  fetchList,
  getHashKeys,
  getKey,
  hgetAll,
  removeFromList,
  setKey,
} from "./db";
import { decode, encode, toDate } from "./helper";
import { loggers } from "./logger";

const commandsHandler = {
  GET: async (args: string[]) => {
    const [key] = args;
    if (!key) throw new Error();
    const r = await getKey(key);

    return r ? decode(r) : false;
  },
  DEL: async (args: string[]) => {
    const [key] = args;
    if (!key) throw new Error();

    return !!(await delKey(key));
  },
  SET: (args: string[]) => {
    const [key, value, ttl] = args;

    if (!key || !value) throw new Error();
    return setKey(key, encode(value), "", toDate(ttl));
  },
  HSET: (args: string[]) => {
    const [hkey, name, value, ttl] = args;

    if (!hkey || !name || !value) throw new Error();

    return setKey(hkey, encode(value), name, toDate(ttl), "hash");
  },
  HGET: async (args: string[]) => {
    const [hkey, name] = args;
    if (!hkey || !name) throw new Error();

    const r = await getKey(hkey, name, "hash");

    return r ? decode(r) : false;
  },
  HDEL: async (args: string[]) => {
    const [hkey, name] = args;
    if (!hkey || !name) throw new Error();

    return !!(await delHash(hkey, name));
  },
  HDELALL: async (args: string[]) => {
    const [hkey] = args;
    if (!hkey) throw new Error();

    return !!(await delHashKey(hkey));
  },
  HGETALL: async (args: string[]) => {
    const [hkey] = args;
    if (!hkey) throw new Error();

    return await hgetAll(hkey);
  },
  HKEYS: () => getHashKeys(),
  FETCH: async (args: string[]) => {
    const [lkey] = args;
    if (!lkey) throw new Error();
    return await fetchList(lkey);
  },
  APPEND: (args: string[]) => {
    const [lkey, member, ttl] = args;
    if (!lkey || !member) throw new Error();
    return setKey(lkey, undefined, encode(member), toDate(ttl), "set");
  },
  REMOVE: async (args: string[]) => {
    const [lkey, member] = args;
    if (!lkey || !member) throw new Error();

    return !!(await removeFromList(lkey, encode(member)));
  },
  LDEL: async (args: string[]) => {
    const [lkey] = args;
    if (!lkey) throw new Error();

    return !!(await delListKey(lkey));
  },
};

export const executeCommand = (
  command: keyof typeof commandsHandler,
  args: string[],
) => {
  loggers.core.log(`Recieved ${command}|${args}`);
  const handler = commandsHandler[command];
  if (!handler) throw new Error();

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
