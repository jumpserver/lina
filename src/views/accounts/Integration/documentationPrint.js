// Use the browser's print layout to retain selectable text and paginate long guides.
const printStyles = `
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #202124; background: #fff;
    font: 10pt/1.65 system-ui, -apple-system, "Microsoft YaHei", sans-serif; }
  h1 { font-size: 20pt; } h2 { font-size: 15pt; } h3 { font-size: 12pt; }
  h1, h2, h3, h4 { line-height: 1.4; break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  a { color: #1763a6; overflow-wrap: anywhere; }
  img { max-width: 100%; height: auto; }
  .documentation-header, .policy-documentation-introduction {
    border-bottom: 1px solid #ddd; margin-bottom: 20pt; }
  .documentation-meta, .policy-documentation-meta {
    display: flex; flex-wrap: wrap; gap: 12pt; margin: 10pt 0; }
  .policy-documentation-section + .policy-documentation-section { margin-top: 20pt; }
  .el-alert { padding: 9pt; margin-bottom: 12pt; background: #f6f8fa; }
  .documentation-content > .readme-content > h1:first-child { display: none; }
  pre { padding: 9pt; border: 1px solid #ddd; background: #f6f8fa; }
  pre, code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 8pt; }
  pre, pre code { white-space: pre-wrap; overflow-wrap: anywhere; }
  code { overflow-wrap: anywhere; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9pt; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th, td { padding: 6pt; border: 1px solid #ddd; text-align: left;
    vertical-align: top; overflow-wrap: anywhere; }
  th { background: #f6f8fa; }
  blockquote { margin: 12pt 0; padding-left: 12pt; border-left: 2pt solid #ccc; }
`

export async function printDocumentation(element, { title, language }) {
  const content = element?.cloneNode(true)
  if (!content) throw new Error('Documentation is unavailable')

  const heading = content.querySelector('.documentation-header h1') || document.createElement('h1')
  heading.textContent = title
  if (!heading.parentNode) content.prepend(heading)
  content
    .querySelectorAll(
      'nav, aside, .markdown-code-block__header, .el-alert__icon, .el-alert__close-btn'
    )
    .forEach((node) => node.remove())

  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0;'
  document.body.appendChild(frame)
  let cleanupTimer
  const cleanup = () => {
    window.clearTimeout(cleanupTimer)
    frame.remove()
  }

  try {
    const printWindow = frame.contentWindow
    const printDocument = printWindow.document
    printDocument.documentElement.lang = language.replace('_', '-')
    printDocument.title = title
    const style = printDocument.createElement('style')
    style.textContent = printStyles
    printDocument.head.appendChild(style)
    printDocument.body.appendChild(content)
    await printDocument.fonts.ready
    await Promise.all([...printDocument.images].map((image) => image.decode().catch(() => {})))
    printWindow.addEventListener('afterprint', cleanup, { once: true })
    // Some browsers do not emit afterprint when their print preview is dismissed.
    cleanupTimer = window.setTimeout(cleanup, 300000)
    printWindow.focus()
    printWindow.print()
  } catch (error) {
    cleanup()
    throw error
  }
}
