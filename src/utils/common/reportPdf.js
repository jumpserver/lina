import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'

export const REPORT_PAGE_WIDTH = 794
export const REPORT_PAGE_HEIGHT = 1123

const clamp = (value, fallback, min, max) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback
}

// The same tile is used in the screen preview and burned into each PDF page.
export function createReportWatermark(settings = {}) {
  const width = clamp(settings.width, 240, 150, 480)
  const height = clamp(settings.height, 180, 130, 400)
  const fontSize = clamp(settings.font_size, 13, 10, 28)
  const tile = document.createElement('canvas')
  tile.width = width * 2
  tile.height = height * 2
  const context = tile.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')
  context.scale(2, 2)
  context.translate(width / 2, height / 2)
  context.rotate((clamp(settings.rotate, 45, -180, 180) * Math.PI) / 180)
  context.font = `${fontSize}px sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#909399'
  if (settings.color) context.fillStyle = settings.color
  // Reports use white paper; keep repeated watermark text legible without obscuring data.
  context.globalAlpha = 0.24
  const lines = []
  for (const paragraph of String(settings.content || 'JumpServer').split('\n')) {
    let line = ''
    for (const character of paragraph) {
      if (line && context.measureText(line + character).width > width * 0.85) {
        lines.push(line)
        line = character
      } else {
        line += character
      }
    }
    lines.push(line)
  }
  lines.forEach((line, index) => {
    context.fillText(line, 0, (index - (lines.length - 1) / 2) * (fontSize + 5))
  })
  return { url: tile.toDataURL('image/png'), width, height }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Report watermark could not be loaded'))
    image.src = url
  })
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
  const tile = createReportWatermark(watermark)
  const watermarkImage = await loadImage(tile.url)
  const pdf = await PDFDocument.create()
  if (options.title) pdf.setTitle(String(options.title))
  if (options.author) pdf.setAuthor(String(options.author))
  pdf.setCreator('JumpServer')

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
    await document.fonts?.ready
    for (let index = 0; index < clones.length; index++) {
      const element = clones[index]
      Object.assign(element.style, {
        transform: 'none',
        width: `${REPORT_PAGE_WIDTH}px`,
        height: `${REPORT_PAGE_HEIGHT}px`,
        margin: '0',
        boxShadow: 'none'
      })
      stage.replaceChildren(element)
      await waitForImages(element)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: REPORT_PAGE_WIDTH,
        height: REPORT_PAGE_HEIGHT,
        windowWidth: Math.max(1024, REPORT_PAGE_WIDTH),
        windowHeight: REPORT_PAGE_HEIGHT,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (node) => node.hasAttribute('data-report-watermark')
      })
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable')
      const scale = canvas.width / REPORT_PAGE_WIDTH
      for (let y = 0; y < canvas.height; y += tile.height * scale) {
        for (let x = 0; x < canvas.width; x += tile.width * scale) {
          context.drawImage(watermarkImage, x, y, tile.width * scale, tile.height * scale)
        }
      }
      // One raster image per page means the watermark is part of the page pixels,
      // not a separate text or annotation object that a PDF editor can simply delete.
      const image = await pdf.embedPng(canvas.toDataURL('image/png'))
      const page = pdf.addPage([595.28, 841.89])
      page.drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 })
      onProgress?.(index + 1, clones.length)
      canvas.width = 0
      canvas.height = 0
    }
    const bytes = await pdf.save()
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
