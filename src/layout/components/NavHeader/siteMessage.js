const listItemPattern = /^(?:[-*+]\s+|\d+[.)]\s+)/
const strongFieldPattern = /\*\*[^*\n]+?[：:]\*\*/g
const fencePattern = /^\s*(`{3,}|~{3,})/

function splitFieldLine(line) {
  const trimmed = line.trimStart()
  if (
    !trimmed ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('>') ||
    listItemPattern.test(trimmed)
  ) {
    return null
  }

  const fields = [...line.matchAll(strongFieldPattern)]
  if (!fields.length || line.slice(0, fields[0].index).trim()) return null

  return fields.map((field, index) => {
    const nextField = fields[index + 1]
    return line.slice(field.index, nextField?.index ?? line.length).trim()
  })
}

export function formatSiteMessage(message) {
  if (!message) return ''

  const lines = String(message).split('\n')
  const formatted = []
  let fence = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const fenceMatch = line.match(fencePattern)

    if (fence) {
      formatted.push(line)
      if (fenceMatch?.[1].startsWith(fence)) fence = null
      continue
    }

    if (fenceMatch) {
      fence = fenceMatch[1][0]
      formatted.push(line)
      continue
    }

    const firstFields = splitFieldLine(line)
    if (!firstFields) {
      formatted.push(line)
      continue
    }

    const sourceLines = [line]
    const fields = [...firstFields]
    while (index + 1 < lines.length) {
      const nextFields = splitFieldLine(lines[index + 1])
      if (!nextFields) break
      index += 1
      sourceLines.push(lines[index])
      fields.push(...nextFields)
    }

    if (fields.length < 2) {
      formatted.push(...sourceLines)
      continue
    }

    formatted.push(...fields.map((field) => `- ${field}`))
  }

  return formatted.join('\n')
}
