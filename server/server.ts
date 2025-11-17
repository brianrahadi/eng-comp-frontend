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

interface HistoricalDataPoint {
  timestamp: number;
  cameras: any[];
}

const historicalData: HistoricalDataPoint[] = [];
const HISTORY_DURATION_MS = 60 * 1000; // 1 minute

app.get("/api/cameras", (_req, res) => {
  res.json(cameras);
});

app.get("/api/history", (_req, res) => {
  const now = Date.now();
  const oneMinuteAgo = now - HISTORY_DURATION_MS;
  const filtered = historicalData.filter(point => point.timestamp >= oneMinuteAgo);
  res.json(filtered);
});

app.get("/api/export/csv", (_req, res) => {
  const now = Date.now();
  const oneMinuteAgo = now - HISTORY_DURATION_MS;
  const filtered = historicalData.filter(point => point.timestamp >= oneMinuteAgo);
  
  if (filtered.length === 0) {
    res.status(404).json({ error: "No data available" });
    return;
  }

  const headers = ["Timestamp", "SegmentID", "Water", "Light", "Status", "PositionX", "PositionY"];
  const rows = filtered.flatMap(point => 
    point.cameras.map((cam: any) => [
      new Date(point.timestamp).toISOString(),
      cam.SegmentID,
      cam.Water,
      cam.Light ?? 3,
      cam.Status,
      cam.Position[0],
      cam.Position[1],
    ])
  );

  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="pipewatch-export-${new Date().toISOString().split("T")[0]}.csv"`);
  res.send(csv);
});

app.get("/api/export/json", (_req, res) => {
  const now = Date.now();
  const oneMinuteAgo = now - HISTORY_DURATION_MS;
  const filtered = historicalData.filter(point => point.timestamp >= oneMinuteAgo);
  
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="pipewatch-export-${new Date().toISOString().split("T")[0]}.json"`);
  res.json(filtered);
});

app.get("/api/insights", (_req, res) => {
  const now = Date.now();
  const oneMinuteAgo = now - HISTORY_DURATION_MS;
  const filtered = historicalData.filter(point => point.timestamp >= oneMinuteAgo);
  
  if (filtered.length === 0) {
    res.json({ insights: "No historical data available for analysis." });
    return;
  }

  const criticalAreas: any[] = [];
  const averages: any[] = [];

  filtered.forEach((point, index) => {
    const timestamp = new Date(point.timestamp).toISOString();
    
    const avgWater = point.cameras.reduce((sum: number, c: any) => sum + c.Water, 0) / point.cameras.length;
    const avgLight = point.cameras.reduce((sum: number, c: any) => sum + (c.Light ?? 3), 0) / point.cameras.length;
    
    averages.push({
      timestamp,
      avgWater: avgWater.toFixed(3),
      avgLight: avgLight.toFixed(2),
    });

    const critical = point.cameras.filter((c: any) => {
      const water = c.Water;
      const light = c.Light ?? 3;
      const status = c.Status;
      
      return water >= 0.85 || 
             (status === "WARNING" && water > 0.40) || 
             light === 1 ||
             status === "WARNING" ||
             status === "LOWLIGHT";
    });

    if (critical.length > 0) {
      criticalAreas.push({
        timestamp,
        count: critical.length,
        segments: critical.map((c: any) => ({
          segmentId: c.SegmentID,
          water: c.Water,
          light: c.Light ?? 3,
          status: c.Status,
        })),
      });
    }
  });

  const totalCritical = criticalAreas.reduce((sum, area) => sum + area.count, 0);
  const avgWaterOverall = averages.reduce((sum, a) => sum + parseFloat(a.avgWater), 0) / averages.length;
  const avgLightOverall = averages.reduce((sum, a) => sum + parseFloat(a.avgLight), 0) / averages.length;

  const insights = `Analysis of the last minute (${filtered.length} data points):

CRITICAL AREAS: ${totalCritical} critical events detected across ${criticalAreas.length} time points. 
${criticalAreas.length > 0 ? `Most critical time: ${criticalAreas.sort((a, b) => b.count - a.count)[0].timestamp} with ${criticalAreas.sort((a, b) => b.count - a.count)[0].count} critical segments.` : "No critical areas detected."}

AVERAGE VALUES: 
- Average Water Level: ${(avgWaterOverall * 100).toFixed(2)}% across all segments
- Average Light Level: ${avgLightOverall.toFixed(2)}/5 across all segments
- Trend: ${avgWaterOverall > 0.7 ? "⚠️ High water levels detected" : avgWaterOverall < 0.3 ? "Water levels normal" : "Moderate water levels"}
${avgLightOverall < 2 ? "⚠️ Low light conditions persist" : "Light levels adequate"}

INTERPRETATION:
${avgWaterOverall > 0.8 ? "CRITICAL: System shows elevated water levels indicating potential flooding or blockage. Immediate inspection recommended." : ""}
${avgLightOverall < 2 ? "WARNING: Insufficient lighting detected, which may indicate camera obstruction or system malfunction." : ""}
${totalCritical > filtered.length * 0.5 ? "ALERT: More than 50% of time points show critical conditions. System health requires immediate attention." : totalCritical > 0 ? "CAUTION: Intermittent critical conditions detected. Monitor closely." : "STATUS: System operating within normal parameters."}`;

  res.json({
    insights,
    criticalAreas,
    averages,
    summary: {
      totalDataPoints: filtered.length,
      totalCriticalEvents: totalCritical,
      avgWaterOverall: avgWaterOverall.toFixed(3),
      avgLightOverall: avgLightOverall.toFixed(2),
    },
  });
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
    
    let Light = c.Light ?? 3;
    if (Math.random() < 0.1) {
      Light = Math.max(1, Math.min(5, Math.round(Light + (Math.random() < 0.5 ? -1 : 1))));
    }
    
    let Status = "OK";
    if (Light <= 2) {
      Status = "LOWLIGHT";
    } else if (Water > 0.8) {
      Status = "WARNING";
    }

    return { ...c, Water, Light, Status };
  });

  const now = Date.now();
  historicalData.push({
    timestamp: now,
    cameras: cameras.map((c: any) => ({ ...c })),
  });

  const oneMinuteAgo = now - HISTORY_DURATION_MS;
  const indexToKeep = historicalData.findIndex(point => point.timestamp >= oneMinuteAgo);
  if (indexToKeep > 0) {
    historicalData.splice(0, indexToKeep);
  }

  const payload = JSON.stringify(cameras);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}, 6000);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
});

