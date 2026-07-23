function normalizeText(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractDjangoDebugSummary(doc) {
  const title = normalizeText(doc.querySelector('#summary h1')?.textContent)
  const value = normalizeText(doc.querySelector('pre.exception_value')?.textContent)

  if (title && value) {
    return `${title}: ${value}`
  }

  if (title) {
    return title
  }

  return ''
}

function extractErrorSummaryFromText(text) {
  const normalized = normalizeText(text)
  if (!normalized) {
    return ''
  }

  const pairs = [
    [
      /Exception Type:\s*([^\n]+?)\s*Exception Value:\s*([^\n]+?)(?=\s*(Exception Location:|Raised during:|Request Method:|$))/i
    ],
    [/([A-Za-z_][\w.]*)\s+at\s+\/[^\s]+\s+(.+?)(?=\s*(Request Method:|Traceback|$))/i]
  ]

  for (const regex of pairs) {
    const match = normalized.match(regex)
    if (!match) {
      continue
    }

    const left = normalizeText(match[1])
    const right = normalizeText(match[2])
    if (left && right) {
      return `${left}: ${right}`
    }
  }

  return normalized
}

export function toPlainTextMessage(message) {
  if (message == null) {
    return ''
  }

  const normalized = typeof message === 'string' ? message : String(message)

  if (!normalized || typeof window === 'undefined' || typeof document === 'undefined') {
    return normalized
  }

  if (/<html[\s>]|<body[\s>]|<!doctype html/i.test(normalized)) {
    const doc = new DOMParser().parseFromString(normalized, 'text/html')
    doc.querySelectorAll('script, style, noscript, template').forEach((node) => node.remove())

    const djangoSummary = extractDjangoDebugSummary(doc)
    if (djangoSummary) {
      return djangoSummary
    }

    const bodyText = normalizeText(doc.body?.textContent || '')
    return extractErrorSummaryFromText(bodyText)
  }

  const container = document.createElement('div')
  container.innerHTML = normalized

  return extractErrorSummaryFromText(container.textContent || container.innerText || '')
}
