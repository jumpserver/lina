import MarkdownIt from 'markdown-it'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      return `<pre class="hljs"><code>${hljs.highlight(language, code, true).value}</code></pre>`
    }

    return `<pre class="hljs"><code>${hljs.highlightAuto(code).value}</code></pre>`
  }
})

markdown.use(mila, {
  attrs: {
    target: '_blank',
    rel: 'noopener noreferrer'
  }
})

export function renderMarkdown(source, { html = false } = {}) {
  const renderer = html ? new MarkdownIt({ html: true, linkify: true }) : markdown
  return DOMPurify.sanitize(renderer.render(source || ''))
}
