# Los Perros API

API Node.js + Express + MongoDB para o cardápio Los Perros Market.

## Rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie o `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Configure `MONGODB_URI` no `.env`.

4. Importe o cardápio inicial:

```bash
npm run seed
```

5. Inicie a API:

```bash
npm run dev
```

A API roda por padrão em `http://localhost:3333/api`.

## Deploy na Vercel

Configure as variáveis `MONGODB_URI`, `PORT` e `CORS_ORIGIN` no projeto da Vercel. O arquivo `vercel.json` já aponta o handler para `src/server.js`.
# los-perros-api
