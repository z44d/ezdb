import "dotenv/config";

import { afterAll, beforeAll, test } from "bun:test";
import assert from "node:assert";
import net from "node:net";

let ezdbClient: net.Socket;

const connectToEzdb = () =>
  new Promise<void>((resolve, reject) => {
    ezdbClient = net.createConnection(
      { port: Number(process.env.PORT ?? "3030") },
      () => resolve(),
    );

    ezdbClient.on("error", (err) => reject(err));
  });

beforeAll(async () => await connectToEzdb());

afterAll(() => {
  if (ezdbClient && !ezdbClient.destroyed) ezdbClient.end();
});

const sendCommand = (command: string) =>
  new Promise((resolve, reject) => {
    const onError = (err: Error) => reject(err);
    if (!ezdbClient || ezdbClient.destroyed) {
      return reject(new Error("Client is not connected"));
    }

    ezdbClient.write(command);
    ezdbClient.once("data", (data) => {
      resolve(data.toString());
      ezdbClient.removeListener("error", onError);
    });

    ezdbClient.once("error", onError);
  });

test("should SET and GET a value", async () => {
  await sendCommand("set foo bar");
  const getResponse = await sendCommand("get foo");
  assert.strictEqual(getResponse, '"bar"\r\n');
});