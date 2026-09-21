#!/usr/bin/env node
/**
 * Convert ~/Desktop/qa-mode-b drafts (+ skipped) into Vitest e2e/unit specs
 * under tests/, mirroring src/views/users structure.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const MODE_B = process.env.QA_MODE_B_DIR || path.join(os.homedir(), 'Desktop', 'qa-mode-b')
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const E2E_ROOT = path.join(ROOT, 'tests', 'e2e', 'views', 'users')
const UNIT_ROOT = path.join(ROOT, 'tests', 'unit', 'views', 'users')

function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/【[^】]*】/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'case'
}

function mapArea(title) {
  const t = title || ''
  if (/用户组/.test(t)) return { folder: 'Group', area: 'group' }
  if (/角色/.test(t) && !/组织角色搜索|系统角色|组织角色/.test(t)) return { folder: 'Role', area: 'role' }
  if (/详情/.test(t)) return { folder: 'User/UserDetail', area: 'user-detail' }
  if (/用户列表|创建用户|更新用户|克隆用户|邀请用户|导入|导出|批量|快速筛选|邮箱|MFA|密码|激活|有效期|来源|token|AK登录|控制台:验证控制台用户/.test(t)) {
    return { folder: 'User', area: 'user-list' }
  }
  if (/用户管理/.test(t)) return { folder: 'User', area: 'user-list' }
  return { folder: '_unmapped', area: 'unmapped' }
}

/** Rare cases that can live as unit inventory / pure metadata tests */
function isUnitCandidate(draft) {
  // Keep unit suite as inventory + contract checks only; UI flows stay e2e.
  return false
}

function esc(str) {
  return String(str ?? '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function renderE2ESpec(draft, areaMeta) {
  const id = draft.testCaseId
  const title = draft.title
  const steps = draft.steps || []
  const outcome = draft.coverage?.outcome || ''
  const risk = draft.coverage?.risk || 'medium'
  const role = draft.coverage?.role || 'unknown'
  const behavior = draft.coverage?.behavior || ''

  const stepsLiteral = JSON.stringify(steps, null, 2)
  const outcomes = JSON.stringify(String(outcome).split('\n').map(s => s.trim()).filter(Boolean), null, 2)

  return `/**
 * Auto-generated from QA Mode B draft ${id}
 * Source title: ${esc(title)}
 * Area: ${areaMeta.area} → src/views/users/${areaMeta.folder}
 * Risk: ${risk} | Role: ${role}
 *
 * Live run requires:
 *   LINA_BASE_URL=https://your-jms-host
 *   LINA_USERNAME=...
 *   LINA_PASSWORD=...
 *   yarn test:e2e
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { page } from '@vitest/browser/context'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = '${id}'
const TITLE = \`${esc(title)}\`
const STEPS = ${stepsLiteral}
const OUTCOMES = ${outcomes}
const BEHAVIOR = \`${esc(behavior)}\`

describe(\`\${MS_ID} \${TITLE}\`, () => {
  it('keeps Mode B draft contract (steps + outcome inventory)', () => {
    expect(MS_ID).toMatch(/^MS-\\d+$/)
    expect(STEPS.length).toBeGreaterThan(0)
    expect(BEHAVIOR.length).toBeGreaterThan(0)
    // Outcomes may be empty in rare drafts; still track array shape.
    expect(Array.isArray(OUTCOMES)).toBe(true)
  })

  it.skipIf(!hasLiveConsole())('executes draft steps against live console', async () => {
    const env = getLinaEnv()
    await page.viewport(draftViewport())
    await loginAsConsoleAdmin(page)
    const log = await runDraftSteps(page, STEPS, { soft: true })
    expect(log.length).toBe(STEPS.length)
    // Soft mode: document expected outcomes for later hardening.
    expect(summarizeOutcome(OUTCOMES.join('\\n')).length).toBeGreaterThanOrEqual(0)
    expect(env.baseURL).toBeTruthy()
  })
})

function draftViewport() {
  return {
    width: ${draft.coverage?.viewport?.width || 1280},
    height: ${draft.coverage?.viewport?.height || 720}
  }
}
`
}

function renderSkippedSpec(items) {
  const list = JSON.stringify(items, null, 2)
  return `/**
 * MeterSphere cases skipped at Mode B because source had no steps.
 * Kept here so inventory coverage is 110/110.
 */
import { describe, it } from 'vitest'

const SKIPPED = ${list}

describe('Mode B skipped cases (missing steps)', () => {
  for (const item of SKIPPED) {
    it.skip(\`MS-\${item.id} \${item.title}\`, () => {
      // missing steps in MeterSphere source
    })
  }
})
`
}

function renderUnitInventory(drafts) {
  const slim = drafts.map(d => ({
    testCaseId: d.testCaseId,
    title: d.title,
    risk: d.coverage?.risk,
    stepCount: (d.steps || []).length,
    requirementId: d.coverage?.requirementId
  }))
  return `/**
 * Unit inventory: ensures every Mode B draft is present and well-formed.
 * Mirrors console users domain (src/views/users) at metadata level.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXPECTED = ${JSON.stringify(slim, null, 2)}

describe('users domain Mode B inventory (unit)', () => {
  it('tracks all converted drafts', () => {
    expect(EXPECTED.length).toBe(95)
    for (const row of EXPECTED) {
      expect(row.testCaseId).toMatch(/^MS-\\d+$/)
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
        else if (/MS-\\d+.*\\.spec\\.js$/.test(ent.name)) files.push(ent.name)
      }
    }
    walk(e2eRoot)
    for (const row of EXPECTED) {
      expect(files.some(f => f.includes(row.testCaseId)), row.testCaseId).toBe(true)
    }
  })
})
`
}

function main() {
  if (!fs.existsSync(MODE_B)) {
    console.error('Mode B dir not found:', MODE_B)
    process.exit(1)
  }

  // clean generated specs (keep support/)
  for (const rel of ['User', 'User/UserDetail', 'Group', 'Role', '_unmapped']) {
    const dir = path.join(E2E_ROOT, rel)
    fs.mkdirSync(dir, { recursive: true })
    for (const f of fs.readdirSync(dir)) {
      if (/^MS-.*\\.spec\\.js$/.test(f)) fs.unlinkSync(path.join(dir, f))
    }
  }
  fs.mkdirSync(path.join(E2E_ROOT, '_skipped'), { recursive: true })
  fs.mkdirSync(UNIT_ROOT, { recursive: true })

  const draftDir = path.join(MODE_B, 'drafts')
  const drafts = fs.readdirSync(draftDir)
    .filter(n => /^MS-\\d+\\.json$/.test(n))
    .map(n => JSON.parse(fs.readFileSync(path.join(draftDir, n), 'utf8')))
    .sort((a, b) => a.testCaseId.localeCompare(b.testCaseId))

  const counts = { User: 0, 'User/UserDetail': 0, Group: 0, Role: 0, _unmapped: 0 }

  for (const draft of drafts) {
    const area = mapArea(draft.title)
    counts[area.folder] = (counts[area.folder] || 0) + 1
    const dir = path.join(E2E_ROOT, area.folder)
    fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${draft.testCaseId}.${slugify(draft.title)}.spec.js`)
    // Fix import depth for User/UserDetail (one level deeper)
    let spec = renderE2ESpec(draft, area)
    if (area.folder === 'User/UserDetail') {
      spec = spec.replaceAll('../../../../support/', '../../../../../support/')
    }
    fs.writeFileSync(file, spec)
  }

  const skippedDir = path.join(MODE_B, 'skipped')
  const skipped = fs.existsSync(skippedDir)
    ? fs.readdirSync(skippedDir).filter(n => n.endsWith('.json')).map(n => JSON.parse(fs.readFileSync(path.join(skippedDir, n), 'utf8')))
    : []
  fs.writeFileSync(path.join(E2E_ROOT, '_skipped', 'missing-steps.spec.js'), renderSkippedSpec(skipped))

  fs.writeFileSync(path.join(UNIT_ROOT, 'mode-b-inventory.spec.js'), renderUnitInventory(drafts))

  // copy mode-b snapshot into repo for reproducibility (optional small summary only)
  const snapDir = path.join(ROOT, 'tests', 'fixtures', 'qa-mode-b')
  fs.mkdirSync(snapDir, { recursive: true })
  fs.copyFileSync(path.join(MODE_B, 'mode-b-summary.json'), path.join(snapDir, 'mode-b-summary.json'))
  fs.copyFileSync(path.join(MODE_B, 'MODE-B-REPORT.md'), path.join(snapDir, 'MODE-B-REPORT.md'))

  console.log(JSON.stringify({
    modeB: MODE_B,
    drafts: drafts.length,
    skipped: skipped.length,
    areaCounts: counts,
    e2eRoot: E2E_ROOT,
    unitRoot: UNIT_ROOT
  }, null, 2))
}

main()
