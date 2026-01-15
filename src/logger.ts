const debugNameSpaces = (process.env.DEBUG || "*")
  .split(",")
  .map((ns) => ns.trim());

const logger = (namespace: string) => {
  // server
  const log = (
    mode: "log" | "error" | "warn" | "debug",
    ...message: any[]
  ) => {
    if (
      debugNameSpaces.includes("*") ||
      debugNameSpaces.includes(namespace)
    )
      console[mode](
        `${new Date().toISOString()} ${mode} [${namespace}]: ${message}`,
      );
  };

  return {
    log: (...message: any[]) => log("log", message),
    error: (...message: any[]) => log("error", message),
    warn: (...message: any[]) => log("warn", message),
    debug: (...message: any[]) => log("debug", message),
  };
};

const loggers = {
  server: logger("server"),
  util: logger("util"),
  core: logger("core"),
};

export { loggers };
