import {
  loadReportFont,
  renderReportPdf,
  reportWatermarkLayout,
  REPORT_FONT_FAMILY
} from './reportPdfRenderer'

export { loadReportFont } from './reportPdfRenderer'

export const REPORT_PAGE_WIDTH = 794
export const REPORT_PAGE_HEIGHT = 1123

// Preview and export share the exact same watermark geometry and settings.
export function createReportWatermark(settings = {}) {
  const { width, height, size, rotation, lines, color } = reportWatermarkLayout(settings)
  const tile = document.createElement('canvas')
  tile.width = width * 2
  tile.height = height * 2
  const context = tile.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')
  context.scale(2, 2)
  context.translate(width / 2, height / 2)
  context.rotate((rotation * Math.PI) / 180)
  context.font = `${size}px "${REPORT_FONT_FAMILY}", "JumpServer Report Symbols", "JumpServer Report Korean"`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.globalAlpha = 0.24
  lines.forEach((line, index) =>
    context.fillText(line, 0, (index - (lines.length - 1) / 2) * (size + 5))
  )
  return { url: tile.toDataURL('image/png'), width, height }
}

async function waitForImages(element) {
  await Promise.all(
    [...element.querySelectorAll('img')].map(async (image) => {
      if (image.complete && image.naturalWidth) return
      if (typeof image.decode === 'function') await image.decode()
      else {
        await new Promise((resolve, reject) => {
          image.onload = resolve
          image.onerror = reject
        })
      }
      if (!image.naturalWidth) throw new Error('Report logo could not be loaded')
    })
  )
}

export async function exportReportPages(elements, options = {}) {
  const pages = [...elements]
  if (!pages.length) throw new Error('Report content is not ready')
  const { filename = 'audit-report.pdf', output = 'save', watermark = {}, onProgress } = options
  // A separate, non-interactive staging area also supports pages hidden by the preview pager.
  // Nothing in the user's visible document is resized or mutated while exporting.
  const stage = document.createElement('div')
  stage.setAttribute('aria-hidden', 'true')
  Object.assign(stage.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${REPORT_PAGE_WIDTH}px`,
    zIndex: '-2147483647',
    pointerEvents: 'none',
    colorScheme: 'light'
  })
  document.body.appendChild(stage)
  const clones = pages.map((page) => page.cloneNode(true))
  try {
    await loadReportFont()
    for (const element of clones) {
      Object.assign(element.style, {
        transform: 'none',
        width: `${REPORT_PAGE_WIDTH}px`,
        height: `${REPORT_PAGE_HEIGHT}px`,
        margin: '0',
        boxShadow: 'none'
      })
      stage.appendChild(element)
      await waitForImages(element)
    }
    const bytes = await renderReportPdf(clones, {
      ...options,
      watermarkTile: createReportWatermark(watermark),
      onProgress
    })
    const blob = new Blob([bytes], { type: 'application/pdf' })
    if (output !== 'blob') {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const safeName = String(filename).replace(/[\\/:*?"<>|\x00-\x1f]/g, '_')
      link.download = /\.pdf$/i.test(safeName) ? safeName : `${safeName}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    }
    return blob
  } finally {
    stage.remove()
  }
}
