const listItemPattern = /^(?:[-*+]\s+|\d+[.)]\s+)/
const strongFieldPattern = /\*\*[^*]+?\*\*/g

export function formatSiteMessage(message) {
  if (!message) return ''

  return String(message)
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart()

      if (
        !trimmed ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('>') ||
        listItemPattern.test(trimmed)
      ) {
        return line
      }

      const fields = line.match(strongFieldPattern)
      if (!fields || fields.length < 2) return line

      return line.replace(/\s*(\*\*[^*]+?\*\*)/g, '\n- $1').replace(/^\n/, '')
    })
    .join('\n')
}
