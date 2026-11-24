// Keep decoder state across evidence chunks: a UTF-8 character may span events.
export function evidenceOutput(events, complete = true) {
  const streams = new Map()
  for (const event of events) {
    const payload = event.payload || {}
    if (typeof payload.data !== 'string') continue
    const name = payload.stream || 'stdout'
    if (!streams.has(name)) streams.set(name, { decoder: new TextDecoder(), text: '' })
    const stream = streams.get(name)
    try {
      const bytes =
        payload.encoding === 'base64'
          ? Uint8Array.from(atob(payload.data), (char) => char.charCodeAt(0))
          : new TextEncoder().encode(payload.data)
      stream.text += stream.decoder.decode(bytes, { stream: true })
    } catch {
      stream.text += '\ufffd'
    }
  }
  return [...streams].map(([name, stream]) => ({
    name,
    text: stream.text + (complete ? stream.decoder.decode() : '')
  }))
}
