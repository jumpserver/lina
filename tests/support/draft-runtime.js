export function summarizeOutcome(outcome) {
  return String(outcome || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Soft executor: records MeterSphere free-text steps.
 * Hardening path: map known actions to role/text locators over time.
 */
export async function runDraftSteps(page, steps, { soft = true } = {}) {
  const log = []
  for (const step of steps || []) {
    const action = String(step.action || '').trim()
    log.push({ id: step.id, action, sideEffect: step.sideEffect })
    if (!action || action.includes('源步骤文本为空')) continue
    if (!soft) throw new Error(`Unimplemented step: ${action}`)
  }
  // keep page reference used to avoid unused lint in future hardening
  void page
  return log
}
