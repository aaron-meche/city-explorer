import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const outRoot = path.join(projectRoot, "out")
const port = Number(process.env.PORT ?? 4174)
const host = process.env.HOST ?? "127.0.0.1"

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`)
  const cleanPath = decodeURIComponent(url.pathname)
  const candidate = cleanPath.endsWith("/")
    ? path.join(outRoot, cleanPath, "index.html")
    : path.join(outRoot, cleanPath)
  const filePath = path.normalize(candidate)

  if (!filePath.startsWith(outRoot)) {
    res.writeHead(403)
    res.end("Forbidden")
    return
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404)
    res.end("Not found")
    return
  }

  const ext = path.extname(filePath)
  res.writeHead(200, { "Content-Type": contentTypes[ext] ?? "application/octet-stream" })
  fs.createReadStream(filePath).pipe(res)
})

server.listen(port, host, () => {
  console.log(`Map Explorer running at http://${host}:${port}`)
})
