import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 0)
}

function createPageCanvases(stitchedCanvas, pageWidthPt, pageHeightPt) {
  const pageCanvas = window.document.createElement('canvas')
  const pageCtx = pageCanvas.getContext('2d')

  if (!pageCtx) {
    throw new Error('Failed to create canvas context')
  }

  const pageHeightPx = Math.floor(stitchedCanvas.width * (pageHeightPt / pageWidthPt))
  pageCanvas.width = stitchedCanvas.width

  const pages = []
  let renderedHeight = 0

  while (renderedHeight < stitchedCanvas.height) {
    const sliceHeight = Math.min(pageHeightPx, stitchedCanvas.height - renderedHeight)
    pageCanvas.height = sliceHeight
    pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
    pageCtx.drawImage(
      stitchedCanvas,
      0,
      renderedHeight,
      stitchedCanvas.width,
      sliceHeight,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height
    )

    pages.push({
      imageBytes: dataUrlToUint8Array(pageCanvas.toDataURL('image/jpeg', 0.95)),
      imageHeightPt: (sliceHeight * pageWidthPt) / stitchedCanvas.width
    })

    renderedHeight += sliceHeight
  }

  return pages
}

export async function exportElementToPdf(element, options = {}) {
  if (!element) {
    throw new Error('Export element is required')
  }

  const {
    filename = 'report.pdf',
    scale = 2,
    backgroundColor = '#ffffff',
    waitMs = 120,
    output = 'save',
    ignoreElements = null
  } = options

  const originStyle = {
    height: element.style.height,
    maxHeight: element.style.maxHeight,
    overflowY: element.style.overflowY,
    overflowX: element.style.overflowX
  }

  try {
    element.style.height = 'auto'
    element.style.maxHeight = 'none'
    element.style.overflowY = 'visible'
    element.style.overflowX = 'visible'
    element.scrollTop = 0

    await new Promise((resolve) => setTimeout(resolve, waitMs))

    const captureWidth = element.scrollWidth || element.clientWidth
    const captureHeight = element.scrollHeight || element.clientHeight
    const canvasOptions = {
      useCORS: true,
      backgroundColor,
      scale,
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: 0
    }
    if (typeof ignoreElements === 'function') {
      canvasOptions.ignoreElements = ignoreElements
    }
    const stitchedCanvas = await html2canvas(element, canvasOptions)
    const pdf = await PDFDocument.create()
    const pages = createPageCanvases(stitchedCanvas, A4_WIDTH_PT, A4_HEIGHT_PT)

    for (const { imageBytes, imageHeightPt } of pages) {
      const image = await pdf.embedJpg(imageBytes)
      const page = pdf.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])
      page.drawImage(image, {
        x: 0,
        y: A4_HEIGHT_PT - imageHeightPt,
        width: A4_WIDTH_PT,
        height: imageHeightPt
      })
    }

    const pdfBytes = await pdf.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })

    if (output === 'blob') {
      return blob
    }
    downloadBlob(blob, filename)
    return null
  } finally {
    element.style.height = originStyle.height
    element.style.maxHeight = originStyle.maxHeight
    element.style.overflowY = originStyle.overflowY
    element.style.overflowX = originStyle.overflowX
  }
}
