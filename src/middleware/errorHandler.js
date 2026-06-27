export function notFound(_request, response) {
  response.status(404).json({ message: "Endpoint não encontrado." });
}

export function errorHandler(error, _request, response, _next) {
  const status = error.status || 500;
  const message = error.type === "entity.too.large"
    ? "Payload muito grande. Envie imagens de até 1MB."
    : status === 500
      ? "Erro interno da API."
      : error.message;

  if (status === 500) {
    console.error(error);
  }

  response.status(status).json({ message });
}
