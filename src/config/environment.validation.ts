export function validateEnvironment(env: Record<string, unknown>) {
  const port = Number(env.PORT ?? 3000);
  const uri = String(env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/vcraft");
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid PORT");
  if (!/^mongodb(\+srv)?:\/\//.test(uri))
    throw new Error("Invalid MONGODB_URI");
  const jwt = String(env.JWT_SECRET ?? "");
  if (jwt.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters");
  return {
    ...env,
    NODE_ENV: env.NODE_ENV ?? "development",
    HOST: env.HOST ?? "127.0.0.1",
    PORT: port,
    MONGODB_URI: uri,
    CORS_ORIGIN: env.CORS_ORIGIN ?? "http://localhost:5173",
  };
}
