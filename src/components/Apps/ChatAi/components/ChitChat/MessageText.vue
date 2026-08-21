<template>
  <div ref="root" class="message-text" @click="handleClick">
    <div v-sanitize="rendered" class="markdown-body" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import linkAttributes from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useI18n } from 'vue-i18n'

import { copy } from '@/utils/common/index'

<<<<<<< HEAD
const props = defineProps({
  content: {
    type: String,
    default: ''
=======
export default {
  props: {
    message: {
      type: Object,
      default: () => ({})
    },
    isTerminal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      markdown: null
    }
  },
  computed: {
    text() {
      const value = this.message?.content || ''
      if (value && this.markdown) {
        return this.renderContentWithDetails(value)
      }
      return this.$xss.process(value)
    }
  },
  mounted() {
    this.init()
    this.$nextTick(() => this.addEvents())
  },
  updated() {
    this.addEvents()
  },
  unmounted() {
    this.removeEvents()
  },
  methods: {
    init() {
      const vm = this
      this.markdown = new MarkdownIt({
        html: false,
        linkify: true,
        highlight(code, language) {
          const validLang = !!(language && hljs.getLanguage(language))
          if (validLang) {
            const lang = language || ''
            return vm.highlightBlock(hljs.highlight(lang, code, true).value, lang)
          }
          return vm.highlightBlock(hljs.highlightAuto(code).value, '')
        }
      })
      this.markdown.use(mila, { attrs: { target: '_blank', rel: 'noopener', class: 'link-style' } })
      this.markdown.use(mdKatex, {
        blockClass: 'katexmath-block rounded-md',
        errorColor: ' #cc0000'
      })
    },
    highlightBlock(str, lang) {
      let insertSpanHtml = `<button class="code-block-header__insert" type="button">
        <i aria-hidden="true" class="fa fa-level-down"></i>
        <span>${this.$t('Insert')}</span>
      </button>`
      if (!this.isTerminal) {
        insertSpanHtml = ''
      }
      return `<pre class="code-block-wrapper">
        <div class="code-block-header">
        <span class="code-block-header__lang">${lang}</span>  
        <span class="code-block-header__actions">
        ${insertSpanHtml}
          <button class="code-block-header__copy" type="button">
            <i aria-hidden="true" class="fa-regular fa-copy"></i>
            <span>${this.$t('Copy')}</span>
          </button>
        </span>
        </div>
        <code class="hljs code-block-body ${lang}">${str}</code></pre>`
    },
    addEvents() {
      this.addBtnClickEvents('.code-block-header__copy', this.handlerClickCopy)
      this.addBtnClickEvents('.code-block-header__insert', this.handlerClickInsert)
    },

    handlerClickCopy(event) {
      const wrapper = event.target.closest('.code-block-wrapper')
      if (wrapper) {
        // 查找里面的 code 元素
        const codeElement = wrapper.querySelector('code.code-block-body')
        if (codeElement) {
          const codeText = codeElement.textContent
          copy(codeText)
        }
      }
    },
    handlerClickInsert(event) {
      const wrapper = event.target.closest('.code-block-wrapper')
      if (wrapper) {
        // 查找里面的 code 元素
        const codeElement = wrapper.querySelector('code.code-block-body')
        if (codeElement) {
          const codeText = codeElement.textContent
          this.$emit('insert-code', codeText)
        }
      }
    },
    addBtnClickEvents(selector, callback) {
      const buttons = this.$refs.textRef?.querySelectorAll(selector) || []
      buttons.forEach((btn) => {
        btn.removeEventListener('click', callback)
        btn.addEventListener('click', callback)
      })
    },
    renderContentWithDetails(value) {
      // Kael responses may wrap reasoning/thinking in <details type="reasoning">; render them with a custom block.
      const detailRegex = /<details[^>]*>[\s\S]*?<\/details>/gi
      let result = ''
      let lastIndex = 0
      let match
      let hasDetails = false

      while ((match = detailRegex.exec(value))) {
        hasDetails = true
        const preceding = value.slice(lastIndex, match.index)
        if (preceding.trim()) {
          result += this.markdown.render(preceding)
        }
        result += this.renderDetailBlock(match[0])
        lastIndex = match.index + match[0].length
      }

      if (!hasDetails) {
        return this.markdown.render(value)
      }

      const remaining = value.slice(lastIndex)
      if (remaining.trim()) {
        result += this.markdown.render(remaining)
      }

      return result
    },
    renderDetailBlock(detailStr) {
      const attributes = this.extractAttributes(detailStr)
      const inner = detailStr.replace(/^<details[^>]*>/i, '').replace(/<\/details>$/i, '')
      const summaryMatch = inner.match(/<summary>([\s\S]*?)<\/summary>/i)
      const summary = summaryMatch ? this.decodeHtml(summaryMatch[1]) : ''
      const body = summaryMatch ? inner.replace(summaryMatch[0], '') : inner
      const bodyHtml = body.trim() ? this.markdown.render(this.decodeHtml(body.trim())) : ''

      const baseClass = 'kael-detail'
      if (attributes.type === 'reasoning') {
        const statusClass = attributes.done === 'true' ? 'is-done' : 'is-pending'
        const title = summary || this.$t('DeeplyThoughtAbout')
        return `<div class="${baseClass} ${baseClass}--reasoning ${statusClass}">
          <div class="${baseClass}__header">
            <span class="${baseClass}__status-dot"></span>
            <span class="${baseClass}__title">${title}</span>
          </div>
          ${bodyHtml ? `<div class="${baseClass}__body">${bodyHtml}</div>` : ''}
        </div>`
      }

      return `<div class="${baseClass}">
        ${summary ? `<div class="${baseClass}__header">${summary}</div>` : ''}
        ${bodyHtml ? `<div class="${baseClass}__body">${bodyHtml}</div>` : ''}
      </div>`
    },
    extractAttributes(detailStr) {
      const attrs = {}
      const attrMatch = detailStr.match(/^<details([^>]*)>/i)
      const attrStr = (attrMatch && attrMatch[1]) || ''
      attrStr.replace(/(\w+)="(.*?)"/g, (all, key, val) => {
        attrs[key] = val
        return all
      })
      return attrs
    },
    decodeHtml(str) {
      if (!str) return ''
      const textArea = document.createElement('textarea')
      textArea.innerHTML = str
      return textArea.value
    },
    removeBtnClickEvent(selector, callback) {
      const buttons = this.$refs.textRef?.querySelectorAll(selector) || []
      buttons.forEach((btn) => {
        btn.removeEventListener('click', callback)
      })
    },
    removeEvents() {
      if (this.$refs.textRef) {
        this.removeBtnClickEvent('.code-block-header__copy', this.handlerClickCopy)
        this.removeBtnClickEvent('.code-block-header__insert', this.handlerClickInsert)
      }
    }
>>>>>>> dev
  }
})

const { t } = useI18n()
let copyTimer = null
let copiedButton = null
let copiedButtonLabel = ''

function codeBlock(source, language) {
  const lang = language && hljs.getLanguage(language) ? language : ''
  const highlighted = lang
    ? hljs.highlight(source, { language: lang }).value
    : hljs.highlightAuto(source).value
  const label = lang || t('ChatAICode')

  return `<div class="ai-code-block">
    <div class="ai-code-block__header">
      <span>${label}</span>
      <button class="ai-code-block__copy" type="button">${t('Copy')}</button>
    </div>
    <pre><code class="hljs ${lang}">${highlighted}</code></pre>
  </div>`
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight: codeBlock
})

markdown.use(linkAttributes, {
  attrs: {
    target: '_blank',
    rel: 'noopener noreferrer'
  }
})
markdown.use(mdKatex, {
  blockClass: 'katexmath-block',
  errorColor: '#d45a68'
})

const rendered = computed(() => markdown.render(props.content || ''))

function handleClick(event) {
  const button = event.target.closest('.ai-code-block__copy')
  if (!button) return
  const code = button.closest('.ai-code-block')?.querySelector('code')?.textContent || ''
  if (!code) return
  copy(code)
  const original = copiedButton === button ? copiedButtonLabel : button.textContent
  if (copyTimer) window.clearTimeout(copyTimer)
  if (copiedButton !== button && copiedButton?.isConnected) {
    copiedButton.textContent = copiedButtonLabel
  }
  copiedButton = button
  copiedButtonLabel = original
  button.textContent = t('ChatAICopied')
  copyTimer = window.setTimeout(() => {
    if (button.isConnected) button.textContent = original
    copiedButton = null
    copiedButtonLabel = ''
  }, 1200)
}

onBeforeUnmount(() => {
  if (copyTimer) window.clearTimeout(copyTimer)
  copiedButton = null
  copiedButtonLabel = ''
})
</script>

<style lang="scss" scoped>
.message-text {
  min-width: 0;
  color: inherit;
  font-size: 13px;
  line-height: 1.72;
  user-select: text;
}

.markdown-body {
  min-width: 0;
  color: inherit;
  background: transparent;

  &:deep(> :first-child) {
    margin-top: 0;
  }

  &:deep(> :last-child) {
    margin-bottom: 0;
  }

  &:deep(p) {
    margin: 0 0 9px;
    line-height: 1.72;
  }

  &:deep(h1),
  &:deep(h2),
  &:deep(h3),
  &:deep(h4) {
    margin: 17px 0 8px;
    color: #282c3d;
    font-weight: 720;
    line-height: 1.35;
  }

  &:deep(h1) {
    font-size: 18px;
  }

  &:deep(h2) {
    font-size: 16px;
  }

  &:deep(h3),
  &:deep(h4) {
    font-size: 14px;
  }

  &:deep(ul),
  &:deep(ol) {
    margin: 7px 0 10px;
    padding-left: 20px;
  }

  &:deep(li) {
    margin: 4px 0;
  }

  &:deep(a) {
    color: var(--el-color-info, #1c84c6);
    text-decoration: underline;
    text-decoration-color: var(--el-color-info-light-5, #8dc2df);
    text-underline-offset: 3px;

    &:hover {
      color: var(--ai-primary-dark, #148f76);
    }
  }

  &:deep(blockquote) {
    margin: 10px 0;
    padding: 8px 12px;
    border-left: 3px solid var(--ai-primary, #1ab394);
    border-radius: 0 8px 8px 0;
    color: #666b7f;
    background: var(--ai-primary-light, #e8f7f3);
  }

  &:deep(code:not(.hljs)) {
    padding: 2px 5px;
    border: 1px solid var(--ai-primary-light-2, #d1efe8);
    border-radius: 4px;
    color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-light, #e8f7f3);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.88em;
  }

  &:deep(table) {
    display: block;
    width: 100%;
    margin: 11px 0;
    overflow: auto;
    border-spacing: 0;
    border-collapse: collapse;

    th,
    td {
      padding: 7px 9px;
      border: 1px solid #e5e7ee;
      text-align: left;
    }

    th {
      color: #555a6d;
      background: #f7f8fb;
    }
  }

  &:deep(.ai-code-block) {
    margin: 11px 0;
    overflow: hidden;
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: var(--ai-radius-md, 10px);
    background: #151722;
    box-shadow: 0 10px 25px rgb(20 22 34 / 13%);

    .ai-code-block__header {
      display: flex;
      min-height: 34px;
      align-items: center;
      justify-content: space-between;
      padding: 0 11px;
      border-bottom: 1px solid rgb(255 255 255 / 7%);
      color: #949aad;
      background: #1c1f2b;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10px;
      text-transform: lowercase;
    }

    .ai-code-block__copy {
      padding: 3px 7px;
      border: 0;
      border-radius: 6px;
      color: #aeb4c5;
      background: rgb(255 255 255 / 6%);
      cursor: pointer;
      font-size: 10px;

      &:hover {
        color: #fff;
        background: rgb(255 255 255 / 10%);
      }

      &:focus-visible {
        outline: 2px solid rgb(255 255 255 / 42%);
        outline-offset: 2px;
      }
    }

    pre {
      margin: 0;
      padding: 0;
      overflow: auto;
      background: transparent;
    }

    code {
      display: block;
      padding: 12px 14px;
      background: transparent;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      line-height: 1.65;
    }
  }
}
</style>
