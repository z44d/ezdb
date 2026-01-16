import "dotenv/config";
import net from "node:net";
import { executeCommand, tokenize } from "./core";
import { delExpired } from "./db";
import { loggers } from "./logger";

const { PORT = "3030", HOST = "127.0.0.1" } = process.env;

const server = net.createServer();

server.on("connection", (socket) => {
  loggers.util.log("Client socket connected");
  socket.on("data", async (data) => {
    let response: string;

    try {
      const { command, args } = tokenize(data);
      if (!command) throw new Error();
      response = JSON.stringify(
        await executeCommand(command as any, args),
        null,
        2,
      );

      if (!response.endsWith("\r\n")) {
        response += "\r\n";
      }
    } catch (err) {
      console.error(err);
      response = `-ERR: ${err}\r\n`;
    }

    socket.write(response);
  });

  socket.on("end", () => {
    loggers.util.log("Client socket disconnected");
  });
});

server.listen(Number(PORT), HOST, () => {
  // Delete expired keys every 5 minutes
  setInterval(async () => {
    const deleted = await delExpired();
    loggers.util.log(`Deleted ${deleted} expired keys`);
  }, 300_000);
  loggers.server.log(`Server running at ${HOST}:${PORT}`);
});
