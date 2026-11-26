export const CLICKHOUSE_HTTP_PROTOCOL = 'clickhouse_http'

export const getAssetProtocolHelpKey = (protocols) => {
  if (protocols.some((p) => p.name === CLICKHOUSE_HTTP_PROTOCOL)) return 'ClickHouseAssetPortsHelp'
  const redis = protocols.find((p) => p.name === 'redis')
  if (!redis) return 'AssetProtocolHelpText'
  // Read the effective protocol setting, not the name of the platform: admins
  // can clone, rename or configure their own Redis platforms.
  const mode = redis.setting?.enable_cluster_mode
  return mode === true || mode === 'true'
    ? 'RedisClusterAssetProtocolHelp'
    : 'RedisStandaloneAssetProtocolHelp'
}

// HTTP is an asset endpoint, not a second platform login protocol.
export const withClickHouseEndpoints = (protocols = []) => {
  if (!protocols.some((p) => p.name === 'clickhouse')) return protocols

  const hasHTTP = protocols.some((p) => p.name === CLICKHOUSE_HTTP_PROTOCOL)
  return protocols.flatMap((p) => {
    if (p.name === CLICKHOUSE_HTTP_PROTOCOL) return { ...p, display_name: 'ClickHouse HTTP' }
    if (p.name !== 'clickhouse') return p
    const native = { ...p, display_name: 'ClickHouse Native' }
    return hasHTTP
      ? [native]
      : [
          native,
          {
            name: CLICKHOUSE_HTTP_PROTOCOL,
            display_name: 'ClickHouse HTTP',
            port: 8123,
            default: true,
            required: true
          }
        ]
  })
}

export const getAssetProtocolChoices = (platform) =>
  withClickHouseEndpoints(platform?.protocols || []).map((item) => {
    const choice = { ...item }
    delete choice.id
    if (choice.name === 'http') choice.display_name = 'http(s)'
    return choice
  })
