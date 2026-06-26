import { Readable } from "stream";

export default async function handler(req: any, res: any) {
  const id = req.query.id;
  if (!id || typeof id !== "string") {
    return res.status(400).send("ID do arquivo não fornecido.");
  }

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

    if (!response.ok && response.status !== 206) {
      throw new Error(`Erro do Google Drive: ${response.status} ${response.statusText}`);
    }

    // Forward headers to client
    const resHeaders: Record<string, string> = {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
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
    console.error("Erro ao fazer proxy do áudio:", error);
    if (!res.headersSent) {
      res.status(500).send(`Falha ao obter o áudio: ${error.message}`);
    }
  }
}
