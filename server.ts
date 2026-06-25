import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { TRACK_LIST } from "./src/data/songs";

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { history } = req.body; // Array of track IDs
      const playbackHistory: string[] = Array.isArray(history) ? history : [];

      // Map history IDs to actual tracks
      const historyTracks = playbackHistory
        .map((id) => TRACK_LIST.find((t) => t.id === id))
        .filter((t): t is typeof TRACK_LIST[0] => !!t);

      const client = getGeminiClient();

      if (client) {
        const prompt = `Analise o histórico de reprodução de músicas cristãs do usuário.
Histórico de reprodução recente (músicas ouvidas, da mais recente para a mais antiga):
${JSON.stringify(historyTracks.map((t) => ({ title: t.title, artist: t.artist, genre: t.genre })))}

Aqui está o catálogo completo de músicas disponíveis:
${JSON.stringify(TRACK_LIST.map((t) => ({ id: t.id, title: t.title, artist: t.artist, genre: t.genre, album: t.album })))}

Recomende exatamente entre 4 e 5 IDs de músicas do catálogo que combinem com o gosto do usuário (se ele ouviu muitas músicas de Adoração, sugira Adoração; se ouviu Pentecostal, sugira Pentecostal, etc). Evite recomendar músicas que ele já ouviu se houver outras opções disponíveis, mas retorne exatamente de 4 a 5 itens sempre. Se o histórico estiver vazio, recomende uma seleção variada de músicas do catálogo.

Dê uma justificativa curta, calorosa e inspiradora em português (máximo de 20 palavras) explicando a seleção de forma amigável baseada no histórico de forma muito breve.`;

        let response;
        try {
          // Attempt using gemini-2.5-flash which is highly available and fast
          response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendedTrackIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of exactly 4-5 track IDs recommended from the provided catalog.",
                  },
                  justification: {
                    type: Type.STRING,
                    description: "Short Portuguese phrase explaining why these tracks are selected.",
                  },
                },
                required: ["recommendedTrackIds", "justification"],
              },
            },
          });
        } catch (apiErr) {
          console.warn("First attempt failed, retrying once...", apiErr);
          // Retry once as a safeguard
          response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendedTrackIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of exactly 4-5 track IDs recommended from the provided catalog.",
                  },
                  justification: {
                    type: Type.STRING,
                    description: "Short Portuguese phrase explaining why these tracks are selected.",
                  },
                },
                required: ["recommendedTrackIds", "justification"],
              },
            },
          });
        }

        const responseText = response.text;
        if (responseText) {
          const data = JSON.parse(responseText.trim());
          const validIds = (data.recommendedTrackIds || []).filter((id: string) =>
            TRACK_LIST.some((t) => t.id === id)
          );
          if (validIds.length >= 3) {
            return res.json({
              recommendedTrackIds: validIds,
              justification: data.justification || "Recomendações preparadas com carinho para inspirar o seu dia de louvor!",
            });
          }
        }
      }

      throw new Error("Gemini client not configured or empty response");
    } catch (error) {
      console.log("Gemini recommendations error, using fallback engine:", error);

      // Fallback logic
      const { history } = req.body;
      const playbackHistory: string[] = Array.isArray(history) ? history : [];

      const historyTracks = playbackHistory
        .map((id) => TRACK_LIST.find((t) => t.id === id))
        .filter((t): t is typeof TRACK_LIST[0] => !!t);

      const genreCounts: Record<string, number> = {};
      historyTracks.forEach((t) => {
        genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1;
      });

      let favoriteGenre = "";
      let maxCount = 0;
      Object.entries(genreCounts).forEach(([genre, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteGenre = genre;
        }
      });

      let recommended = TRACK_LIST.filter(
        (t) => t.genre === favoriteGenre && !playbackHistory.includes(t.id)
      );

      if (recommended.length < 4) {
        const others = TRACK_LIST.filter(
          (t) => !playbackHistory.includes(t.id) && !recommended.some((r) => r.id === t.id)
        );
        recommended = [...recommended, ...others];
      }

      if (recommended.length < 4) {
        const allOthers = TRACK_LIST.filter((t) => !recommended.some((r) => r.id === t.id));
        recommended = [...recommended, ...allOthers];
      }

      const recommendedIds = recommended.slice(0, 5).map((t) => t.id);
      const justification = favoriteGenre
        ? `Com base no seu estilo recente focado em ${favoriteGenre}, selecionamos estes louvores especiais para edificar sua vida!`
        : "Selecionamos estes lindos louvores com muito carinho para inspirar e abençoar o seu dia!";

      return res.json({
        recommendedTrackIds: recommendedIds,
        justification,
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
