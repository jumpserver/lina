import SvgIcon from '@/components/Widgets/SvgIcon' // svg component

const svgModules = import.meta.glob('./svg/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

let spriteMounted = false

function buildSymbol(id, svgContent) {
  const matches = svgContent.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i)

  if (!matches) {
    return ''
  }

  const attrs = matches[1] || ''
  const body = matches[2] || ''
  const viewBoxMatch = attrs.match(/\bviewBox=(["'])(.*?)\1/i)
  const viewBox = viewBoxMatch ? ` viewBox="${viewBoxMatch[2]}"` : ''

  return `<symbol id="icon-${id}"${viewBox}>${body}</symbol>`
}

function mountSprite() {
  if (spriteMounted || typeof document === 'undefined') {
    return
  }

  const symbols = Object.entries(svgModules)
    .map(([filePath, svgContent]) => {
      const iconName = filePath.replace(/^\.\/svg\/(.*)\.svg$/, '$1')
      return buildSymbol(iconName, svgContent)
    })
    .join('')

  const mount = () => {
    if (spriteMounted || !symbols) {
      return
    }

    const container = document.createElement('div')
    container.setAttribute('aria-hidden', 'true')
    container.style.position = 'absolute'
    container.style.width = '0'
    container.style.height = '0'
    container.style.overflow = 'hidden'
    container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`
    ;(document.body || document.documentElement).prepend(container)
    spriteMounted = true
  }

  if (document.body) {
    mount()
    return
  }

  document.addEventListener('DOMContentLoaded', mount, { once: true })
}

export function installSvgIcon(app) {
  app.component('SvgIcon', SvgIcon)
  mountSprite()
}

export default {
  install: installSvgIcon
}
