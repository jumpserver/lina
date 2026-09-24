export function buildEventLanes(data) {
  const events = [...(data?.events || [])].sort((a, b) => a.sequence - b.sequence)
  const lanes = (data?.instances || []).map((client) => {
    const receipts = new Map(client.receipts.map((receipt) => [receipt.event_id, receipt]))
    const nodes = events.map((event) => {
      const receipt = receipts.get(event.id)
      const status = !receipt
        ? 'not_targeted'
        : receipt.received_at
          ? 'received'
          : receipt.publish_result === 'failed'
            ? 'failed'
            : receipt.publish_result === 'pending'
              ? 'publishing'
              : 'unacknowledged'
      return { event, receipt, status }
    })
    return {
      ...client,
      nodes,
      receivedCount: nodes.filter((node) => node.status === 'received').length,
      targetCount: nodes.filter((node) => node.receipt).length
    }
  })
  return { events, lanes }
}
