#!/usr/bin/env node
import net from "node:net";
import readline from "node:readline";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 3030);

const socket = net.createConnection({ host: HOST, port: PORT });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `ezdb ${HOST}:${PORT}> `,
});

socket.on("connect", () => {
  console.log(`Connected to ${HOST}:${PORT}`);
  rl.prompt();
});

socket.on("data", (data) => {
  process.stdout.write(data.toString());
  rl.prompt();
});

socket.on("error", (err) => {
  console.error("Connection error:", err.message);
  process.exit(1);
});

socket.on("end", () => {
  console.log("\nDisconnected");
  process.exit(0);
});

rl.on("line", (line) => {
  const input = line.trim();

  if (input.toLowerCase() === "exit") {
    rl.close();
    socket.end();
    return;
  }

  if (input.toLowerCase() === "clear") {
    console.clear();
    rl.prompt();
    return;
  }

  socket.write(`${input}\r\n`);
});

rl.on("close", () => {
  socket.end();
});
