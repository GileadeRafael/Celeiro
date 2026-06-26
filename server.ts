import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { TRACK_LIST } from "./src/data/songs";
import { Readable } from "stream";
import fs from "fs";

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

async function streamGoogleDriveFile(id: string, req: express.Request, res: express.Response) {
  const driveUrl = `https://docs.google.com/uc?export=download&id=${id}`;
  const clientHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  };

  if (req.headers.range) {
    clientHeaders["Range"] = req.headers.range;
  }

  try {
    let response = await fetch(driveUrl, { headers: clientHeaders });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const text = await response.text();
      const confirmMatch = text.match(/confirm=([0-9a-zA-Z_-]+)/);
      if (confirmMatch) {
        const confirmToken = confirmMatch[1];
        const setCookies = response.headers.getSetCookie 
          ? response.headers.getSetCookie() 
          : (response.headers.get("set-cookie") ? [response.headers.get("set-cookie")!] : []);

        const cookieString = setCookies.map(c => c.split(';')[0]).join('; ');
        const finalUrl = `https://docs.google.com/uc?export=download&id=${id}&confirm=${confirmToken}`;
        
        const finalHeaders: Record<string, string> = {
          ...clientHeaders,
          Cookie: cookieString
        };

        response = await fetch(finalUrl, { headers: finalHeaders });
      }
    }

    // Check response status
    if (!response.ok && response.status !== 206) {
      throw new Error(`Erro do Google Drive: ${response.status} ${response.statusText}`);
    }

    // Forward headers to client
    const isImage = id === "1HuLyBZi7Kg1WsbhmrOvRAg7BuYGF3WCq" || id === "1fVT7J-TBsVBfcQYoSCJ5RIRyZSZ7P87E";
    const resHeaders: Record<string, string> = {
      "Content-Type": response.headers.get("Content-Type") || (isImage ? "image/jpeg" : "audio/mpeg"),
      "Cache-Control": "public, max-age=86400",
    };

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) resHeaders["Content-Length"] = contentLength;

    const contentRange = response.headers.get("Content-Range");
    if (contentRange) resHeaders["Content-Range"] = contentRange;

    const acceptRanges = response.headers.get("Accept-Ranges");
    if (acceptRanges) resHeaders["Accept-Ranges"] = acceptRanges;

    res.writeHead(response.status, resHeaders);

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as any);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error("Erro ao fazer proxy do arquivo:", error);
    if (!res.headersSent) {
      res.status(500).send(`Falha ao obter o arquivo: ${error.message}`);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve the public folder statically
  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir));

  app.use(express.json());

  // Direct route for "local-file-like" audio path
  app.get("/quem_e_este.mp3", async (req, res) => {
    return streamGoogleDriveFile("1JKcbSg-qApsUO7bnXoGS2LXKgZZGTdGl", req, res);
  });

  // Direct route for "local-file-like" cover path
  app.get("/quem_e_este_capa.jpg", async (req, res) => {
    return streamGoogleDriveFile("1HuLyBZi7Kg1WsbhmrOvRAg7BuYGF3WCq", req, res);
  });

  // O Altar Está Pronto audio route
  app.get("/o_altar_esta_pronto.mp3", async (req, res) => {
    return streamGoogleDriveFile("1CuwSkKC_f1gd3sC9_zHc8akL2EqLUaaP", req, res);
  });

  // O Altar Está Pronto cover route
  app.get("/o_altar_esta_pronto_capa.jpg", async (req, res) => {
    return streamGoogleDriveFile("1fVT7J-TBsVBfcQYoSCJ5RIRyZSZ7P87E", req, res);
  });

  // API Route to stream audio from Google Drive bypassing iframe/cookie blocks
  app.get("/api/stream-audio", async (req, res) => {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).send("ID do arquivo não fornecido.");
    }
    return streamGoogleDriveFile(id, req, res);
  });

  // API Route for Shuffled Daily Recommendations
  app.post("/api/recommendations", (req, res) => {
    try {
      // Shuffle all songs from the catalog and select 5 random ones
      const shuffled = [...TRACK_LIST].sort(() => Math.random() - 0.5);
      const recommendedTracks = shuffled.slice(0, 5);
      const recommendedTrackIds = recommendedTracks.map((t) => t.id);

      const justification = "Selecionamos estes lindos louvores abençoados de forma especial para edificar e alegrar o seu dia!";

      return res.json({
        recommendedTrackIds,
        justification,
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      const recommendedTrackIds = TRACK_LIST.slice(0, 5).map((t) => t.id);
      return res.json({
        recommendedTrackIds,
        justification: "Selecionamos estes lindos louvores para abençoar o seu dia!",
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
