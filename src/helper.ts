import msgpack from "msgpack-lite";

export const toDate = (ttl?: string) => {
  const t = Number(ttl);
  return Number.isNaN(t) ? undefined : new Date(Date.now() + t * 1000);
};

export const encode = (s: string) => msgpack.encode(s.trim()).toHex();

export const decode = (hex: string) =>
  msgpack.decode(Buffer.from(hex, "hex"));

export const checkArgslength = (len: number, args: string[]) => {
  if (args.length < len) throw new Error("Invalid number of arguments");
};
