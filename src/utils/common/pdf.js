import html2canvas from 'html2canvas'
import { jsPDF as JsPDF } from 'jspdf'

export async function exportElementToPdf(element, options = {}) {
  if (!element) {
    throw new Error('Export element is required')
  }

  const {
    filename = 'report.pdf',
    scale = 2,
    backgroundColor = '#ffffff',
    waitMs = 120,
    output = 'save'
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

    await new Promise(resolve => setTimeout(resolve, waitMs))

    const captureWidth = element.scrollWidth || element.clientWidth
    const captureHeight = element.scrollHeight || element.clientHeight
    const stitchedCanvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor,
      scale,
      width: captureWidth,
      height: captureHeight,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: 0
    })

    const pdf = new JsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const pageCanvas = window.document.createElement('canvas')
    const pageCtx = pageCanvas.getContext('2d')
    const pageHeightPx = Math.floor(stitchedCanvas.width * (pageHeight / pageWidth))

    pageCanvas.width = stitchedCanvas.width
    let renderedHeight = 0
    let isFirstPage = true

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

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95)
      const imgHeightMm = (sliceHeight * pageWidth) / stitchedCanvas.width

      if (!isFirstPage) {
        pdf.addPage()
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeightMm)

      renderedHeight += sliceHeight
      isFirstPage = false
    }

    if (output === 'blob') {
      return pdf.output('blob')
    }
    pdf.save(filename)
    return null
  } finally {
    element.style.height = originStyle.height
    element.style.maxHeight = originStyle.maxHeight
    element.style.overflowY = originStyle.overflowY
    element.style.overflowX = originStyle.overflowX
  }
}
