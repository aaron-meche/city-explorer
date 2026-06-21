//
// map-explorer
//
// created by Aaron Meche
// file on June 17, 2026
//

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { RueFile } from "../rue-lang/dist/src/index.js"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const sourceRoot = path.join(projectRoot, "src")
const outputRoot = path.join(projectRoot, "out")
const entryPath = path.join(sourceRoot, "main.rue")

const source = resolveRueImports(entryPath)
const file = new RueFile()
file.feed(source)

if (file.getErrors().length) {
  throw new Error(`Rue build failed with ${file.getErrors().length} error(s).`)
}

fs.rmSync(outputRoot, { recursive: true, force: true })
fs.mkdirSync(outputRoot, { recursive: true })

const html = file.getHTML()
  .replace("<title>Document</title>", "<title>Map Explorer</title>")
  .replace("</head>", '<link rel="stylesheet" href="./styles/responsive.css">\n</head>')
fs.writeFileSync(path.join(outputRoot, "index.html"), html)
copyStaticFiles(sourceRoot, outputRoot)

console.log(`Built Map Explorer to ${path.relative(projectRoot, outputRoot)}/`)

export function resolveRueImports(entryFile) {
  const visited = new Set()
  return visit(path.resolve(entryFile), [], visited).join("\n\n")
}

function visit(filePath, stack, visited) {
  if (stack.includes(filePath)) {
    const cycle = [...stack.slice(stack.indexOf(filePath)), filePath]
      .map(item => path.relative(sourceRoot, item))
      .join(" -> ")
    throw new Error(`Circular Rue import: ${cycle}`)
  }

  if (visited.has(filePath)) return []
  if (!fs.existsSync(filePath)) {
    throw new Error(`Rue import not found: ${path.relative(projectRoot, filePath)}`)
  }

  const raw = fs.readFileSync(filePath, "utf8")
  const imports = parseImports(raw, filePath)
  const nextStack = [...stack, filePath]
  const output = []

  for (const dependency of imports) {
    validateNamedImports(dependency)
    output.push(...visit(dependency.path, nextStack, visited))
  }

  visited.add(filePath)
  output.push(stripModuleSyntax(raw))
  return output
}

function parseImports(source, importerPath) {
  const importPattern = /^\s*import\s+(?:\{\s*([^}]+)\s*\}\s+from\s+)?["']([^"']+\.rue)["'];?\s*$/gm
  const imports = []
  let match

  while ((match = importPattern.exec(source))) {
    const request = match[2]
    if (!request.startsWith(".")) {
      throw new Error(`Rue imports must be relative: ${request}`)
    }

    imports.push({
      names: match[1] ? match[1].split(",").map(name => name.trim()).filter(Boolean) : [],
      path: path.resolve(path.dirname(importerPath), request),
      importerPath
    })
  }

  return imports
}

function validateNamedImports(dependency) {
  if (!dependency.names.length) return
  if (!fs.existsSync(dependency.path)) return

  const target = fs.readFileSync(dependency.path, "utf8")
  const exports = new Set(
    [...target.matchAll(/^\s*export\s+component\s+([A-Za-z_$][\w$]*)\s*\(/gm)]
      .map(match => match[1])
  )

  for (const name of dependency.names) {
    if (!exports.has(name)) {
      throw new Error(
        `${path.relative(projectRoot, dependency.importerPath)} imports missing Rue component ${name} ` +
        `from ${path.relative(projectRoot, dependency.path)}`
      )
    }
  }
}

function stripModuleSyntax(source) {
  return source
    .replace(/^\s*import\s+(?:\{\s*[^}]+\s*\}\s+from\s+)?["'][^"']+\.rue["'];?\s*$/gm, "")
    .replace(/^\s*export\s+component\s+/gm, "component ")
}

function copyStaticFiles(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true })
      copyStaticFiles(sourcePath, targetPath)
      continue
    }

    if (entry.name.endsWith(".rue")) continue
    fs.copyFileSync(sourcePath, targetPath)
  }
}
