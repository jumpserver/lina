import { receiptStatus, statusLabels } from '../AccountRotationDetail/rotationEventTimeline.js'

const commandStatusLabels = {
  pending: 'ApplicationCommandPending',
  received: 'RotationEventReceived',
  running: 'Running',
  success: 'Success',
  failed: 'Failed',
  timeout: 'Timeout'
}

const statusTypes = {
  pending: 'info',
  received: 'success',
  running: 'warning',
  success: 'success',
  failed: 'danger',
  timeout: 'danger'
}

export function applicationEventRows(events, source) {
  return events.flatMap((event) => {
    const recipients = event.recipients.length ? event.recipients : [{}]
    return recipients.map((recipient, index) => {
      const row = { ...event, ...recipient }
      const status =
        source === 'manual' ? row.status : receiptStatus(event.recipients.length ? recipient : null)
      return {
        ...row,
        key: `${source}:${event.id || event.command_id}:${index}`,
        source,
        published_at: source === 'manual' ? event.occurred_at : event.published_at,
        statusLabel: (source === 'manual' ? commandStatusLabels : statusLabels)[status],
        statusType: statusTypes[status] || 'info'
      }
    })
  })
}

export function createApplicationEventHistory(request, pageSize = 30) {
  let sources = ['manual', 'policy'].map((source) => ({
    source,
    offset: 0,
    rows: [],
    exhausted: false
  }))

  async function fill(source, rowCount, options) {
    while (source.rows.length < rowCount && !source.exhausted) {
      const data = await request(source.source, { limit: pageSize, offset: source.offset }, options)
      if (!data.results.length && source.offset < data.count) {
        throw new Error('Event history returned an incomplete page')
      }
      source.offset += data.results.length
      source.rows = source.rows.concat(applicationEventRows(data.results, source.source))
      source.exhausted = source.offset >= data.count
    }
  }

  return {
    async getPage(page, size = pageSize, options = {}) {
      const end = page * size
      // Each source must provide its first end + 1 instance rows, or be exhausted,
      // before the merged page and the presence of a next page can be determined.
      const nextSources = sources.map((source) => ({ ...source }))
      await Promise.all(nextSources.map((source) => fill(source, end + 1, options)))
      const rows = nextSources
        .flatMap((source) => source.rows)
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      options.signal?.throwIfAborted()
      sources = nextSources
      return { rows: rows.slice(end - size, end), hasNext: rows.length > end }
    }
  }
}
