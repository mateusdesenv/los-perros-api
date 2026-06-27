import "./env.js";

const defaultLocalOrigins = ["http://localhost:5173", "http://localhost:5174"];

export const allowedOrigins = Array.from(
  new Set([
    ...defaultLocalOrigins,
    ...(process.env.CORS_ORIGIN || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ])
);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    try {
      const hostname = new URL(origin).hostname;

      if (hostname.endsWith(".vercel.app")) {
        callback(null, true);
        return;
      }
    } catch {
      callback(new Error("Origem inválida no CORS."));
      return;
    }

    callback(new Error(`CORS bloqueado para origem: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204
};
