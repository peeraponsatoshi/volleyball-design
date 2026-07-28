import http from "http";
import { spawn } from "child_process";
import os from "os";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let WebSocket;
try {
  WebSocket = require("ws");
} catch {
  console.error("ws package missing, installing...");
  process.exit(1);
}

const chrome =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9333;
const userData = path.join(os.tmpdir(), "yft-cdp-check");
const targetUrl = process.argv[2] || "http://localhost:5174/";

const ps = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userData}`,
    "about:blank",
  ],
  { stdio: ["ignore", "pipe", "pipe"] }
);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getJSON(p) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "127.0.0.1", port, path: p }, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

const logs = [];

try {
  for (let i = 0; i < 40; i++) {
    try {
      await getJSON("/json/version");
      break;
    } catch {
      await sleep(200);
    }
  }

  const version = await getJSON("/json/version");
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      const msg = { id: mid, method, params };
      if (sessionId) msg.sessionId = sessionId;
      ws.send(JSON.stringify(msg));
    });

  await new Promise((resolve, reject) => {
    ws.on("open", resolve);
    ws.on("error", reject);
  });

  ws.on("message", (raw) => {
    const msg = JSON.parse(String(raw));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
    if (msg.method === "Runtime.consoleAPICalled") {
      const a = (msg.params.args || [])
        .map((x) => x.value ?? x.description ?? JSON.stringify(x))
        .join(" ");
      logs.push({ type: "console", level: msg.params.type, text: a });
      console.log(`[console:${msg.params.type}] ${a}`);
    }
    if (msg.method === "Runtime.exceptionThrown") {
      const text =
        msg.params.exceptionDetails?.exception?.description ||
        msg.params.exceptionDetails?.text ||
        "unknown";
      logs.push({ type: "exception", text });
      console.log(`[exception] ${text}`);
    }
    if (msg.method === "Log.entryAdded") {
      const e = msg.params.entry;
      logs.push({ type: "log", level: e.level, text: e.text });
      console.log(`[log:${e.level}] ${e.text}`);
    }
  });

  const { targetId } = await send("Target.createTarget", { url: targetUrl });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  await send("Runtime.enable", {}, sessionId);
  await send("Log.enable", {}, sessionId);
  await send("Page.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);

  await sleep(10000);

  const evalResult = await send(
    "Runtime.evaluate",
    {
      expression:
        "({ title: document.title, text: (document.body && document.body.innerText || '').slice(0, 300), htmlLen: document.documentElement.outerHTML.length })",
      returnByValue: true,
    },
    sessionId
  );
  console.log("[page]", JSON.stringify(evalResult.result?.value, null, 2));

  const hardErrors = logs.filter(
    (l) =>
      l.type === "exception" ||
      l.level === "error" ||
      (l.text && /error|failed|uncaught/i.test(l.text))
  );
  console.log(`[summary] total=${logs.length} hardErrors=${hardErrors.length}`);
  if (hardErrors.length) {
    console.log(JSON.stringify(hardErrors, null, 2));
  }

  ws.close();
  ps.kill();
  process.exit(hardErrors.length ? 2 : 0);
} catch (e) {
  console.error("[script-error]", e);
  ps.kill();
  process.exit(1);
}
