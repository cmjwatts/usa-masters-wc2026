// Minimal static server for local preview (used by .claude/launch.json).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT) || 8642;
const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".ttf": "font/ttf", ".woff2": "font/woff2",
};

async function resolveFile(urlPath) {
  if (urlPath.endsWith("/")) urlPath += "index.html";
  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) throw new Error("traversal");
  try {
    return { file, body: await readFile(file) };
  } catch (err) {
    // Mimic Netlify's clean-URL behavior: an extensionless path with no
    // matching file falls back to path + ".html" before 404ing.
    if (!path.extname(file)) {
      return { file: file + ".html", body: await readFile(file + ".html") };
    }
    throw err;
  }
}

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const { file, body } = await resolveFile(urlPath);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end("not found");
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
