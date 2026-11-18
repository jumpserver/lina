export const CLICKHOUSE_HTTP_PROTOCOL = 'clickhouse_http'

export const getAssetProtocolChoices = (platform) => {
  const protocols = (platform?.protocols || []).map((item) => {
    const choice = { ...item }
    delete choice.id
    if (choice.name === 'http') choice.display_name = 'http(s)'
    return choice
  })
  const native = protocols.find((item) => item.name === 'clickhouse')
  if (!native) return protocols

  native.display_name = 'ClickHouse Native'
  protocols.splice(protocols.indexOf(native) + 1, 0, {
    name: CLICKHOUSE_HTTP_PROTOCOL,
    display_name: 'ClickHouse HTTP',
    port: 8123,
    default: true,
    // Old assets show a second row even before a separate port is saved.
    required: true
  })
  return protocols
}
