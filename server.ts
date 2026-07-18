import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parsing support
  app.use(express.json());

  // Exemplo de rota API simples que poderá necessitar futuramente
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "TicketAngola Backend operacional" });
  });

  // Integração com o Vite para desenvolvimento ou servir ficheiros estáticos em produção
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando em modo de DESENVOLVIMENTO com middleware do Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando em modo de PRODUÇÃO...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve ficheiros estáticos da pasta de compilação
    app.use(express.static(distPath));
    
    // Qualquer outra rota serve o SPA (Single Page Application) do React
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor Node.js a rodar na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erro ao iniciar o servidor de produção:", err);
  process.exit(1);
});
