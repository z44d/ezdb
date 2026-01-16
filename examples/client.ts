import "dotenv/config";
import net from "node:net";

const client = net.createConnection({
  port: Number(process.env.PORT ?? "3030"),
  host: process.env.HOST ?? "127.0.0.1",
});

const serialize = (s: string) => {
  if (s.includes(" ") || s.includes('"')) {
    return `"${s.replaceAll('"', '\\"')}"`;
  }
  return s;
};

async function executeCommand(command: string): Promise<string> {
  await new Promise((resolve) => {
    client.write(command);
    resolve(true);
  });
  return new Promise((resolve) => {
    client.once("data", (data) => resolve(data.toString()));
  });
}

async function setKey(
  key: string,
  value: string,
  ttl?: number,
): Promise<string> {
  return await executeCommand(
    `SET ${serialize(key)} ${serialize(value)} ${ttl}`,
  );
}

async function getKey(key: string): Promise<string> {
  return await executeCommand(`GET ${serialize(key)}`);
}

async function main() {
  await setKey("name", "Zaid", 10);
  const response = await setKey("bio", "I like to code", 10);
  console.log(JSON.parse(response));
  const value = await getKey("bio");
  console.log(JSON.parse(value));
  client.end();
}

main();
