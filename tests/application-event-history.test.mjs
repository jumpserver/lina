import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  applicationEventRows,
  createApplicationEventHistory
} from '../src/views/accounts/Integration/ApplicationDetail/applicationEventHistory.js'

function event(number, source, recipients = 1) {
  const date = new Date(Date.UTC(2026, 9, 13, 0, 0, number)).toISOString()
  return {
    ...(source === 'manual'
      ? { command_id: `event-${number}`, occurred_at: date }
      : { id: `event-${number}`, published_at: date }),
    recipients: Array.from({ length: recipients }, (_, index) => ({
      instance_id: `instance-${index}`,
      status: 'received',
      received_at: date
    }))
  }
}

function history(records, pageSize = 30) {
  const requests = []
  const request = async (source, params) => {
    requests.push({ source, ...params })
    return {
      count: records[source].length,
      results: records[source].slice(params.offset, params.offset + params.limit)
    }
  }
  return { pager: createApplicationEventHistory(request, pageSize), requests }
}

test('mixed history pages retain chronological order and every instance without duplicates', async () => {
  const records = { manual: [], policy: [] }
  const expected = []
  for (let number = 78; number >= 0; number--) {
    const source = number % 2 ? 'manual' : 'policy'
    const recipients = number % 5 ? 1 : 3
    records[source].push(event(number, source, recipients))
    for (let index = 0; index < recipients; index++) {
      expected.push(`${source}:event-${number}:${index}`)
    }
  }
  const { pager } = history(records)
  const actual = []
  let page = 1
  let result
  do {
    result = await pager.getPage(page++)
    assert.ok(result.rows.length <= 30)
    actual.push(...result.rows.map((row) => row.key))
  } while (result.hasNext)
  assert.deepEqual(actual, expected)
})

test('a long single source passes the API limit and going back uses cached rows', async () => {
  const records = {
    manual: Array.from({ length: 131 }, (_, index) => event(130 - index, 'manual')),
    policy: []
  }
  const { pager, requests } = history(records)
  const last = await pager.getPage(5)
  assert.equal(last.rows.length, 11)
  assert.equal(last.hasNext, false)
  assert.deepEqual(
    requests.filter((item) => item.source === 'manual').map((item) => item.offset),
    [0, 30, 60, 90, 120]
  )
  const requestCount = requests.length
  const first = await pager.getPage(1)
  assert.equal(first.rows[0].command_id, 'event-130')
  assert.equal(requests.length, requestCount)
})

test('one event with many recipients paginates by instance rows and preserves each receipt', async () => {
  const { pager, requests } = history({ manual: [event(1, 'manual', 61)], policy: [] })
  const first = await pager.getPage(1)
  const second = await pager.getPage(2)
  const third = await pager.getPage(3)
  assert.deepEqual([first.rows.length, second.rows.length, third.rows.length], [30, 30, 1])
  assert.equal(third.rows[0].instance_id, 'instance-60')
  assert.equal(third.hasNext, false)
  assert.equal(requests.length, 2)
})

test('failed loading can be retried without consuming or losing rows', async () => {
  const records = {
    manual: [event(5, 'manual'), event(3, 'manual'), event(1, 'manual')],
    policy: [event(4, 'policy'), event(2, 'policy'), event(0, 'policy')]
  }
  let fail = true
  const pager = createApplicationEventHistory(async (source, params) => {
    if (source === 'policy' && params.offset === 2 && fail) throw new Error('Unavailable')
    return {
      count: records[source].length,
      results: records[source].slice(params.offset, params.offset + params.limit)
    }
  }, 2)
  await assert.rejects(pager.getPage(2), /Unavailable/)
  fail = false
  const page = await pager.getPage(2)
  assert.deepEqual(
    page.rows.map((row) => row.key),
    ['manual:event-3:0', 'policy:event-2:0']
  )
})

test('a receipt keeps the received state separate from successful command execution', () => {
  const received = applicationEventRows([event(1, 'manual')], 'manual')[0]
  assert.equal(received.statusLabel, 'RotationEventReceived')
  assert.equal(received.statusType, 'success')
  const policyReceived = applicationEventRows([event(1, 'policy')], 'policy')[0]
  assert.equal(policyReceived.statusLabel, 'RotationEventReceived')
  assert.equal(policyReceived.statusType, 'success')
  const succeeded = event(2, 'manual')
  succeeded.recipients[0].status = 'success'
  assert.equal(applicationEventRows([succeeded], 'manual')[0].statusLabel, 'Success')
  const untargeted = applicationEventRows([event(3, 'policy', 0)], 'policy')[0]
  assert.equal(untargeted.statusLabel, 'RotationEventNotTargeted')
})

test('an unexpectedly empty API page reports failure instead of silently hiding history', async () => {
  const pager = createApplicationEventHistory(async () => ({ count: 10, results: [] }))
  await assert.rejects(pager.getPage(1), /incomplete page/)
})
