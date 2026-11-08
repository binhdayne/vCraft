// Run the admin UI against a disposable database, never the user's accounts.
const { spawn } = require("node:child_process");
const { randomBytes } = require("node:crypto");
const mongoose = require("mongoose");
const name = "vcraft_font_audit_" + Date.now();
const uri = "mongodb://127.0.0.1:27017/" + name;
const env = {
  ...process.env,
  MONGODB_URI: uri,
  JWT_SECRET: randomBytes(48).toString("hex"),
  PORT: "3001",
  HOST: "127.0.0.1",
  NODE_ENV: "test",
  PUBLIC_URL: "http://localhost:3001",
};
function run(file, args, extra = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      env: { ...env, ...extra },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(file + " exited " + code)),
    );
  });
}
(async () => {
  let server;
  try {
    await run("scripts/seed.cjs", []);
    server = spawn(process.execPath, ["dist/main.js"], {
      env,
      stdio: "ignore",
    });
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        ready = (await fetch("http://localhost:3001/api/v1/health")).ok;
        if (ready) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!ready) throw new Error("Audit backend did not start");
    await run("scripts/audit-typography.cjs", ["after-admin"], {
      AUDIT_BASE: "http://localhost:3001",
      AUDIT_PUBLIC: "0",
      AUDIT_ROLES: "admin",
    });
  } finally {
    if (server) server.kill();
    const connection = await mongoose.createConnection(uri).asPromise();
    try {
      if (connection.name !== name || !/^vcraft_font_audit_\d+$/.test(name))
        throw new Error("Unexpected database name");
      await connection.dropDatabase();
    } finally {
      await connection.close();
    }
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
