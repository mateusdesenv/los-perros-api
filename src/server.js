import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

connectDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Los Perros API rodando em http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar API:", error);
    process.exit(1);
  });
