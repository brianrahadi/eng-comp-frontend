import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const seedPath = path.join(__dirname, "seed.json");
let cameras = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

app.get("/api/cameras", (_req, res) => {
  res.json(cameras);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify(cameras));
});

setInterval(() => {
  cameras = cameras.map((c: any) => {
    const jitter = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const Water = Math.min(1, Math.max(0, c.Water + jitter(-0.02, 0.02)));
    const Light = Math.max(0, Math.min(1, c.Light + jitter(-0.05, 0.05)));
    
    let Status = "OK";
    if (Light < 0.3) {
      Status = "LOWLIGHT";
    } else if (Water > 0.8) {
      Status = "WARNING";
    }

    return { ...c, Water, Light, Status };
  });

  const payload = JSON.stringify(cameras);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}, 7000);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
});

