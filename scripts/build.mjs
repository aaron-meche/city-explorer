import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { RueRouter } from "../../rue-lang/dist/src/index.js"

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const webRoot = path.join(projectRoot, "web")
const outRoot = path.join(projectRoot, "out")
const publicRoot = path.join(projectRoot, "public")

fs.rmSync(outRoot, { recursive: true, force: true })
new RueRouter(webRoot, outRoot)
copyDirectory(publicRoot, outRoot)
postProcessHtml(path.join(outRoot, "index.html"))

console.log(`Built Map Explorer to ${path.relative(projectRoot, outRoot)}/`)

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) return

  fs.mkdirSync(target, { recursive: true })

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath)
      continue
    }

    fs.copyFileSync(sourcePath, targetPath)
  }
}

function postProcessHtml(filePath) {
  if (!fs.existsSync(filePath)) return

  const html = fs.readFileSync(filePath, "utf8")
    .replace("<title>Document</title>", "<title>Map Explorer</title>")
    .replace("</head>", '<link rel="stylesheet" href="./app.css">\n</head>')

  fs.writeFileSync(filePath, html)
}
