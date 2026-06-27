import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import { publicRouter } from "./routes/public.js";
import { adminRouter } from "./routes/admin.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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
