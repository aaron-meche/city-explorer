import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { resolveRueImports } from "../builder.js"

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "map-explorer-rue-"))
  for (const [name, source] of Object.entries(files)) {
    const filePath = path.join(root, name)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, source)
  }
  return root
}

test("resolves named rue component imports before the importing file", () => {
  const root = fixture({
    "Navigation.rue": 'export component Navigation() { content: "nav" }',
    "main.rue": 'import { Navigation } from "./Navigation.rue"\nInterface { Navigation() }'
  })

  const source = resolveRueImports(path.join(root, "main.rue"))
  assert.match(source, /component Navigation/)
  assert.ok(source.indexOf("component Navigation") < source.indexOf("Interface"))
  assert.doesNotMatch(source, /import/)
  assert.doesNotMatch(source, /export component/)
})

test("reports missing named rue exports", () => {
  const root = fixture({
    "Other.rue": 'export component Other() { content: "other" }',
    "main.rue": 'import { Missing } from "./Other.rue"\nInterface { Missing() }'
  })

  assert.throws(() => resolveRueImports(path.join(root, "main.rue")), /imports missing Rue component Missing/)
})
