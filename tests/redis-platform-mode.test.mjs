import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getAssetProtocolChoices,
  getAssetProtocolHelpKey
} from '../src/views/assets/assetProtocols.js'

test('show Redis routing mode from protocol settings, independently of the platform name or ACL user', () => {
  for (const [enabled, help] of [
    [undefined, 'RedisStandaloneAssetProtocolHelp'],
    [false, 'RedisStandaloneAssetProtocolHelp'],
    ['false', 'RedisStandaloneAssetProtocolHelp'],
    [true, 'RedisClusterAssetProtocolHelp'],
    ['true', 'RedisClusterAssetProtocolHelp']
  ]) {
    for (const auth_username of [false, true]) {
      const protocols = [
        { name: 'redis', port: 7000, setting: { auth_username, enable_cluster_mode: enabled } }
      ]
      assert.equal(
        getAssetProtocolHelpKey(getAssetProtocolChoices({ name: 'custom', protocols })),
        help
      )
    }
  }
})

test('other assets retain their existing protocol hints', () => {
  assert.equal(
    getAssetProtocolHelpKey(getAssetProtocolChoices({ protocols: [{ name: 'clickhouse' }] })),
    'ClickHouseAssetPortsHelp'
  )
  assert.equal(getAssetProtocolHelpKey([{ name: 'mysql' }]), 'AssetProtocolHelpText')
  assert.equal(getAssetProtocolHelpKey([]), 'AssetProtocolHelpText')
})
