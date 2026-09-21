/**
 * Unit inventory: ensures every Mode B draft is present and well-formed.
 * Mirrors console users domain (src/views/users) at metadata level.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXPECTED = []

describe('users domain Mode B inventory (unit)', () => {
  it('tracks all converted drafts', () => {
    expect(EXPECTED.length).toBe(95)
    for (const row of EXPECTED) {
      expect(row.testCaseId).toMatch(/^MS-\d+$/)
      expect(row.title.length).toBeGreaterThan(0)
      expect(row.stepCount).toBeGreaterThan(0)
    }
  })

  it('has matching e2e spec files generated under tests/e2e/views/users', () => {
    const e2eRoot = path.resolve(__dirname, '../../../e2e/views/users')
    const files = []
    function walk(dir) {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name)
        if (ent.isDirectory()) walk(p)
        else if (/MS-\d+.*\.spec\.js$/.test(ent.name)) files.push(ent.name)
      }
    }
    walk(e2eRoot)
    for (const row of EXPECTED) {
      expect(files.some(f => f.includes(row.testCaseId)), row.testCaseId).toBe(true)
    }
  })
})
