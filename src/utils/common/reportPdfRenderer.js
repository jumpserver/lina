import fallbackFontUrl from '@/assets/fonts/audit-report/NotoSans-Regular.ttf?url'
import fontUrl from '@/assets/fonts/audit-report/NotoSansSC-Regular.ttf?url'
import koreanFontUrl from '@/assets/fonts/audit-report/NotoSansKR-Regular.ttf?url'

export const REPORT_FONT_FAMILY = 'JumpServer Report'
let fontPromise

export function loadReportFont() {
  if (!fontPromise) {
    fontPromise = (async () => {
      return Promise.all(
        [fontUrl, fallbackFontUrl, koreanFontUrl].map(async (url, index) => {
          const response = await fetch(url)
          if (!response.ok) throw new Error('Report font could not be loaded')
          const bytes = await response.arrayBuffer()
          const face = await new FontFace(
            [REPORT_FONT_FAMILY, 'JumpServer Report Symbols', 'JumpServer Report Korean'][index],
            bytes
          ).load()
          document.fonts.add(face)
          return bytes
        })
      )
    })().catch((error) => {
      fontPromise = null
      throw error
    })
  }
  return fontPromise
}

const clamp = (value, fallback, min, max) => {
  const number = value == null || value === '' ? NaN : Number(value)
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback
}

export function reportWatermarkLayout(settings = {}) {
  const width = clamp(settings.width, 240, 150, 480)
  const height = clamp(settings.height, 180, 130, 400)
  const size = clamp(settings.font_size, 13, 10, 28)
  const rotation = clamp(settings.rotate, 45, -180, 180)
  const context = document.createElement('canvas').getContext('2d')
  context.font = `${size}px "${REPORT_FONT_FAMILY}", "JumpServer Report Symbols", "JumpServer Report Korean"`
  context.fillStyle = '#909399'
  if (settings.color) context.fillStyle = settings.color
  const lines = []
  for (const paragraph of String(settings.content || 'JumpServer').split('\n')) {
    let line = ''
    for (const character of paragraph) {
      if (line && context.measureText(line + character).width > width * 0.85) {
        lines.push(line)
        line = character
      } else line += character
    }
    lines.push(line)
  }
  return { width, height, size, rotation, lines, color: context.fillStyle }
}

// This renderer intentionally supports the report's small HTML vocabulary.
// Text, borders, table fills and links remain native PDF objects. Logos and
// the repeated watermark tile are images. Browser layout and the embedded font are shared with the preview.
export async function renderReportPdf(elements, options) {
  const [pdfLib, { default: fontkit }, bytes] = await Promise.all([
    import('pdf-lib'),
    import('@pdf-lib/fontkit'),
    loadReportFont()
  ])
  const {
    PDFDocument,
    PDFName,
    PDFString,
    rgb,
    pushGraphicsState,
    popGraphicsState,
    rectangle,
    clip,
    endPath,
    setTextRenderingMode,
    TextRenderingMode,
    setLineWidth,
    setCharacterSpacing
  } = pdfLib
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const fonts = await Promise.all(bytes.map((data) => pdf.embedFont(data, { subset: true })))
  const characterSets = fonts.map((font) => new Set(font.getCharacterSet()))
  const fontFor = (character) => {
    const index = characterSets.findIndex((set) => set.has(character.codePointAt(0)))
    if (index < 0) {
      const error = new Error('Report font does not support a character')
      error.code = 'REPORT_UNSUPPORTED_CHARACTER'
      error.character = `U+${character.codePointAt(0).toString(16).toUpperCase()}`
      throw error
    }
    return fonts[index]
  }
  const scale = 595.28 / 794
  const height = 1123 * scale
  const measure = document.createElement('canvas').getContext('2d')
  const images = new Map()
  const watermarkTile = options.watermarkTile
  const watermarkImage = watermarkTile ? await pdf.embedPng(watermarkTile.url) : null
  pdf.setCreator('JumpServer')
  if (options.title) pdf.setTitle(String(options.title))
  if (options.author) pdf.setAuthor(String(options.author))

  const color = (value) => {
    if (/^#[a-f0-9]{6}$/i.test(value || '')) {
      return {
        color: rgb(...[1, 3, 5].map((start) => parseInt(value.slice(start, start + 2), 16) / 255)),
        opacity: 1
      }
    }
    const numbers = value?.match(/[\d.]+/g)?.map(Number)
    if (!numbers || numbers.length < 3) return { color: rgb(0, 0, 0), opacity: 0 }
    return { color: rgb(...numbers.slice(0, 3).map((n) => n / 255)), opacity: numbers[3] ?? 1 }
  }
  for (let index = 0; index < elements.length; index++) {
    const root = elements[index]
    const origin = root.getBoundingClientRect()
    const page = pdf.addPage([595.28, height])
    const box = (rect) => ({
      x: (rect.left - origin.left) * scale,
      y: height - (rect.bottom - origin.top) * scale,
      width: rect.width * scale,
      height: rect.height * scale
    })
    const clipped = (element, draw) => {
      page.pushOperators(pushGraphicsState())
      for (let parent = element; parent && root.contains(parent); parent = parent.parentElement) {
        const style = getComputedStyle(parent)
        if (
          parent === root ||
          ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX) ||
          ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY)
        ) {
          const b = box(parent.getBoundingClientRect())
          page.pushOperators(rectangle(b.x, b.y, b.width, b.height), clip(), endPath())
        }
      }
      draw()
      page.pushOperators(popGraphicsState())
    }
    const drawTextNode = (node) => {
      const style = getComputedStyle(node.parentElement)
      const text = node.nodeValue
      if (!text?.trim()) return
      const size = parseFloat(style.fontSize)
      const spacing = parseFloat(style.letterSpacing) || 0
      measure.font = `${size}px "${REPORT_FONT_FAMILY}", "JumpServer Report Symbols", "JumpServer Report Korean"`
      const ascent = measure.measureText('Hg').fontBoundingBoxAscent || size * 1.16
      const range = document.createRange()
      const lines = []
      let offset = 0
      for (const character of text) {
        range.setStart(node, offset)
        offset += character.length
        range.setEnd(node, offset)
        const rect = range.getBoundingClientRect()
        if (!rect.width || !rect.height || /[\r\n\t]/.test(character)) continue
        const selectedFont = fontFor(character)
        let line = lines.at(-1)
        if (
          !line ||
          line.font !== selectedFont ||
          Math.abs(line.top - rect.top) > 0.5 ||
          rect.left < line.left - 0.5
        ) {
          line = { text: '', left: rect.left, top: rect.top, font: selectedFont }
          lines.push(line)
        }
        line.text += character
      }
      clipped(node.parentElement, () => {
        for (const line of lines) {
          page.pushOperators(pushGraphicsState(), setCharacterSpacing(spacing * scale))
          if (Number(style.fontWeight) >= 600) {
            page.pushOperators(
              setTextRenderingMode(TextRenderingMode.FillAndOutline),
              setLineWidth(size * scale * 0.025)
            )
          }
          page.drawText(line.text, {
            font: line.font,
            size: size * scale,
            x: (line.left - origin.left) * scale,
            y: height - (line.top - origin.top + ascent) * scale,
            ...color(style.color)
          })
          page.pushOperators(popGraphicsState())
        }
      })
    }
    const walk = async (element) => {
      if (element.hasAttribute('data-report-watermark')) return
      const style = getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') return
      const rect = element.getBoundingClientRect()
      const b = box(rect)
      clipped(element, () => {
        const fill = color(style.backgroundColor)
        if (fill.opacity) page.drawRectangle({ ...b, ...fill })
        const edges = [
          ['Top', b.x, b.y + b.height, b.x + b.width, b.y + b.height],
          ['Bottom', b.x, b.y, b.x + b.width, b.y],
          ['Left', b.x, b.y, b.x, b.y + b.height],
          ['Right', b.x + b.width, b.y, b.x + b.width, b.y + b.height]
        ]
        for (const [side, x1, y1, x2, y2] of edges) {
          const width = parseFloat(style[`border${side}Width`]) * scale
          if (width && style[`border${side}Style`] !== 'none') {
            page.drawLine({
              start: { x: x1, y: y1 },
              end: { x: x2, y: y2 },
              thickness: width,
              ...color(style[`border${side}Color`])
            })
          }
        }
      })
      if (element.tagName === 'IMG') {
        if (!images.has(element.src)) {
          if (!element.complete) await element.decode()
          const canvas = document.createElement('canvas')
          canvas.width = element.naturalWidth
          canvas.height = element.naturalHeight
          canvas.getContext('2d').drawImage(element, 0, 0)
          images.set(element.src, await pdf.embedPng(canvas.toDataURL('image/png')))
        }
        const image = images.get(element.src)
        const ratio = Math.min(b.width / image.width, b.height / image.height)
        page.drawImage(image, {
          x: b.x,
          y: b.y + (b.height - image.height * ratio) / 2,
          width: image.width * ratio,
          height: image.height * ratio
        })
      }
      if (element.tagName === 'A' && element.href) {
        const url = new URL(element.href, location.href)
        if (url.origin === location.origin && ['http:', 'https:'].includes(url.protocol)) {
          const annotation = pdf.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [b.x, b.y, b.x + b.width, b.y + b.height],
            Border: [0, 0, 0],
            A: { Type: 'Action', S: 'URI', URI: PDFString.of(url.href) }
          })
          const ref = pdf.context.register(annotation)
          const annotations = page.node.lookupMaybe(PDFName.of('Annots'), pdfLib.PDFArray)
          if (annotations) annotations.push(ref)
          else page.node.set(PDFName.of('Annots'), pdf.context.obj([ref]))
        }
      }
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) drawTextNode(child)
        else if (child.nodeType === Node.ELEMENT_NODE) await walk(child)
      }
    }
    await walk(root)
    // Reuse one small decorative tile so watermark characters do not pollute
    // copied report text. Report content is never rasterized.
    if (watermarkImage) {
      page.pushOperators(pushGraphicsState(), rectangle(0, 0, 595.28, height), clip(), endPath())
      for (let y = 0; y < 1123; y += watermarkTile.height) {
        for (let x = 0; x < 794; x += watermarkTile.width) {
          page.drawImage(watermarkImage, {
            x: x * scale,
            y: height - (y + watermarkTile.height) * scale,
            width: watermarkTile.width * scale,
            height: watermarkTile.height * scale
          })
        }
      }
      page.pushOperators(popGraphicsState())
    }
    options.onProgress?.(index + 1, elements.length)
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  return pdf.save()
}
