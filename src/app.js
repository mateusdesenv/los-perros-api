import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { publicRouter } from "./routes/public.js";
import { adminRouter } from "./routes/admin.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigin.length === 0 || env.corsOrigin.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem não permitida pelo CORS."));
    }
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "los-perros-api" });
});

app.use("/api/public", publicRouter);
app.use("/api/admin", adminRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
