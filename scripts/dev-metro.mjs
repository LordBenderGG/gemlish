import { spawn } from "node:child_process";
import net from "node:net";

const DEFAULT_PORT = 8081;

const rawPort = process.env.EXPO_PORT;
const parsedPort = Number.parseInt(rawPort ?? "", 10);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT;

const findAvailablePort = (startPort, maxTries = 20) =>
  new Promise((resolve, reject) => {
    const tryPort = (candidate, remaining) => {
      const server = net.createServer();

      server.once("error", () => {
        server.close();
        if (remaining <= 0) {
          reject(new Error(`No available port found starting at ${startPort}`));
          return;
        }
        tryPort(candidate + 1, remaining - 1);
      });

      server.once("listening", () => {
        server.close(() => resolve(candidate));
      });

      server.listen(candidate, "0.0.0.0");
    };

    tryPort(startPort, maxTries);
  });

const selectedPort = await findAvailablePort(port);

const child = spawn(`pnpm exec expo start --web --port ${selectedPort}`, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
