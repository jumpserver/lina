import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  withClickHouseEndpoints,
  getAssetProtocolChoices
} from '../src/views/assets/assetProtocols.js'

const ports = (rows) => rows.map(({ name, port }) => [name, port])

test('platform preview and asset creation agree without adding HTTP to the saved platform', () => {
  for (const port of [9000, 19000]) {
    const saved = Object.freeze([Object.freeze({ id: 1, name: 'clickhouse', port })])
    const preview = withClickHouseEndpoints(saved)
    assert.deepEqual(ports(preview), [
      ['clickhouse', port],
      ['clickhouse_http', 8123]
    ])
    assert.deepEqual(
      preview.map((p) => p.display_name),
      ['ClickHouse Native', 'ClickHouse HTTP']
    )
    assert.deepEqual(ports(getAssetProtocolChoices({ protocols: saved })), ports(preview))
    assert.deepEqual(saved, [{ id: 1, name: 'clickhouse', port }])
  }
})

test('existing HTTP ports are not duplicated or reset by presentation', () => {
  const saved = [
    { name: 'clickhouse', port: 19000 },
    { name: 'clickhouse_http', port: 18123 }
  ]
  assert.deepEqual(ports(withClickHouseEndpoints(withClickHouseEndpoints(saved))), ports(saved))
})

test('other platforms and empty protocol lists have no implicit HTTP endpoint', () => {
  const mysql = [{ name: 'mysql', port: 3307 }]
  assert.equal(withClickHouseEndpoints(mysql), mysql)
  assert.deepEqual(getAssetProtocolChoices({ protocols: mysql }), mysql)
  assert.deepEqual(getAssetProtocolChoices({ protocols: null }), [])
})
