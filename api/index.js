import app from "../src/app.js";
import { connectDatabase } from "../src/config/database.js";

let readyPromise;

async function getReadyApp() {
  if (!readyPromise) {
    readyPromise = connectDatabase().then(() => app);
  }

  return readyPromise;
}

export default async function handler(request, response) {
  if (request.url?.split("?")[0] === "/api/health") {
    return app(request, response);
  }

  const readyApp = await getReadyApp();
  return readyApp(request, response);
}
